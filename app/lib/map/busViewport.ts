import type { BusRoute, BusStop } from '@/app/types/transit'

export interface MapBoundsLike {
  north: number
  south: number
  east: number
  west: number
}

export type BusZoomBucket = 'overview' | 'route' | 'stop'

export interface BusViewportState {
  zoomBucket: BusZoomBucket
  visibleRouteIds: string[]
  visibleStopIds: string[]
  stopRenderCap: number
}

interface DeriveBusViewportArgs {
  zoomLevel: number
  bounds: MapBoundsLike | null
  routes: BusRoute[]
  stops: BusStop[]
  activeRouteIds: string[]
  selectedRouteId: string | null
}

export const BUS_VIEWPORT_THRESHOLDS = {
  routeZoom: 11,
  stopZoom: 14,
  overviewStopCap: 0,
  routeStopCap: 36,
  stopStopCap: 140,
  selectedRouteStopCap: 220,
  majorStopRouteCountThreshold: 4,
} as const

export function getBusZoomBucket(zoomLevel: number): BusZoomBucket {
  if (zoomLevel >= BUS_VIEWPORT_THRESHOLDS.stopZoom) return 'stop'
  if (zoomLevel >= BUS_VIEWPORT_THRESHOLDS.routeZoom) return 'route'
  return 'overview'
}

function boundsIntersect(
  a: [number, number][],
  b: MapBoundsLike,
): boolean {
  if (a.length !== 2) return true

  const [[west, south], [east, north]] = a
  return !(east < b.west || west > b.east || north < b.south || south > b.north)
}

function pointInBounds(
  coordinates: [number, number],
  bounds: MapBoundsLike,
): boolean {
  const [lng, lat] = coordinates
  return lat <= bounds.north && lat >= bounds.south && lng <= bounds.east && lng >= bounds.west
}

export function deriveBusViewportState({
  zoomLevel,
  bounds,
  routes,
  stops,
  activeRouteIds,
  selectedRouteId,
}: DeriveBusViewportArgs): BusViewportState {
  const zoomBucket = getBusZoomBucket(zoomLevel)
  const activeSet = activeRouteIds.length > 0 ? new Set(activeRouteIds) : null

  const visibleRoutes = routes.filter((route) => {
    const matchesActive = !activeSet || activeSet.has(route.routeId)
    const matchesBounds = !bounds || !route.bounds || boundsIntersect(route.bounds, bounds)
    return matchesActive && matchesBounds
  })

  if (zoomBucket === 'overview') {
    return {
      zoomBucket,
      visibleRouteIds: visibleRoutes.map((route) => route.routeId),
      visibleStopIds: [],
      stopRenderCap: BUS_VIEWPORT_THRESHOLDS.overviewStopCap,
    }
  }

  const stopCap = selectedRouteId
    ? BUS_VIEWPORT_THRESHOLDS.selectedRouteStopCap
    : zoomBucket === 'stop'
      ? BUS_VIEWPORT_THRESHOLDS.stopStopCap
      : BUS_VIEWPORT_THRESHOLDS.routeStopCap

  const routeIdsForStops = new Set(
    selectedRouteId
      ? [selectedRouteId]
      : visibleRoutes.map((route) => route.routeId)
  )

  let eligibleStops = stops.filter((stop) => {
    const servedByVisibleRoute = stop.servedRouteIds.some((routeId) => routeIdsForStops.has(routeId))
    const insideBounds = !bounds || pointInBounds(stop.position.coordinates, bounds)
    return servedByVisibleRoute && insideBounds
  })

  if (!selectedRouteId && routeIdsForStops.size > BUS_VIEWPORT_THRESHOLDS.majorStopRouteCountThreshold) {
    eligibleStops = eligibleStops.filter((stop) => stop.importance === 'major')
  }

  return {
    zoomBucket,
    visibleRouteIds: visibleRoutes.map((route) => route.routeId),
    visibleStopIds: eligibleStops.slice(0, stopCap).map((stop) => stop.stopId),
    stopRenderCap: stopCap,
  }
}

export function getVisibleBusData(
  routes: BusRoute[],
  stops: BusStop[],
  viewportState: BusViewportState,
): { routes: BusRoute[]; stops: BusStop[] } {
  const routeIds = new Set(viewportState.visibleRouteIds)
  const stopIds = new Set(viewportState.visibleStopIds)

  return {
    routes: routes.filter((route) => routeIds.has(route.routeId)),
    stops: stops.filter((stop) => stopIds.has(stop.stopId)),
  }
}