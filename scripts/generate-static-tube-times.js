#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate static tube journey times using TfL timetable data so that the
 * client map can serve accurate previews without calling live APIs.
 */

const fs = require('fs/promises')
const path = require('path')

const OUTPUT_PATH = path.join(__dirname, '../public/data/static-tube-times.json')
const STATIONS_PATH = path.join(__dirname, '../public/data/stations.json')
const LINES_PATH = path.join(__dirname, '../public/data/lines.json')

const API_BASE = 'https://api.tfl.gov.uk'
const DIRECTIONS = ['outbound', 'inbound']
const MAX_MINUTES = 240
const BOARDING_WAIT_MINUTES = 4.5
const TRANSFER_WALK_MINUTES = 6.5
const HUB_WALK_MINUTES = 4.5
const MAX_RETRIES = 4
const RETRY_BASE_DELAY_MS = 750
const FETCH_CONCURRENCY = 4
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504])
const FALLBACK_LINE_SPEED_MPH = 22
const FALLBACK_DWELL_MINUTES = 0.5
const stopPointAliasCache = new Map()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJson(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'LondonTubeStaticGenerator/1.0 (https://github.com/)',
      },
    })
    if (res.ok) {
      return res.json()
    }
    if (RETRYABLE_STATUS.has(res.status) && attempt <= MAX_RETRIES) {
      const retryAfter = Number(res.headers.get('Retry-After'))
      const delayMs = Number.isFinite(retryAfter)
        ? retryAfter * 1000
        : RETRY_BASE_DELAY_MS * attempt
      console.warn(`Retrying ${url} after ${delayMs}ms (status ${res.status})`)
      await sleep(delayMs)
      return fetchJson(url, attempt + 1)
    }
    throw new Error(`Request failed for ${url} with status ${res.status}`)
  } catch (error) {
    if (attempt > MAX_RETRIES) throw error
    console.warn(`Retrying ${url} due to error: ${error.message}`)
    await sleep(RETRY_BASE_DELAY_MS * attempt)
    return fetchJson(url, attempt + 1)
  }
}

async function loadJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

async function resolveStationId(id, stationMap) {
  if (!id) return null
  if (stationMap.has(id)) return id
  if (stopPointAliasCache.has(id)) return stopPointAliasCache.get(id)
  let canonical = null
  try {
    const data = await fetchJson(`${API_BASE}/StopPoint/${id}`)
    const candidates = [data?.id, data?.stationId, data?.hubNaptanCode, data?.naptanId, data?.stationNaptan, data?.icsCode]
    for (const candidate of candidates) {
      if (candidate && stationMap.has(candidate)) {
        canonical = candidate
        break
      }
    }
  } catch (error) {
    console.warn(`Unable to resolve stop ${id}: ${error.message}`)
  }
  stopPointAliasCache.set(id, canonical)
  return canonical
}

function pooledMap(concurrency, items, iterator) {
  let active = 0
  let index = 0

  return new Promise((resolve, reject) => {
    const output = []

    const launchNext = () => {
      if (index >= items.length && active === 0) {
        resolve(output)
        return
      }
      while (active < concurrency && index < items.length) {
        const currentIndex = index++
        active++
        Promise.resolve()
          .then(() => iterator(items[currentIndex], currentIndex))
          .then(result => {
            output[currentIndex] = result
            active--
            launchNext()
          })
          .catch(err => {
            reject(err)
          })
      }
    }

    launchNext()
  })
}

