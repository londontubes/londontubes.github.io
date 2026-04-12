'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import BusRouteFilter from '@/app/components/BusRouteFilter/BusRouteFilter'
import { TimeSlider } from '@/app/components/TimeSlider/TimeSlider'
import { deriveReachableBusNetwork, type ReachableBusStop } from '@/app/lib/map/busGraph'
import type { BusDataset } from '@/app/types/transit'

const BusMapCanvas = dynamic(() => import('./BusMapCanvas'), {
  ssr: false,
  loading: () => (
    <section className="map-shell" aria-busy="true" aria-label="Loading bus map">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-1, #111113)',
          color: 'var(--text-3, #71717a)',
          fontSize: '0.9rem',
        }}
      >
        Loading bus map&hellip;
      </div>
    </section>
  ),
})

interface BusExperienceProps {
  dataset: BusDataset
}

type BusControlMode = 'route' | 'time'

function flattenRouteCoordinates(route: BusDataset['routes'][number]): [number, number][] {
  if (route.geometry.type === 'LineString') {
    return route.geometry.coordinates as [number, number][]
  }

  return (route.geometry.coordinates as [number, number][][]).flat()
}

export default function BusExperience({ dataset }: BusExperienceProps) {
  const { routes, stops } = dataset
  const [travelTimeMinutes, setTravelTimeMinutes] = useState(20)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedRouteStopId, setSelectedRouteStopId] = useState<string | null>(null)
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [selectedReachableStopId, setSelectedReachableStopId] = useState<string | null>(null)
  const [activeControlMode, setActiveControlMode] = useState<BusControlMode>('route')
  const [resetVersion, setResetVersion] = useState(0)

  const selectedRouteStop = useMemo(
    () => stops.find((stop) => stop.stopId === selectedRouteStopId) ?? null,
    [selectedRouteStopId, stops]
  )

  const activeRouteIds = useMemo(
    () => {
      if (selectedRouteId) {
        return [selectedRouteId]
      }

      if (activeControlMode === 'route' && selectedRouteStop) {
        return selectedRouteStop.servedRouteIds
      }

      return []
    },
    [activeControlMode, selectedRouteId, selectedRouteStop]
  )

  const handleRouteFilterChange = (routeId: string | null) => {
    setActiveControlMode('route')
    setSelectedRouteId(routeId)
    setSelectedRouteStopId(null)
    setSelectedStopId(null)
    setSelectedReachableStopId(null)
  }

  const activateRouteMode = () => {
    setActiveControlMode('route')
    setSelectedRouteStopId(null)
    setSelectedStopId(null)
    setSelectedReachableStopId(null)
  }

  const activateTimeMode = () => {
    setActiveControlMode('time')
    setSelectedRouteId(null)
    setSelectedRouteStopId(null)
  }

  const handleTimeModeReset = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setActiveControlMode('time')
    setSelectedRouteId(null)
    setSelectedRouteStopId(null)
    setSelectedStopId(null)
    setSelectedReachableStopId(null)
    setResetVersion((currentValue) => currentValue + 1)
  }

  const handleControlPanelKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    mode: BusControlMode
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()

    if (mode === 'route') {
      activateRouteMode()
      return
    }

    activateTimeMode()
  }

  const visibleRoutes = useMemo(() => {
    if (!selectedRouteId) return routes
    return routes.filter((route) => route.routeId === selectedRouteId)
  }, [routes, selectedRouteId])

  const selectedStop = useMemo(
    () => stops.find((stop) => stop.stopId === selectedStopId) ?? null,
    [selectedStopId, stops]
  )

  const reachableNetwork = useMemo(() => {
    if (!selectedStopId) {
      return null
    }

    return deriveReachableBusNetwork(
      selectedStopId,
      routes,
      stops,
      travelTimeMinutes,
      selectedStop?.servedRouteIds,
    )
  }, [selectedStop, selectedStopId, routes, stops, travelTimeMinutes])

  const focusedRouteIds = reachableNetwork?.routeIds ?? null
  const focusedStopIds = reachableNetwork?.stopIds ?? null
  const reachableStopDetails = useMemo<Record<string, ReachableBusStop>>(() => {
    if (!reachableNetwork) {
      return {}
    }

    return reachableNetwork.stops.reduce<Record<string, ReachableBusStop>>((accumulator, stop) => {
      accumulator[stop.stopId] = stop
      return accumulator
    }, {})
  }, [reachableNetwork])
  const selectedReachableStop = useMemo(
    () => selectedReachableStopId ? reachableStopDetails[selectedReachableStopId] ?? null : null,
    [reachableStopDetails, selectedReachableStopId]
  )
  const selectedReachableStopDetails = useMemo(
    () => selectedReachableStopId ? stops.find((stop) => stop.stopId === selectedReachableStopId) ?? null : null,
    [selectedReachableStopId, stops]
  )
  const availableRoutes = useMemo(() => {
    if (!focusedRouteIds) {
      return routes
    }

    const routeSet = new Set(focusedRouteIds)
    return routes.filter((route) => routeSet.has(route.routeId))
  }, [focusedRouteIds, routes])

  const selectedRoute = useMemo(
    () => routes.find((route) => route.routeId === selectedRouteId) ?? null,
    [routes, selectedRouteId]
  )
  const selectedReachableRouteLabel = useMemo(() => {
    if (!selectedReachableStop || selectedReachableStop.routeIds.length === 0) {
      return null
    }

    const routeCodes = selectedReachableStop.routeIds
      .map((routeId) => routes.find((route) => route.routeId === routeId)?.routeCode ?? routeId)
      .filter((routeCode, index, array) => Boolean(routeCode) && array.indexOf(routeCode) === index)

    if (routeCodes.length === 0) {
      return null
    }

    return routeCodes.join(', ')
  }, [routes, selectedReachableStop])
  const busTimeDescription = useMemo(() => {
    if (selectedStop && selectedReachableStopDetails && selectedReachableRouteLabel) {
      return `${selectedStop.displayName} -> ${selectedReachableStopDetails.displayName} via ${selectedReachableRouteLabel}`
    }

    if (selectedStop) {
      return selectedStop.displayName
    }

    return 'Set a time window, then click a major stop to see nearby reachable stops within that time.'
  }, [selectedReachableRouteLabel, selectedReachableStopDetails, selectedStop])

  const focusCoordinates = useMemo(() => {
    if (selectedRoute) {
      const routeCoordinates = flattenRouteCoordinates(selectedRoute)
      const stopCoordinates = selectedRoute.stopIds
        .map((stopId) => stops.find((stop) => stop.stopId === stopId)?.position.coordinates)
        .filter((coordinates): coordinates is [number, number] => Boolean(coordinates))

      const firstStopCoordinates = stopCoordinates[0] ? [stopCoordinates[0]] : []
      const lastStopCoordinates = stopCoordinates.length > 1 ? [stopCoordinates[stopCoordinates.length - 1]] : []

      return [...routeCoordinates, ...firstStopCoordinates, ...lastStopCoordinates]
    }

    if (activeControlMode === 'route' && selectedRouteStop) {
      const routeCoordinates = routes
        .filter((route) => selectedRouteStop.servedRouteIds.includes(route.routeId))
        .flatMap((route) => flattenRouteCoordinates(route))

      return [selectedRouteStop.position.coordinates, ...routeCoordinates]
    }

    if (selectedReachableStop) {
      if (activeControlMode === 'time') {
        return selectedReachableStop.pathStopIds
          .map((stopId) => stops.find((stop) => stop.stopId === stopId))
          .filter((stop): stop is (typeof stops)[number] => stop !== undefined)
          .filter((stop) => stop.importance === 'major')
          .map((stop) => stop.position.coordinates)
      }

      return selectedReachableStop.pathStopIds
        .map((stopId) => stops.find((stop) => stop.stopId === stopId)?.position.coordinates)
        .filter((coordinates): coordinates is [number, number] => Boolean(coordinates))
    }

    if (!focusedStopIds) {
      return null
    }

    const focusedStopSet = new Set(focusedStopIds)
    return stops
      .filter((stop) => focusedStopSet.has(stop.stopId))
      .filter((stop) => activeControlMode !== 'time' || stop.importance === 'major')
      .map((stop) => stop.position.coordinates)
  }, [activeControlMode, focusedStopIds, routes, selectedReachableStop, selectedRoute, selectedRouteStop, stops])

  const focusedRouteCount = focusedRouteIds?.length ?? visibleRoutes.length

  return (
    <div className="map-experience">
      <header className="map-experience__header-inline">
        <h1 className="map-title">London Bus Routes</h1>
        <span className="map-stats" data-testid="bus-network-stats">
          {routes.length} routes · {stops.length} stops · {focusedRouteCount} visible
        </span>
      </header>

      <div className="bus-controls-row">
        <div
          className={`bus-control-panel bus-control-panel--route ${activeControlMode === 'route' ? 'bus-control-panel--active' : 'bus-control-panel--inactive'}`}
          role="button"
          tabIndex={0}
          aria-pressed={activeControlMode === 'route'}
          onClick={activateRouteMode}
          onKeyDown={(event) => handleControlPanelKeyDown(event, 'route')}
        >
          <div className="bus-control-panel__header">
            <span className="bus-control-panel__title">Bus Route</span>
            <span className="bus-control-panel__description">Select one route to overlay it clearly across London.</span>
          </div>
          <BusRouteFilter
            routes={availableRoutes}
            selectedRouteId={selectedRouteId}
            onChange={handleRouteFilterChange}
            disabled={activeControlMode !== 'route'}
            hideLabel
            hideHint
          />
        </div>

        <div
          className={`bus-control-panel bus-control-panel--time ${activeControlMode === 'time' ? 'bus-control-panel--active' : 'bus-control-panel--inactive'}`}
          role="button"
          tabIndex={0}
          aria-pressed={activeControlMode === 'time'}
          onClick={activateTimeMode}
          onKeyDown={(event) => handleControlPanelKeyDown(event, 'time')}
        >
          <div className="bus-control-panel__header">
            <span className="bus-control-panel__title">Bus Time</span>
            <button
              type="button"
              className="bus-control-panel__reset"
              onClick={handleTimeModeReset}
            >
              Reset
            </button>
            <span className="bus-control-panel__description">
              {busTimeDescription}
            </span>
          </div>
          <div className="bus-time-filter" data-testid="bus-time-filter">
            <TimeSlider
              value={travelTimeMinutes}
              onChange={setTravelTimeMinutes}
              min={5}
              max={60}
              step={1}
              label="Bus Time"
              ariaLabel="Bus time in minutes"
              disabled={activeControlMode !== 'time'}
              hideVisibleLabel
            />
          </div>
        </div>
      </div>

      <BusMapCanvas
        routes={routes}
        stops={stops}
        controlMode={activeControlMode}
        resetVersion={resetVersion}
        activeRouteIds={activeRouteIds}
        selectedRouteId={selectedRouteId}
        selectedStopId={activeControlMode === 'time' ? selectedStopId : selectedRouteStopId}
        selectedReachableStopId={selectedReachableStopId}
        selectedReachablePathStopIds={selectedReachableStop?.pathStopIds ?? null}
        selectedReachableRouteIds={selectedReachableStop?.routeIds ?? null}
        focusedRouteIds={focusedRouteIds}
        focusedStopIds={focusedStopIds}
        reachableStopDetails={reachableStopDetails}
        fitToCoordinates={focusCoordinates}
        onSelectRoute={(routeId) => {
          setActiveControlMode('route')
          setSelectedRouteId(routeId)
          setSelectedRouteStopId(null)
          setSelectedStopId(null)
          setSelectedReachableStopId(null)
        }}
        onSelectStop={(stopId) => {
          if (activeControlMode === 'route') {
            setSelectedRouteId(null)
            setSelectedRouteStopId((currentStopId) => currentStopId === stopId ? null : stopId)
            setSelectedStopId(null)
            setSelectedReachableStopId(null)
            return
          }

          setActiveControlMode('time')
          setSelectedRouteId(null)
          setSelectedRouteStopId(null)
          setSelectedStopId(stopId)
          setSelectedReachableStopId(null)
        }}
        onSelectReachableStop={(stopId) => {
          setActiveControlMode('time')
          setSelectedRouteId(null)
          setSelectedReachableStopId((currentStopId) => currentStopId === stopId ? null : stopId)
        }}
      />
    </div>
  )
}