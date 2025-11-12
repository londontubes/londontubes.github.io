'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet'
import { trackStationSelect, trackMapZoom } from '@/app/lib/analytics'
import L from 'leaflet'
import type { Station, TransitLine } from '@/app/types/transit'
import type { UniversitiesDataset } from '@/app/types/university'
import type { TravelTimeResult } from '@/app/lib/map/travelTime'
import { calculateDistance, WALK_SPEED_MPH, WALK_OVERHEAD_MINUTES, WALK_ROUTE_FACTOR } from '@/app/lib/map/proximity'
import { stationMarkerAriaLabel } from '@/app/lib/a11y'

const LONDON_CENTER: [number, number] = [51.5074, -0.1278]
const DEFAULT_ZOOM = 11

export type MapStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface MapCanvasProps {
  lines: TransitLine[]
  stations: Station[]
  activeLineCodes: string[]
  selectedStation: Station | null
  onStationSelect: (station: Station | null) => void
  lineLabels: Record<string, string>
  onStatusChange?: (status: MapStatus) => void
  universities?: UniversitiesDataset
  universityMode?: boolean
  selectedUniversityId?: string | null
  onUniversityClick?: (universityId: string) => void
  travelTimeResults?: TravelTimeResult[]
  filterMode?: 'radius' | 'time'
  filteredStationIds?: string[]
  radiusMiles?: number
  campusCoordinates?: [number, number] // [lng, lat] of selected campus
}

// Helper functions
function stationVisible(
  station: Station,
  active: Set<string> | null,
  filteredIds: Set<string> | null
): boolean {
  if (filteredIds && filteredIds.size > 0) {
    return filteredIds.has(station.stationId)
  }
  if (!active) return true
  return station.lineCodes.some(code => active.has(code))
}

// Component to handle map events
function MapEventHandler({
  onMapClick,
  selectedUniversityId,
}: {
  onMapClick: () => void
  selectedUniversityId: string | null
}) {
  useMapEvents({
    click: () => {
      if (!selectedUniversityId) {
        onMapClick()
      }
    },
  })
  return null
}

// Component to manage university center and zoom
function UniversityFocusHandler({
  selectedUniversityId,
  universities,
}: {
  selectedUniversityId: string | null
  universities?: UniversitiesDataset
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedUniversityId && universities) {
      const uni = universities.features.find((u) => u.properties.universityId === selectedUniversityId)
      if (uni) {
        map.setView([uni.geometry.coordinates[1], uni.geometry.coordinates[0]], 13, {
          animate: true,
        })
      }
    }
  }, [selectedUniversityId, universities, map])

  return null
}

