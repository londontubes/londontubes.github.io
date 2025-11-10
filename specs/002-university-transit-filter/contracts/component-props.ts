/**
 * Component Props Contract
 * 
 * TypeScript interfaces for React component props in the university transit filter feature.
 * 
 * Feature: 002-university-transit-filter
 * Related: data-model.md, research.md
 */

import type { 
  UniversitiesDataset, 
  University, 
  Campus 
} from './university-data';
import type { 
  ProximityFilter, 
  RadiusControlState, 
  CampusSelectorState 
} from './proximity-state';
import type { TransitLine, Station } from './transit-data';

/**
 * Props for NavigationTabs component
 * 
 * Horizontal tab navigation between "Line Filter" and "University Filter" pages.
 */
export interface NavigationTabsProps {
  /** Currently active tab ("lines" | "universities") */
  activeTab: "lines" | "universities";
  /** Optional CSS class for custom styling */
  className?: string;
}

/**
 * Props for UniversityExperience component (main page)
 * 
 * Orchestrates the entire university filter experience.
 */
export interface UniversityExperienceProps {
  /** University dataset loaded from universities.json */
  universities: UniversitiesDataset;
  /** Transit lines loaded from lines.json */
  lines: TransitLine[];
  /** Tube/DLR stations loaded from stations.json */
  stations: Station[];
  /** Google Maps API key for map rendering */
  googleMapsApiKey: string;
}

/**
 * Props for RadiusSlider component
 * 
 * HTML5 range input for adjusting proximity radius.
 */
export interface RadiusSliderProps {
  /** Current slider value in miles */
  value: number;
  /** Callback when user changes slider (debounced) */
  onChange: (newValue: number) => void;
  /** Minimum value (default: 0.25 miles) */
  min?: number;
  /** Maximum value (default: 1.0 miles) */
  max?: number;
  /** Step increment (default: 0.05 miles) */
  step?: number;
  /** Whether a university is currently selected */
  disabled?: boolean;
  /** Optional CSS class for custom styling */
  className?: string;
  /** Optional ARIA label override */
  ariaLabel?: string;
}

/**
 * Props for CampusSelector component
 * 
 * Modal dialog for selecting a specific campus from multi-campus universities.
 */
export interface CampusSelectorProps {
  /** University display name (for modal title) */
  universityName: string;
  /** Array of campus options to choose from */
  campuses: Campus[];
  /** Currently selected campus ID */
  selectedCampusId: string | null;
  /** Callback when user confirms selection */
  onSelect: (campusId: string) => void;
  /** Callback when user cancels modal */
  onCancel: () => void;
  /** Whether modal is visible */
  isOpen: boolean;
}

/**
 * Props for UniversityMarker component
 * 
 * Custom marker renderer for university locations on the map.
 */
export interface UniversityMarkerProps {
  /** University data for marker */
  university: University;
  /** Whether this marker is currently selected */
  isSelected: boolean;
  /** Callback when user clicks marker */
  onClick: (universityId: string) => void;
  /** Google Maps instance for marker rendering */
  map: google.maps.Map;
  /** Optional icon override (for testing) */
  icon?: google.maps.Icon;
}

/**
 * Props for extended MapCanvas component
 * 
 * Extends existing MapCanvas with university mode support.
 */
export interface MapCanvasPropsExtended {
  /** Transit lines to display */
  lines: TransitLine[];
  /** Tube/DLR stations to display */
  stations: Station[];
  /** Universities to display (optional, for university mode) */
  universities?: UniversitiesDataset;
  /** Currently active line codes (for line filter mode) */
  activeLineCodes?: string[];
  /** Currently active proximity filter (for university mode) */
  proximityFilter?: ProximityFilter | null;
  /** Operating mode ("lines" | "universities") */
  mode: "lines" | "universities";
  /** Google Maps API key */
  googleMapsApiKey: string;
  /** Map center override */
  center?: { lat: number; lng: number };
  /** Map zoom override */
  zoom?: number;
  /** Optional CSS class */
  className?: string;
}

/**
 * Event handlers for university interactions
 */
export interface UniversityEventHandlers {
  /** Fired when user clicks a university marker */
  onUniversitySelect: (universityId: string) => void;
  /** Fired when user confirms campus selection (multi-campus) */
  onCampusSelect: (campusId: string) => void;
  /** Fired when user adjusts radius slider */
  onRadiusChange: (newRadius: number) => void;
  /** Fired when user clears filter */
  onFilterClear: () => void;
}

/**
 * Props for ProximityCalculator utility component
 * 
 * Headless component that performs proximity calculations and updates filter state.
 */
export interface ProximityCalculatorProps {
  /** Selected campus coordinates [longitude, latitude] */
  campusCoordinates: [number, number];
  /** User-selected radius in miles */
  radiusMiles: number;
  /** All available stations */
  stations: Station[];
  /** All available lines */
  lines: TransitLine[];
  /** Callback with calculated nearby stations and filtered lines */
  onCalculated: (nearbyStationIds: string[], filteredLineCodes: string[]) => void;
}
