import type { BusRoute, BusStop } from '@/app/types/transit'

export interface BusGraphEdge {
  to: string
  routeId: string
  runMinutes: number
}

export interface BusGraph {
  [stopId: string]: BusGraphEdge[]
}

export interface ReachableBusStop {
  stopId: string
  minutes: number
  pathStopIds: string[]
  routeIds: string[]
}

export interface ReachableBusNetwork {
  stopIds: string[]
  routeIds: string[]
  stops: ReachableBusStop[]
}

const FALLBACK_BUS_SPEED_MPH = 11
const FALLBACK_DWELL_MINUTES = 0.4

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusMeters = 6371000
  const toRadians = (value: number) => (value * Math.PI) / 180
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLng = toRadians(lng2 - lng1)
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusMeters * c
}

export function buildBusGraph(routes: BusRoute[], stops: BusStop[]): BusGraph {
  const stopMap = new Map(stops.map((stop) => [stop.stopId, stop]))
  const graph: BusGraph = {}
  const seenEdges = new Set<string>()

  const ensureStop = (stopId: string) => {
    if (!graph[stopId]) {
      graph[stopId] = []
    }
  }

  routes.forEach((route) => {
    for (let index = 0; index < route.stopIds.length - 1; index += 1) {
      const currentStopId = route.stopIds[index]
      const nextStopId = route.stopIds[index + 1]
      const currentStop = stopMap.get(currentStopId)
      const nextStop = stopMap.get(nextStopId)

      if (!currentStop || !nextStop || currentStopId === nextStopId) {
        continue
      }

      const edgeKey = `${route.routeId}:${currentStopId}:${nextStopId}`
      const reverseKey = `${route.routeId}:${nextStopId}:${currentStopId}`
      if (seenEdges.has(edgeKey) || seenEdges.has(reverseKey)) {
        continue
      }

      const [currentLng, currentLat] = currentStop.position.coordinates
      const [nextLng, nextLat] = nextStop.position.coordinates
      const distanceMeters = haversineMeters(currentLat, currentLng, nextLat, nextLng)
      const distanceMiles = distanceMeters / 1609.34
      const runMinutes = Math.max(
        FALLBACK_DWELL_MINUTES,
        (distanceMiles / FALLBACK_BUS_SPEED_MPH) * 60 + FALLBACK_DWELL_MINUTES
      )

      ensureStop(currentStopId)
      ensureStop(nextStopId)
      graph[currentStopId].push({ to: nextStopId, routeId: route.routeId, runMinutes })
      graph[nextStopId].push({ to: currentStopId, routeId: route.routeId, runMinutes })

      seenEdges.add(edgeKey)
      seenEdges.add(reverseKey)
    }
  })

  return graph
}

export function shortestBusPathsFrom(originStopId: string, graph: BusGraph, maxMinutes: number): ReachableBusStop[] {
  if (!graph[originStopId]) {
    return []
  }

  const distances = new Map<string, number>([[originStopId, 0]])
  const previousStop = new Map<string, string | null>([[originStopId, null]])
  const previousRoute = new Map<string, string | null>([[originStopId, null]])
  const visited = new Set<string>()
  const queue: Array<{ stopId: string; minutes: number }> = [{ stopId: originStopId, minutes: 0 }]

  const popNext = () => {
    let bestIndex = -1
    let bestMinutes = Number.POSITIVE_INFINITY

    for (let index = 0; index < queue.length; index += 1) {
      if (queue[index].minutes < bestMinutes) {
        bestMinutes = queue[index].minutes
        bestIndex = index
      }
    }

    if (bestIndex === -1) {
      return null
    }

    const [next] = queue.splice(bestIndex, 1)
    return next
  }

  while (true) {
    const current = popNext()
    if (!current) {
      break
    }

    if (visited.has(current.stopId)) {
      continue
    }

    visited.add(current.stopId)

    for (const edge of graph[current.stopId] ?? []) {
      const candidateMinutes = current.minutes + edge.runMinutes
      if (candidateMinutes > maxMinutes) {
        continue
      }

      const previousBest = distances.get(edge.to)
      if (previousBest === undefined || candidateMinutes < previousBest) {
        distances.set(edge.to, candidateMinutes)
        previousStop.set(edge.to, current.stopId)
        previousRoute.set(edge.to, edge.routeId)
        queue.push({ stopId: edge.to, minutes: candidateMinutes })
      }
    }
  }

  return Array.from(distances.entries())
    .map(([stopId, minutes]) => {
      const pathStopIds: string[] = []
      const routeIds: string[] = []
      let cursor: string | null = stopId

      while (cursor) {
        pathStopIds.push(cursor)
        const routeId = previousRoute.get(cursor) ?? null
        if (routeId && routeIds[routeIds.length - 1] !== routeId) {
          routeIds.push(routeId)
        }
        cursor = previousStop.get(cursor) ?? null
      }

      pathStopIds.reverse()
      routeIds.reverse()

      return {
        stopId,
        minutes: Math.round(minutes * 10) / 10,
        pathStopIds,
        routeIds,
      }
    })
    .sort((left, right) => left.minutes - right.minutes)
}

export function deriveReachableBusNetwork(
  originStopId: string,
  routes: BusRoute[],
  stops: BusStop[],
  maxMinutes: number,
): ReachableBusNetwork {
  const graph = buildBusGraph(routes, stops)
  const reachableStops = shortestBusPathsFrom(originStopId, graph, maxMinutes)
  const reachableStopIds = new Set(reachableStops.map((stop) => stop.stopId))

  const routeIds = routes
    .filter((route) => route.stopIds.some((stopId) => reachableStopIds.has(stopId)))
    .map((route) => route.routeId)

  return {
    stopIds: Array.from(reachableStopIds),
    routeIds,
    stops: reachableStops,
  }
}