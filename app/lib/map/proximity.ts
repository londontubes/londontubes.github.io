/**
 * Proximity Calculation Utilities
 * 
 * Implements Haversine formula for calculating straight-line distances between
 * geographic coordinates and filtering transit stations within a given radius.
 * 
 * Feature: 002-university-transit-filter
 * Performance Target: < 2ms for 450 stations
 */

import type { Station, TransitLine } from '@/app/types/transit'
import { calculateTravelTimes, deriveReachableLines, type TravelTimeResult } from './travelTime'

// Earth's radius in miles
const EARTH_RADIUS_MILES = 3958.8

// Conversion factor: degrees to radians
const DEG_TO_RAD = Math.PI / 180

/**
 * Coordinate tuple [longitude, latitude]
 */
export type Coordinates = [number, number]

/**
 * Calculate straight-line distance between two points using Haversine formula
 * 
 * @param coord1 - First point [longitude, latitude]
 * @param coord2 - Second point [longitude, latitude]
 * @returns Distance in miles
 * 
 * @example
 * const distance = calculateDistance(
 *   [-0.1339, 51.5246], // UCL
 *   [-0.1357, 51.5254]  // Euston Square station
 * );
 * // Returns: ~0.08 miles
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const [lon1, lat1] = coord1
  const [lon2, lat2] = coord2

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = lat1 * DEG_TO_RAD
  const lat2Rad = lat2 * DEG_TO_RAD
  const deltaLat = (lat2 - lat1) * DEG_TO_RAD
  const deltaLon = (lon2 - lon1) * DEG_TO_RAD

  // Haversine formula
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // Calculate distance in miles
  const distance = EARTH_RADIUS_MILES * c

  return distance

}

// Walking model constants (exported for UI components)
export const WALK_SPEED_MPH = 3 // average walking speed
export const WALK_ROUTE_FACTOR = 1.3 // factor to inflate straight-line distance to approximate street routing
export const WALK_OVERHEAD_MINUTES = 2 // fixed overhead (traffic lights, orientation)


/**
 * Find all stations within a given radius of a point
 *
 * @param centerCoords - Origin point [longitude, latitude]
 * @param radiusMiles - Search radius in miles
 * @param allStations - Array of all available stations
 * @returns Array of station IDs within radius
 */
export function findNearbyStations(
  centerCoords: Coordinates,
  radiusMiles: number,
  allStations: Station[]
): string[] {
  const nearbyStationIds: string[] = []

  for (const station of allStations) {
    const stationCoords: Coordinates = station.position.coordinates
    const distance = calculateDistance(centerCoords, stationCoords)

    // Use inclusive distance measurement (≤ radius)
    if (distance <= radiusMiles) {
      nearbyStationIds.push(station.stationId)
    }
  }

  return nearbyStationIds
}
/**
 * Derive line codes from station IDs
 * @param stationIds - Array of station IDs
 * @param allStations - All available stations
 * @returns Array of unique line codes serving those stations
 */
export function deriveLineCodes(
  stationIds: string[],
  allStations: Station[]
): string[] {
  // Create a Set to store unique line codes
  const lineCodeSet = new Set<string>()

  // For each station ID, find the station and add its line codes
  for (const stationId of stationIds) {
    const station = allStations.find(s => s.stationId === stationId)
    if (station) {
      for (const lineCode of station.lineCodes) {
        lineCodeSet.add(lineCode)
      }
    }
  }

  // Convert Set to array and sort alphabetically
  return Array.from(lineCodeSet).sort()
}

/**
 * Find nearest station to a given point
 * 
 * @param centerCoords - Origin point [longitude, latitude]
 * @param allStations - Array of all available stations
 * @returns Object with station ID, name, and distance
 * 
 * @example
 * const nearest = findNearestStation(
 *   [-0.1339, 51.5246], // UCL
 *   stations
 * );
 * // Returns: { stationId: "940GZZLUEUS", name: "Euston Square", distance: 0.2 }
 */
export function findNearestStation(
  centerCoords: Coordinates,
  allStations: Station[]
): {
  stationId: string
  name: string
  distance: number
} {
  let nearestStation = allStations[0]
  let minDistance = calculateDistance(
    centerCoords,
    nearestStation.position.coordinates
  )

  for (let i = 1; i < allStations.length; i++) {
    const station = allStations[i]
    const distance = calculateDistance(
      centerCoords,
      station.position.coordinates
    )

    if (distance < minDistance) {
      minDistance = distance
      nearestStation = station
    }
  }

  return {
    stationId: nearestStation.stationId,
    name: nearestStation.displayName,
    distance: Math.round(minDistance * 10) / 10, // Round to 1 decimal place
  }
}

