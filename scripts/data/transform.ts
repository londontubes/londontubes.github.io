import fs from 'fs/promises'
import path from 'path'
import { buildBusRouteColorMap, getBusRouteColor } from '../../app/lib/map/busRouteColors'

const CACHE_DIR = path.join(process.cwd(), 'scripts', 'cache')
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data')

// Line color mappings from TfL brand guidelines
const LINE_COLORS: Record<string, { brand: string; text: string }> = {
  'bakerloo': { brand: '#B36305', text: '#FFFFFF' },
  'central': { brand: '#E32017', text: '#FFFFFF' },
  'circle': { brand: '#FFD300', text: '#000000' },
  'district': { brand: '#00782A', text: '#FFFFFF' },
  'dlr': { brand: '#00A4A7', text: '#FFFFFF' },
  'hammersmith-city': { brand: '#F3A9BB', text: '#000000' },
  'jubilee': { brand: '#A0A5A9', text: '#000000' },
  'metropolitan': { brand: '#9B0056', text: '#FFFFFF' },
  'northern': { brand: '#000000', text: '#FFFFFF' },
  'piccadilly': { brand: '#003688', text: '#FFFFFF' },
  'victoria': { brand: '#0098D4', text: '#FFFFFF' },
  'waterloo-city': { brand: '#95CDBA', text: '#000000' },
  'elizabeth': { brand: '#6950A1', text: '#FFFFFF' },
}

/**
 * Deduplicate overlapping route segments from TfL API.
 * TfL returns full origin-to-destination routes for every journey combination,
 * so branching lines (Elizabeth, Northern, etc.) have the shared central section
 * duplicated many times. This extracts unique point-to-point edges and
 * reconstructs minimal polylines between branch points / terminals.
 */
