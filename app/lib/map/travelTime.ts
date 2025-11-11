/**
 * Travel Time Calculation using Google Distance Matrix API
 * 
 * Computes travel times from a university campus to stations via transit/walking.
 * Used for time-based proximity filtering (e.g., "Show all areas within 15 mins").
 */

import type { Station } from '@/app/types/transit'
import { loadGoogleMaps } from './google-loader'

export interface TravelTimeResult {
  stationId: string
  durationMinutes: number
  distance: number // meters
  status: 'OK' | 'ZERO_RESULTS' | 'NOT_FOUND'
}

export interface TravelTimeOptions {
  mode?: 'TRANSIT' | 'WALKING' | 'BICYCLING'
  maxDurationMinutes?: number
  /** Batch size for Distance Matrix API (max 25 origins × 25 destinations per request) */
  batchSize?: number
}

const DEFAULT_OPTIONS: Required<TravelTimeOptions> = {
  mode: 'TRANSIT',
  maxDurationMinutes: 30,
  batchSize: 25,
}

/**
 * Calculate travel times from origin to multiple stations using Distance Matrix API.
 * Returns only stations reachable within maxDurationMinutes.
 * 
 * @param origin - [lat, lng] of university campus
 * @param stations - Array of station objects with coordinates
 * @param options - Travel mode, max duration, batch size
 */
export async function calculateTravelTimes(
  origin: [number, number],
  stations: Station[],
  options: TravelTimeOptions = {}
): Promise<TravelTimeResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const results: TravelTimeResult[] = []

  // Load Google Maps with necessary libraries
  const google = await loadGoogleMaps({ libraries: ['places', 'geometry'] })
  const service = new google.maps.DistanceMatrixService()

  // Prepare origin
  const originLatLng = new google.maps.LatLng(origin[0], origin[1])

  // Split stations into batches (Distance Matrix API limit: 25 destinations per request)
  const batches: Station[][] = []
  for (let i = 0; i < stations.length; i += opts.batchSize) {
    batches.push(stations.slice(i, i + opts.batchSize))
  }

  // Process each batch
  for (const batch of batches) {
    try {
      const destinations = batch.map(
        (station) => new google.maps.LatLng(station.position.coordinates[1], station.position.coordinates[0])
      )

      const response = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        service.getDistanceMatrix(
          {
            origins: [originLatLng],
            destinations,
            travelMode: google.maps.TravelMode[opts.mode],
            transitOptions: opts.mode === 'TRANSIT' ? {
              modes: [
                google.maps.TransitMode.SUBWAY,
                google.maps.TransitMode.TRAIN,
                google.maps.TransitMode.BUS,
              ],
              routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS,
            } : undefined,
            unitSystem: google.maps.UnitSystem.METRIC,
          },
          (result, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK && result) {
              resolve(result)
            } else {
              reject(new Error(`Distance Matrix API error: ${status}`))
            }
          }
        )
      })

      // Parse results
      if (response.rows?.[0]?.elements) {
        response.rows[0].elements.forEach((element, index) => {
          const station = batch[index]
          if (element.status === 'OK' && element.duration) {
            const durationMinutes = element.duration.value / 60
            
            // Only include if within time threshold
            if (durationMinutes <= opts.maxDurationMinutes) {
              results.push({
                stationId: station.stationId,
                durationMinutes: Math.round(durationMinutes * 10) / 10, // 1 decimal place
                distance: element.distance?.value || 0,
                status: 'OK',
              })
            }
          } else {
            // Record failure (useful for debugging)
            results.push({
              stationId: station.stationId,
              durationMinutes: Infinity,
              distance: 0,
              status: element.status === 'ZERO_RESULTS' ? 'ZERO_RESULTS' : 'NOT_FOUND',
            })
          }
        })
      }

      // Rate limiting: wait 100ms between batches to avoid quota issues
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error('Distance Matrix batch error:', error)
      // Continue with next batch even if one fails
    }
  }

  return results.filter((r) => r.status === 'OK')
}

/**
 * Given travel time results, derive which tube lines are reachable.
 * Similar to deriveLineCodes in proximity.ts but uses time-based station set.
 */
export function deriveReachableLines(
  travelTimes: TravelTimeResult[],
  stations: Station[]
): string[] {
  const reachableStationIds = new Set(travelTimes.map((t) => t.stationId))
  const lineSet = new Set<string>()

  stations.forEach((station) => {
    if (reachableStationIds.has(station.stationId)) {
      station.lineCodes.forEach((lineCode: string) => lineSet.add(lineCode))
    }
  })

  return Array.from(lineSet)
}

/**
 * Compute a bounding polygon or circle representing the reachable area.
 * For visualization: returns array of station coordinates that are reachable.
 */
export function getReachableStationCoordinates(
  travelTimes: TravelTimeResult[],
  stations: Station[]
): Array<[number, number]> {
  const reachableIds = new Set(travelTimes.map((t) => t.stationId))
  return stations
    .filter((s) => reachableIds.has(s.stationId))
    .map((s) => s.position.coordinates as [number, number])
}

