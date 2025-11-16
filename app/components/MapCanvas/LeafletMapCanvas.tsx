'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap, useMapEvents, Marker, Tooltip } from 'react-leaflet'
import { trackStationSelect, trackMapZoom } from '@/app/lib/analytics'
import L from 'leaflet'
import type { Station, TransitLine } from '@/app/types/transit'
import type { UniversitiesDataset } from '@/app/types/university'
import type { TravelTimeResult } from '@/app/lib/map/travelTime'
import { calculateDistance, WALK_SPEED_MPH, WALK_OVERHEAD_MINUTES, WALK_ROUTE_FACTOR } from '@/app/lib/map/proximity'
import { stationMarkerAriaLabel } from '@/app/lib/a11y'
import { getCachedGraph, shortestPathsFrom } from '@/app/lib/map/stationGraph'
import { getStaticTubeJourney } from '@/app/lib/map/staticTubeTimes'

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
  purpleStationIds?: string[] // multi-source tube-time reachable (layered over walk mode)
  purpleReachInfo?: Record<string, { originStationId: string; minutes: number }>
}

// Helper functions
function stationVisible(
  station: Station,
  active: Set<string> | null,
  filteredIds: Set<string> | null,
  purpleIds: Set<string> | null
): boolean {
  // If we have any layered proximity sets (green or purple), show union of both
  const hasLayering = (filteredIds && filteredIds.size > 0) || (purpleIds && purpleIds.size > 0)
  if (hasLayering) {
    return !!(filteredIds?.has(station.stationId) || purpleIds?.has(station.stationId))
  }
  // Otherwise default to line activation visibility
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

type HoverPreviewStatus = 'idle' | 'ready' | 'error'

interface HoverJourneyPreview {
  totalMinutes: number | null
  durationSource: 'static' | 'unavailable'
  notice?: string
  fetchingLive: false
  source?: string
}

function useHoverJourneyPreview(
  origin: Station | null,
  target: Station | null,
  journeyCache: MutableRefObject<Map<string, HoverJourneyPreview>>
): { preview: HoverJourneyPreview | null; status: HoverPreviewStatus } {
  return useMemo(() => {
    if (!origin || !target || origin.stationId === target.stationId) {
      return { preview: null, status: origin && target ? 'ready' : 'idle' }
    }

    const cacheKey = `${origin.stationId}->${target.stationId}`
    const cached = journeyCache.current.get(cacheKey)
    if (cached) {
      return {
        preview: cached,
        status: cached.totalMinutes !== null ? 'ready' : 'error',
      }
    }

    const journey = getStaticTubeJourney(origin.stationId, target.stationId)
    let preview: HoverJourneyPreview
    let status: HoverPreviewStatus

    if (journey) {
      preview = {
        totalMinutes: journey.minutes,
        durationSource: 'static',
        fetchingLive: false,
        notice: journey.source ? `Source: ${journey.source}` : undefined,
        source: journey.source,
      }
      status = 'ready'
    } else {
      preview = {
        totalMinutes: null,
        durationSource: 'unavailable',
        fetchingLive: false,
        notice: 'Static tube time unavailable.',
      }
      status = 'error'
    }

    journeyCache.current.set(cacheKey, preview)
    return { preview, status }
  }, [origin, target, journeyCache])
}

interface StationCardContentProps {
  station: Station
  lineLabels: Record<string, string>
  lineColorMap: Record<string, string>
  includePurpleDetails: boolean
  isPurple: boolean
  purpleReachInfo?: Record<string, { originStationId: string; minutes: number }>
  selectedStation: Station | null
  showHoverJourney: boolean
  lines: TransitLine[]
  stations: Station[]
  journeyCache: MutableRefObject<Map<string, HoverJourneyPreview>>
}

function StationCardContent({
  station,
  lineLabels,
  lineColorMap,
  includePurpleDetails,
  isPurple,
  purpleReachInfo,
  selectedStation,
  showHoverJourney,
  lines,
  stations,
  journeyCache,
}: StationCardContentProps) {
  const { preview } = useHoverJourneyPreview(
    selectedStation,
    showHoverJourney ? station : null,
    journeyCache
  )

  const formatMinutes = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    const rounded = Math.round(value * 10) / 10
    return Number.isInteger(rounded) ? `${rounded} min${rounded === 1 ? '' : 's'}` : `${rounded.toFixed(1)} mins`
  }

  const purpleOriginInfo = isPurple && purpleReachInfo ? purpleReachInfo[station.stationId] : null
  const purpleOriginStation = purpleOriginInfo ? stations.find(s => s.stationId === purpleOriginInfo.originStationId) : null
  const purpleOriginName = purpleOriginStation?.displayName || purpleOriginInfo?.originStationId || null
  const ensureStationSuffix = (name: string) => {
    const trimmed = name.trim()
    return trimmed.toLowerCase().endsWith(' station') ? trimmed : `${trimmed} station`
  }
  const purpleOriginLabel = purpleOriginName ? ensureStationSuffix(purpleOriginName) : null
  const purpleStaticLabel = purpleOriginInfo && typeof purpleOriginInfo.minutes === 'number' && purpleOriginInfo.minutes > 0
    ? formatMinutes(purpleOriginInfo.minutes)
    : null

  const summaryText = (() => {
    if (!showHoverJourney || !selectedStation) return ''
    if (!preview) return ''
    if (preview.totalMinutes !== null) {
      return `Static ${formatMinutes(preview.totalMinutes)} from ${selectedStation.displayName} to ${station.displayName}.`
    }
    return preview.notice
      ? `${preview.notice} (${selectedStation.displayName} to ${station.displayName}).`
      : `Static tube time unavailable from ${selectedStation.displayName} to ${station.displayName}.`
  })()

  const travelMinutesLabel = (() => {
    if (!showHoverJourney || !selectedStation) return null
    if (!preview) return null
    if (preview.totalMinutes === null) return preview.notice ?? 'Unavailable'
    return formatMinutes(preview.totalMinutes)
  })()

  const cardTitle = travelMinutesLabel ? `${station.displayName} (${travelMinutesLabel})` : station.displayName

  useEffect(() => {
    if (typeof window === 'undefined') return
    const region = document.getElementById('live-region')
    if (!region) return
    if (!showHoverJourney || !summaryText) {
      region.textContent = ''
      return
    }
    region.textContent = summaryText
  }, [showHoverJourney, summaryText])

  return (
    <div
      className="station-hover-card"
      style={{
        minWidth: '220px',
        padding: '10px 12px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.22)',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        color: '#1f2937',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
        {cardTitle}
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
              fontWeight: 600,
            }}
          >
            {lineLabels[code] || code}
          </span>
        ))}
      </div>
      {isPurple && purpleOriginInfo && purpleOriginName && (
        <p style={{ fontSize: '12px', lineHeight: '1.4', color: '#374151', margin: '10px 0 0 0' }}>
          From {purpleOriginLabel}{purpleStaticLabel ? ` (${purpleStaticLabel})` : ''}
        </p>
      )}
      {includePurpleDetails && isPurple && purpleReachInfo && purpleReachInfo[station.stationId] && (
        <div style={{ marginTop: '10px' }}>
          <PurpleTubeTime
            originId={purpleReachInfo[station.stationId].originStationId}
            targetId={station.stationId}
            stations={stations}
            lines={lines}
          />
        </div>
      )}
    </div>
  )
}

