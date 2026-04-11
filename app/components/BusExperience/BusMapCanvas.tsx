'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Popup, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { BusRoute, BusStop } from '@/app/types/transit'
import type { ReachableBusStop } from '@/app/lib/map/busGraph'
import {
  deriveBusViewportState,
  getVisibleBusData,
  type MapBoundsLike,
} from '@/app/lib/map/busViewport'

const LONDON_CENTER: [number, number] = [51.5074, -0.1278]
const DEFAULT_ZOOM = 11

interface BusMapCanvasProps {
  routes: BusRoute[]
  stops: BusStop[]
  activeRouteIds: string[]
  selectedRouteId: string | null
  selectedStopId: string | null
  selectedReachableStopId?: string | null
  selectedReachablePathStopIds?: string[] | null
  selectedReachableRouteIds?: string[] | null
  focusedRouteIds?: string[] | null
  focusedStopIds?: string[] | null
  reachableStopDetails?: Record<string, ReachableBusStop>
  fitToCoordinates?: [number, number][] | null
  onSelectRoute: (routeId: string | null) => void
  onSelectStop: (stopId: string | null) => void
  onSelectReachableStop: (stopId: string) => void
}

function BusMapFocus({ coordinates }: { coordinates?: [number, number][] | null }) {
  const map = useMap()

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) {
      return
    }

    if (coordinates.length === 1) {
      const [lng, lat] = coordinates[0]
      map.setView([lat, lng], Math.max(map.getZoom(), 14), { animate: true })
      return
    }

    const latitudes = coordinates.map((coordinate) => coordinate[1])
    const longitudes = coordinates.map((coordinate) => coordinate[0])
    map.fitBounds([
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)],
    ], {
      padding: [32, 32],
      animate: true,
      maxZoom: 14,
    })
  }, [coordinates, map])

  return null
}

function BusMapEvents({
  onViewportChange,
}: {
  onViewportChange: (viewport: { zoomLevel: number; bounds: MapBoundsLike }) => void
}) {
  const map = useMap()

  const emitViewport = useCallback(() => {
    const bounds = map.getBounds()
    onViewportChange({
      zoomLevel: map.getZoom(),
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
    })
  }, [map, onViewportChange])

  useMapEvents({
    zoomend: emitViewport,
    moveend: emitViewport,
  })

  useEffect(() => {
    emitViewport()
  }, [emitViewport])

  return null
}

function toLatLngs(coordinates: [number, number][]): [number, number][] {
  return coordinates.map(([lng, lat]) => [lat, lng])
}

function getSortedRouteCodes(routeIds: string[], routeLookup: Map<string, BusRoute>): string[] {
  const collator = new Intl.Collator('en-GB', { numeric: true, sensitivity: 'base' })

  return routeIds
    .map((routeId) => routeLookup.get(routeId)?.routeCode ?? routeId)
    .filter((routeCode, index, array) => Boolean(routeCode) && array.indexOf(routeCode) === index)
    .sort((left, right) => collator.compare(left, right))
}

