/**
 * Proximity Filter State Contract
 * 
 * TypeScript interfaces for runtime state related to university selection,
 * proximity-based filtering, and UI controls.
 * 
 * Feature: 002-university-transit-filter
 * Related: data-model.md
 */

/**
 * Runtime state for proximity-based line filtering
 * 
 * Created when user selects a university; destroyed on deselection.
 */
export interface ProximityFilter {
  /** Currently selected university ID */
  selectedUniversityId: string;
  /** Specific campus (required if university.isMultiCampus) */
  selectedCampusId?: string;
  /** User-selected distance threshold in miles */
  radiusMiles: number;
  /** Station IDs within radius (cached) */
  nearbyStationIds: string[];
  /** Line codes serving nearby stations (derived) */
  filteredLineCodes: string[];
  /** Timestamp of last calculation (ms since epoch) */
  calculatedAt: number;
}

/**
 * UI state for university marker rendering
 */
export interface UniversityMarkerState {
  /** Reference to University entity */
  universityId: string;
  /** Marker position [longitude, latitude] */
  coordinates: [number, number];
  /** Label for tooltip */
  displayName: string;
  /** Station name for tooltip */
  nearestStationName: string;
  /** Whether marker is currently selected */
  isSelected: boolean;
  /** Whether to show campus selector on click */
  isMultiCampus: boolean;
  /** Custom SVG icon configuration (placeholder, Google removed) */
  icon: unknown;
}

/**
 * UI state for radius slider component
 */
export interface RadiusControlState {
  /** Current radius in miles */
  currentValue: number;
  /** Whether user is currently dragging slider */
  isAdjusting: boolean;
  /** Last applied value (after debounce) */
  debouncedValue: number;
}

/**
 * UI state for campus selection modal
 */
export interface CampusSelectorState {
  /** University being selected for */
  universityId: string;
  /** Available campuses to choose from */
  campusOptions: CampusOption[];
  /** Currently selected option (radio button) */
  selectedCampusId: string | null;
  /** Whether modal is displayed */
  isOpen: boolean;
}

/**
 * Campus option for radio button list
 */
export interface CampusOption {
  /** Campus ID for form value */
  campusId: string;
  /** Campus name for label */
  name: string;
  /** Station name for context (e.g., "Nearest: Euston Square") */
  nearestStation: string;
}

/**
 * Constraints for proximity filter values
 */
export const PROXIMITY_CONSTRAINTS = {
  radius: {
    min: 0.25, // miles
    max: 1.0,  // miles
    step: 0.05,
    default: 0.5,
  },
  debounce: {
    delay: 200, // milliseconds
  },
  cache: {
    ttl: 10000, // milliseconds (10 seconds)
  },
} as const;

/**
 * State transition events for ProximityFilter
 */
export enum ProximityFilterEvent {
  UNIVERSITY_SELECTED = "UNIVERSITY_SELECTED",
  CAMPUS_SELECTED = "CAMPUS_SELECTED",
  RADIUS_CHANGED = "RADIUS_CHANGED",
  FILTER_CLEARED = "FILTER_CLEARED",
}