async function getRouteData(lineCode, stationMap) {
  const requestMap = new Map()
  const sequences = []
  const coveredStations = new Set()
  for (const direction of DIRECTIONS) {
    const url = `${API_BASE}/Line/${lineCode}/Route/Sequence/${direction}?serviceTypes=Regular`
    let data
    try {
      data = await fetchJson(url)
    } catch (error) {
      console.warn(`Failed to fetch route sequence for ${lineCode} ${direction}: ${error.message}`)
      continue
    }
    const routes = Array.isArray(data?.orderedLineRoutes) ? data.orderedLineRoutes : []
    for (const route of routes) {
      const ids = Array.isArray(route?.naptanIds) ? route.naptanIds : []
      if (!ids.length) continue
      const resolved = []
      for (const rawId of ids) {
        const canonical = await resolveStationId(rawId, stationMap)
        if (!canonical) continue
        if (resolved.length && resolved[resolved.length - 1] === canonical) continue
        resolved.push(canonical)
      }
      if (resolved.length < 2) continue
      sequences.push({ lineCode, direction, stops: resolved })
      const originRawId = ids[0]
      const key = `${direction}|${originRawId}`
      if (!requestMap.has(key)) {
        requestMap.set(key, {
          lineCode,
          direction,
          originId: originRawId,
          routeStations: new Set(),
        })
      }
      const entry = requestMap.get(key)
      for (const id of resolved) {
        entry.routeStations.add(id)
        coveredStations.add(id)
      }
    }
  }
  const requests = [...requestMap.values()].map(entry => ({
    lineCode,
    direction: entry.direction,
    originId: entry.originId,
    routeStations: [...entry.routeStations],
  }))
  return { requests, sequences, coveredStations }
}

async function fetchTimetableEdges(request, stationMap) {
  const { lineCode, originId, direction } = request
  const url = `${API_BASE}/Line/${lineCode}/Timetable/${originId}?direction=${direction}`
  let data
  try {
    data = await fetchJson(url)
  } catch (error) {
    console.warn(`Failed to fetch timetable for ${lineCode} ${originId} ${direction}: ${error.message}`)
    return []
  }
  const stopAlias = new Map()
  const stops = Array.isArray(data?.stops) ? data.stops : []
  for (const stop of stops) {
    const identifiers = [stop.stationId, stop.id, stop.parentId, stop.topMostParentId]
    const canonical = identifiers.find(id => id && stationMap.has(id))
    if (!canonical) continue
    for (const identifier of identifiers) {
      if (identifier) {
        stopAlias.set(identifier, canonical)
      }
    }
  }

  const resolveStopId = id => {
    if (!id) return null
    if (stationMap.has(id)) return id
    return stopAlias.get(id) || null
  }

  const originCanonical = resolveStopId(originId)
  if (!originCanonical) {
    console.warn(`Skipping timetable ${lineCode} ${originId} ${direction}: unable to resolve origin`)
    return []
  }
  const routes = Array.isArray(data?.timetable?.routes) ? data.timetable.routes : []
  const edges = []
  for (const route of routes) {
    const intervalGroups = Array.isArray(route?.stationIntervals) ? route.stationIntervals : []
    for (const group of intervalGroups) {
      let prevStop = originCanonical
      let prevTime = 0
      const intervals = Array.isArray(group?.intervals) ? group.intervals : []
      for (const interval of intervals) {
        const stopId = resolveStopId(interval?.stopId)
        const arrival = Number(interval?.timeToArrival)
        if (!stopId) {
          continue
        }
        if (!Number.isFinite(arrival)) {
          continue
        }
        if (stopId === prevStop) {
          prevTime = arrival
          continue
        }
        const minutes = arrival - prevTime
        if (minutes > 0) {
          edges.push({ from: prevStop, to: stopId, lineCode, minutes })
        }
        prevStop = stopId
        prevTime = arrival
      }
    }
  }
  return edges
}

function recordEdge(edgeIndex, edge) {
  const key = `${edge.from}|${edge.to}`
  if (!edgeIndex.has(key)) edgeIndex.set(key, new Map())
  const segments = edgeIndex.get(key)
  const current = segments.get(edge.lineCode)
  if (!current || edge.minutes < current) {
    segments.set(edge.lineCode, edge.minutes)
  }
}