/**
 * Calculate proximity filter from campus coordinates
 * 
 * Combines findNearbyStations + deriveLineCodes into single operation.
 * 
 * @param campusCoords - Campus location [longitude, latitude]
 * @param radiusMiles - Search radius in miles
 * @param allStations - All available stations
 * @returns Object with nearby station IDs and filtered line codes
 * 
 * @example
 * const filter = calculateProximityFilter(
 *   [-0.1749, 51.4988],
 *   0.5,
 *   stations
 * );
 * // Returns: {
 * //   nearbyStationIds: ["940GZZLUSKS", "940GZZLUGTR"],
 * //   filteredLineCodes: ["circle", "district", "piccadilly"]
 * // }
 */
export function calculateProximityFilter(
  campusCoords: Coordinates,
  radiusMiles: number,
  allStations: Station[]
): {
  nearbyStationIds: string[]
  filteredLineCodes: string[]
} {
  const nearbyStationIds = findNearbyStations(
    campusCoords,
    radiusMiles,
    allStations
  )

  const filteredLineCodes = deriveLineCodes(
    nearbyStationIds,
    allStations
  )

  return {
    nearbyStationIds,
    filteredLineCodes,
  }
}

/**
 * Calculate walking-time based filter (approximate street shortest route).
 *
 * Instead of simple radius inclusion (straight-line distance), this converts
 * each campus->station distance to an estimated walking time using:
 *   routeDistanceMiles = straightLineMiles * WALK_ROUTE_FACTOR
 *   walkingMinutes = (routeDistanceMiles / WALK_SPEED_MPH) * 60 + WALK_OVERHEAD_MINUTES
 * Stations whose walkingMinutes <= maxWalkMinutes are included.
 *
 * This is an offline heuristic approximation; for production-grade accuracy,
 * replace with real pedestrian network routing (e.g. OSM graph + Dijkstra/A*).
 */
export function calculateWalkingTimeFilter(
  campusCoords: Coordinates,
  maxWalkMinutes: number,
  allStations: Station[]
): {
  reachableStationIds: string[]
  filteredLineCodes: string[]
  walkingTimes: Array<{ stationId: string; minutes: number }>
} {
  const reachableStationIds: string[] = []
  const walkingTimes: Array<{ stationId: string; minutes: number }> = []

  for (const station of allStations) {
    const distanceMiles = calculateDistance(campusCoords, station.position.coordinates)
    const routeMiles = distanceMiles * WALK_ROUTE_FACTOR
    const minutes = (routeMiles / WALK_SPEED_MPH) * 60 + WALK_OVERHEAD_MINUTES
    if (minutes <= maxWalkMinutes) {
      reachableStationIds.push(station.stationId)
    }
    walkingTimes.push({ stationId: station.stationId, minutes: Math.round(minutes * 10) / 10 })
  }

  const filteredLineCodes = deriveLineCodes(reachableStationIds, allStations)

  return {
    reachableStationIds,
    filteredLineCodes,
    walkingTimes,
  }
}

/**
 * Type guard: Check if coordinates are valid
 * 
 * @param coords - Coordinates to validate
 * @returns True if valid [longitude, latitude] within London bounds
 */
export function isValidCoordinates(coords: unknown): coords is Coordinates {
  if (!Array.isArray(coords) || coords.length !== 2) {
    return false
  }

  const [lng, lat] = coords

  if (typeof lng !== 'number' || typeof lat !== 'number') {
    return false
  }

  // Check if within Greater London bounds
  // Latitude: 51.2 to 51.7
  // Longitude: -0.6 to 0.3
  const isLatValid = lat >= 51.2 && lat <= 51.7
  const isLngValid = lng >= -0.6 && lng <= 0.3

  return isLatValid && isLngValid
}

/**
 * Calculate time-based proximity filter (offline heuristic).
 *
 * Uses straight-line distance + average mode speeds + fixed overhead
 * (see travelTime.ts) to approximate reachability within a maximum duration.
 * No external API calls. Suitable for coarse UI filtering only.
 */
export async function calculateTimeBasedFilter(
  campusCoords: Coordinates,
  travelTimeMinutes: number,
  allStations: Station[],
  allLines: TransitLine[],
  mode: 'TRANSIT' | 'WALKING' | 'BICYCLING' = 'TRANSIT'
): Promise<{
  reachableStationIds: string[]
  filteredLineCodes: string[]
  travelTimes: TravelTimeResult[]
}> {
  // Convert [lng, lat] to [lat, lng] for Distance Matrix API
  const origin: [number, number] = [campusCoords[1], campusCoords[0]]

  // Calculate travel times to all stations
  const travelTimes = await calculateTravelTimes(origin, allStations, {
    mode,
    maxDurationMinutes: travelTimeMinutes,
    batchSize: 25,
  })

  // Extract reachable station IDs
  const reachableStationIds = travelTimes.map((t) => t.stationId)

  // Derive line codes from reachable stations
  const filteredLineCodes = deriveReachableLines(travelTimes, allStations)

  return {
    reachableStationIds,
    filteredLineCodes,
    travelTimes,
  }
}