function deduplicateTrackSegments(segments: [number, number][][]): [number, number][][] {
  if (segments.length <= 1) return segments

  // --- Phase 1: Snap nearby coordinates together ---
  // TfL uses slightly different coordinates for the same station across route
  // variants (e.g. Paddington at -0.177107 vs -0.176174). Cluster points within
  // ~150m and replace with a single representative coordinate.
  const SNAP_THRESHOLD = 0.002 // ~150m at London latitude

  const allCoords: [number, number][] = []
  for (const seg of segments) {
    for (const c of seg) allCoords.push(c)
  }

  // Union-Find for clustering
  const parent = new Map<number, number>()
  function find(i: number): number {
    while (parent.get(i) !== i) {
      parent.set(i, parent.get(parent.get(i)!)!)
      i = parent.get(i)!
    }
    return i
  }
  function union(a: number, b: number) {
    const ra = find(a), rb = find(b)
    if (ra !== rb) parent.set(rb, ra)
  }

  // Deduplicate allCoords by exact value first to limit N^2 comparisons
  const uniqueMap = new Map<string, number>() // exactKey → first index
  const indexToUnique: number[] = [] // allCoords index → unique representative index
  const uniqueCoords: [number, number][] = []

  for (let i = 0; i < allCoords.length; i++) {
    const key = `${allCoords[i][0]},${allCoords[i][1]}`
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, uniqueCoords.length)
      parent.set(uniqueCoords.length, uniqueCoords.length)
      uniqueCoords.push(allCoords[i])
    }
    indexToUnique.push(uniqueMap.get(key)!)
  }

  // Cluster unique coords within threshold
  for (let i = 0; i < uniqueCoords.length; i++) {
    for (let j = i + 1; j < uniqueCoords.length; j++) {
      const dx = uniqueCoords[i][0] - uniqueCoords[j][0]
      const dy = uniqueCoords[i][1] - uniqueCoords[j][1]
      if (Math.abs(dx) < SNAP_THRESHOLD && Math.abs(dy) < SNAP_THRESHOLD) {
        union(i, j)
      }
    }
  }

  // Build representative coord per cluster (use the first member)
  const clusterRep = new Map<number, [number, number]>()
  for (let i = 0; i < uniqueCoords.length; i++) {
    const root = find(i)
    if (!clusterRep.has(root)) clusterRep.set(root, uniqueCoords[root])
  }

  // Apply snapping: rebuild segments with normalized coordinates
  let ci = 0
  const snapped: [number, number][][] = segments.map(seg =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    seg.map(_=> clusterRep.get(find(indexToUnique[ci++]))!)
  )

  // --- Phase 2: Edge deduplication ---
  function coordKey(c: [number, number]): string {
    return `${c[0].toFixed(6)},${c[1].toFixed(6)}`
  }

  function edgeKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`
  }

  const edgeSet = new Set<string>()
  const adj = new Map<string, Set<string>>()
  const coordLookup = new Map<string, [number, number]>()

  for (const seg of snapped) {
    for (let i = 0; i < seg.length - 1; i++) {
      const ka = coordKey(seg[i])
      const kb = coordKey(seg[i + 1])
      if (ka === kb) continue
      coordLookup.set(ka, seg[i])
      coordLookup.set(kb, seg[i + 1])
      const ek = edgeKey(ka, kb)
      if (!edgeSet.has(ek)) {
        edgeSet.add(ek)
        if (!adj.has(ka)) adj.set(ka, new Set())
        if (!adj.has(kb)) adj.set(kb, new Set())
        adj.get(ka)!.add(kb)
        adj.get(kb)!.add(ka)
      }
    }
  }

  // --- Phase 3: Remove shortcut edges ---
  // TfL sometimes skips intermediate stations in a route variant, creating
  // direct edges (e.g. Liverpool St → Stratford) that bypass the real route
  // (Liverpool St → Whitechapel → Stratford). These form triangles in the
  // graph. Remove the longest edge of each triangle (the geometric shortcut).
  function dist(a: string, b: string): number {
    const ca = coordLookup.get(a)!, cb = coordLookup.get(b)!
    return Math.hypot(ca[0] - cb[0], ca[1] - cb[1])
  }

  const shortcutsToRemove = new Set<string>()
  for (const [nodeA, neighborsA] of adj) {
    for (const nodeB of neighborsA) {
      for (const nodeC of neighborsA) {
        if (nodeB >= nodeC) continue // avoid duplicate triangle checks
        if (!adj.get(nodeB)!.has(nodeC)) continue // B-C edge must exist
        // Triangle A-B-C found. Remove the longest edge.
        const dAB = dist(nodeA, nodeB)
        const dAC = dist(nodeA, nodeC)
        const dBC = dist(nodeB, nodeC)
        const maxDist = Math.max(dAB, dAC, dBC)
        if (maxDist === dAB) shortcutsToRemove.add(edgeKey(nodeA, nodeB))
        else if (maxDist === dAC) shortcutsToRemove.add(edgeKey(nodeA, nodeC))
        else shortcutsToRemove.add(edgeKey(nodeB, nodeC))
      }
    }
  }

  for (const ek of shortcutsToRemove) {
    edgeSet.delete(ek)
    const [ka, kb] = ek.split('|')
    adj.get(ka)?.delete(kb)
    adj.get(kb)?.delete(ka)
    // Clean up isolated nodes
    if (adj.get(ka)?.size === 0) adj.delete(ka)
    if (adj.get(kb)?.size === 0) adj.delete(kb)
  }

  // Trace polylines: walk edges, splitting at branch points (degree != 2)
  const visitedEdges = new Set<string>()
  const polylines: [number, number][][] = []

  // Start from terminals / branch points (degree != 2)
  const startNodes = [...adj.entries()]
    .filter(([, neighbors]) => neighbors.size !== 2)
    .map(([key]) => key)

  // If all degree-2 (a loop), start from any node
  if (startNodes.length === 0 && adj.size > 0) {
    startNodes.push(adj.keys().next().value!)
  }

  for (const start of startNodes) {
    for (const firstNeighbor of adj.get(start)!) {
      const ek = edgeKey(start, firstNeighbor)
      if (visitedEdges.has(ek)) continue

      const path: [number, number][] = [coordLookup.get(start)!]
      let prev = start
      let curr = firstNeighbor

      while (true) {
        visitedEdges.add(edgeKey(prev, curr))
        path.push(coordLookup.get(curr)!)

        // Stop at terminals / branch points
        if (adj.get(curr)!.size !== 2) break

        const next = [...adj.get(curr)!].find(n => n !== prev)
        if (!next || visitedEdges.has(edgeKey(curr, next))) break

        prev = curr
        curr = next
      }

      if (path.length >= 2) {
        polylines.push(path)
      }
    }
  }

  return polylines.length > 0 ? polylines : segments
}

interface RawLine {
  id: string
  name: string
  modeName: string
}

interface RawRouteStation {
  id: string
  name?: string
  lat?: number | null
  lon?: number | null
}

interface RawRoute {
  stations?: RawRouteStation[]
  lineStrings?: string[]
  [key: string]: unknown
}

interface BusRouteOutput {
  routeId: string
  routeCode: string
  displayName: string
  originName: string
  destinationName: string
  brandColor: string
  textColor: string
  strokeWeight: number
  geometry: {
    type: 'LineString' | 'MultiLineString'
    coordinates: [number, number][] | [number, number][][]
  }
  bounds?: [[number, number], [number, number]]
  stopIds: string[]
  lastUpdated: string
}

interface BusStopOutput {
  stopId: string
  displayName: string
  position: {
    type: 'Point'
    coordinates: [number, number]
  }
  servedRouteIds: string[]
  indicator?: string
  importance: 'major' | 'standard'
}

interface TransformedLine {
  lineCode: string
  displayName: string
  brandColor: string
  textColor: string
  mode: 'tube' | 'dlr' | 'elizabeth-line'
  strokeWeight: number
  polyline: {
    type: 'LineString' | 'MultiLineString'
    coordinates: [number, number][] | [number, number][][]
  }
  bounds?: [[number, number], [number, number]]
  stationIds: string[]
  lastUpdated: string
}

interface TransformedStation {
  stationId: string
  displayName: string
  position: {
    type: 'Point'
    coordinates: [number, number]
  }
  lineCodes: string[]
  isInterchange: boolean
  markerIcon: string
  tooltipSummary: string
  order: number
}

async function loadRawData() {
  const linesRaw = await fs.readFile(path.join(CACHE_DIR, 'lines.raw.json'), 'utf-8')
  const routesRaw = await fs.readFile(path.join(CACHE_DIR, 'routes.raw.json'), 'utf-8')
  const busLinesRaw = await fs.readFile(path.join(CACHE_DIR, 'bus-lines.raw.json'), 'utf-8')
  const busRoutesRaw = await fs.readFile(path.join(CACHE_DIR, 'bus-routes.raw.json'), 'utf-8')
  
  return {
    lines: JSON.parse(linesRaw) as RawLine[],
    routes: JSON.parse(routesRaw) as Record<string, RawRoute>,
    busLines: JSON.parse(busLinesRaw) as RawLine[],
    busRoutes: JSON.parse(busRoutesRaw) as Record<string, RawRoute>,
  }
}

function parseLineStringSegments(lineStrings?: string[]): [number, number][][] {
  if (!lineStrings || lineStrings.length === 0) return []

  const segments: [number, number][][] = []

  lineStrings.forEach((lineStringJson) => {
    try {
      const lineString = JSON.parse(lineStringJson) as unknown
      if (!Array.isArray(lineString) || lineString.length === 0 || !Array.isArray(lineString[0])) {
        return
      }

      const segment: [number, number][] = []
      lineString[0].forEach((coord: unknown) => {
        if (Array.isArray(coord) && coord.length === 2) {
          const [lng, lat] = coord
          if (typeof lng === 'number' && typeof lat === 'number') {
            segment.push([lng, lat])
          }
        }
      })

      if (segment.length >= 2) {
        segments.push(segment)
      }
    } catch (error) {
      console.error('Failed to parse lineString:', error)
    }
  })

  return segments
}

function calculateBounds(allCoordinates: [number, number][][]): [[number, number], [number, number]] | undefined {
  const allPoints: [number, number][] = allCoordinates.flat()
  if (allPoints.length === 0) return undefined

  const lons = allPoints.map((c) => c[0])
  const lats = allPoints.map((c) => c[1])

  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ]
}

function transformLines(lines: RawLine[], routes: Record<string, RawRoute>) {
  const transformed: TransformedLine[] = lines.map(line => {
    const colors = LINE_COLORS[line.id] || { brand: '#666666', text: '#FFFFFF' }
    const route = routes[line.id]
    
    // Extract stations from route
    const stationIds: string[] = []
    let allCoordinates: [number, number][][] = []
    
    if (route?.stations) {
      route.stations.forEach((station: RawRouteStation) => {
        stationIds.push(station.id)
      })
    }
    
    // Use TfL lineStrings for proper route paths (includes branches/forks)
    if (route?.lineStrings && route.lineStrings.length > 0) {
      allCoordinates = parseLineStringSegments(route.lineStrings)
      
      // Fallback to station coordinates if no valid lineStrings parsed
      if (allCoordinates.length === 0 && route.stations) {
        const fallbackCoords: [number, number][] = []
        route.stations.forEach((station: RawRouteStation) => {
          if (typeof station.lat === 'number' && typeof station.lon === 'number') {
            fallbackCoords.push([station.lon, station.lat])
          }
        })
        if (fallbackCoords.length >= 2) {
          allCoordinates.push(fallbackCoords)
        }
      }
    } else if (route?.stations) {
      // Fallback: use station coordinates
      const fallbackCoords: [number, number][] = []
      route.stations.forEach((station: RawRouteStation) => {
        if (typeof station.lat === 'number' && typeof station.lon === 'number') {
          fallbackCoords.push([station.lon, station.lat])
        }
      })
      if (fallbackCoords.length >= 2) {
        allCoordinates.push(fallbackCoords)
      }
    }
    
    // Deduplicate overlapping route segments from TfL API
    allCoordinates = deduplicateTrackSegments(allCoordinates)

    // Connectivity correction for two-station lines (e.g., Waterloo & City):
    // If we have exactly two stations and multiple segments that are simple reversals, unify them and snap endpoints to station coordinates.
    if (stationIds.length === 2 && route?.stations && route.stations.length >= 2 && allCoordinates.length >= 1) {
      const stationPosMap: Record<string, [number, number]> = {}
      route.stations.forEach((s: RawRouteStation) => {
        if (s.id && typeof s.lat === 'number' && typeof s.lon === 'number') {
          stationPosMap[s.id] = [s.lon, s.lat]
        }
      })
      const aId = stationIds[0]
      const bId = stationIds[1]
      const aPos = stationPosMap[aId]
      const bPos = stationPosMap[bId]

      const isReverse = (seg1: [number, number][], seg2: [number, number][]) => {
        if (seg1.length !== seg2.length) return false
        for (let i = 0; i < seg1.length; i++) {
          const a = seg1[i]
          const b = seg2[seg2.length - 1 - i]
          if (Math.abs(a[0] - b[0]) > 1e-6 || Math.abs(a[1] - b[1]) > 1e-6) return false
        }
        return true
      }

      // Deduplicate reversed pair (two segments that are path and its reverse)
      if (allCoordinates.length === 2 && isReverse(allCoordinates[0], allCoordinates[1])) {
        allCoordinates = [allCoordinates[0]]
      }

      // Snap endpoints if they differ from station positions by > ~150m (approx 0.0015 deg lat/lon)
      if (aPos && bPos) {
        allCoordinates = allCoordinates.map(segment => {
          if (segment.length === 0) return segment
          const [first] = segment
          const dist = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1])
          const oriented = dist(first, aPos) <= dist(first, bPos) ? [...segment] : [...segment].reverse()
          const adjusted = [...oriented]
          if (adjusted.length > 0) {
            adjusted[0] = aPos
            adjusted[adjusted.length - 1] = bPos
          }
          return adjusted
        })
      }
    }

    // Calculate bounds from all coordinate segments
    const bounds = calculateBounds(allCoordinates)
    
    // Use MultiLineString if multiple segments, LineString if single segment
    const polylineType = allCoordinates.length > 1 ? 'MultiLineString' : 'LineString'
    const polylineCoords = allCoordinates.length > 1 
      ? allCoordinates 
      : (allCoordinates[0] || [[-0.1, 51.5], [-0.1, 51.5]])
    
    return {
      lineCode: line.id,
      displayName: line.name,
      brandColor: colors.brand,
      textColor: colors.text,
      mode: line.modeName === 'dlr' ? 'dlr' : line.modeName === 'elizabeth-line' ? 'elizabeth-line' : 'tube',
      strokeWeight: 4,
      polyline: {
        type: polylineType,
        coordinates: polylineCoords,
      },
      bounds,
      stationIds,
      lastUpdated: new Date().toISOString(),
    }
  })
  
  return {
    generatedAt: new Date().toISOString(),
    source: {
      provider: 'Transport for London',
      dataset: 'GeoJSON',
    },
    lines: transformed,
  }
}

function transformStations(routes: Record<string, RawRoute>) {
  const stationMap = new Map<string, TransformedStation>()
  
  // Collect all unique stations across lines
  Object.entries(routes).forEach(([lineId, route]) => {
    if (!route?.stations) return
    
    route.stations.forEach((station: RawRouteStation) => {
      if (!stationMap.has(station.id)) {
        const transformedStation: TransformedStation = {
          stationId: station.id,
          displayName: station.name || station.id,
          position: {
            type: 'Point',
            coordinates: [typeof station.lon === 'number' ? station.lon : 0, typeof station.lat === 'number' ? station.lat : 0],
          },
          lineCodes: [lineId],
          isInterchange: false,
          markerIcon: 'default',
          tooltipSummary: station.name || station.id,
          order: 0,
        }
        stationMap.set(station.id, transformedStation)
      } else {
        const existing = stationMap.get(station.id)
        if (existing && !existing.lineCodes.includes(lineId)) {
          existing.lineCodes.push(lineId)
          existing.isInterchange = existing.lineCodes.length > 1
        }
      }
    })
  })
  
  return {
    generatedAt: new Date().toISOString(),
    stations: Array.from(stationMap.values()),
  }
}

function transformBusRoutes(lines: RawLine[], routes: Record<string, RawRoute>) {
  const routeColorMap = buildBusRouteColorMap(lines.map((line) => line.name))
  const transformed: BusRouteOutput[] = lines.map((line) => {
    const route = routes[line.id]
    const stopIds: string[] = []
    const allCoordinates = parseLineStringSegments(route?.lineStrings)
    const routeColors = getBusRouteColor(line.name, routeColorMap)

    if (route?.stations) {
      route.stations.forEach((station) => {
        stopIds.push(station.id)
      })
    }

    if (allCoordinates.length === 0 && route?.stations) {
      const fallbackCoords: [number, number][] = []
      route.stations.forEach((station) => {
        if (typeof station.lat === 'number' && typeof station.lon === 'number') {
          fallbackCoords.push([station.lon, station.lat])
        }
      })
      if (fallbackCoords.length >= 2) {
        allCoordinates.push(fallbackCoords)
      }
    }

    const bounds = calculateBounds(allCoordinates)
    const firstStop = route?.stations?.[0]
    const lastStop = route?.stations?.[route.stations.length - 1]
    const geometryType: BusRouteOutput['geometry']['type'] = allCoordinates.length > 1
      ? 'MultiLineString'
      : 'LineString'
    const geometryCoordinates = allCoordinates.length > 1
      ? allCoordinates
      : (allCoordinates[0] || [[-0.1, 51.5], [-0.1, 51.5]])

    return {
      routeId: line.id,
      routeCode: line.name,
      displayName: `Route ${line.name}`,
      originName: firstStop?.name || line.name,
      destinationName: lastStop?.name || line.name,
      brandColor: routeColors.brand,
      textColor: routeColors.text,
      strokeWeight: 3,
      geometry: {
        type: geometryType,
        coordinates: geometryCoordinates,
      },
      bounds,
      stopIds: Array.from(new Set(stopIds)),
      lastUpdated: new Date().toISOString(),
    }
  }).filter((route) => route.stopIds.length > 0)

  return {
    generatedAt: new Date().toISOString(),
    source: {
      provider: 'Transport for London',
      dataset: 'GeoJSON',
    },
    routes: transformed,
  }
}

function transformBusStops(routes: Record<string, RawRoute>) {
  const stopMap = new Map<string, BusStopOutput>()

  Object.entries(routes).forEach(([routeId, route]) => {
    if (!route.stations) return

    route.stations.forEach((station, index) => {
      const importance: 'major' | 'standard' = index === 0 || index === route.stations!.length - 1 ? 'major' : 'standard'

      if (!stopMap.has(station.id)) {
        stopMap.set(station.id, {
          stopId: station.id,
          displayName: station.name || station.id,
          position: {
            type: 'Point',
            coordinates: [typeof station.lon === 'number' ? station.lon : 0, typeof station.lat === 'number' ? station.lat : 0],
          },
          servedRouteIds: [routeId],
          importance,
        })
      } else {
        const existing = stopMap.get(station.id)
        if (existing && !existing.servedRouteIds.includes(routeId)) {
          existing.servedRouteIds.push(routeId)
          if (importance === 'major') {
            existing.importance = 'major'
          }
        }
      }
    })
  })

  return {
    generatedAt: new Date().toISOString(),
    source: {
      provider: 'Transport for London',
      dataset: 'GeoJSON',
    },
    stops: Array.from(stopMap.values()),
  }
}

async function main() {
  try {
    console.log('Transforming TfL data...')
    
    // Load raw data
    const { lines, routes, busLines, busRoutes } = await loadRawData()
    
    // Transform to our schema
    const linesData = transformLines(lines, routes)
    const stationsData = transformStations(routes)
    const busRoutesData = transformBusRoutes(busLines, busRoutes)
    const busStopsData = transformBusStops(busRoutes)
    
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    
    // Write transformed data
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'lines.json'),
      JSON.stringify(linesData, null, 2)
    )
    
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'stations.json'),
      JSON.stringify(stationsData, null, 2)
    )

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'buses.json'),
      JSON.stringify(busRoutesData, null, 2)
    )

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'bus-stops.json'),
      JSON.stringify(busStopsData, null, 2)
    )
    
    // Write metadata
    const metadata = {
      generatedAt: new Date().toISOString(),
      source: {
        provider: 'Transport for London',
        apiEndpoints: [
          'https://api.tfl.gov.uk/Line/Mode/tube,dlr',
          'https://api.tfl.gov.uk/Line/Mode/bus',
          'https://api.tfl.gov.uk/Line/{id}/Route/Sequence/all',
        ],
      },
      datasetVersion: '1.0.0',
      lineCount: linesData.lines.length,
      stationCount: stationsData.stations.length,
      lastRefresh: new Date().toISOString(),
    }
    
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    )
    
    console.log('✅ Data transformation complete')
    console.log(`   Lines: ${linesData.lines.length}`)
    console.log(`   Stations: ${stationsData.stations.length}`)
    console.log(`   Bus routes: ${busRoutesData.routes.length}`)
    console.log(`   Bus stops: ${busStopsData.stops.length}`)
    
  } catch (error) {
    console.error('❌ Transformation failed:', error)
    process.exit(1)
  }
}

main()
