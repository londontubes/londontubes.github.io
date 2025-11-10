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

/**
 * Find all stations within a given radius of a point
 * 
 * @param centerCoords - Origin point [longitude, latitude]
 * @param radiusMiles - Search radius in miles
 * @param allStations - Array of all available stations
 * @returns Array of station IDs within radius
 * 
 * @performance Target: <2ms for 450 stations
 * 
 * @example
 * const nearbyStations = findNearbyStations(
 *   [-0.1749, 51.4988], // Imperial College South Kensington
 *   0.5, // 0.5 mile radius
 *   stations
 * );
 * // Returns: ["940GZZLUSKS", "940GZZLUGTR", ...]
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
 * 
 * @param stationIds - Array of station IDs
 * @param allStations - All available stations
 * @param allLines - All available lines
 * @returns Array of unique line codes serving those stations
 * 
 * @example
 * const lineCodes = deriveLineCodes(
 *   ["940GZZLUSKS", "940GZZLUGTR"],
 *   stations,
 *   lines
 * );
 * // Returns: ["circle", "district", "piccadilly"]
 */
export function deriveLineCodes(
  stationIds: string[],
  allStations: Station[],
  allLines: TransitLine[]
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
 * @param allLines - All available lines
 * @returns Object with nearby station IDs and filtered line codes
 * 
 * @example
 * const filter = calculateProximityFilter(
 *   [-0.1749, 51.4988],
 *   0.5,
 *   stations,
 *   lines
 * );
 * // Returns: {
 * //   nearbyStationIds: ["940GZZLUSKS", "940GZZLUGTR"],
 * //   filteredLineCodes: ["circle", "district", "piccadilly"]
 * // }
 */
export function calculateProximityFilter(
  campusCoords: Coordinates,
  radiusMiles: number,
  allStations: Station[],
  allLines: TransitLine[]
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
    allStations,
    allLines
  )

  return {
    nearbyStationIds,
    filteredLineCodes,
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