// Station markers component
function StationMarkers({
  stations,
  activeSet,
  filteredStationSet,
  selectedStation,
  onStationSelect,
  lineLabels,
  lines,
  filterMode,
}: {
  stations: Station[]
  activeSet: Set<string> | null
  filteredStationSet: Set<string> | null
  selectedStation: Station | null
  onStationSelect: (station: Station | null) => void
  travelTimeResults?: TravelTimeResult[]
  filterMode?: 'radius' | 'time'
  lineLabels: Record<string, string>
  lines: TransitLine[]
}) {
  // Create a map of line code to brand color
  const lineColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    lines.forEach(line => {
      map[line.lineCode] = line.brandColor
    })
    return map
  }, [lines])

  // Track popup opens (station selection)
  useEffect(() => {
    if (selectedStation) {
      trackStationSelect(selectedStation.stationId)
    }
  }, [selectedStation])

  const visibleStations = stations.filter(s => stationVisible(s, activeSet, filteredStationSet))

  return (
    <>
      {visibleStations.map(station => {
  const isSelected = selectedStation?.stationId === station.stationId
  const isFiltered = filteredStationSet?.has(station.stationId)
  // Default marker styling
  let color = '#FFFFFF'

        let radius = 8
        
        if (filteredStationSet) {
          if (filterMode === 'radius') {
            // Walking-time filter active: green for reachable stations, grey for others
            if (isFiltered) {
              color = '#4CAF50'
              radius = 9
            } else {
              color = '#333333'
              radius = 6
            }
          } else {
            // Time-based (tube) filter: keep previous scheme (white for reachable, grey for others)
            if (!isFiltered) {
              color = '#333333'
              radius = 6
            }
          }
        }

        if (isSelected) {
          color = '#0066cc' // Blue for selected
          radius = 10
        }

        return (
          <CircleMarker
            key={station.stationId}
            center={[station.position.coordinates[1], station.position.coordinates[0]]}
            radius={radius}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.8,
              color: isSelected ? '#0066cc' : '#000000',
              weight: 2,
            }}
            eventHandlers={{
              click: (e: L.LeafletMouseEvent) => {
                L.DomEvent.stopPropagation(e)
                onStationSelect(station)
              },
            }}
          >
            {/* Accessibility title */}
            <title>{stationMarkerAriaLabel(station)}</title>
            {/* Show popup for selected station */}
            {isSelected && (
              <Popup
                offset={[0, -10]}
                closeButton={true}
                autoClose={false}
                closeOnClick={false}
              >
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                    {station.displayName}
                  </h3>
                  <div style={{ fontSize: '14px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {station.lineCodes.map(code => (
                      <span 
                        key={code} 
                        style={{ 
                          display: 'inline-block',
                          padding: '4px 10px',
                          backgroundColor: lineColorMap[code] || '#0066cc',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {lineLabels[code] || code}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            )}
          </CircleMarker>
        )
      })}
    </>
  )
}

// University markers component
function UniversityMarkers({
  universities,
  selectedUniversityId,
  onUniversityClick,
}: {
  universities?: UniversitiesDataset
  selectedUniversityId?: string | null
  onUniversityClick?: (id: string) => void
}) {
  if (!universities) return null

  // Only show selected university marker if one is selected
  const featuresToShow = selectedUniversityId
    ? universities.features.filter(f => f.properties.universityId === selectedUniversityId)
    : universities.features

  return (
    <>
      {featuresToShow.map(feature => {
        const uni = feature.properties
        const isSelected = selectedUniversityId === uni.universityId
        
        return (
          <CircleMarker
            key={uni.universityId}
            center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
            radius={isSelected ? 14 : 10}
            pathOptions={{
              fillColor: isSelected ? '#FFD700' : '#FFA500',
              fillOpacity: 0.9,
              color: isSelected ? '#0066cc' : '#000000',
              weight: isSelected ? 4 : 2,
            }}
            eventHandlers={{
              click: (e: L.LeafletMouseEvent) => {
                L.DomEvent.stopPropagation(e)
                if (onUniversityClick) {
                  onUniversityClick(uni.universityId)
                }
              },
            }}
          >
            <title>{uni.displayName}</title>
          </CircleMarker>
        )
      })}
    </>
  )
}

// Radius circle component
function RadiusCircle({
  selectedUniversityId,
  universities,
  radiusMiles,
}: {
  selectedUniversityId?: string | null
  universities?: UniversitiesDataset
  radiusMiles?: number
}) {
  if (!selectedUniversityId || !universities || !radiusMiles) return null

  const uni = universities.features.find((u) => u.properties.universityId === selectedUniversityId)
  if (!uni) return null

  const radiusMeters = radiusMiles * 1609.34

  return (
    <Circle
      center={[uni.geometry.coordinates[1], uni.geometry.coordinates[0]]}
      radius={radiusMeters}
      interactive={false}
      bubblingMouseEvents={false}
      pathOptions={{
        color: '#4CAF50',
        fillColor: '#4CAF50',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 10',
        // Disable pointer events to ensure station markers beneath remain clickable
        pane: 'overlayPane'
      }}
    />
  )
}

export default function LeafletMapCanvas(props: MapCanvasProps) {
  const {
    lines,
    stations,
    activeLineCodes,
    selectedStation,
    onStationSelect,
    lineLabels,
    onStatusChange,
    universities,
    selectedUniversityId,
    onUniversityClick,
    filteredStationIds = [],
    radiusMiles,
    campusCoordinates,
    filterMode,
  } = props

  const mapRef = useRef<L.Map | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('LeafletMapCanvas mounted, lines:', lines.length, 'stations:', stations.length)
    console.log('Universities:', universities?.features.length || 0)
    console.log('Selected university:', selectedUniversityId)
    onStatusChange?.('ready')
  }, [onStatusChange, lines.length, stations.length, universities, selectedUniversityId])

  useEffect(() => {
    // Check if we can create Leaflet map
    try {
      if (typeof window !== 'undefined') {
        console.log('Window is defined, Leaflet available:', typeof L !== 'undefined')
      }
    } catch (e) {
      console.error('Error checking Leaflet:', e)
      setError(`Error: ${e}`)
    }
  }, [])

  const activeSet = useMemo(
    () => (activeLineCodes.length ? new Set(activeLineCodes) : null),
    [activeLineCodes]
  )

  const filteredStationSet = useMemo(
    () => (filteredStationIds.length ? new Set(filteredStationIds) : null),
    [filteredStationIds]
  )

  // Walking route state (road-following path from campus to selected station)
  const [walkingRoute, setWalkingRoute] = useState<[number, number][]>([])
  const [walkingRouteError, setWalkingRouteError] = useState<string | null>(null)
  const [walkingRouteLoading, setWalkingRouteLoading] = useState(false)
  const [walkingRouteDistanceMiles, setWalkingRouteDistanceMiles] = useState<number | null>(null)
  const [walkingRouteDurationMinutes, setWalkingRouteDurationMinutes] = useState<number | null>(null)

  // Fetch real walking route using OSRM public demo server (no key required)
  useEffect(() => {
    // Only in walk radius mode, with campus + selected reachable station
    if (filterMode !== 'radius' || !campusCoordinates || !selectedStation || !filteredStationSet?.has(selectedStation.stationId)) {
      setWalkingRoute([])
      setWalkingRouteError(null)
      return
    }

    const [campusLng, campusLat] = campusCoordinates
    const [stationLng, stationLat] = selectedStation.position.coordinates
    const routeKey = `${campusLng},${campusLat}|${stationLng},${stationLat}`

    // Basic cache in sessionStorage to avoid repeated calls
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(`walkRoute:${routeKey}`)
      if (cached) {
        try {
          const coords: [number, number][] = JSON.parse(cached)
          setWalkingRoute(coords)
          setWalkingRouteError(null)
          return
        } catch {
          // ignore parse error
        }
      }
    }

    let abort = false
    setWalkingRouteLoading(true)
    setWalkingRouteError(null)

    const controller = new AbortController()
    const url = `https://router.project-osrm.org/route/v1/foot/${campusLng},${campusLat};${stationLng},${stationLat}?overview=full&geometries=geojson&alternatives=true&steps=false`
    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (abort) return
        if (data.code !== 'Ok' || !data.routes?.length) {
          throw new Error('No route')
        }
        // Pick shortest distance route among alternatives
        const bestRoute = data.routes.reduce((min: any, r: any) => (r.distance < min.distance ? r : min), data.routes[0])
        const geometry = bestRoute.geometry
        if (!geometry || geometry.type !== 'LineString') {
          throw new Error('Bad geometry')
        }
        const osrmCoords: [number, number][] = geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
        const osrmDistanceMiles = bestRoute.distance / 1609.34
        const osrmDurationMinutes = bestRoute.duration / 60

  // Attempt route optimization by removing small detours (ignoring one-way vehicle constraints for pedestrians).
  // Example scenario: LSE Old Building -> Covent Garden where OSRM may loop rather than staying on Aldwych -> Catherine St -> Bow St -> Floral St.
  const optimizedOsrmCoords = optimizeWalkingPolyline(osrmCoords)
  // Recalculate distance if optimization shortened path.
  const optDistanceMiles = polylineDistanceMiles(optimizedOsrmCoords)
  const optDurationMinutes = (optDistanceMiles / WALK_SPEED_MPH) * 60 + WALK_OVERHEAD_MINUTES

        // Compare with straight-line distance to optionally ignore one-way detours
        const straightMiles = calculateDistance([campusLng, campusLat], [stationLng, stationLat])
        const detourRatio = osrmDistanceMiles / straightMiles
        // Threshold: if OSRM path is >15% longer than straight line, treat as excessive detour (likely one-way constraints)
        const EXCESS_DETOUR_THRESHOLD = 1.15

  let chosenCoords: [number, number][] = optimizedOsrmCoords
  if (straightMiles > 0 && detourRatio > EXCESS_DETOUR_THRESHOLD) {
          // Ignore one-way: use direct straight path with small midpoint nudge to emulate realistic walkway
          const midLat = (campusLat + stationLat) / 2 + (stationLat - campusLat) * 0.02
          const midLng = (campusLng + stationLng) / 2 + (stationLng - campusLng) * -0.02
          const directCoords: [number, number][] = [
            [campusLat, campusLng],
            [midLat, midLng],
            [stationLat, stationLng],
          ]
          // Estimate duration using heuristic (inflated route factor removed to reflect shorter allowance)
          const directMinutes = (straightMiles / WALK_SPEED_MPH) * 60 + WALK_OVERHEAD_MINUTES
          setWalkingRoute(directCoords)
          setWalkingRouteDistanceMiles(straightMiles)
          setWalkingRouteDurationMinutes(directMinutes)
          setWalkingRouteError('One-way detours ignored for shorter walking path')
          chosenCoords = directCoords
        } else {
          // Prefer optimized route if it is at least 4% shorter than original OSRM result
          if (optDistanceMiles < osrmDistanceMiles * 0.96) {
            setWalkingRoute(optimizedOsrmCoords)
            setWalkingRouteDistanceMiles(optDistanceMiles)
            setWalkingRouteDurationMinutes(optDurationMinutes)
            chosenCoords = optimizedOsrmCoords
            setWalkingRouteError('Minor detours removed for shorter pedestrian route')
          } else {
            setWalkingRoute(osrmCoords)
            setWalkingRouteDistanceMiles(osrmDistanceMiles)
            setWalkingRouteDurationMinutes(osrmDurationMinutes)
            chosenCoords = osrmCoords
          }
        }
        setWalkingRouteLoading(false)
        if (typeof window !== 'undefined') {
          try { sessionStorage.setItem(`walkRoute:${routeKey}`, JSON.stringify(chosenCoords)) } catch {}
        }
      })
      .catch(err => {
        if (abort) return
        setWalkingRouteLoading(false)
        setWalkingRouteError(err.message || 'Route error')
        // Fallback: simple straight polyline so user still sees a connection
        const fallback: [number, number][] = [
          [campusLat, campusLng],
          [stationLat, stationLng],
        ]
        setWalkingRoute(fallback)
        // Approximate fallback metrics using heuristic inflation
        const straightMiles = calculateDistance([campusLng, campusLat], [stationLng, stationLat])
        const routeMiles = straightMiles * WALK_ROUTE_FACTOR
        const minutes = (routeMiles / WALK_SPEED_MPH) * 60 + WALK_OVERHEAD_MINUTES
        setWalkingRouteDistanceMiles(routeMiles)
        setWalkingRouteDurationMinutes(minutes)
      })
    return () => {
      abort = true
      controller.abort()
    }
  }, [filterMode, campusCoordinates, selectedStation, filteredStationSet])

  // Prepare transit line paths
  const linePaths = useMemo(() => {
    const result: Array<{
      lineCode: string
      displayName: string
      brandColor: string
      positions: [number, number][]
      segmentIndex: number
    }> = []

    lines
      .filter(line => !activeSet || activeSet.has(line.lineCode))
      .forEach(line => {
        if (line.polyline.type === 'MultiLineString') {
          // Handle MultiLineString: each segment separately
          const segments = line.polyline.coordinates as [number, number][][]
          segments.forEach((segment, index) => {
            result.push({
              lineCode: line.lineCode,
              displayName: line.displayName,
              brandColor: line.brandColor,
              positions: segment.map(([lng, lat]) => [lat, lng] as [number, number]),
              segmentIndex: index,
            })
          })
        } else {
          // Handle LineString: single segment
          const coords = line.polyline.coordinates as [number, number][]
          result.push({
            lineCode: line.lineCode,
            displayName: line.displayName,
            brandColor: line.brandColor,
            positions: coords.map(([lng, lat]) => [lat, lng] as [number, number]),
            segmentIndex: 0,
          })
        }
      })

    return result
  }, [lines, activeSet])

  // Prepare inactive lines (greyed out)
  const inactiveLinePaths = useMemo(() => {
    if (!activeSet) return []
    
    const result: Array<{
      lineCode: string
      positions: [number, number][]
      segmentIndex: number
    }> = []

    lines
      .filter(line => !activeSet.has(line.lineCode))
      .forEach(line => {
        if (line.polyline.type === 'MultiLineString') {
          // Handle MultiLineString: each segment separately
          const segments = line.polyline.coordinates as [number, number][][]
          segments.forEach((segment, index) => {
            result.push({
              lineCode: line.lineCode,
              positions: segment.map(([lng, lat]) => [lat, lng] as [number, number]),
              segmentIndex: index,
            })
          })
        } else {
          // Handle LineString: single segment
          const coords = line.polyline.coordinates as [number, number][]
          result.push({
            lineCode: line.lineCode,
            positions: coords.map(([lng, lat]) => [lat, lng] as [number, number]),
            segmentIndex: 0,
          })
        }
      })

    return result
  }, [lines, activeSet])

  const handleMapClick = () => {
    onStationSelect(null)
  }

  // Track zoom changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const onZoom = () => {
      trackMapZoom(map.getZoom())
    }
    map.on('zoomend', onZoom)
    return () => {
      map.off('zoomend', onZoom)
    }
  }, [mapRef])

  return (
    <section className="map-shell">
      <div className="map-canvas">
        {error && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 10001,
            background: 'orange',
            color: 'black',
            padding: '10px',
            borderRadius: '5px',
          }}>
            Error: {error}
          </div>
        )}
        
        <MapContainer
          center={LONDON_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ position: 'absolute', inset: 0, background: '#ffffff' }}
          zoomControl={true}
          ref={(mapInstance) => {
            if (mapInstance) {
              console.log('Map instance created!', mapInstance)
              mapRef.current = mapInstance
            }
          }}
        >
        {/* Standard colorful OpenStreetMap tiles - similar to Google Maps */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Inactive lines (grey) */}
        {inactiveLinePaths.map(line => (
          <Polyline
            key={`inactive-${line.lineCode}-${line.segmentIndex}`}
            positions={line.positions}
            pathOptions={{
              color: '#cccccc',
              weight: 3,
              opacity: 0.6,
            }}
          />
        ))}

        {/* Active lines */}
        {linePaths.map(line => (
          <Polyline
            key={`${line.lineCode}-${line.segmentIndex}`}
            positions={line.positions}
            pathOptions={{
              color: line.brandColor,
              weight: 4,
              opacity: 0.8,
            }}
          >
            <title>{line.displayName}</title>
          </Polyline>
        ))}

        {/* Radius circle around selected university */}
        <RadiusCircle
          selectedUniversityId={selectedUniversityId}
          universities={universities}
          radiusMiles={radiusMiles}
        />

        {/* Walking route polyline (real OSRM road-following or fallback) */}
        {filterMode === 'radius' && walkingRoute.length > 1 && (
          <Polyline
            positions={walkingRoute}
            pathOptions={{
              color: '#0066cc',
              weight: 4,
              opacity: 0.9,
              dashArray: '2,6',
            }}
          >
            <title>{selectedStation ? `Walking route to ${selectedStation.displayName}` : 'Walking route'}</title>
            {selectedStation && (
              <Popup autoClose={false} closeButton={true}>
                <div style={{ fontSize: '13px' }}>
                  <strong>Walking route</strong><br />
                  {walkingRouteLoading && 'Loading real route…'}
                  {!walkingRouteLoading && walkingRouteError && walkingRouteError}
                  {!walkingRouteLoading && !walkingRouteError && 'Shortest walking route'}
                  <br />
                  {walkingRouteDistanceMiles !== null && walkingRouteDurationMinutes !== null && (
                    <span>
                      Distance: {walkingRouteDistanceMiles.toFixed(2)} mi · Time: {Math.round(walkingRouteDurationMinutes)} min
                    </span>
                  )}
                </div>
              </Popup>
            )}
          </Polyline>
        )}

        {/* Station markers */}
        <StationMarkers
          stations={stations}
          activeSet={activeSet}
          filteredStationSet={filteredStationSet}
          selectedStation={selectedStation}
          onStationSelect={onStationSelect}
          lineLabels={lineLabels}
          lines={lines}
          filterMode={props.filterMode}
        />

        {/* University markers */}
        <UniversityMarkers
          universities={universities}
          selectedUniversityId={selectedUniversityId}
          onUniversityClick={onUniversityClick}
        />

        {/* Map event handlers */}
        <MapEventHandler
          onMapClick={handleMapClick}
          selectedUniversityId={selectedUniversityId ?? null}
        />

        {/* University focus handler */}
        <UniversityFocusHandler
          selectedUniversityId={selectedUniversityId ?? null}
          universities={universities}
        />
      </MapContainer>
      </div>
    </section>
  )
}

