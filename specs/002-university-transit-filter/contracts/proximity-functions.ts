/**
 * Proximity Calculation Function Signatures
 * 
 * TypeScript interfaces for Haversine distance calculation and proximity filtering.
 * 
 * Feature: 002-university-transit-filter
 * Related: research.md (Proximity Algorithm section)
 */

/**
 * Coordinate tuple [longitude, latitude]
 */
export type Coordinates = [number, number];

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
): number;

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
): string[];

/**
 * Derive line codes from station IDs
 * 
 * @param stationIds - Array of station IDs
 * @param allStations - All available stations
 * @returns Array of unique line codes serving those stations
 * 
 * @example
 * const lineCodes = deriveLineCodes(
 *   ["940GZZLUSKS", "940GZZLUGTR"],
 *   stations
 * );
 * // Returns: ["circle", "district", "piccadilly"]
 */
export function deriveLineCodes(
  stationIds: string[],
  allStations: Station[]
): string[];

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
 * // Returns: { stationId: "940GZZLUEUS", name: "Euston Square", distance: 0.08 }
 */
export function findNearestStation(
  centerCoords: Coordinates,
  allStations: Station[]
): {
  stationId: string;
  name: string;
  distance: number;
};

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
  nearbyStationIds: string[];
  filteredLineCodes: string[];
};

/**
 * Haversine formula constants
 */
export const HAVERSINE_CONSTANTS = {
  /** Earth's radius in miles */
  EARTH_RADIUS_MILES: 3958.8,
  /** Conversion factor: degrees to radians */
  DEG_TO_RAD: Math.PI / 180,
} as const;

/**
 * Type guard: Check if coordinates are valid
 * 
 * @param coords - Coordinates to validate
 * @returns True if valid [longitude, latitude] within London bounds
 */
export function isValidCoordinates(coords: unknown): coords is Coordinates;

/**
 * Import types from other contracts
 */
import type { Station } from './transit-data';
import type { TransitLine } from './transit-data';
