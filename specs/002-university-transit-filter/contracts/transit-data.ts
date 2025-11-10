/**
 * Transit Data Contract (Reference)
 * 
 * TypeScript interfaces for existing transit data structures (lines.json, stations.json).
 * These are already defined in the codebase but reproduced here for completeness.
 * 
 * Feature: 002-university-transit-filter
 * Note: These interfaces should match the existing definitions in the app.
 */

/**
 * Transit line entity
 * 
 * Source: public/data/lines.json
 */
export interface TransitLine {
  /** Line ID (e.g., "central", "northern") */
  id: string;
  /** Display name (e.g., "Central", "Northern") */
  name: string;
  /** Line color code (e.g., "#DC241F") */
  color: string;
  /** Line mode (e.g., "tube", "dlr", "overground") */
  mode: string;
  /** Array of station IDs served by this line */
  stations: string[];
  /** GeoJSON coordinates for polyline rendering */
  coordinates: [number, number][];
}

/**
 * Station entity
 * 
 * Source: public/data/stations.json
 */
export interface Station {
  /** TfL station ID (e.g., "940GZZLUEUS") */
  id: string;
  /** Display name (e.g., "Euston Square") */
  name: string;
  /** Station coordinates [longitude, latitude] */
  coordinates: [number, number];
  /** Array of line IDs serving this station */
  lines: string[];
  /** True if station is an interchange (serves 2+ lines) */
  isInterchange: boolean;
  /** Zone information (e.g., "1", "2-3") */
  zone?: string;
}

/**
 * Line filter state (existing feature)
 * 
 * Used in Feature 001 for line-based filtering.
 */
export interface LineFilterState {
  /** Array of currently active line codes */
  activeLineCodes: string[];
  /** Whether filter is in "all lines" mode */
  showAllLines: boolean;
}
