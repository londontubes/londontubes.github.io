import type { Station, TransitLine } from '@/app/types/transit'

export interface StationGraphEdge {
  to: string
  lineCode: string
  distanceMeters: number
  runMinutes: number
}

export interface StationGraph {
  [stationId: string]: StationGraphEdge[]
}

// Baseline assumptions until timetable API integration replaced:
// Average in-train speed (mph) excludes station dwell; dwell added separately.
const DEFAULT_LINE_SPEED_MPH = 22 // approximate average inclusive of acceleration/deceleration
const DEFAULT_DWELL_MINUTES = 0.5 // assumed dwell per stop (not added to final edge time here; kept lightweight)

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
export function buildStationGraph(lines: TransitLine[], stations: Station[]): StationGraph {
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
      // Baseline runtime (in-train only) + minimal dwell at destination to approximate timetable segment
      const runMinutes = (distMiles / DEFAULT_LINE_SPEED_MPH) * 60 + DEFAULT_DWELL_MINUTES
      ensure(a.stationId); ensure(b.stationId)
      graph[a.stationId].push({ to: b.stationId, lineCode: line.lineCode, distanceMeters: distMeters, runMinutes })
      graph[b.stationId].push({ to: a.stationId, lineCode: line.lineCode, distanceMeters: distMeters, runMinutes })
    }
  }
  return graph
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
  transferPenaltyMinutes = 1
): PathResult[] {
  if (!graph[originId]) return []
  const dist: Record<string, number> = { [originId]: 0 }
  const prev: Record<string, string | null> = { [originId]: null }
  const prevLine: Record<string, string | null> = { [originId]: null }
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
      const base = dist[id]
      const lineChange = prevLine[id] && prevLine[id] !== e.lineCode ? transferPenaltyMinutes : 0
      const candidate = base + e.runMinutes + lineChange
      if (candidate > maxMinutes) continue
      const prevBest = dist[e.to]
      if (prevBest === undefined || candidate < prevBest) {
        dist[e.to] = candidate
        prev[e.to] = id
        prevLine[e.to] = e.lineCode
        queue.push({ id: e.to, minutes: candidate })
      }
    }
  }

  const results: PathResult[] = []
  Object.keys(dist).forEach(stationId => {
    if (stationId === originId) return
    const minutes = Math.round(dist[stationId] * 10) / 10
    // Reconstruct path
    const path: string[] = []
    let cursor: string | null = stationId
    while (cursor) {
      path.push(cursor)
      cursor = prev[cursor] || null
    }
    path.reverse()
    // Build encountered lines list in order
    const linesEncountered: string[] = []
    let lastLine: string | null = null
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i]
      const to = path[i + 1]
      const edge = graph[from].find(ed => ed.to === to)
      if (!edge) continue
      if (edge.lineCode !== lastLine) {
        linesEncountered.push(edge.lineCode)
        lastLine = edge.lineCode
      }
    }
    results.push({ stationId, minutes, via: [originId, ...path], lines: linesEncountered })
  })
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
