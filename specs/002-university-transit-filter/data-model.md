# Data Model: University Transit Filter

**Feature**: `002-university-transit-filter`  
**Date**: 2025-11-09  
**Related**: [spec.md](spec.md), [research.md](research.md)

## Overview

This document defines the data structures for university locations, campus information, and proximity filtering state. All data is stored as static JSON files bundled at build time, extending the existing transit data model.

## Entities

### University

Represents a higher education institution in London with one or more campus locations.

**Source**: Static JSON file (`public/data/universities.json`)  
**Format**: GeoJSON FeatureCollection

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `universityId` | string | Yes | Unique identifier (e.g., "UCL", "IMPERIAL") | Uppercase alphanumeric + hyphens; max 20 chars |
| `displayName` | string | Yes | Official institution name | Min 3 chars; max 100 chars |
| `isMultiCampus` | boolean | Yes | True if institution has multiple campuses | Must match campuses.length > 1 |
| `primaryCampusId` | string | Yes | ID of main campus for marker placement | Must exist in campuses array |
| `campuses` | Campus[] | Yes | Array of campus locations | Min 1 campus; max 10 campuses |
| `geometry` | GeoJSON Point | Yes | Marker coordinates (from primary campus) | Valid lat/lng for Greater London |

**Relationships**:
- Has many: Campus (1 to 10)
- Referenced by: ProximityFilter (many-to-one)

**State Transitions**: N/A (read-only static data)

