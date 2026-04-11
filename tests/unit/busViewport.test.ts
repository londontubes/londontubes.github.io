import {
  deriveBusViewportState,
  getBusZoomBucket,
  getVisibleBusData,
} from '@/app/lib/map/busViewport'
import type { BusRoute, BusStop } from '@/app/types/transit'

const routes: BusRoute[] = [
  {
    routeId: '1',
    routeCode: '1',
    displayName: 'Route 1',
    originName: 'A',
    destinationName: 'B',
    brandColor: '#D62B1F',
    textColor: '#FFFFFF',
    strokeWeight: 3,
    geometry: {
      type: 'LineString',
      coordinates: [[-0.15, 51.5], [-0.12, 51.52]],
    },
    bounds: [[-0.15, 51.5], [-0.12, 51.52]],
    stopIds: ['s1', 's2'],
    lastUpdated: '2026-04-11T00:00:00.000Z',
  },
  {
    routeId: '2',
    routeCode: '2',
    displayName: 'Route 2',
    originName: 'C',
    destinationName: 'D',
    brandColor: '#D62B1F',
    textColor: '#FFFFFF',
    strokeWeight: 3,
    geometry: {
      type: 'LineString',
      coordinates: [[0.2, 51.7], [0.25, 51.72]],
    },
    bounds: [[0.2, 51.7], [0.25, 51.72]],
    stopIds: ['s3'],
    lastUpdated: '2026-04-11T00:00:00.000Z',
  },
]

const stops: BusStop[] = [
  {
    stopId: 's1',
    displayName: 'Stop 1',
    position: { type: 'Point', coordinates: [-0.14, 51.505] },
    servedRouteIds: ['1'],
    importance: 'major',
  },
  {
    stopId: 's2',
    displayName: 'Stop 2',
    position: { type: 'Point', coordinates: [-0.13, 51.51] },
    servedRouteIds: ['1'],
    importance: 'standard',
  },
  {
    stopId: 's3',
    displayName: 'Stop 3',
    position: { type: 'Point', coordinates: [0.22, 51.71] },
    servedRouteIds: ['2'],
    importance: 'major',
  },
]

describe('busViewport helpers', () => {
  it('categorizes zoom levels into buckets', () => {
    expect(getBusZoomBucket(10)).toBe('overview')
    expect(getBusZoomBucket(12)).toBe('route')
    expect(getBusZoomBucket(14)).toBe('stop')
  })

  it('filters visible routes by viewport bounds', () => {
    const state = deriveBusViewportState({
      zoomLevel: 10,
      bounds: { north: 51.55, south: 51.48, east: -0.1, west: -0.2 },
      routes,
      stops,
      activeRouteIds: [],
      selectedRouteId: null,
    })

    expect(state.visibleRouteIds).toEqual(['1'])
    expect(state.visibleStopIds).toEqual([])
  })

  it('shows stop detail for a selected route at high zoom', () => {
    const state = deriveBusViewportState({
      zoomLevel: 15,
      bounds: { north: 51.55, south: 51.48, east: -0.1, west: -0.2 },
      routes,
      stops,
      activeRouteIds: [],
      selectedRouteId: '1',
    })

    const visible = getVisibleBusData(routes, stops, state)
    expect(visible.routes.map((route) => route.routeId)).toEqual(['1'])
    expect(visible.stops.map((stop) => stop.stopId)).toEqual(['s1', 's2'])
  })
})