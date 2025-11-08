'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Station, TransitLine } from '@/app/types/transit'
import { loadGoogleMaps, resetGoogleMapsLoader } from '@/app/lib/map/google-loader'
import { stationMarkerAriaLabel, describeActiveLines } from '@/app/lib/a11y'
import StationTooltip from '@/app/components/StationTooltip/StationTooltip'

const LONDON_CENTER = {
  lat: 51.5074,
  lng: -0.1278,
} as const

export type MapStatus = 'idle' | 'loading' | 'ready' | 'error'
export type MapRenderMode = 'google' | 'fallback'

export interface MapCanvasProps {
  lines: TransitLine[]
  stations: Station[]
  activeLineCodes: string[]
  selectedStation: Station | null
  onStationSelect: (station: Station | null) => void
  lineLabels: Record<string, string>
  onStatusChange?: (status: MapStatus) => void
}

type MapOverlays = {
  map: google.maps.Map | null
  polylines: Array<{ polyline: google.maps.Polyline; lineCode: string }>
  markers: google.maps.Marker[]
}

const INITIAL_OVERLAYS: MapOverlays = {
  map: null,
  polylines: [],
  markers: [],
}

const toLatLngLiteral = (coords: [number, number]): google.maps.LatLngLiteral => ({
  lng: coords[0],
  lat: coords[1],
})

// Extract all coordinate points from a line (handles both LineString and MultiLineString)
const getAllCoordinates = (line: TransitLine): [number, number][] => {
  if (line.polyline.type === 'MultiLineString') {
    return (line.polyline.coordinates as [number, number][][]).flat()
  }
  return line.polyline.coordinates as [number, number][]
}

function stationVisible(station: Station, active: Set<string> | null): boolean {
  if (!active) return true
  return station.lineCodes.some(code => active.has(code))
}

function disposeOverlays(overlays: MapOverlays) {
  overlays.polylines.forEach(({ polyline }) => polyline.setMap(null))
  overlays.markers.forEach(marker => marker.setMap(null))
}