**Example**:
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-0.1339, 51.5246]
  },
  "properties": {
    "universityId": "UCL",
    "displayName": "University College London",
    "isMultiCampus": false,
    "primaryCampusId": "UCL-MAIN",
    "campuses": [
      {
        "campusId": "UCL-MAIN",
        "name": "Main Campus (Bloomsbury)",
        "coordinates": [-0.1339, 51.5246],
        "nearestStation": {
          "stationId": "940GZZLUEUS",
          "name": "Euston Square",
          "distance": 0.2
        }
      }
    ]
  }
}
```

---

### Campus

Represents a specific physical campus location for a university.

**Source**: Embedded in University entity within `universities.json`  
**Scope**: Sub-entity, not stored independently

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `campusId` | string | Yes | Unique ID within university (e.g., "UCL-MAIN") | Format: {universityId}-{SHORT_NAME}; max 30 chars |
| `name` | string | Yes | Descriptive campus name | Min 3 chars; max 80 chars; include location hint |
| `coordinates` | [number, number] | Yes | [longitude, latitude] tuple | Valid WGS84 coords; within Greater London |
| `nearestStation` | NearestStation | Yes | Pre-calculated nearest tube/DLR station | Must reference valid station from stations.json |

**Relationships**:
- Belongs to: University (many-to-one)
- References: Station (via nearestStation.stationId)

**Validation Rules**:
- `campusId` must be unique within parent university's campuses array
- `coordinates` must be valid lat/lng pair (lat: 51.2-51.7, lng: -0.6-0.3 for London)
- `nearestStation.stationId` must exist in `stations.json`
- `nearestStation.distance` must be > 0 and < 5 miles (sanity check)

**Example**:
```json
{
  "campusId": "IMPERIAL-SK",
  "name": "South Kensington Campus",
  "coordinates": [-0.1749, 51.4988],
  "nearestStation": {
    "stationId": "940GZZLUSKS",
    "name": "South Kensington",
    "distance": 0.1
  }
}
```

---

### NearestStation

Embedded metadata about the closest tube/DLR station to a campus.

**Source**: Pre-calculated during data generation; embedded in Campus entity  
**Purpose**: Display in tooltips; avoid runtime calculation

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `stationId` | string | Yes | TfL station ID (e.g., "940GZZLUEUS") | Must exist in stations.json |
| `name` | string | Yes | Station display name | Must match stations.json entry |
| `distance` | number | Yes | Straight-line distance in miles | > 0; < 5; rounded to 1 decimal |

**Validation Rules**:
- `stationId` must reference valid entry in `stations.json`
- `name` must match `displayName` of referenced station
- `distance` calculated via Haversine formula; pre-computed for performance

---

### ProximityFilter

Runtime state object representing the current university selection and proximity-based line filtering.

**Source**: React component state in `UniversityExperience`  
**Lifecycle**: Created on university click; destroyed on deselection

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `selectedUniversityId` | string | Yes | University currently selected | Must be valid universityId from universities.json |
| `selectedCampusId` | string | Conditional | Specific campus (if multi-campus) | Required if university.isMultiCampus; must exist in campuses |
| `radiusMiles` | number | Yes | User-selected distance threshold | Min 0.25; max 1; step 0.05 |
| `nearbyStationIds` | string[] | Yes | Stations within radius (cached) | Array of station IDs; calculated via Haversine |
| `filteredLineCodes` | string[] | Yes | Lines serving nearby stations | Derived from nearbyStationIds; sorted alphabetically |
| `calculatedAt` | number | Yes | Timestamp of last calculation (ms) | Used for memoization cache key |

**Relationships**:
- References: University (via selectedUniversityId)
- References: Campus (via selectedCampusId)
- References: Station[] (via nearbyStationIds)
- Derives: TransitLine[] (via filteredLineCodes)

**State Transitions**:
1. **Idle** → **University Selected**: User clicks university marker
2. **University Selected** → **Campus Selected**: User selects campus from modal (multi-campus only)
3. **Campus Selected** → **Filtering Active**: Proximity calculation completes
4. **Filtering Active** → **Radius Changed**: User adjusts slider
5. **Filtering Active** → **Idle**: User deselects university (clicks marker again or clear button)
6. **Filtering Active** → **University Selected**: User clicks different university

**Validation Rules**:
- `radiusMiles` must be between 0.25 and 1 (inclusive)
- `nearbyStationIds` must only contain IDs from `stations.json`
- `filteredLineCodes` must only contain codes from `lines.json`
- `calculatedAt` used to invalidate cache after 10 seconds (in case data changes)

**Example**:
```typescript
{
  selectedUniversityId: "IMPERIAL",
  selectedCampusId: "IMPERIAL-SK",
  radiusMiles: 0.5,
  nearbyStationIds: ["940GZZLUSKS", "940GZZLUGTR", "940GZZLUKSX"],
  filteredLineCodes: ["circle", "district", "piccadilly"],
  calculatedAt: 1699545600000
}
```

---

### UniversityMarkerState

UI state for rendering university markers on the map.

**Source**: Derived from University entity + selection state  
**Purpose**: Map overlay rendering

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `universityId` | string | Yes | Reference to University | Must exist in universities.json |
| `coordinates` | [number, number] | Yes | Marker position [lng, lat] | From university.geometry.coordinates |
| `displayName` | string | Yes | Label for tooltip | From university.displayName |
| `nearestStationName` | string | Yes | Station name for tooltip | From primaryCampus.nearestStation.name |
| `isSelected` | boolean | Yes | Whether marker is currently selected | True if matches ProximityFilter.selectedUniversityId |
| `isMultiCampus` | boolean | Yes | Whether to show campus selector on click | From university.isMultiCampus |
| `icon` | MarkerIcon | Yes | SVG icon configuration | Custom graduation cap icon |

**Derived Fields**:
- `tooltipText`: Computed as `"{displayName}\nNearest station: {nearestStationName}"`
- `markerSize`: Computed as `isSelected ? 40 : 32` (pixels)

---

### RadiusControlState

UI state for the distance radius slider component.

**Source**: React component state in `RadiusSlider`  
**Lifecycle**: Persistent across university selections

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `currentValue` | number | Yes | Current radius in miles | Min 0.25; max 1; step 0.05 |
| `isAdjusting` | boolean | Yes | Whether user is currently dragging slider | True during drag; false on mouseup/touchend |
| `debouncedValue` | number | Yes | Last applied value (after debounce) | Updated 200ms after drag stops |

**State Transitions**:
1. **Idle** → **Adjusting**: User starts dragging slider
2. **Adjusting** → **Debouncing**: User releases slider
3. **Debouncing** → **Idle**: 200ms passes, value applied, proximity recalculated

---

### CampusSelectorState

UI state for the campus selection modal.

**Source**: React component state in `CampusSelector`  
**Lifecycle**: Created on multi-campus marker click; destroyed on selection/cancel

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `universityId` | string | Yes | University being selected for | Must have isMultiCampus: true |
| `campusOptions` | CampusOption[] | Yes | Available campuses to choose from | Min 2 options; from university.campuses |
| `selectedCampusId` | string | No | Currently selected option (radio) | Null until user picks; then must be valid campusId |
| `isOpen` | boolean | Yes | Whether modal is displayed | True when shown; false when dismissed |

**CampusOption Structure**:
```typescript
{
  campusId: string;
  name: string;
  nearestStation: string; // For display in option label
}
```

**Validation Rules**:
- `campusOptions` must have at least 2 entries (single-campus shouldn't show modal)
- `selectedCampusId` must be one of the campusOptions[].campusId values
- Modal must be dismissible via ESC key or Cancel button

---

## Data Flow

### University Selection Flow

```
User clicks university marker
  → MapCanvas detects click event
  → Check university.isMultiCampus
    → If false:
        → Create ProximityFilter with primaryCampusId
        → Calculate nearby stations (Haversine)
        → Derive filtered line codes
        → Update MapCanvas to highlight lines
    → If true:
        → Open CampusSelector modal
        → User selects campus from radio list
        → On "Apply":
            → Create ProximityFilter with selected campusId
            → Calculate nearby stations
            → Derive filtered line codes
            → Update MapCanvas to highlight lines
