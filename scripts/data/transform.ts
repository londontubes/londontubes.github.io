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

interface RawStation {
  id: string
  name: string
  lat: number
  lon: number
}

async function loadRawData() {
  const linesRaw = await fs.readFile(path.join(CACHE_DIR, 'lines.raw.json'), 'utf-8')
  const routesRaw = await fs.readFile(path.join(CACHE_DIR, 'routes.raw.json'), 'utf-8')
  
  return {
    lines: JSON.parse(linesRaw) as RawLine[],
    routes: JSON.parse(routesRaw) as Record<string, any>,
  }
}

function transformLines(lines: RawLine[], routes: Record<string, any>) {
  const transformed = lines.map(line => {
    const colors = LINE_COLORS[line.id] || { brand: '#666666', text: '#FFFFFF' }
    const route = routes[line.id]
    
    // Extract stations from route
    const stationIds: string[] = []
  let allCoordinates: [number, number][][] = []
    
    if (route && route.stations) {
      route.stations.forEach((station: any) => {
        stationIds.push(station.id)
      })
    }
    
    // Use TfL lineStrings for proper route paths (includes branches/forks)
    if (route && route.lineStrings && route.lineStrings.length > 0) {
      // Parse ALL lineStrings to handle branches (e.g., Northern line has multiple branches)
      route.lineStrings.forEach((lineStringJson: string, index: number) => {
        try {
          const lineString = JSON.parse(lineStringJson)
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
        route.stations.forEach((station: any) => {
          if (station.lat && station.lon) {
            fallbackCoords.push([station.lon, station.lat])
          }
        })
        if (fallbackCoords.length >= 2) {
          allCoordinates.push(fallbackCoords)
        }
      }
    } else if (route && route.stations) {
      // Fallback: use station coordinates
      const fallbackCoords: [number, number][] = []
      route.stations.forEach((station: any) => {
        if (station.lat && station.lon) {
          fallbackCoords.push([station.lon, station.lat])
        }
      })
      if (fallbackCoords.length >= 2) {
        allCoordinates.push(fallbackCoords)
      }
    }
    
    // Connectivity correction for two-station lines (e.g., Waterloo & City):
    // If we have exactly two stations and multiple segments that are simple reversals, unify them and snap endpoints to station coordinates.
    if (stationIds.length === 2 && route && route.stations && route.stations.length >= 2 && allCoordinates.length >= 1) {
      const stationPosMap: Record<string, [number, number]> = {}
      route.stations.forEach((s: any) => {
        if (s.id && s.lat && s.lon) {
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
      const SNAP_THRESHOLD = 0.0015
      if (aPos && bPos) {
        allCoordinates = allCoordinates.map(segment => {
          const first = segment[0]
          const last = segment[segment.length - 1]
          const dist = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1])
          const newFirst = dist(first, aPos) > SNAP_THRESHOLD && dist(first, bPos) < dist(first, aPos) ? first : aPos
          const newLast = dist(last, bPos) > SNAP_THRESHOLD && dist(last, aPos) < dist(last, bPos) ? last : bPos
          // Ensure we orient from aPos to bPos consistently
          const oriented = dist(newFirst, aPos) <= dist(newFirst, bPos) ? segment : [...segment].reverse()
          const adjusted = [...oriented]
          adjusted[0] = aPos
          adjusted[adjusted.length - 1] = bPos
          return adjusted
        })
      }
    }

    // Calculate bounds from all coordinate segments
    const allPoints: [number, number][] = allCoordinates.flat()
    const lons = allPoints.map((c: [number, number]) => c[0])
    const lats = allPoints.map((c: [number, number]) => c[1])
    const bounds = allPoints.length > 0 ? [
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

function transformStations(routes: Record<string, any>) {
  const stationMap = new Map<string, any>()
  
  // Collect all unique stations across lines
  Object.entries(routes).forEach(([lineId, route]) => {
    if (!route || !route.stations) return
    
    route.stations.forEach((station: any) => {
      if (!stationMap.has(station.id)) {
        stationMap.set(station.id, {
          stationId: station.id,
          displayName: station.name || station.id,
          position: {
            type: 'Point',
            coordinates: [station.lon || 0, station.lat || 0],
          },
          lineCodes: [lineId],
          isInterchange: false,
          markerIcon: 'default',
          tooltipSummary: station.name || station.id,
          order: 0,
        })
      } else {
        const existing = stationMap.get(station.id)
        if (!existing.lineCodes.includes(lineId)) {
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
