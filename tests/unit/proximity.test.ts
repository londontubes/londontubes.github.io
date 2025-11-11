/**
 * Unit tests for proximity calculation functions
 * 
 * Tests Haversine distance calculations and station filtering logic.
 * 
 * Feature: 002-university-transit-filter
 */

import {
  calculateDistance,
  findNearbyStations,
  deriveLineCodes,
  findNearestStation,
  calculateProximityFilter,
  isValidCoordinates,
  type Coordinates,
} from '@/app/lib/map/proximity'
import type { Station } from '@/app/types/transit'

describe('proximity calculations', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between UCL and Euston Square', () => {
      const ucl: Coordinates = [-0.1339, 51.5246]
      const eustonSquare: Coordinates = [-0.1357, 51.5254]
      const distance = calculateDistance(ucl, eustonSquare)
      
      // Distance should be approximately 0.08 miles (within 0.01 tolerance)
      expect(distance).toBeGreaterThan(0.07)
      expect(distance).toBeLessThan(0.09)
    })

    it('should return 0 for identical coordinates', () => {
      const coord: Coordinates = [-0.1339, 51.5246]
      const distance = calculateDistance(coord, coord)
      
      expect(distance).toBe(0)
    })

    it('should handle coordinates at opposite ends of London', () => {
      const west: Coordinates = [-0.5, 51.5] // Western edge
      const east: Coordinates = [0.2, 51.5]  // Eastern edge
      const distance = calculateDistance(west, east)
      
      // Distance should be approximately 30-40 miles (London width)
      expect(distance).toBeGreaterThan(30)
      expect(distance).toBeLessThan(45)
    })

    it('should be commutative (distance A→B = distance B→A)', () => {
      const coord1: Coordinates = [-0.1339, 51.5246]
      const coord2: Coordinates = [-0.1749, 51.4988]
      
      const distance1 = calculateDistance(coord1, coord2)
      const distance2 = calculateDistance(coord2, coord1)
      
      expect(distance1).toBe(distance2)
    })
  })

  describe('findNearbyStations', () => {
    const mockStations: Station[] = [
      {
        stationId: 'STATION_A',
        displayName: 'Station A',
        position: { type: 'Point', coordinates: [-0.1339, 51.5246] },
        lineCodes: ['central'],
        isInterchange: false,
        markerIcon: 'default',
        tooltipSummary: 'Station A',
        order: 1,
      },
      {
        stationId: 'STATION_B',
        displayName: 'Station B',
        position: { type: 'Point', coordinates: [-0.1357, 51.5254] }, // ~0.08 miles from A
        lineCodes: ['northern'],
        isInterchange: false,
        markerIcon: 'default',
        tooltipSummary: 'Station B',
        order: 2,
      },
      {
        stationId: 'STATION_C',
        displayName: 'Station C',
        position: { type: 'Point', coordinates: [-0.5, 51.5] }, // ~20 miles from A
        lineCodes: ['district'],
        isInterchange: false,
        markerIcon: 'default',
        tooltipSummary: 'Station C',
        order: 3,
      },
    ]

    it('should find stations within 0.5 mile radius', () => {
      const center: Coordinates = [-0.1339, 51.5246]
      const nearbyStations = findNearbyStations(center, 0.5, mockStations)
      
      expect(nearbyStations).toContain('STATION_A')
      expect(nearbyStations).toContain('STATION_B')
      expect(nearbyStations).not.toContain('STATION_C')
    })

    it('should use inclusive distance measurement', () => {
      const center: Coordinates = [-0.1339, 51.5246]
      const exactRadius = calculateDistance(center, mockStations[1].position.coordinates)
      
      // Station exactly at radius should be included
      const nearbyStations = findNearbyStations(center, exactRadius, mockStations)
      expect(nearbyStations).toContain('STATION_B')
    })

    it('should return empty array when no stations within radius', () => {
      const center: Coordinates = [-0.1339, 51.5246]
      const nearbyStations = findNearbyStations(center, 0.01, mockStations) // Very small radius
      
      expect(nearbyStations).toHaveLength(0)
    })

    it('should handle 0 mile radius (only exact matches)', () => {
      const center: Coordinates = [-0.1339, 51.5246]
      const nearbyStations = findNearbyStations(center, 0, mockStations)
      
      expect(nearbyStations).toContain('STATION_A') // Exact match
      expect(nearbyStations).toHaveLength(1)
    })

    it('should handle very large radius (all stations)', () => {
      const center: Coordinates = [-0.1339, 51.5246]
      const nearbyStations = findNearbyStations(center, 100, mockStations) // 100 miles
      
      expect(nearbyStations).toHaveLength(mockStations.length)
    })
  })

  describe('deriveLineCodes', () => {
    const mockStations: Station[] = [
      {
        stationId: 'STATION_A',
        displayName: 'Station A',
        position: { type: 'Point', coordinates: [-0.1339, 51.5246] },
        lineCodes: ['central', 'northern'],
        isInterchange: true,
        markerIcon: 'default',
        tooltipSummary: 'Station A',
        order: 1,
      },
      {
        stationId: 'STATION_B',
        displayName: 'Station B',
        position: { type: 'Point', coordinates: [-0.1357, 51.5254] },
        lineCodes: ['northern'],
        isInterchange: false,
        markerIcon: 'default',
        tooltipSummary: 'Station B',
        order: 2,
      },
      {
        stationId: 'STATION_C',
        displayName: 'Station C',
        position: { type: 'Point', coordinates: [-0.5, 51.5] },
        lineCodes: ['piccadilly', 'district'],
        isInterchange: true,
        markerIcon: 'default',
        tooltipSummary: 'Station C',
        order: 3,
      },
    ]

    it('should derive unique line codes from station IDs', () => {
      const stationIds = ['STATION_A', 'STATION_B']
      const lineCodes = deriveLineCodes(stationIds, mockStations)
      
      expect(lineCodes).toContain('central')
      expect(lineCodes).toContain('northern')
      expect(lineCodes).toHaveLength(2)
    })

    it('should return alphabetically sorted line codes', () => {
      const stationIds = ['STATION_C', 'STATION_A']
      const lineCodes = deriveLineCodes(stationIds, mockStations)
      
      const expected = ['central', 'district', 'northern', 'piccadilly'].sort()
      expect(lineCodes).toEqual(expected)
    })

    it('should handle empty station IDs array', () => {
      const lineCodes = deriveLineCodes([], mockStations)
      expect(lineCodes).toHaveLength(0)
    })

    it('should handle invalid station IDs gracefully', () => {
      const stationIds = ['INVALID_ID', 'STATION_A']
      const lineCodes = deriveLineCodes(stationIds, mockStations)
      
      expect(lineCodes).toContain('central')
      expect(lineCodes).toContain('northern')
    })
  })

  describe('findNearestStation', () => {
    const mockStations: Station[] = [
      {
        stationId: 'STATION_FAR',
        displayName: 'Far Station',
        position: { type: 'Point', coordinates: [-0.5, 51.3] },
        lineCodes: ['district'],
        isInterchange: false,
        markerIcon: 'default',
        tooltipSummary: 'Far Station',
        order: 1,
      },
      {
        stationId: 'STATION_NEAR',
        displayName: 'Near Station',
        position: { type: 'Point', coordinates: [-0.1357, 51.5254] },
        lineCodes: ['northern'],
        isInterchange: false,
        markerIcon: 'default',
        tooltipSummary: 'Near Station',
        order: 2,
      },
      {
        stationId: 'STATION_NEAREST',
        displayName: 'Nearest Station',
        position: { type: 'Point', coordinates: [-0.1340, 51.5247] },
        lineCodes: ['central'],
        isInterchange: false,
        markerIcon: 'default',
        tooltipSummary: 'Nearest Station',
        order: 3,
      },
    ]

    it('should find the nearest station', () => {
      const center: Coordinates = [-0.1339, 51.5246]
      const nearest = findNearestStation(center, mockStations)
      
      expect(nearest.stationId).toBe('STATION_NEAREST')
      expect(nearest.name).toBe('Nearest Station')
    })

    it('should round distance to 1 decimal place', () => {
      const center: Coordinates = [-0.1339, 51.5246]
      const nearest = findNearestStation(center, mockStations)
      
      expect(nearest.distance.toString()).toMatch(/^\d+\.\d$/)
    })
  })

  describe('calculateProximityFilter', () => {
    const mockStations: Station[] = [
      {
        stationId: 'STATION_A',
        displayName: 'Station A',
        position: { type: 'Point', coordinates: [-0.1339, 51.5246] },
        lineCodes: ['central', 'northern'],
        isInterchange: true,
        markerIcon: 'default',
        tooltipSummary: 'Station A',
        order: 1,
      },
      {
        stationId: 'STATION_B',
        displayName: 'Station B',
        position: { type: 'Point', coordinates: [-0.1357, 51.5254] },
        lineCodes: ['northern', 'piccadilly'],
        isInterchange: true,
        markerIcon: 'default',
        tooltipSummary: 'Station B',
        order: 2,
      },
    ]

    it('should combine proximity and line derivation', () => {
      const center: Coordinates = [-0.1339, 51.5246]
      const filter = calculateProximityFilter(center, 0.5, mockStations)
      
      expect(filter.nearbyStationIds).toHaveLength(2)
      expect(filter.filteredLineCodes).toContain('central')
      expect(filter.filteredLineCodes).toContain('northern')
    })

    it('should return empty arrays when no stations nearby', () => {
      const center: Coordinates = [-0.1339, 51.5246]
      const filter = calculateProximityFilter(center, 0.001, mockStations)
      
      expect(filter.nearbyStationIds).toHaveLength(0)
      expect(filter.filteredLineCodes).toHaveLength(0)
    })
  })

  describe('isValidCoordinates', () => {
    it('should accept valid London coordinates', () => {
      expect(isValidCoordinates([-0.1339, 51.5246])).toBe(true)
      expect(isValidCoordinates([-0.1749, 51.4988])).toBe(true)
    })

    it('should reject coordinates outside London bounds', () => {
      expect(isValidCoordinates([-1.0, 51.5])).toBe(false) // Too far west
      expect(isValidCoordinates([1.0, 51.5])).toBe(false)  // Too far east
      expect(isValidCoordinates([-0.1, 50.0])).toBe(false) // Too far south
      expect(isValidCoordinates([-0.1, 52.0])).toBe(false) // Too far north
    })

    it('should reject non-array inputs', () => {
      expect(isValidCoordinates(null)).toBe(false)
      expect(isValidCoordinates(undefined)).toBe(false)
      expect(isValidCoordinates('string')).toBe(false)
      expect(isValidCoordinates(123)).toBe(false)
    })

    it('should reject arrays with wrong length', () => {
      expect(isValidCoordinates([-0.1339])).toBe(false)
      expect(isValidCoordinates([-0.1339, 51.5246, 0])).toBe(false)
    })

    it('should reject non-numeric coordinates', () => {
      expect(isValidCoordinates(['string', 51.5246])).toBe(false)
      expect(isValidCoordinates([-0.1339, 'string'])).toBe(false)
    })
  })
})