```

### Radius Adjustment Flow

```
User drags radius slider
  → RadiusControlState.currentValue updates continuously
  → RadiusControlState.isAdjusting = true
User releases slider
  → RadiusControlState.isAdjusting = false
  → Start 200ms debounce timer
After 200ms:
  → RadiusControlState.debouncedValue = currentValue
  → If ProximityFilter exists:
      → Recalculate nearbyStationIds with new radius
      → Update filteredLineCodes
      → Re-render MapCanvas
  → If no university selected:
      → Store radius for next selection (no action)
```

### Data Loading Flow

```
Page navigation to /universities
  → Next.js loads universities/page.tsx
  → UniversityExperience component mounts
  → Load static data:
      → lines.json (already loaded, from cache)
      → stations.json (already loaded, from cache)
      → universities.json (new, fetch from public/)
  → Parse universities.json as GeoJSON
  → Validate schema (check required fields)
  → Pass to MapCanvas as `universities` prop
  → MapCanvas renders university markers
```

---

## Validation Rules Summary

### Data Integrity
- All university IDs must be unique across universities.json
- All campus IDs must be unique within their parent university
- Campus coordinates must be within Greater London bounds (51.2-51.7 lat, -0.6-0.3 lng)
- Nearest station IDs must reference valid entries in stations.json
- Nearest station distances must be > 0 and < 5 miles

### UI Constraints
- Radius slider: 0.25 ≤ value ≤ 1, step 0.05
- Campus selector: Only shown for universities with isMultiCampus: true
- Proximity filter: Only one university selected at a time
- Line filter: Auto-selected lines can be manually overridden by user

### Performance Constraints
- Proximity calculation: Must complete in < 5ms for 450 stations
- Debounce delay: 200ms for radius slider to balance responsiveness and calculation cost
- Memoization: Cache calculation results for 10 seconds per university+radius combination

---

## Data Versioning

### universities.json Schema Version

**Current Version**: 1.0.0

**Semantic Versioning Rules**:
- **Major (X.0.0)**: Breaking changes to schema (rename fields, change types)
- **Minor (1.X.0)**: Add new universities, campuses, or optional fields
- **Patch (1.0.X)**: Fix typos, update coordinates, correct nearest stations

**Version History**:
- `1.0.0` (2025-11-09): Initial schema with University, Campus, NearestStation

**Future Compatibility**:
- Add `"version": "1.0.0"` field to root of universities.json
- Client code checks version; warns if major version mismatch
- Minor/patch version differences handled gracefully (ignore unknown fields)

---

## Example Data File Structure

### universities.json (abbreviated)

```json
{
  "type": "FeatureCollection",
  "version": "1.0.0",
  "generatedAt": "2025-11-09T12:00:00.000Z",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-0.1339, 51.5246]
      },
      "properties": {
        "universityId": "UCL",
        "displayName": "University College London",
        "isMultiCampus": false,
        "primaryCampusId": "UCL-MAIN",
        "campuses": [
          {
            "campusId": "UCL-MAIN",
            "name": "Main Campus (Bloomsbury)",
            "coordinates": [-0.1339, 51.5246],
            "nearestStation": {
              "stationId": "940GZZLUEUS",
              "name": "Euston Square",
              "distance": 0.2
            }
          }
        ]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-0.1749, 51.4988]
      },
      "properties": {
        "universityId": "IMPERIAL",
        "displayName": "Imperial College London",
        "isMultiCampus": true,
        "primaryCampusId": "IMPERIAL-SK",
        "campuses": [
          {
            "campusId": "IMPERIAL-SK",
            "name": "South Kensington Campus",
            "coordinates": [-0.1749, 51.4988],
            "nearestStation": {
              "stationId": "940GZZLUSKS",
              "name": "South Kensington",
              "distance": 0.1
            }
          },
          {
            "campusId": "IMPERIAL-WC",
            "name": "White City Campus",
            "coordinates": [-0.2239, 51.5173],
            "nearestStation": {
              "stationId": "940GZZLUWCY",
              "name": "White City",
              "distance": 0.15
            }
          }
        ]
      }
    }
  ]
}
```

---

## TypeScript Interfaces

```typescript
// University entity from universities.json
export interface University {
  universityId: string;
  displayName: string;
  isMultiCampus: boolean;
  primaryCampusId: string;
  campuses: Campus[];
}

