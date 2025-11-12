'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet'
import { trackStationSelect } from '@/app/lib/analytics'
import L from 'leaflet'
import type { Station, TransitLine } from '@/app/types/transit'
import type { UniversitiesDataset } from '@/app/types/university'
import type { TravelTimeResult } from '@/app/lib/map/travelTime'
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
  // Track popup opens (station selection)
  useEffect(() => {
    if (selectedStation) {
      trackStationSelect(selectedStation.stationId)
    }
  }, [selectedStation])
  }, [lines])

  const visibleStations = stations.filter(s => stationVisible(s, activeSet, filteredStationSet))

  return (
    <>
      {visibleStations.map(station => {
        const isSelected = selectedStation?.stationId === station.stationId
        const isFiltered = filteredStationSet?.has(station.stationId)
        
        let color = '#4CAF50' // Green for filtered/visible stations
        let radius = 8
        
        if (!isFiltered && filteredStationSet) {
          color = '#333333' // Grey for non-filtered
          radius = 6
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
      pathOptions={{
        color: '#4CAF50',
        fillColor: '#4CAF50',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 10',
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

        {/* Station markers */}
        <StationMarkers
          stations={stations}
          activeSet={activeSet}
          filteredStationSet={filteredStationSet}
          selectedStation={selectedStation}
          onStationSelect={onStationSelect}
          lineLabels={lineLabels}
          lines={lines}
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