function StationMarkers({
  stations,
  activeSet,
  filteredStationSet,
  selectedStation,
  onStationSelect,
  lineLabels,
  lines,
  filterMode,
  purpleStationSet,
  universityMode,
  purpleReachInfo,
  selectedStationVisible,
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
  purpleStationSet: Set<string> | null
  universityMode?: boolean
  purpleReachInfo?: Record<string, { originStationId: string; minutes: number }>
  selectedStationVisible: boolean
}) {
  const map = useMap()
  const [zoomLevel, setZoomLevel] = useState(map.getZoom())
  const journeyCache = useRef<Map<string, HoverJourneyPreview>>(new Map())

  // Subscribe to zoom changes to recompute marker sizes
  useEffect(() => {
    const handler = () => setZoomLevel(map.getZoom())
    map.on('zoomend', handler)
    return () => {
      map.off('zoomend', handler)
    }
  }, [map])

  // Scale factor: linear relative to DEFAULT_ZOOM, clamped for usability
  const scale = useMemo(() => {
    const raw = 1 + (zoomLevel - DEFAULT_ZOOM) * 0.12 // ~12% size change per zoom step
    return Math.min(2.4, Math.max(0.5, raw))
  }, [zoomLevel])
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

  const visibleStations = stations.filter(s => stationVisible(s, activeSet, filteredStationSet, purpleStationSet))

  // Build simple circular icon (white default)
  const buildStationIcon = (
    station: Station,
    radius: number,
    isSelected: boolean,
    fillColor: string,
    emphasis: 'normal' | 'green' | 'purple'
  ) => {
    const diameter = radius * 2
    const borderWidth = Math.max(2, Math.round(radius * 0.35))
    const label = stationMarkerAriaLabel(station)
    let borderColor = '#0f172a'
    if (emphasis === 'green') borderColor = '#2e7d32'
    if (emphasis === 'purple') borderColor = '#5e35b1'
    if (isSelected) borderColor = '#1d4ed8'
    const boxShadow = isSelected ? '0 0 10px rgba(29, 78, 216, 0.45)' : '0 2px 6px rgba(15, 23, 42, 0.22)'
    const html = `
      <div
        class="station-circle-icon"
        aria-label="${label}"
        style="width:${diameter}px;height:${diameter}px;border-radius:50%;background:${fillColor};border:${borderWidth}px solid ${borderColor};box-shadow:${boxShadow};"
      ></div>`
    return L.divIcon({
      html,
      className: 'station-circle-icon-wrapper',
      iconSize: [diameter, diameter],
      iconAnchor: [diameter / 2, diameter / 2],
      popupAnchor: [0, -radius],
      tooltipAnchor: [0, -radius * 0.7],
    })
  }


  return (
    <>
      {visibleStations.map(station => {
        const isSelected = selectedStation?.stationId === station.stationId
        const isFiltered = filteredStationSet?.has(station.stationId)
        const isPurple = !!(filterMode === 'radius' && purpleStationSet?.has(station.stationId) && !isFiltered)

        // Enlarged base radii integrating previous size increase request
        let color = '#FFFFFF'
        let baseRadius = 9 // default
        if (filterMode === 'radius') {
          if (isFiltered) {
            color = '#4CAF50'
            baseRadius = 10 // filtered (green) slightly larger
          } else if (isPurple) {
            color = '#7e57c2'
            baseRadius = 9 // purple same as default
          } else {
            color = universityMode ? '#FFFFFF' : '#333333'
            baseRadius = 7 // inactive within radius context
          }
        } else if (filterMode === 'time' && filteredStationSet) {
          if (!isFiltered) {
            color = '#333333'
            baseRadius = 7
          }
        } else if (!isFiltered && filteredStationSet) {
          // fallback for non-time non-radius modes
          color = '#333333'
          baseRadius = 7
        }
        if (isSelected) {
          color = '#0066cc'
          baseRadius = 12 // selected larger
        }

        const radius = Math.round(baseRadius * scale)
        const icon = buildStationIcon(
          station,
          radius,
          isSelected,
            color,
          isFiltered ? 'green' : isPurple ? 'purple' : 'normal'
        )
        const renderStationCard = (includePurpleDetails: boolean) => (
          <StationCardContent
            station={station}
            lineLabels={lineLabels}
            lineColorMap={lineColorMap}
            includePurpleDetails={includePurpleDetails}
            isPurple={isPurple}
            purpleReachInfo={purpleReachInfo}
            selectedStation={selectedStation}
            showHoverJourney={!!selectedStation && selectedStationVisible && selectedStation.stationId !== station.stationId}
            lines={lines}
            stations={stations}
            journeyCache={journeyCache}
          />
        )

        return (
          <Marker
            key={station.stationId}
            position={[station.position.coordinates[1], station.position.coordinates[0]]}
            icon={icon}
            eventHandlers={{
              click: (e: L.LeafletMouseEvent) => {
                L.DomEvent.stopPropagation(e)
                onStationSelect(station)
              },
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -radius]}
              opacity={1}
              className="station-hover-tooltip"
              interactive
            >
              {renderStationCard(false)}
            </Tooltip>
            {isSelected && (
              <Popup
                offset={[0, -radius]}
                closeButton={true}
                autoClose={false}
                closeOnClick={false}
              >
                {renderStationCard(true)}
              </Popup>
            )}
          </Marker>
        )
      })}
    </>
  )
}