function addFallbackEdges(edgeIndex, routeSequences, stationMap, lines, coverageByLine) {
  let added = 0
  for (const sequence of routeSequences) {
    const { lineCode, stops } = sequence
    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i]
      const to = stops[i + 1]
      if (!from || !to || from === to) continue
      const key = `${from}|${to}`
      const existing = edgeIndex.get(key)
      if (existing && existing.has(lineCode)) continue
      const fromStation = stationMap.get(from)
      const toStation = stationMap.get(to)
      if (!fromStation || !toStation) continue
      const [fromLng, fromLat] = fromStation.position?.coordinates || []
      const [toLng, toLat] = toStation.position?.coordinates || []
      if (!Number.isFinite(fromLat) || !Number.isFinite(fromLng) || !Number.isFinite(toLat) || !Number.isFinite(toLng)) {
        continue
      }
      const distMeters = haversineMeters(fromLat, fromLng, toLat, toLng)
      const distMiles = distMeters / 1609.34
      const minutes = (distMiles / FALLBACK_LINE_SPEED_MPH) * 60 + FALLBACK_DWELL_MINUTES
      recordEdge(edgeIndex, { from, to, lineCode, minutes })
      added++
    }
  }
  for (const line of lines) {
    const ids = Array.isArray(line?.stationIds) ? line.stationIds : []
    if (ids.length < 2) continue
    const covered = coverageByLine.get(line.lineCode) || new Set()
    for (let i = 0; i < ids.length - 1; i++) {
      const from = ids[i]
      const to = ids[i + 1]
      if (!from || !to || from === to) continue
      if (covered.has(from) && covered.has(to)) continue
      const key = `${from}|${to}`
      const existing = edgeIndex.get(key)
      if (existing && existing.has(line.lineCode)) continue
      const fromStation = stationMap.get(from)
      const toStation = stationMap.get(to)
      if (!fromStation || !toStation) continue
      const [fromLng, fromLat] = fromStation.position?.coordinates || []
      const [toLng, toLat] = toStation.position?.coordinates || []
      if (!Number.isFinite(fromLat) || !Number.isFinite(fromLng) || !Number.isFinite(toLat) || !Number.isFinite(toLng)) {
        continue
      }
      const distMeters = haversineMeters(fromLat, fromLng, toLat, toLng)
      const distMiles = distMeters / 1609.34
      const minutes = (distMiles / FALLBACK_LINE_SPEED_MPH) * 60 + FALLBACK_DWELL_MINUTES
      recordEdge(edgeIndex, { from, to, lineCode: line.lineCode, minutes })
      added++
    }
  }
  return added
}

function ensureSymmetricEdges(edgeIndex) {
  const additions = []
  for (const [key, segments] of edgeIndex.entries()) {
    const [from, to] = key.split('|')
    const reverseKey = `${to}|${from}`
    const reverseSegments = edgeIndex.get(reverseKey)
    for (const [lineCode, minutes] of segments.entries()) {
      if (!reverseSegments || !reverseSegments.has(lineCode)) {
        additions.push({ from: to, to: from, lineCode, minutes })
      }
    }
  }
  for (const addition of additions) {
    recordEdge(edgeIndex, addition)
  }
}

function buildGraph(edgeIndex) {
  const graph = new Map()
  for (const [key, segments] of edgeIndex.entries()) {
    const [from, to] = key.split('|')
    for (const [lineCode, minutes] of segments.entries()) {
      if (!graph.has(from)) graph.set(from, [])
      graph.get(from).push({ to, lineCode, runMinutes: minutes })
    }
  }
  return graph
}

