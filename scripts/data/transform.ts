import fs from 'fs/promises'
import path from 'path'

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

interface TransformedLine {
  lineCode: string
  displayName: string
  brandColor: string
  textColor: string
  mode: 'tube' | 'dlr'
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
  
  return {
    lines: JSON.parse(linesRaw) as RawLine[],
    routes: JSON.parse(routesRaw) as Record<string, RawRoute>,
  }
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
      // Parse ALL lineStrings to handle branches (e.g., Northern line has multiple branches)
      route.lineStrings.forEach((lineStringJson: string, index: number) => {
        try {
          const lineString = JSON.parse(lineStringJson) as unknown
          // TfL lineStrings structure: array containing one array of coordinates
          if (Array.isArray(lineString) && lineString.length > 0 && Array.isArray(lineString[0])) {
            const coordArray = lineString[0]
            const segment: [number, number][] = []
            coordArray.forEach((coord: [number, number]) => {
              if (Array.isArray(coord) && coord.length === 2) {
                segment.push(coord)
              }
            })
            if (segment.length >= 2) {
              allCoordinates.push(segment)
            }
          }
        } catch (e) {
          console.error(`Failed to parse lineString ${index} for ${line.id}:`, e)
        }
      })
      
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
    const allPoints: [number, number][] = allCoordinates.flat()
    const lons = allPoints.map((c: [number, number]) => c[0])
    const lats = allPoints.map((c: [number, number]) => c[1])
    const bounds: [[number, number], [number, number]] | undefined = allPoints.length > 0 ? [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ] : undefined
    
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
      mode: line.modeName === 'dlr' ? 'dlr' : 'tube',
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

async function main() {
  try {
    console.log('Transforming TfL data...')
    
    // Load raw data
    const { lines, routes } = await loadRawData()
    
    // Transform to our schema
    const linesData = transformLines(lines, routes)
    const stationsData = transformStations(routes)
    
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
    
    // Write metadata
    const metadata = {
      generatedAt: new Date().toISOString(),
      source: {
        provider: 'Transport for London',
        apiEndpoints: [
          'https://api.tfl.gov.uk/Line/Mode/tube,dlr',
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
    
  } catch (error) {
    console.error('❌ Transformation failed:', error)
    process.exit(1)
  }
}

main()