export default function MapCanvas(props: MapCanvasProps) {
  const { lines, stations, activeLineCodes, selectedStation, onStationSelect, lineLabels, onStatusChange } = props
  const [status, setStatus] = useState<MapStatus>('idle')
  const [renderMode, setRenderMode] = useState<MapRenderMode>('google')
  const googleRef = useRef<Awaited<ReturnType<typeof loadGoogleMaps>> | null>(null)
  const overlaysRef = useRef<MapOverlays>(INITIAL_OVERLAYS)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const prevActiveLineCodesRef = useRef<string[]>(activeLineCodes)

  const activeSet = useMemo(
    () => (activeLineCodes.length ? new Set(activeLineCodes) : null),
    [activeLineCodes]
  )

  useEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current

    if (!container) {
      return
    }

    setStatus('loading')

    loadGoogleMaps({ libraries: ['marker'] })
      .then(google => {
        if (cancelled) {
          return
        }

        googleRef.current = google

        const map = new google.maps.Map(container, {
          center: LONDON_CENTER,
          zoom: 10,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
        })

        overlaysRef.current.map = map

        const polylines: Array<{ polyline: google.maps.Polyline; lineCode: string }> = []
        lines.forEach(line => {
          const shouldShow = !activeSet || activeSet.has(line.lineCode)
          
          // Handle both LineString and MultiLineString
          if (line.polyline.type === 'MultiLineString') {
            // Multiple line segments (e.g., for branching lines like Northern)
            const coords = line.polyline.coordinates as [number, number][][]
            coords.forEach(segment => {
              const polyline = new google.maps.Polyline({
                path: segment.map(toLatLngLiteral),
                strokeColor: line.brandColor,
                strokeOpacity: 1,
                strokeWeight: line.strokeWeight,
                map: shouldShow ? map : null,
              })
              polylines.push({ polyline, lineCode: line.lineCode })
            })
          } else {
            // Single line segment
            const coords = line.polyline.coordinates as [number, number][]
            const polyline = new google.maps.Polyline({
              path: coords.map(toLatLngLiteral),
              strokeColor: line.brandColor,
              strokeOpacity: 1,
              strokeWeight: line.strokeWeight,
              map: shouldShow ? map : null,
            })
            polylines.push({ polyline, lineCode: line.lineCode })
          }
        })

        const markerClickHandlers: Array<google.maps.MapsEventListener> = []
        const markers = stations.map(station => {
          const ariaTitle = stationMarkerAriaLabel(station)
          const shouldShow = stationVisible(station, activeSet)

          const marker = new google.maps.Marker({
            title: ariaTitle,
            position: toLatLngLiteral(station.position.coordinates),
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#ffffff',
              fillOpacity: 1,
              strokeColor: '#333333',
              strokeWeight: station.isInterchange ? 3 : 2,
              scale: station.isInterchange ? 8 : 5,
            },
            map: shouldShow ? map : null,
          })

          marker.setTitle(ariaTitle)

          markerClickHandlers.push(
            marker.addListener('click', () => {
              onStationSelect(station)
            })
          )

          return marker
        })

        overlaysRef.current.polylines = polylines
        overlaysRef.current.markers = markers

        const visibleLines = lines.filter(line => !activeSet || activeSet.has(line.lineCode))
        const bounds = new google.maps.LatLngBounds()
        visibleLines.forEach(line => {
          getAllCoordinates(line).forEach(coord => bounds.extend(toLatLngLiteral(coord)))
        })
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, 24)
        }

        setRenderMode('google')
        setStatus('ready')

        return () => {
          markerClickHandlers.forEach(listener => listener.remove())
        }
      })
      .catch(error => {
        console.error('Google Maps failed to load. Falling back to offline renderer.', error)
        setRenderMode('fallback')
        setStatus('ready')
      })

    return () => {
      cancelled = true
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      disposeOverlays(overlaysRef.current)
      resetGoogleMapsLoader()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, stations])

  useEffect(() => {
    if (!googleRef.current) return

    const { map, polylines, markers } = overlaysRef.current
    if (!map) return

    const visibleLines = lines.filter(line => !activeSet || activeSet.has(line.lineCode))

    // Update visibility for polylines & markers
    polylines.forEach(({ polyline, lineCode }) => {
      const visible = !activeSet || activeSet.has(lineCode)
      polyline.setMap(visible ? map : null)
    })

    markers.forEach((marker, index) => {
      const station = stations[index]
      const visible = stationVisible(station, activeSet)
      marker.setMap(visible ? map : null)
    })

    // Check if activeLineCodes actually changed (not just re-rendered)
    const activeLineCodesChanged = 
      prevActiveLineCodesRef.current.length !== activeLineCodes.length ||
      prevActiveLineCodesRef.current.some((code, i) => code !== activeLineCodes[i])

    // Auto-fit only when exactly one line is active AND the filter actually changed
    if (activeLineCodesChanged && activeLineCodes.length === 1) {
      const line = lines.find(l => l.lineCode === activeLineCodes[0])
      if (line) {
        const gmaps = googleRef.current.maps
        const bounds = new gmaps.LatLngBounds()
        getAllCoordinates(line).forEach(coord => bounds.extend(toLatLngLiteral(coord)))
        if (!bounds.isEmpty()) {
          // Capture current state
          const fromCenter = map.getCenter()
          const fromZoom = map.getZoom()
          // Use fitBounds to compute target then revert
          map.fitBounds(bounds, 32)
          const toCenter = map.getCenter()
          const toZoom = map.getZoom()
          if (!fromCenter || !toCenter || fromZoom == null || toZoom == null) {
            return
          }
          map.setCenter(fromCenter as google.maps.LatLng)
          map.setZoom(fromZoom as number)

          // Cancel any existing animation
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
          }

            const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
          const duration = 700
          const start = performance.now()
          const animate = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            const e = easeInOutCubic(t)
            const lat = fromCenter.lat() + (toCenter.lat() - fromCenter.lat()) * e
            const lng = fromCenter.lng() + (toCenter.lng() - fromCenter.lng()) * e
            map.setCenter(new gmaps.LatLng(lat, lng))
            const zoom = fromZoom + (toZoom - fromZoom) * e
            map.setZoom(Math.round(zoom * 100) / 100)
            if (t < 1) {
              animationRef.current = requestAnimationFrame(animate)
            } else {
              animationRef.current = null
            }
          }
          animationRef.current = requestAnimationFrame(animate)
        }
      }
    }

    // If single selection cleared (back to all) we do not refit to avoid jump; initial mount handled earlier.

    if (selectedStation && !stationVisible(selectedStation, activeSet)) {
      onStationSelect(null)
    }

    // Update the ref to track current activeLineCodes for next render
    prevActiveLineCodesRef.current = activeLineCodes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSet, lines, selectedStation, stations, activeLineCodes])

  const fallbackStations = useMemo(() => {
    if (!activeSet) {
      return stations
    }
    return stations.filter(station => stationVisible(station, activeSet))
  }, [activeSet, stations])

  const activeLineSummary = useMemo(
    () => describeActiveLines(activeLineCodes, lineLabels),
    [activeLineCodes, lineLabels]
  )

  return (
    <section
      className="map-shell"
      data-testid="map-canvas"
      data-state={status}
      aria-busy={status === 'loading'}
      style={{ display: 'flex' }}
    >
      <div ref={containerRef} className="map-canvas" hidden={renderMode !== 'google'} style={{ flex: 1 }} />

      {status === 'loading' && (
        <div className="map-status" role="status">
          <p>Loading network map…</p>
        </div>
      )}

      {renderMode === 'fallback' && status === 'ready' && (
        <div className="map-fallback" role="region" aria-live="polite">
          <p role="alert">Live map unavailable. Showing simplified network view.</p>
          <ul className="map-fallback__list">
            {fallbackStations.map(station => (
              <li key={station.stationId}>
                <button
                  type="button"
                  onClick={() => onStationSelect(station)}
                  className="map-fallback__station"
                >
                  {station.displayName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats moved to header in MapExperience */}

      <StationTooltip
        station={selectedStation}
        lineLabels={lineLabels}
        onClose={() => onStationSelect(null)}
      />
    </section>
  )
}
