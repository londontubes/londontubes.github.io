/**
 * University Data Contract
 * 
 * TypeScript interfaces for universities.json schema and related data structures.
 * These contracts define the shape of data loaded from static JSON files.
 * 
 * Feature: 002-university-transit-filter
 * Related: data-model.md, research.md
 */

/**
 * Top-level GeoJSON FeatureCollection containing all London universities
 */
export interface UniversitiesDataset {
  type: "FeatureCollection";
  /** Semantic version of the schema (e.g., "1.0.0") */
  version: string;
  /** ISO 8601 timestamp of data generation */
  generatedAt: string;
  /** Array of university features */
  features: UniversityFeature[];
}

/**
 * Individual university as a GeoJSON Feature
 */
export interface UniversityFeature {
  type: "Feature";
  /** Marker position (primary campus location) */
  geometry: {
    type: "Point";
    /** [longitude, latitude] */
    coordinates: [number, number];
  };
  /** University metadata and campus details */
  properties: University;
}

/**
 * University entity with campus information
 */
export interface University {
  /** Unique identifier (e.g., "UCL", "IMPERIAL") */
  universityId: string;
  /** Official institution name */
  displayName: string;
  /** True if institution has multiple campuses */
  isMultiCampus: boolean;
  /** ID of main campus for marker placement */
  primaryCampusId: string;
  /** Array of campus locations (1 to 10) */
  campuses: Campus[];
}

/**
 * Campus location within a university
 */
export interface Campus {
  /** Unique ID within university (e.g., "UCL-MAIN") */
  campusId: string;
  /** Descriptive campus name with location hint */
  name: string;
  /** [longitude, latitude] */
  coordinates: [number, number];
  /** Pre-calculated nearest tube/DLR station */
  nearestStation: NearestStation;
}

/**
 * Pre-calculated nearest station metadata
 */
export interface NearestStation {
  /** TfL station ID (e.g., "940GZZLUEUS") */
  stationId: string;
  /** Station display name */
  name: string;
  /** Straight-line distance in miles (rounded to 1 decimal) */
  distance: number;
}

/**
 * Validation constraints for university data
 */
export const UNIVERSITY_CONSTRAINTS = {
  universityId: {
    maxLength: 20,
    pattern: /^[A-Z0-9-]+$/,
  },
  displayName: {
    minLength: 3,
    maxLength: 100,
  },
  campusId: {
    maxLength: 30,
    pattern: /^[A-Z0-9-]+$/,
  },
  campusName: {
    minLength: 3,
    maxLength: 80,
  },
  campuses: {
    minCount: 1,
    maxCount: 10,
  },
  coordinates: {
    lat: { min: 51.2, max: 51.7 }, // Greater London bounds
    lng: { min: -0.6, max: 0.3 },
  },
  nearestStationDistance: {
    min: 0,
    max: 5, // miles (sanity check)
  },
} as const;
