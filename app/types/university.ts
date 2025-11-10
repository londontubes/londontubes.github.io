/**
 * University Data Types
 * 
 * TypeScript interfaces for university data loaded from universities.json
 * 
 * Feature: 002-university-transit-filter
 */

export interface University {
  universityId: string
  displayName: string
  isMultiCampus: boolean
  primaryCampusId: string
  campuses: Campus[]
}

export interface Campus {
  campusId: string
  name: string
  coordinates: [number, number]
  nearestStation: NearestStation
}

export interface NearestStation {
  stationId: string
  name: string
  distance: number
}

export interface UniversityFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: University
}

export interface UniversitiesDataset {
  type: 'FeatureCollection'
  version: string
  generatedAt: string
  features: UniversityFeature[]
}
