'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Popup, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
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
  controlMode: 'route' | 'time'
  resetVersion?: number
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

function BusMapFocus({
  coordinates,
  resetVersion,
}: {
  coordinates?: [number, number][] | null
  resetVersion?: number
}) {
  const map = useMap()

  useEffect(() => {
    if (!resetVersion) {
      return
    }

    map.setView(LONDON_CENTER, DEFAULT_ZOOM, { animate: true })
  }, [map, resetVersion])

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
  controlMode,
  resetVersion,
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
  const isTimeMode = controlMode === 'time'

  const stopLookup = useMemo(
    () => new Map(stops.map((stop) => [stop.stopId, stop])),
    [stops]
  )
  const originStop = selectedStopId ? stopLookup.get(selectedStopId) ?? null : null
  const selectedReachableStop = selectedReachableStopId
    ? stopLookup.get(selectedReachableStopId) ?? null
    : null
  const timeModeVisibleRouteIds = useMemo(() => {
    if (!originStop || !selectedReachableStop) {
      return selectedReachableRouteIds ?? []
    }

    const directRouteIds = routes
      .filter((route) => {
        const originIndex = route.stopIds.indexOf(originStop.stopId)
        const destinationIndex = route.stopIds.indexOf(selectedReachableStop.stopId)

        return originIndex !== -1 && destinationIndex !== -1 && originIndex !== destinationIndex
      })
      .map((route) => route.routeId)

    return directRouteIds.length > 0 ? directRouteIds : selectedReachableRouteIds ?? []
  }, [originStop, routes, selectedReachableRouteIds, selectedReachableStop])

  const visibleRoutes = useMemo(() => {
    if (isTimeMode) {
      if (timeModeVisibleRouteIds.length === 0) {
        return []
      }

      const routeSet = new Set(timeModeVisibleRouteIds)
      return routes.filter((route) => routeSet.has(route.routeId))
    }

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
  }, [computedVisibleData.routes, focusedRouteIds, focusedStopIds, isTimeMode, routes, selectedRouteId, timeModeVisibleRouteIds])

  const visibleStops = useMemo(() => {
    if (isTimeMode) {
      const baseStops = focusedStopIds
        ? stops.filter((stop) => focusedStopIds.includes(stop.stopId))
        : stops

      return baseStops.filter((stop) => stop.importance === 'major')
    }

    if (!focusedStopIds) {
      return computedVisibleData.stops
    }

    const stopSet = new Set(focusedStopIds)
    return stops.filter((stop) => stopSet.has(stop.stopId))
  }, [computedVisibleData.stops, focusedStopIds, isTimeMode, stops])

  const isFocusedNetwork = Boolean(focusedRouteIds && focusedStopIds)
  const routeLookup = useMemo(
    () => new Map(routes.map((route) => [route.routeId, route])),
    [routes]
  )
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
          detectRetina
        />
        <BusMapEvents onViewportChange={setViewport} />
        <BusMapFocus coordinates={fitToCoordinates} resetVersion={resetVersion} />

        {visibleRoutes.map((route) => {
          const isSelected = route.routeId === selectedRouteId
          const style = {
            color: route.brandColor,
            weight: isTimeMode || isSelected ? route.strokeWeight + 2 : route.strokeWeight,
            opacity: isTimeMode || isSelected ? 0.95 : isFocusedNetwork ? 0.8 : 0.55,
          }

          if (route.geometry.type === 'LineString') {
            return (
              <Polyline
                key={route.routeId}
                positions={toLatLngs(route.geometry.coordinates as [number, number][])}
                pathOptions={style}
                eventHandlers={isTimeMode ? undefined : {
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
              eventHandlers={isTimeMode ? undefined : {
                click: () => onSelectRoute(isSelected ? null : route.routeId),
              }}
            />
          ))
        })}

        {!isTimeMode && selectedReachablePathCoordinates.length > 1 ? (
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
          const isMajorStop = stop.importance === 'major'
          const isRouteMode = !isTimeMode
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
          const reachableSummaryLabel = reachableDetail
            ? `${reachableDetail.minutes} min from ${pathLabel ?? originStop?.displayName ?? stop.displayName}${viaLabel ? ` via ${viaLabel}` : ''}`
            : null
          const fillColor = isTimeMode
            ? isSelected
              ? '#FACC15'
              : isReachableStop
                ? '#4CAF50'
                : '#FFFFFF'
            : isSelected
              ? '#FACC15'
              : isReachableStop
                ? '#FACC15'
                : '#FFFFFF'
          const strokeColor = isTimeMode
            ? isSelected
              ? '#92400E'
              : isReachableStop
                ? '#2E7D32'
                : '#0F172A'
            : isSelected
              ? '#92400E'
              : isReachableStop
                ? '#92400E'
                : '#0F172A'
          const markerRadius = isSelected
            ? isTimeMode
              ? 10
              : isMajorStop
                ? 9
                : 4
            : isSelectedReachableStop
              ? 12
              : isReachableStop
                ? 10
                : isMajorStop
                  ? 9
                  : 4
          const markerWeight = isSelectedReachableStop
            ? 3
            : isTimeMode || isReachableStop || isMajorStop
              ? 2
              : 1
          return (
            <CircleMarker
              key={stop.stopId}
              center={[stop.position.coordinates[1], stop.position.coordinates[0]]}
              radius={markerRadius}
              pathOptions={{
                color: strokeColor,
                weight: markerWeight,
                fillColor,
                fillOpacity: isReachableStop ? 0.9 : 0.9,
              }}
              eventHandlers={isRouteMode ? undefined : isReachableStop ? {
                click: () => onSelectReachableStop(stop.stopId),
              } : {
                click: () => onSelectStop(isSelected ? null : stop.stopId),
              }}
            >
              {isRouteMode ? (
                <Tooltip direction="top" offset={[0, -8]} opacity={1} sticky>
                  <div className="bus-map-popup">
                    <h3>{stop.displayName}</h3>
                    {servedRouteLabels.length > 0 ? <p>Routes: {servedRouteLabels.join(', ')}</p> : null}
                  </div>
                </Tooltip>
              ) : (
                <Popup>
                  <div className="bus-map-popup">
                    <h3>{stop.displayName}</h3>
                    {isSelected || isReachableStop ? null : (
                      <p>Click to start a reachability search</p>
                    )}
                    {isReachableStop && originStop && reachableDetail ? (
                      <>
                        {reachableSummaryLabel ? <p>{reachableSummaryLabel}</p> : null}
                      </>
                    ) : null}
                    {servedRouteLabels.length > 0 ? <p>Routes: {servedRouteLabels.join(', ')}</p> : null}
                  </div>
                </Popup>
              )}
            </CircleMarker>
          )
        })}
      </MapContainer>
    </section>
  )
}