export interface Campus {
  campusId: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  nearestStation: NearestStation;
}

export interface NearestStation {
  stationId: string;
  name: string;
  distance: number; // miles
}

// Runtime state interfaces
export interface ProximityFilter {
  selectedUniversityId: string;
  selectedCampusId?: string;
  radiusMiles: number;
  nearbyStationIds: string[];
  filteredLineCodes: string[];
  calculatedAt: number;
}

export interface UniversityMarkerState {
  universityId: string;
  coordinates: [number, number];
  displayName: string;
  nearestStationName: string;
  isSelected: boolean;
  isMultiCampus: boolean;
  icon: google.maps.Icon;
}

export interface RadiusControlState {
  currentValue: number;
  isAdjusting: boolean;
  debouncedValue: number;
}

export interface CampusSelectorState {
  universityId: string;
  campusOptions: CampusOption[];
  selectedCampusId: string | null;
  isOpen: boolean;
}

export interface CampusOption {
  campusId: string;
  name: string;
  nearestStation: string;
}

// GeoJSON wrapper
export interface UniversitiesDataset {
  type: "FeatureCollection";
  version: string;
  generatedAt: string;
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties: University;
  }>;
}
```

---

## Summary

This data model extends the existing transit data structure with university-specific entities while maintaining consistency with GeoJSON standards and static-first delivery principles. All data is pre-computed and cached where possible (nearest stations, primary campus coordinates) to minimize runtime calculations and meet performance targets.

Key design decisions:
- **GeoJSON format**: Consistent with existing lines/stations data
- **Embedded campuses**: Avoids combinatorial explosion of separate entities
- **Pre-calculated metadata**: Nearest station distances computed at build time
- **Runtime state separation**: Transient filtering state kept in React components, not mixed with static data
- **Validation at multiple layers**: Schema validation on load, business rule validation in components
