import { buildBusGraph, deriveReachableBusNetwork, shortestBusPathsFrom } from '@/app/lib/map/busGraph'
import type { BusRoute, BusStop } from '@/app/types/transit'

const routes: BusRoute[] = [
  {
    routeId: 'r1',
    routeCode: '1',
    displayName: 'Route 1',
    originName: 'A',
    destinationName: 'C',
    brandColor: '#D62B1F',
    textColor: '#FFFFFF',
    strokeWeight: 3,
    geometry: {
      type: 'LineString',
      coordinates: [[-0.14, 51.5], [-0.135, 51.501], [-0.13, 51.502]],
    },
    stopIds: ['a', 'b', 'c'],
    lastUpdated: '2026-04-11T00:00:00.000Z',
  },
  {
    routeId: 'r2',
    routeCode: '2',
    displayName: 'Route 2',
    originName: 'B',
    destinationName: 'D',
    brandColor: '#D62B1F',
    textColor: '#FFFFFF',
    strokeWeight: 3,
    geometry: {
      type: 'LineString',
      coordinates: [[-0.135, 51.501], [-0.129, 51.503]],
    },
    stopIds: ['b', 'd'],
    lastUpdated: '2026-04-11T00:00:00.000Z',
  },
]

const stops: BusStop[] = [
  { stopId: 'a', displayName: 'A', position: { type: 'Point', coordinates: [-0.14, 51.5] }, servedRouteIds: ['r1'], importance: 'major' },
  { stopId: 'b', displayName: 'B', position: { type: 'Point', coordinates: [-0.135, 51.501] }, servedRouteIds: ['r1', 'r2'], importance: 'major' },
  { stopId: 'c', displayName: 'C', position: { type: 'Point', coordinates: [-0.13, 51.502] }, servedRouteIds: ['r1'], importance: 'standard' },
  { stopId: 'd', displayName: 'D', position: { type: 'Point', coordinates: [-0.129, 51.503] }, servedRouteIds: ['r2'], importance: 'standard' },
]

describe('busGraph helpers', () => {
  it('builds adjacency between consecutive stops', () => {
    const graph = buildBusGraph(routes, stops)

    expect(graph.a.map((edge) => edge.to)).toContain('b')
    expect(graph.b.map((edge) => edge.to)).toEqual(expect.arrayContaining(['a', 'c', 'd']))
  })

  it('finds reachable stops within the selected minutes', () => {
    const graph = buildBusGraph(routes, stops)
    const reachable = shortestBusPathsFrom('a', graph, 5)
    const stopB = reachable.find((stop) => stop.stopId === 'b')

    expect(reachable.some((stop) => stop.stopId === 'a')).toBe(true)
    expect(reachable.some((stop) => stop.stopId === 'b')).toBe(true)
    expect(stopB).toEqual(expect.objectContaining({
      minutes: expect.any(Number),
      pathStopIds: ['a', 'b'],
      routeIds: ['r1'],
    }))
  })

  it('derives a reachable route and stop network from an origin stop', () => {
    const network = deriveReachableBusNetwork('a', routes, stops, 8)

    expect(network.stopIds).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']))
    expect(network.routeIds).toEqual(expect.arrayContaining(['r1', 'r2']))
  })
})