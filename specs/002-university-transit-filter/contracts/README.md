# Contracts Directory

**Feature**: `002-university-transit-filter`  
**Purpose**: TypeScript interface definitions for university transit filter feature

## Overview

This directory contains TypeScript interface definitions (contracts) that define the shape of data structures, component props, and function signatures for the university transit filter feature. These contracts serve as the source of truth for data validation and type safety.

## Files

### `university-data.ts`
**Purpose**: Interfaces for static university data loaded from `universities.json`

**Key Exports**:
- `UniversitiesDataset`: GeoJSON FeatureCollection wrapper
- `UniversityFeature`: Individual university as GeoJSON Feature
- `University`: University entity with campus information
- `Campus`: Campus location within a university
- `NearestStation`: Pre-calculated nearest station metadata
- `UNIVERSITY_CONSTRAINTS`: Validation rules

**Usage**:
```typescript
import type { UniversitiesDataset, University, Campus } from '@/contracts/university-data';

const universities: UniversitiesDataset = await fetch('/data/universities.json').then(r => r.json());
```

---

### `proximity-state.ts`
**Purpose**: Interfaces for runtime state related to proximity filtering and UI controls

**Key Exports**:
- `ProximityFilter`: Active filter state (selected university, radius, nearby stations)
- `UniversityMarkerState`: UI state for marker rendering
- `RadiusControlState`: Slider component state
- `CampusSelectorState`: Campus selection modal state
- `CampusOption`: Campus option for radio buttons
- `PROXIMITY_CONSTRAINTS`: Radius limits, debounce delay, cache TTL
- `ProximityFilterEvent`: State transition event enum

**Usage**:
```typescript
import type { ProximityFilter, RadiusControlState } from '@/contracts/proximity-state';

const [filter, setFilter] = useState<ProximityFilter | null>(null);
const [radiusState, setRadiusState] = useState<RadiusControlState>({
  currentValue: 0.5,
  isAdjusting: false,
  debouncedValue: 0.5
});
```

---

### `component-props.ts`
**Purpose**: React component prop interfaces

**Key Exports**:
- `NavigationTabsProps`: Tab navigation component props
- `UniversityExperienceProps`: Main page component props
- `RadiusSliderProps`: Slider component props
- `CampusSelectorProps`: Modal component props
- `UniversityMarkerProps`: Marker renderer props
- `MapCanvasPropsExtended`: Extended MapCanvas props with university mode
- `UniversityEventHandlers`: Event handler callbacks
- `ProximityCalculatorProps`: Proximity calculation utility props

**Usage**:
```typescript
import type { RadiusSliderProps } from '@/contracts/component-props';

export function RadiusSlider({
  value,
  onChange,
  min = 0.25,
  max = 1.0,
  step = 0.05,
  disabled = false,
  className,
  ariaLabel = "Proximity radius in miles"
}: RadiusSliderProps) {
  // Component implementation
}
```

---

### `transit-data.ts`
**Purpose**: Interfaces for existing transit data structures (lines.json, stations.json)

**Key Exports**:
- `TransitLine`: Transit line entity
- `Station`: Station entity
- `LineFilterState`: Existing line filter state (Feature 001)

**Usage**:
```typescript
import type { TransitLine, Station } from '@/contracts/transit-data';

const lines: TransitLine[] = await fetch('/data/lines.json').then(r => r.json());
const stations: Station[] = await fetch('/data/stations.json').then(r => r.json());
```

**Note**: These interfaces should match existing definitions in the codebase. This file is provided for reference and completeness.

---

### `proximity-functions.ts`
**Purpose**: Function signatures for Haversine distance calculation and proximity filtering

**Key Exports**:
- `calculateDistance`: Haversine distance between two points
- `findNearbyStations`: Find stations within radius
- `deriveLineCodes`: Derive line codes from station IDs
- `findNearestStation`: Find single nearest station
- `calculateProximityFilter`: Combined proximity + line filtering
- `isValidCoordinates`: Type guard for coordinate validation
- `HAVERSINE_CONSTANTS`: Earth radius and conversion factors

