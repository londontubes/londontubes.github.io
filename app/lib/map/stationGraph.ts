import type { Station, TransitLine } from '@/app/types/transit'
import { getStaticTubeGraph, staticTubeGraphPenalties } from './staticTubeTimes'

export interface StationGraphEdge {
  to: string
  lineCode: string
  distanceMeters: number
  runMinutes: number
}

export interface StationGraph {
  [stationId: string]: StationGraphEdge[]
}

// Baseline assumptions for fallback heuristic when static timetable graph is unavailable.
const FALLBACK_LINE_SPEED_MPH = 22
const FALLBACK_DWELL_MINUTES = 0.5

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Build an undirected adjacency graph using the ordered stationIds list on each line.
 * Each consecutive pair becomes an edge annotated with straight-line distance and baseline run time.
 */
function buildStaticGraph(stations: Station[]): StationGraph | null {
  const staticGraph = getStaticTubeGraph()
  if (!staticGraph || staticGraph.size === 0) return null
  const stationMap: Record<string, Station> = {}
  stations.forEach(s => { stationMap[s.stationId] = s })
  const graph: StationGraph = {}
  for (const [fromStationId, edges] of staticGraph.entries()) {
    const prepared = edges.map(edge => {
      const fromStation = stationMap[fromStationId]
      const toStation = stationMap[edge.toStationId]
      let distanceMeters = 0
      if (fromStation && toStation) {
        const [fromLng, fromLat] = fromStation.position.coordinates
        const [toLng, toLat] = toStation.position.coordinates
        distanceMeters = haversineMeters(fromLat, fromLng, toLat, toLng)
      }
      return {
        to: edge.toStationId,
        lineCode: edge.lineCode,
        distanceMeters,
        runMinutes: edge.runMinutes,
      }
    })
    graph[fromStationId] = prepared
  }
  return graph
}

function buildHeuristicGraph(lines: TransitLine[], stations: Station[]): StationGraph {
  const stationMap: Record<string, Station> = {}
  stations.forEach(s => { stationMap[s.stationId] = s })
  const graph: StationGraph = {}

  const ensure = (id: string) => { if (!graph[id]) graph[id] = [] }

  for (const line of lines) {
    const ids = line.stationIds
    for (let i = 0; i < ids.length - 1; i++) {
      const a = stationMap[ids[i]]
      const b = stationMap[ids[i + 1]]
      if (!a || !b) continue
      const [aLng, aLat] = a.position.coordinates
      const [bLng, bLat] = b.position.coordinates
      const distMeters = haversineMeters(aLat, aLng, bLat, bLng)
      const distMiles = distMeters / 1609.34
      const runMinutes = (distMiles / FALLBACK_LINE_SPEED_MPH) * 60 + FALLBACK_DWELL_MINUTES
      ensure(a.stationId); ensure(b.stationId)
      graph[a.stationId].push({ to: b.stationId, lineCode: line.lineCode, distanceMeters: distMeters, runMinutes })
      graph[b.stationId].push({ to: a.stationId, lineCode: line.lineCode, distanceMeters: distMeters, runMinutes })
    }
  }
  return graph
}

export function buildStationGraph(lines: TransitLine[], stations: Station[]): StationGraph {
  return buildStaticGraph(stations) ?? buildHeuristicGraph(lines, stations)
}

export interface PathResult {
  stationId: string
  minutes: number
  via: string[] // stationIds path
  lines: string[] // line codes encountered
}

/**
 * Dijkstra shortest path limited by maxMinutes. Transfer penalty applies when line changes between edges.
 */
export function shortestPathsFrom(
  originId: string,
  graph: StationGraph,
  maxMinutes: number,
  penalties: { boardingWaitMinutes?: number; transferWalkMinutes?: number } = {}
): PathResult[] {
  if (!graph[originId]) return []
  const boardingWaitMinutes = penalties.boardingWaitMinutes ?? staticTubeGraphPenalties.boardingWaitMinutes ?? 0
  const transferWalkMinutes = penalties.transferWalkMinutes ?? staticTubeGraphPenalties.transferWalkMinutes ?? 0
  const hubWalkMinutes = penalties.hubWalkMinutes ?? staticTubeGraphPenalties.hubWalkMinutes ?? 0
  const dist = new Map<string, number>([[originId, 0]])
  const prev = new Map<string, string | null>([[originId, null]])
  const prevLine = new Map<string, string | null>([[originId, null]])
  const visited = new Set<string>()
  type QNode = { id: string; minutes: number }
  const queue: QNode[] = [{ id: originId, minutes: 0 }]

  const popMin = () => {
    let idx = -1; let best = Infinity
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].minutes < best) { best = queue[i].minutes; idx = i }
    }
    if (idx === -1) return null
    const node = queue[idx]
    queue.splice(idx, 1)
    return node
  }

  while (true) {
    const current = popMin()
    if (!current) break
    const { id } = current
    if (visited.has(id)) continue
    visited.add(id)
    const edges = graph[id] || []
    for (const e of edges) {
      const base = dist.get(id) ?? 0
      const previousLine = prevLine.get(id)
      const boardingPenalty = previousLine === null ? boardingWaitMinutes : 0
      const transferPenalty = previousLine && previousLine !== e.lineCode ? transferWalkMinutes + boardingWaitMinutes : 0
      const hubPenalty = (id.startsWith('HUB') || e.to.startsWith('HUB')) ? hubWalkMinutes : 0
      const candidate = base + e.runMinutes + boardingPenalty + transferPenalty + hubPenalty
      if (candidate > maxMinutes) continue
      const prevBest = dist.get(e.to)
      if (prevBest === undefined || candidate < prevBest) {
        dist.set(e.to, candidate)
        prev.set(e.to, id)
        prevLine.set(e.to, e.lineCode)
        queue.push({ id: e.to, minutes: candidate })
      }
    }
  }

  const results: PathResult[] = []
  for (const [stationId, value] of dist.entries()) {
    if (stationId === originId) continue
    const minutes = Math.round(value * 10) / 10
    const path: string[] = []
    let cursor: string | null = stationId
    while (cursor) {
      path.push(cursor)
      cursor = prev.get(cursor) ?? null
    }
    path.reverse()
    if (path[0] === originId) {
      path.shift()
    }
    const linesEncountered: string[] = []
    let lastLine: string | null = null
    const sequence = [originId, ...path]
    for (let i = 0; i < sequence.length - 1; i++) {
      const from = sequence[i]
      const to = sequence[i + 1]
      const edge = graph[from]?.find(ed => ed.to === to)
      if (!edge) continue
      if (edge.lineCode !== lastLine) {
        linesEncountered.push(edge.lineCode)
        lastLine = edge.lineCode
      }
    }
    results.push({ stationId, minutes, via: [originId, ...path], lines: linesEncountered })
  }
  return results
}

// Utility to build and memoize graph on client (basic cache)
let cachedGraph: StationGraph | null = null
export function getCachedGraph(lines: TransitLine[], stations: Station[]): StationGraph {
  if (!cachedGraph) {
    cachedGraph = buildStationGraph(lines, stations)
  }
  return cachedGraph
}