export default function BusMapCanvas({
  routes,
  stops,
  activeRouteIds,
  selectedRouteId,
  selectedStopId,
  selectedReachableStopId,
  selectedReachablePathStopIds,
  selectedReachableRouteIds,
  focusedRouteIds,
  focusedStopIds,
  reachableStopDetails = {},
  fitToCoordinates,
  onSelectRoute,
  onSelectStop,
  onSelectReachableStop,
}: BusMapCanvasProps) {
  const [viewport, setViewport] = useState<{ zoomLevel: number; bounds: MapBoundsLike | null }>({
    zoomLevel: DEFAULT_ZOOM,
    bounds: null,
  })

  const viewportState = useMemo(() => deriveBusViewportState({
    zoomLevel: viewport.zoomLevel,
    bounds: viewport.bounds,
    routes,
    stops,
    activeRouteIds,
    selectedRouteId,
  }), [viewport.zoomLevel, viewport.bounds, routes, stops, activeRouteIds, selectedRouteId])

  const computedVisibleData = useMemo(
    () => getVisibleBusData(routes, stops, viewportState),
    [routes, stops, viewportState]
  )

  const visibleRoutes = useMemo(() => {
    if (selectedRouteId) {
      return routes.filter((route) => route.routeId === selectedRouteId)
    }

    if (focusedStopIds) {
      return []
    }

    if (!focusedRouteIds) {
      return computedVisibleData.routes
    }

    const routeSet = new Set(focusedRouteIds)
    return routes.filter((route) => routeSet.has(route.routeId))
  }, [computedVisibleData.routes, focusedRouteIds, focusedStopIds, routes, selectedRouteId])

  const visibleStops = useMemo(() => {
    if (!focusedStopIds) {
      return computedVisibleData.stops
    }

    const stopSet = new Set(focusedStopIds)
    return stops.filter((stop) => stopSet.has(stop.stopId))
  }, [computedVisibleData.stops, focusedStopIds, stops])

  const isFocusedNetwork = Boolean(focusedRouteIds && focusedStopIds)
  const routeLookup = useMemo(
    () => new Map(routes.map((route) => [route.routeId, route])),
    [routes]
  )
  const stopLookup = useMemo(
    () => new Map(stops.map((stop) => [stop.stopId, stop])),
    [stops]
  )
  const originStop = selectedStopId ? stopLookup.get(selectedStopId) ?? null : null
  const selectedReachablePathCoordinates = useMemo(() => {
    if (!selectedReachablePathStopIds || selectedReachablePathStopIds.length < 2) {
      return []
    }

    return selectedReachablePathStopIds
      .map((stopId) => stopLookup.get(stopId)?.position.coordinates)
      .filter((coordinates): coordinates is [number, number] => Boolean(coordinates))
  }, [selectedReachablePathStopIds, stopLookup])
  const selectedReachablePathColor = useMemo(() => {
    if (!selectedReachableRouteIds || selectedReachableRouteIds.length === 0) {
      return '#F59E0B'
    }

    return routeLookup.get(selectedReachableRouteIds[0])?.brandColor ?? '#F59E0B'
  }, [routeLookup, selectedReachableRouteIds])

  return (
    <section className="map-shell" aria-label="London bus map">
      <MapContainer center={LONDON_CENTER} zoom={DEFAULT_ZOOM} className="map-canvas" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BusMapEvents onViewportChange={setViewport} />
        <BusMapFocus coordinates={fitToCoordinates} />

        {visibleRoutes.map((route) => {
          const isSelected = route.routeId === selectedRouteId
          const style = {
            color: route.brandColor,
            weight: isSelected ? route.strokeWeight + 2 : route.strokeWeight,
            opacity: isSelected ? 0.95 : isFocusedNetwork ? 0.8 : 0.55,
          }

          if (route.geometry.type === 'LineString') {
            return (
              <Polyline
                key={route.routeId}
                positions={toLatLngs(route.geometry.coordinates as [number, number][])}
                pathOptions={style}
                eventHandlers={{
                  click: () => onSelectRoute(isSelected ? null : route.routeId),
                }}
              />
            )
          }

          return (route.geometry.coordinates as [number, number][][]).map((segment, index) => (
            <Polyline
              key={`${route.routeId}-${index}`}
              positions={toLatLngs(segment)}
              pathOptions={style}
              eventHandlers={{
                click: () => onSelectRoute(isSelected ? null : route.routeId),
              }}
            />
          ))
        })}

        {selectedReachablePathCoordinates.length > 1 ? (
          <Polyline
            positions={toLatLngs(selectedReachablePathCoordinates)}
            pathOptions={{
              color: selectedReachablePathColor,
              weight: 5,
              opacity: 0.95,
            }}
          />
        ) : null}

        {visibleStops.map((stop) => {
          const isSelected = stop.stopId === selectedStopId
          const isReachableStop = isFocusedNetwork && !isSelected
          const isSelectedReachableStop = stop.stopId === selectedReachableStopId
          const reachableDetail = reachableStopDetails[stop.stopId]
          const servedRouteLabels = getSortedRouteCodes(stop.servedRouteIds, routeLookup)
          const routeLabels = reachableDetail
            ? getSortedRouteCodes(reachableDetail.routeIds, routeLookup)
            : []
          const viaLabel = routeLabels.length === 0
            ? null
            : routeLabels.length === 1
              ? `Bus route ${routeLabels[0]}`
              : `Bus routes ${routeLabels.join(', ')}`
          const pathLabel = reachableDetail && reachableDetail.pathStopIds.length > 1
            ? reachableDetail.pathStopIds
                .map((stopId) => stopLookup.get(stopId)?.displayName ?? stopId)
                .join(' -> ')
            : null
          const fillColor = isSelected ? '#D62B1F' : isReachableStop ? '#FACC15' : '#111827'
          const strokeColor = isSelected ? '#ffffff' : isReachableStop ? '#92400E' : '#ffffff'
          return (
            <CircleMarker
              key={stop.stopId}
              center={[stop.position.coordinates[1], stop.position.coordinates[0]]}
              radius={isSelected ? 6 : isSelectedReachableStop ? 12 : isReachableStop ? 10 : stop.importance === 'major' ? 5 : 4}
              pathOptions={{
                color: strokeColor,
                weight: isSelectedReachableStop ? 3 : isReachableStop ? 2 : 1,
                fillColor,
                fillOpacity: isReachableStop ? 0.9 : 0.9,
              }}
              eventHandlers={isReachableStop ? {
                click: () => onSelectReachableStop(stop.stopId),
              } : {
                click: () => onSelectStop(isSelected ? null : stop.stopId),
              }}
            >
              <Popup>
                <div className="bus-map-popup">
                  <h3>{stop.displayName}</h3>
                  {isSelected || isReachableStop ? null : <p>Click to start a reachability search</p>}
                  {isReachableStop && originStop && reachableDetail ? (
                    <>
                      <p>{reachableDetail.minutes} min from {originStop.displayName}</p>
                      {viaLabel ? <p>{viaLabel}</p> : null}
                      {pathLabel ? <p>{pathLabel}</p> : null}
                    </>
                  ) : null}
                  {servedRouteLabels.length > 0 ? <p>Routes: {servedRouteLabels.join(', ')}</p> : null}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </section>
  )
}