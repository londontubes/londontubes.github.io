'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Station, TransitLine } from '@/app/types/transit'
import type { UniversitiesDataset } from '@/app/types/university'
import type { TravelTimeResult } from '@/app/lib/map/travelTime'
import { loadGoogleMaps, resetGoogleMapsLoader } from '@/app/lib/map/google-loader'
import { stationMarkerAriaLabel } from '@/app/lib/a11y'
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
  // University mode props (optional)
  universities?: UniversitiesDataset
  universityMode?: boolean
  selectedUniversityId?: string | null
  onUniversityClick?: (universityId: string) => void
  // Time-based filtering props
  travelTimeResults?: TravelTimeResult[]
  filterMode?: 'radius' | 'time'
  // Station filtering (for radius/time-based filtering)
  filteredStationIds?: string[]
  // Radius distance in miles (for displaying circle overlay)
  radiusMiles?: number
}

type MapOverlays = {
  map: google.maps.Map | null
  polylines: Array<{ polyline: google.maps.Polyline; lineCode: string }>
  markers: google.maps.Marker[]
  universityMarkers?: google.maps.Marker[]
  highlightCircles?: google.maps.Circle[]
  radiusCircle?: google.maps.Circle | null
}

const INITIAL_OVERLAYS: MapOverlays = {
  map: null,
  polylines: [],
  markers: [],
  universityMarkers: [],
  highlightCircles: [],
  radiusCircle: null,
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

function stationVisible(
  station: Station, 
  active: Set<string> | null, 
  filteredIds: Set<string> | null
): boolean {
  // If in filtered mode (radius/time), only show stations in the filtered set
  if (filteredIds && filteredIds.size > 0) {
    return filteredIds.has(station.stationId)
  }
  // Otherwise, check if station is on an active line
  if (!active) return true
  return station.lineCodes.some(code => active.has(code))
}

function disposeOverlays(overlays: MapOverlays) {
  overlays.polylines.forEach(({ polyline }) => polyline.setMap(null))
  overlays.markers.forEach(marker => marker.setMap(null))
  overlays.universityMarkers?.forEach(marker => marker.setMap(null))
  overlays.highlightCircles?.forEach(circle => circle.setMap(null))
  overlays.radiusCircle?.setMap(null)
}

// Haversine distance in meters between two lat/lng points
function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const a = sinDLat * sinDLat + sinDLng * sinDLng * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function MapCanvas(props: MapCanvasProps) {
  const { 
    lines, 
    stations, 
    activeLineCodes, 
    selectedStation, 
    onStationSelect, 
    lineLabels, 
    onStatusChange,
    universities,
    universityMode,
    selectedUniversityId,
    onUniversityClick,
    travelTimeResults,
    filterMode = 'radius',
    filteredStationIds = [],
    radiusMiles
  } = props
  const [status, setStatus] = useState<MapStatus>('idle')
  const [renderMode, setRenderMode] = useState<MapRenderMode>('google')
  const googleRef = useRef<Awaited<ReturnType<typeof loadGoogleMaps>> | null>(null)
  const overlaysRef = useRef<MapOverlays>(INITIAL_OVERLAYS)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const prevActiveLineCodesRef = useRef<string[]>(activeLineCodes)
  const lastMarkerClickRef = useRef<number>(0)
  const selectedUniversityIdRef = useRef<string | null>(selectedUniversityId ?? null)

  // Keep ref in sync so map click handler always has latest value
  useEffect(() => {
    selectedUniversityIdRef.current = selectedUniversityId ?? null
  }, [selectedUniversityId])

  const activeSet = useMemo(
    () => (activeLineCodes.length ? new Set(activeLineCodes) : null),
    [activeLineCodes]
  )

  const filteredStationSet = useMemo(
    () => (filteredStationIds.length ? new Set(filteredStationIds) : null),
    [filteredStationIds]
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
          zoomControl: true,
          scrollwheel: true,
          disableDoubleClickZoom: true,
        })

        // Debug: verify zoom interactions are firing
        map.addListener('zoom_changed', () => {
          const z = map.getZoom()
          console.log('[MapZoomDebug] zoom_changed ->', z)
        })
        map.addListener('bounds_changed', () => {
          const z = map.getZoom()
          console.log('[MapZoomDebug] bounds_changed (post zoom/pan) current zoom =', z)
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
          const shouldShow = stationVisible(station, activeSet, filteredStationSet)

          const marker = new google.maps.Marker({
            title: ariaTitle,
            position: toLatLngLiteral(station.position.coordinates),
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#ffffff',
              fillOpacity: 1,
              strokeColor: '#333333',
              strokeWeight: station.isInterchange ? 3 : 2,
              scale: station.isInterchange ? 10 : 6,
            },
            map: shouldShow ? map : null,
            zIndex: 1000,
          })

          marker.setTitle(ariaTitle)

          markerClickHandlers.push(
            marker.addListener('click', () => {
              const isFiltered = !!(filteredStationSet && filteredStationSet.has(station.stationId))
              const selectedUni = selectedUniversityId || 'none'
              // Consolidated debug log for station selection events
              console.log('[StationSelectDebug]', {
                stationId: station.stationId,
                name: station.displayName,
                filtered: isFiltered,
                interchange: station.isInterchange,
                lineCodes: station.lineCodes,
                selectedUniversityId: selectedUni,
              })
              onStationSelect(station)
              lastMarkerClickRef.current = Date.now()
              
              // Center map on selected station with smooth animation
              const gmaps = googleRef.current!.maps
              const fromCenter = map.getCenter()
              const fromZoom = map.getZoom()
              const toCenter = new gmaps.LatLng(
                station.position.coordinates[1],
                station.position.coordinates[0]
              )
              const toZoom = Math.max(13, fromZoom || 12) // Zoom in if not already zoomed

              if (!fromCenter || fromZoom == null) {
                map.setCenter(toCenter)
                map.setZoom(toZoom)
                return
              }

              // Cancel any existing animation
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
              }

              const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
              const duration = 500
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
            })
          )

          return marker
        })

        overlaysRef.current.polylines = polylines
        overlaysRef.current.markers = markers

        // Render university markers if in university mode
        if (props.universityMode && props.universities) {
          const universityMarkers = props.universities.features.map(feature => {
            const university = feature.properties
            const coords = feature.geometry.coordinates
            const universityId = university.universityId
            const isSelected = selectedUniversityId === universityId
            
            const marker = new google.maps.Marker({
              title: `${university.displayName}\nNearest station: ${university.campuses[0].nearestStation.name}`,
              position: toLatLngLiteral(coords),
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: isSelected ? '#FFD700' : '#DC241F', // Gold when selected, TfL red otherwise
                fillOpacity: 1,
                strokeColor: isSelected ? '#0066cc' : '#000000', // Blue border when selected
                strokeWeight: isSelected ? 4 : 2, // Thicker border when selected
                scale: isSelected ? 16 : 12,
              },
              map: map,
              zIndex: isSelected ? 3000 : 2000, // Higher when selected
            })

            // Add click handler
            if (onUniversityClick) {
              marker.addListener('click', () => {
                onUniversityClick(universityId)
                lastMarkerClickRef.current = Date.now()
              })
              // Support explicit double-click deselection (second click without cursor move)
              marker.addListener('dblclick', () => {
                // If currently selected, treat dblclick as deselect
                if (selectedUniversityIdRef.current === universityId) {
                  onUniversityClick(universityId)
                } else {
                  // Otherwise select it (mirrors single click behavior)
                  onUniversityClick(universityId)
                }
              })
            }

            return marker
          })

          overlaysRef.current.universityMarkers = universityMarkers
        }

        // Map background click: clear university selection OR select nearest filtered station
        const mapClickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
          const last = lastMarkerClickRef.current
          // Ignore immediate map click following marker click
          if (Date.now() - last < 150) return

          const currentSelectedUni = selectedUniversityIdRef.current
          if (onUniversityClick && currentSelectedUni) {
            // Passing the same id triggers toggle/deselect logic upstream
            onUniversityClick(currentSelectedUni)
            return
          }

          // If in a filtered mode (green stations) attempt to select nearest visible station
          if (filteredStationSet && filteredStationSet.size > 0 && e.latLng) {
            const clickLat = e.latLng.lat()
            const clickLng = e.latLng.lng()
            const nearestStation = stations.reduce<{ station: Station | null; dist: number | null }>((acc, station) => {
              if (!filteredStationSet.has(station.stationId)) return acc
              const [lng, lat] = station.position.coordinates
              const d = distanceMeters(lat, lng, clickLat, clickLng)
              if (acc.station === null || (acc.dist !== null && d < acc.dist)) {
                return { station, dist: d }
              }
              return acc
            }, { station: null, dist: null })

            if (nearestStation.station && nearestStation.dist !== null && nearestStation.dist < 500) { // 500m threshold
              console.log('[StationSelectDebug] background click nearest filtered station', {
                stationId: nearestStation.station.stationId,
                name: nearestStation.station.displayName,
                distanceMeters: Math.round(nearestStation.dist),
              })
              onStationSelect(nearestStation.station)
            }
          }
        })
        markerClickHandlers.push(mapClickListener)

        const visibleLines = lines.filter(line => !activeSet || activeSet.has(line.lineCode))
        const bounds = new google.maps.LatLngBounds()
        
        // If in university mode and a university is selected, center on that university
        if (props.universityMode && selectedUniversityId && props.universities) {
          const selectedFeature = props.universities.features.find(
            f => f.properties.universityId === selectedUniversityId
          )
          if (selectedFeature) {
            const coords = selectedFeature.geometry.coordinates
            const center = toLatLngLiteral(coords)
            map.setCenter(center)
            map.setZoom(14) // Zoom in to show university and nearby area
            
            // Add visible lines to bounds for reference
            visibleLines.forEach(line => {
              getAllCoordinates(line).forEach(coord => bounds.extend(toLatLngLiteral(coord)))
            })
          }
        } else {
          // Default behavior: fit to all visible lines
          visibleLines.forEach(line => {
            getAllCoordinates(line).forEach(coord => bounds.extend(toLatLngLiteral(coord)))
          })
          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, 24)
          }
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

    // Determine which lines to show based on context
    let linesToShow: Set<string> | null = null
    
    // Priority 1: If a station is selected, show only its lines
    if (selectedStation) {
      linesToShow = new Set(selectedStation.lineCodes)
    }
    // Priority 2: In filtered mode, show lines with filtered stations
    else {
      const inFilteredMode = filteredStationSet && filteredStationSet.size > 0
      if (inFilteredMode) {
        // Collect all line codes from filtered stations
        const lineCodesArray: string[] = []
        stations.forEach(station => {
          if (filteredStationSet.has(station.stationId)) {
            lineCodesArray.push(...station.lineCodes)
          }
        })
        linesToShow = new Set(lineCodesArray)
      }
    }

    // Update visibility for polylines & markers
    polylines.forEach(({ polyline, lineCode }) => {
      const visible = linesToShow 
        ? linesToShow.has(lineCode)
        : (!activeSet || activeSet.has(lineCode))
      polyline.setMap(visible ? map : null)
    })

    markers.forEach((marker, index) => {
      const station = stations[index]
      const visible = stationVisible(station, activeSet, filteredStationSet)
      marker.setMap(visible ? map : null)
      
      // Make filtered stations more prominent
      const inFilteredMode = filteredStationSet && filteredStationSet.size > 0
      const isFiltered = inFilteredMode && filteredStationSet.has(station.stationId)
      
      if (isFiltered) {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#4CAF50', // Bright green for filtered stations
          fillOpacity: 1,
          strokeColor: '#2E7D32', // Darker green border
          strokeWeight: 4,
          scale: station.isInterchange ? 14 : 10, // Larger than default
        })
        marker.setZIndex(2000) // Higher z-index to appear on top
      } else {
        // Reset to default styling
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#ffffff',
          fillOpacity: 1,
          strokeColor: '#333333',
          strokeWeight: station.isInterchange ? 3 : 2,
          scale: station.isInterchange ? 10 : 6,
        })
        marker.setZIndex(1000)
      }
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

    if (selectedStation && !stationVisible(selectedStation, activeSet, filteredStationSet)) {
      onStationSelect(null)
    }

    // Update the ref to track current activeLineCodes for next render
    prevActiveLineCodesRef.current = activeLineCodes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSet, lines, selectedStation, stations, activeLineCodes, filteredStationSet])

  // Effect to zoom to selected university
  useEffect(() => {
    if (!googleRef.current || !universityMode || !universities) return
    
    const { map } = overlaysRef.current
    if (!map) return

    if (selectedUniversityId) {
      const selectedFeature = universities.features.find(
        f => f.properties.universityId === selectedUniversityId
      )
      if (selectedFeature) {
        const coords = selectedFeature.geometry.coordinates
        const center = toLatLngLiteral(coords)
        
        // Animate zoom to university
        const gmaps = googleRef.current.maps
        const fromCenter = map.getCenter()
        const fromZoom = map.getZoom()
        const toCenter = new gmaps.LatLng(center.lat, center.lng)
        const toZoom = 14

        if (!fromCenter || fromZoom == null) return

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
  }, [selectedUniversityId, universityMode, universities])

  // Effect to update university marker styles when selection changes
  useEffect(() => {
    if (!googleRef.current || !universityMode || !universities) return
    
    const { map, universityMarkers } = overlaysRef.current
    if (!map || !universityMarkers) return

    console.log('Updating university markers, selectedUniversityId:', selectedUniversityId)

    // Update all university markers
    universities.features.forEach((feature, index) => {
      const marker = universityMarkers[index]
      if (!marker) return

      const universityId = feature.properties.universityId
      const isSelected = selectedUniversityId === universityId

      console.log(`Marker ${universityId}: isSelected=${isSelected}`)

      // Hide unselected universities when one is selected
      if (selectedUniversityId && !isSelected) {
        marker.setMap(null)
      } else {
        marker.setMap(map)
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: isSelected ? '#FFD700' : '#DC241F',
          fillOpacity: 1,
          strokeColor: isSelected ? '#0066cc' : '#000000', // Blue border when selected
          strokeWeight: isSelected ? 4 : 2, // Thicker border when selected
          scale: isSelected ? 16 : 12,
        })
        marker.setZIndex(isSelected ? 3000 : 2000)
      }
    })
  }, [selectedUniversityId, universityMode, universities])

  // Effect to render radius circle overlay when distance is adjusted
  useEffect(() => {
    if (!googleRef.current || !universityMode || !universities) return
    
    const { map, radiusCircle } = overlaysRef.current
    if (!map) return

    // Clear existing radius circle
    if (radiusCircle) {
      radiusCircle.setMap(null)
      overlaysRef.current.radiusCircle = null
    }

    // Only draw circle if university is selected, in radius mode, and has valid radius
    if (!selectedUniversityId || !radiusMiles || filterMode !== 'radius') return

    // Find selected university coordinates
    const selectedFeature = universities.features.find(
      f => f.properties.universityId === selectedUniversityId
    )
    if (!selectedFeature) return

    const coords = selectedFeature.geometry.coordinates
    const center = new google.maps.LatLng(coords[1], coords[0])

    // Convert miles to meters (1 mile = 1609.34 meters)
    const radiusMeters = radiusMiles * 1609.34

    // Create transparent circle overlay
    const circle = new google.maps.Circle({
      center: center,
      radius: radiusMeters,
      map: map,
      strokeColor: '#4CAF50',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#4CAF50',
      fillOpacity: 0.15,
      zIndex: 500, // Below markers but above base map
      clickable: false,
      draggable: false,
    })

    overlaysRef.current.radiusCircle = circle
  }, [selectedUniversityId, universityMode, universities, radiusMiles, filterMode])

  // Effect to render travel-time based area highlighting
  useEffect(() => {
    if (!googleRef.current || !filterMode || filterMode !== 'time') return
    
    const { map, highlightCircles } = overlaysRef.current
    if (!map) return

    // Clear existing highlight circles
    highlightCircles?.forEach(circle => circle.setMap(null))
    overlaysRef.current.highlightCircles = []

    if (!travelTimeResults || travelTimeResults.length === 0) return

    // Create a Set of reachable station IDs
    const reachableStationIds = new Set(travelTimeResults.map(t => t.stationId))

    // Create highlight circles around each reachable station
    const newCircles = stations
      .filter(station => reachableStationIds.has(station.stationId))
      .map(station => {
        const travelTime = travelTimeResults.find(t => t.stationId === station.stationId)
        const durationMins = travelTime?.durationMinutes || 0

        // Color gradient from green (close) to orange (far within limit)
        const intensity = Math.min(1, durationMins / 20)
        const fillColor = `rgba(76, 175, 80, ${0.3 - intensity * 0.15})` // Green with varying opacity

        return new google.maps.Circle({
          center: toLatLngLiteral(station.position.coordinates),
          radius: 150, // 150 meters highlight radius around each reachable station
          fillColor: fillColor,
          fillOpacity: 0.25,
          strokeColor: '#4CAF50',
          strokeOpacity: 0.6,
          strokeWeight: 1,
          map: map,
          zIndex: 500,
          clickable: false,
          draggable: false,
        })
      })

    overlaysRef.current.highlightCircles = newCircles
  }, [filterMode, travelTimeResults, stations])

  const fallbackStations = useMemo(() => {
    if (!activeSet && !filteredStationSet) {
      return stations
    }
    return stations.filter(station => stationVisible(station, activeSet, filteredStationSet))
  }, [activeSet, filteredStationSet, stations])

  return (
    <section
      className="map-shell"
      data-testid="map-canvas"
      data-state={status}
      aria-busy={status === 'loading'}
      style={{ display: 'flex', position: 'relative' }}
    >
      <div
        ref={containerRef}
        className="map-canvas"
        hidden={renderMode !== 'google'}
        style={{ flex: 1, position: 'relative' }}
      />
      {/* Restore tooltip overlay layer to ensure proper positioning above markers */}
      {renderMode === 'google' && (
        <div
          className="map-tooltip-layer"
          aria-hidden={renderMode !== 'google'}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2500 }}
        >
          {/* Only the tooltip itself should capture pointer events; not the full overlay */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'relative', pointerEvents: 'auto' }}>
              <StationTooltip
                station={selectedStation}
                lineLabels={lineLabels}
                onClose={() => onStationSelect(null)}
                mapInstance={overlaysRef.current.map}
              />
            </div>
          </div>
        </div>
      )}

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
    </section>
  )
}