function PurpleTubeTime({ originId, targetId, stations, lines }: { originId: string; targetId: string; stations: Station[]; lines: TransitLine[] }) {
  const [showDetails, setShowDetails] = useState(false)

  const staticJourney = useMemo(() => getStaticTubeJourney(originId, targetId), [originId, targetId])

  const journeyBreakdown = useMemo(() => {
    const origin = stations.find(s => s.stationId === originId)
    const target = stations.find(s => s.stationId === targetId)
    if (!origin || !target) return null
    const graph = getCachedGraph(lines, stations)
    const maxMinutes = 120 // generous cap to find path
    const paths = shortestPathsFrom(originId, graph, maxMinutes)
    const targetPath = paths.find(p => p.stationId === targetId)
    if (!targetPath) return null
    const via = targetPath.via
    const segments: { from: string; to: string; line: string; minutes: number }[] = []
    for (let i = 0; i < via.length - 1; i++) {
      const from = via[i]
      const to = via[i + 1]
      const edge = graph[from].find(e => e.to === to)
      if (!edge) continue
      segments.push({ from, to, line: edge.lineCode, minutes: Math.round(edge.runMinutes * 10) / 10 })
    }
    let transfers = 0
    for (let i = 1; i < segments.length; i++) {
      if (segments[i].line !== segments[i - 1].line) transfers++
    }
    return { segments, transfers, totalGraphMinutes: targetPath.minutes }
  }, [originId, targetId, stations, lines])

  useEffect(() => {
    setShowDetails(false)
  }, [originId, targetId])

  const originStation = stations.find(s => s.stationId === originId)
  const originName = originStation?.displayName || originId
  const targetStation = stations.find(s => s.stationId === targetId)
  const sharedLines = originStation && targetStation ? originStation.lineCodes.filter(c => targetStation.lineCodes.includes(c)) : []

  const lineDisplayMap: Record<string, string> = {}
  lines.forEach(l => { lineDisplayMap[l.lineCode] = l.displayName })
  const directLine = sharedLines.length ? sharedLines[0] : null
  const directLineName = directLine ? (lineDisplayMap[directLine] || directLine) : null

  const formatMinutes = (minutes: number) => {
    const rounded = Math.round(minutes * 10) / 10
    return Number.isInteger(rounded) ? `${rounded} min${rounded === 1 ? '' : 's'}` : `${rounded.toFixed(1)} mins`
  }

  let summaryText: string
  if (staticJourney) {
    const minutesLabel = formatMinutes(staticJourney.minutes)
    if (directLineName) {
      summaryText = `${minutesLabel} (static) from ${originName} via ${directLineName} line.`
    } else {
      summaryText = `${minutesLabel} (static) from ${originName} (transfers required).`
    }
  } else {
    summaryText = directLineName
      ? `Static tube time unavailable from ${originName} (direct ${directLineName} line).`
      : `Static tube time unavailable from ${originName} (transfers required).`
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <p style={{ fontSize: '12px', lineHeight: '1.4', color: '#333', margin: 0 }}>{summaryText}</p>
      {staticJourney?.source && (
        <p style={{ fontSize: '11px', lineHeight: '1.4', color: '#555', margin: '2px 0 0 0' }}>Source: {staticJourney.source}</p>
      )}
      {journeyBreakdown && (
        <div style={{ marginTop: '4px' }}>
          {!showDetails && (
            <button
              type="button"
              style={{ background: '#0066cc', color: 'white', border: 'none', padding: '4px 8px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer' }}
              onClick={() => setShowDetails(true)}
            >
              Show journey breakdown
            </button>
          )}
          {showDetails && (
            <div style={{ fontSize: '11px', lineHeight: '1.4', background: '#f7f9fc', border: '1px solid #e0e6ed', padding: '6px 8px', borderRadius: '4px' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Journey path ({journeyBreakdown.transfers} transfer{journeyBreakdown.transfers !== 1 ? 's' : ''}, graph est. {journeyBreakdown.totalGraphMinutes} min)</strong>
              <ol style={{ margin: 0, paddingLeft: '16px' }}>
                {journeyBreakdown.segments.map((seg, idx) => (
                  <li key={idx} style={{ marginBottom: '2px' }}>
                    <span>{stations.find(s => s.stationId === seg.from)?.displayName || seg.from} → {stations.find(s => s.stationId === seg.to)?.displayName || seg.to} </span>
                    <span style={{ background: '#004d99', color: 'white', padding: '1px 4px', borderRadius: '3px', fontSize: '10px', marginLeft: '4px' }}>{seg.line}</span>
                    <span style={{ marginLeft: '4px', color: '#555' }}>{seg.minutes} min</span>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                style={{ marginTop: '6px', background: '#ccc', color: '#222', border: 'none', padding: '3px 6px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Hide breakdown
              </button>
            </div>
          )}
        </div>
      )}
    </div>
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
    // radiusMiles removed (legacy miles-based radius no longer used)
    campusCoordinates,
    filterMode,
    purpleStationIds = [],
  } = props

  const mapRef = useRef<L.Map | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stationIndex = useMemo(() => {
    const idx: Record<string, Station> = {}
    stations.forEach(station => {
      idx[station.stationId] = station
    })
    return idx
  }, [stations])

  const activeLinesKey = useMemo(() => [...activeLineCodes].sort().join('|'), [activeLineCodes])
  const previousActiveLinesKeyRef = useRef(activeLinesKey)

  const activeSet = useMemo(
    () => (activeLineCodes.length ? new Set(activeLineCodes) : null),
    [activeLineCodes]
  )

  const filteredStationSet = useMemo(
    () => (filteredStationIds.length ? new Set(filteredStationIds) : null),
    [filteredStationIds]
  )

  const purpleStationSet = useMemo(
    () => (purpleStationIds.length ? new Set<string>(purpleStationIds) : null),
    [purpleStationIds]
  )

  const selectedStationVisible = useMemo(() => {
    if (!selectedStation) return false
    return stationVisible(selectedStation, activeSet, filteredStationSet, purpleStationSet)
  }, [selectedStation, activeSet, filteredStationSet, purpleStationSet])

  useEffect(() => {
    console.log('LeafletMapCanvas mounted, lines:', lines.length, 'stations:', stations.length)
    console.log('Universities:', universities?.features.length || 0)
    console.log('Selected university:', selectedUniversityId)
    onStatusChange?.('ready')
  }, [onStatusChange, lines.length, stations.length, universities, selectedUniversityId])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        console.log('Window is defined, Leaflet available:', typeof L !== 'undefined')
      }
    } catch (e) {
      console.error('Error checking Leaflet:', e)
      setError(`Error: ${e}`)
    }
  }, [])

  useEffect(() => {
    if (previousActiveLinesKeyRef.current === activeLinesKey) return
    previousActiveLinesKeyRef.current = activeLinesKey
    if (selectedStation) {
      onStationSelect(null)
    }
  }, [activeLinesKey, selectedStation, onStationSelect])

  useEffect(() => {
    if (selectedStation && !selectedStationVisible) {
      onStationSelect(null)
    }
  }, [selectedStation, selectedStationVisible, onStationSelect])

  const stationConnectors = useMemo(() => {
    const connectors: Array<{ key: string; positions: [number, number][]; color: string }> = []
    const thresholdMiles = 0.01 // ~16 meters, prevents redundant connectors when already aligned

    const lineVerticesCache = new Map<string, [number, number][]>()

    const getLineVertices = (line: TransitLine): [number, number][] => {
      const cached = lineVerticesCache.get(line.lineCode)
      if (cached) return cached
      let verts: [number, number][] = []
      if (line.polyline.type === 'MultiLineString') {
        const segments = line.polyline.coordinates as [number, number][][]
        verts = segments.flat()
      } else {
        verts = line.polyline.coordinates as [number, number][]
      }
      lineVerticesCache.set(line.lineCode, verts)
      return verts
    }

    lines.forEach(line => {
      const vertices = getLineVertices(line)
      if (!vertices.length) return
      const isActive = !activeSet || activeSet.has(line.lineCode)
      const connectorColor = isActive ? line.brandColor : '#cccccc'

      line.stationIds.forEach(stationId => {
        const station = stationIndex[stationId]
        if (!station) return
        const [stationLng, stationLat] = station.position.coordinates
        let bestVertex: [number, number] | null = null
        let bestDistance = Number.POSITIVE_INFINITY
        for (const vertex of vertices) {
          const distance = calculateDistance(vertex, [stationLng, stationLat])
          if (distance < bestDistance) {
            bestDistance = distance
            bestVertex = vertex
          }
        }
        if (!bestVertex || bestDistance <= thresholdMiles) {
          return
        }
        const [vertexLng, vertexLat] = bestVertex
        connectors.push({
          key: `${line.lineCode}-${stationId}`,
          positions: [
            [stationLat, stationLng],
            [vertexLat, vertexLng],
          ],
          color: connectorColor,
        })
      })
    })

    return connectors
  }, [lines, stationIndex, activeSet])

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
    type OSRMRoute = { distance: number; duration: number; geometry: { type: string; coordinates: [number, number][] } }
    type OSRMResponse = { code: string; routes: OSRMRoute[] }

    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then((data: OSRMResponse) => {
        if (abort) return
        if (data.code !== 'Ok' || !data.routes?.length) {
          throw new Error('No route')
        }
        // Pick shortest distance route among alternatives
        const bestRoute = data.routes.reduce((min: OSRMRoute, r: OSRMRoute) => (r.distance < min.distance ? r : min), data.routes[0])
        const geometry = bestRoute.geometry
        if (!geometry || geometry.type !== 'LineString') {
          throw new Error('Bad geometry')
        }
        const osrmCoords: [number, number][] = geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
        const osrmDistanceMiles = bestRoute.distance / 1609.34
        const osrmDurationMinutes = bestRoute.duration / 60

        // Use OSRM route directly without optimization to ensure it follows roads exactly
        let chosenCoords: [number, number][] = osrmCoords
  // Always use unmodified OSRM route to ensure it follows roads exactly
  setWalkingRoute(osrmCoords)
  setWalkingRouteDistanceMiles(osrmDistanceMiles)
  setWalkingRouteDurationMinutes(osrmDurationMinutes)
  chosenCoords = osrmCoords
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
  // Auto zoom & center: maximize zoom while keeping all selected line stations visible
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!activeSet || activeSet.size === 0) return
  if (selectedUniversityId) return // suppress when university focus active
    const targetStations = stations.filter(s => s.lineCodes.some(c => activeSet.has(c)))
    if (!targetStations.length) return

    const latLngs = targetStations.map(s => L.latLng(s.position.coordinates[1], s.position.coordinates[0]))
    const bounds = L.latLngBounds(latLngs)
    const center = bounds.getCenter()
    const maxZoomCap = 18
    const minZoomCap = typeof map.getMinZoom === 'function' && map.getMinZoom() !== undefined ? map.getMinZoom() : 0
    let appliedZoom = map.getZoom()
    for (let z = maxZoomCap; z >= minZoomCap; z--) {
      map.setView(center, z, { animate: false })
      const viewBounds = map.getBounds()
      const allVisible = latLngs.every(ll => viewBounds.contains(ll))
      if (allVisible) {
        appliedZoom = z
        break
      }
    }
    map.setView(center, appliedZoom, { animate: true })
  }, [activeSet, stations, selectedUniversityId])

  // Prepare transit line paths
  const linePaths = useMemo(() => {
    const result: Array<{
      lineCode: string
      displayName: string
      brandColor: string
      strokeWeight: number
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
              strokeWeight: line.strokeWeight,
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
            strokeWeight: line.strokeWeight,
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
        <div
          id="live-region"
          aria-live="polite"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            margin: '-1px',
            border: 0,
            padding: 0,
            clip: 'rect(0 0 0 0)',
            overflow: 'hidden',
          }}
        />
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

        {/* Active lines with universal outline for clarity */}
        {linePaths.map(line => {
          // Adaptive outline: light inner color gets dark outline; dark inner gets light outline
          const hex = line.brandColor.replace('#', '')
          const r = parseInt(hex.substring(0, 2), 16)
          const g = parseInt(hex.substring(2, 4), 16)
          const b = parseInt(hex.substring(4, 6), 16)
          const brightness = (r * 299 + g * 587 + b * 114) / 1000
          const outlineColor = brightness < 90 ? '#FFFFFF' : '#000000'
          const innerWeight = line.strokeWeight || 4
          const outlineWeight = innerWeight + 2
          return (
            <>
              <Polyline
                key={`${line.lineCode}-outline-${line.segmentIndex}`}
                positions={line.positions}
                pathOptions={{
                  color: outlineColor,
                  weight: outlineWeight,
                  opacity: 0.9,
                }}
              />
              <Polyline
                key={`${line.lineCode}-inner-${line.segmentIndex}`}
                positions={line.positions}
                pathOptions={{
                  color: line.brandColor,
                  weight: innerWeight,
                  opacity: 1.0,
                }}
              >
                <title>{line.displayName}</title>
              </Polyline>
            </>
          )
        })}

        {/* Station connectors to ensure markers touch their lines visually */}
        {stationConnectors.map(connector => (
          <Polyline
            key={`connector-${connector.key}`}
            positions={connector.positions}
            pathOptions={{ color: connector.color, weight: 3, opacity: 0.9 }}
          />
        ))}

        {/* Radius circle removed per requirement: no green boundary when adjusting walk time */}

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
          purpleStationSet={purpleStationSet}
          universityMode={props.universityMode}
          purpleReachInfo={props.purpleReachInfo}
          selectedStationVisible={selectedStationVisible}
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
// Removed polylineDistanceMiles and optimizeWalkingPolyline (unused after disabling optimization)