**Usage**:
```typescript
import { calculateDistance, findNearbyStations } from '@/lib/map/proximity';

const distance = calculateDistance(
  [-0.1339, 51.5246], // UCL
  [-0.1357, 51.5254]  // Euston Square
);

const nearby = findNearbyStations(
  [-0.1749, 51.4988], // Imperial South Kensington
  0.5,                 // 0.5 mile radius
  stations
);
```

---

## Usage Patterns

### Data Validation

Use constraints from `university-data.ts` to validate loaded data:

```typescript
import { UNIVERSITY_CONSTRAINTS } from '@/contracts/university-data';

function validateUniversityId(id: string): boolean {
  return (
    id.length <= UNIVERSITY_CONSTRAINTS.universityId.maxLength &&
    UNIVERSITY_CONSTRAINTS.universityId.pattern.test(id)
  );
}
```

### Type Guards

Use type guards for runtime type checking:

```typescript
import { isValidCoordinates } from '@/contracts/proximity-functions';

function safeCalculateDistance(coord1: unknown, coord2: unknown) {
  if (!isValidCoordinates(coord1) || !isValidCoordinates(coord2)) {
    throw new Error("Invalid coordinates");
  }
  return calculateDistance(coord1, coord2);
}
```

### Component Props

Import prop interfaces for type-safe components:

```typescript
import type { CampusSelectorProps } from '@/contracts/component-props';

export function CampusSelector({
  universityName,
  campuses,
  selectedCampusId,
  onSelect,
  onCancel,
  isOpen
}: CampusSelectorProps) {
  // Component implementation
}
```

### State Management

Use state interfaces with React hooks:

```typescript
import { useState } from 'react';
import type { ProximityFilter } from '@/contracts/proximity-state';

export function useProximityFilter() {
  const [filter, setFilter] = useState<ProximityFilter | null>(null);
  
  const selectUniversity = (universityId: string, campusId: string, radius: number) => {
    // Calculate proximity and update filter
  };
  
  return { filter, selectUniversity };
}
```

---

## Implementation Notes

### File Organization

These contract files define **interfaces only** (type-level code). The actual **implementations** live in:

- **Data loading**: `lib/data/university-loader.ts`
- **Proximity calculations**: `lib/map/proximity.ts`
- **Components**: `app/components/RadiusSlider/`, `app/components/CampusSelector/`, etc.
- **Hooks**: `app/hooks/useProximityFilter.ts`, `app/hooks/useRadiusControl.ts`

### Consistency Checks

When implementing, ensure:

1. **Data structure matches schema**: Validate loaded `universities.json` against `UniversitiesDataset` interface
2. **Component props match contracts**: TypeScript will enforce this at compile time
3. **Function signatures match**: Implement proximity functions according to `proximity-functions.ts`
4. **Constraints are enforced**: Use validation rules from `UNIVERSITY_CONSTRAINTS` and `PROXIMITY_CONSTRAINTS`

### Testing

Contract interfaces can be used to generate mock data for tests:

```typescript
import type { University, Campus } from '@/contracts/university-data';

const mockUniversity: University = {
  universityId: "TEST-UNIV",
  displayName: "Test University",
  isMultiCampus: false,
  primaryCampusId: "TEST-CAMPUS",
  campuses: [{
    campusId: "TEST-CAMPUS",
    name: "Main Campus",
    coordinates: [-0.1, 51.5],
    nearestStation: {
      stationId: "TEST-STATION",
      name: "Test Station",
      distance: 0.2
    }
  }]
};
```

---

## Related Documents

- **Data Model**: `data-model.md` - Detailed entity definitions with relationships
- **Research**: `research.md` - Technical decisions and rationale
- **Specification**: `spec.md` - Functional requirements and user stories
- **Quickstart**: `quickstart.md` - Developer setup and usage guide

---

## Version History

- **1.0.0** (2025-11-09): Initial contract definitions for Feature 002