// Removed heuristic curve generator (replaced by real OSRM fetch + fallback)

// Calculate total polyline distance in miles (coords are [lat,lng])
function polylineDistanceMiles(coords: [number, number][]): number {
  if (coords.length < 2) return 0
  let total = 0
  for (let i = 1; i < coords.length; i++) {
    const [prevLat, prevLng] = coords[i - 1]
    const [lat, lng] = coords[i]
    total += calculateDistance([prevLng, prevLat], [lng, lat])
  }
  return total
}

// Optimize walking polyline by shortcutting small detours.
// Strategy: attempt to remove intermediate points when direct segment reduces distance by >= MIN_IMPROVEMENT_RATIO.
function optimizeWalkingPolyline(original: [number, number][]): [number, number][] {
  const MIN_IMPROVEMENT_RATIO = 0.94 // resulting distance must be <= 94% of original segment chain
  const coords = [...original]
  let changed = true
  let passSafety = 0
  while (changed && passSafety < 8) { // cap iterations
    changed = false
    passSafety++
    for (let i = 0; i < coords.length - 2; i++) {
      for (let j = i + 2; j < Math.min(coords.length, i + 8); j++) { // local window
        const segmentSlice = coords.slice(i, j + 1)
        const chainDist = polylineDistanceMiles(segmentSlice)
        const directDist = calculateDistance([coords[i][1], coords[i][0]], [coords[j][1], coords[j][0]])
        if (directDist <= chainDist * MIN_IMPROVEMENT_RATIO) {
          // Replace intermediate points with direct connection, preserving endpoints
          const before = coords.slice(0, i + 1)
          const after = coords.slice(j)
          coords.splice(0, coords.length, ...before, ...after) // mutate in place
          changed = true
          break
        }
      }
      if (changed) break
    }
  }
  return coords
}
