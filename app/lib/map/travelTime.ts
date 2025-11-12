import type { Station } from '@/app/types/transit'

/**
 * Offline approximate travel time heuristics replacing Google Distance Matrix.
 * Model: straight-line distance + average speed + fixed overhead.
 */
export interface TravelTimeResult {
  stationId: string
  durationMinutes: number
  distance: number // meters
  status: 'OK'
}

export interface TravelTimeOptions {
  mode?: 'TRANSIT' | 'WALKING' | 'BICYCLING'
  maxDurationMinutes?: number
  batchSize?: number // retained for parity; unused
}

const DEFAULT_OPTIONS: Required<TravelTimeOptions> = {
  mode: 'TRANSIT',
  maxDurationMinutes: 30,
  batchSize: 25,
}

const SPEEDS_MPH: Record<'TRANSIT' | 'WALKING' | 'BICYCLING', number> = {
  TRANSIT: 18,
  WALKING: 3,
  BICYCLING: 10,
}

const OVERHEAD_MINUTES: Record<'TRANSIT' | 'WALKING' | 'BICYCLING', number> = {
  TRANSIT: 4,
  WALKING: 0,
  BICYCLING: 2,
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function calculateTravelTimes(
  origin: [number, number], // [lat, lng]
  stations: Station[],
  options: TravelTimeOptions = {}
): Promise<TravelTimeResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const speedMph = SPEEDS_MPH[opts.mode]
  const overhead = OVERHEAD_MINUTES[opts.mode]
  const [originLat, originLng] = origin

  const results: TravelTimeResult[] = stations.map((station) => {
    const [lng, lat] = station.position.coordinates // [lng, lat]
    const distanceMeters = haversineMeters(originLat, originLng, lat, lng)
    const distanceMiles = distanceMeters / 1609.34
    const travelMinutes = (distanceMiles / speedMph) * 60 + overhead

    return {
      stationId: station.stationId,
      durationMinutes: Math.round(travelMinutes * 10) / 10,
      distance: Math.round(distanceMeters),
      status: 'OK',
    }
  })

  return results.filter(r => r.durationMinutes <= opts.maxDurationMinutes)
}

export function deriveReachableLines(
  travelTimes: TravelTimeResult[],
  stations: Station[]
): string[] {
  const reachableStationIds = new Set(travelTimes.map((t) => t.stationId))
  const lineSet = new Set<string>()

  stations.forEach((station) => {
    if (reachableStationIds.has(station.stationId)) {
      station.lineCodes.forEach((lineCode) => lineSet.add(lineCode))
    }
  })

  return Array.from(lineSet)
}

export function getReachableStationCoordinates(
  travelTimes: TravelTimeResult[],
  stations: Station[]
): Array<[number, number]> {
  const reachableIds = new Set(travelTimes.map((t) => t.stationId))
  return stations
    .filter((s) => reachableIds.has(s.stationId))
    .map((s) => s.position.coordinates as [number, number])
}