function shortestPathsFrom(originId, graph) {
  if (!graph.has(originId)) return {}
  const dist = new Map([[originId, 0]])
  const prevLine = new Map([[originId, null]])
  const visited = new Set()
  const queue = [{ id: originId, minutes: 0 }]

  function popMin() {
    let idx = -1
    let best = Infinity
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].minutes < best) {
        best = queue[i].minutes
        idx = i
      }
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
    const edges = graph.get(id) || []
    for (const edge of edges) {
      const base = dist.get(id)
      const previousLine = prevLine.get(id)
      const boardingPenalty = previousLine === null ? BOARDING_WAIT_MINUTES : 0
      const transferPenalty = previousLine && previousLine !== edge.lineCode ? TRANSFER_WALK_MINUTES + BOARDING_WAIT_MINUTES : 0
      const isOrigin = id === originId
      const hubPenalty = isOrigin && id.startsWith('HUB') ? HUB_WALK_MINUTES : 0
      const candidate = base + edge.runMinutes + boardingPenalty + transferPenalty + hubPenalty
      if (candidate > MAX_MINUTES) continue
      if (!dist.has(edge.to) || candidate < dist.get(edge.to)) {
        dist.set(edge.to, candidate)
        prevLine.set(edge.to, edge.lineCode)
        queue.push({ id: edge.to, minutes: candidate })
      }
    }
  }

  const results = {}
  for (const [stationId, minutes] of dist.entries()) {
    if (stationId === originId) continue
    const adjusted = minutes + (stationId.startsWith('HUB') ? HUB_WALK_MINUTES : 0)
    results[stationId] = Math.round(adjusted * 10) / 10
  }
  return results
}

function generateJourneys(graph) {
  const entries = []
  const stationIds = [...graph.keys()].sort()
  for (const originId of stationIds) {
    const distances = shortestPathsFrom(originId, graph)
    for (const [destination, minutes] of Object.entries(distances)) {
      if (!Number.isFinite(minutes) || minutes <= 0) continue
      entries.push({ fromStationId: originId, toStationId: destination, minutes })
    }
  }
  return entries
}

async function main() {
  const stationData = await loadJson(STATIONS_PATH)
  const stations = Array.isArray(stationData?.stations) ? stationData.stations : []
  const stationMap = new Map(stations.map(station => [station.stationId, station]))
  const lineData = await loadJson(LINES_PATH)
  const lines = Array.isArray(lineData?.lines) ? lineData.lines.filter(line => line.mode === 'tube') : []

  const timetableRequests = []
  const routeSequences = []
  const coverageByLine = new Map()
  for (const line of lines) {
    const { requests, sequences, coveredStations } = await getRouteData(line.lineCode, stationMap)
    timetableRequests.push(...requests)
    routeSequences.push(...sequences)
    coverageByLine.set(line.lineCode, coveredStations)
  }

  console.log(`Generated ${timetableRequests.length} timetable requests`)

  const edgeIndex = new Map()
  const results = await pooledMap(FETCH_CONCURRENCY, timetableRequests, async request => {
    const edges = await fetchTimetableEdges(request, stationMap)
    return { request, edges }
  })

  let timetableEdgeCount = 0
  for (const result of results) {
    const edges = Array.isArray(result?.edges) ? result.edges : []
    for (const edge of edges) {
      recordEdge(edgeIndex, edge)
      timetableEdgeCount++
    }
  }

  const fallbackEdges = addFallbackEdges(edgeIndex, routeSequences, stationMap, lines, coverageByLine)

  ensureSymmetricEdges(edgeIndex)

  const graph = buildGraph(edgeIndex)
  const journeys = generateJourneys(graph)
  const graphEdges = []
  for (const [fromStationId, edges] of graph.entries()) {
    for (const edge of edges) {
      graphEdges.push({
        fromStationId,
        toStationId: edge.to,
        lineCode: edge.lineCode,
        runMinutes: Math.round(edge.runMinutes * 100) / 100,
      })
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'tfl-timetables-v1',
    transferPenaltyMinutes: TRANSFER_WALK_MINUTES + BOARDING_WAIT_MINUTES,
    generatedWith: 'scripts/generate-static-tube-times.js',
    metadata: {
      timetableRequests: timetableRequests.length,
      timetableEdgesParsed: timetableEdgeCount,
      fallbackEdges,
      graphStations: graph.size,
      graphEdges: [...graph.values()].reduce((sum, edges) => sum + edges.length, 0),
      boardingWaitMinutes: BOARDING_WAIT_MINUTES,
      transferWalkMinutes: TRANSFER_WALK_MINUTES,
      hubWalkMinutes: HUB_WALK_MINUTES,
    },
    graphEdges,
    journeys,
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`Wrote ${journeys.length} journeys to ${OUTPUT_PATH}`)
}

if (require.main === module) {
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
