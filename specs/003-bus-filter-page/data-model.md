# Data Model: Bus Filter Page

**Feature**: `003-bus-filter-page`  
**Date**: 2026-04-11  
**Related**: [spec.md](spec.md), [research.md](research.md)

## Overview

This document defines the build-time and runtime data structures needed for a London bus filtering experience. All persisted data remains static JSON generated at build time and loaded by the existing static data pipeline.

## Entities

### BusDataset

Top-level static dataset metadata for the bus experience.

**Source**: Generated static JSON files in `public/data/`  
**Format**: Split dataset using `buses.json` and `bus-stops.json`

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `version` | string | Yes | Dataset schema version | Semantic version string |
| `generatedAt` | string | Yes | ISO 8601 generation timestamp | Must be valid ISO timestamp |
| `network` | string | Yes | Dataset coverage label | Must equal `london-bus` |
| `routeCount` | number | Yes | Number of routes in dataset | Must be > 0 |
| `stopCount` | number | Yes | Number of stops in dataset | Must be > 0 |

**Relationships**:

- Contains many `BusRoute`
- Contains many `BusStop`

---

### BusRoute

Represents a single London bus route that can be filtered and rendered on the map.

**Source**: `public/data/buses.json`

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `routeId` | string | Yes | Internal stable route identifier | Non-empty, unique |
| `routeCode` | string | Yes | Public route label, such as `25` or `N18` | Non-empty, unique within active dataset |
| `displayName` | string | Yes | Human-readable route name | Min 1 char, max 80 chars |
| `originName` | string | Yes | Start of named route corridor | Non-empty |
| `destinationName` | string | Yes | End of named route corridor | Non-empty |
| `color` | string | Yes | Route stroke color for map/filter UI | Valid hex color |
| `stopIds` | string[] | Yes | Ordered stops served by the route | At least 2 valid stop references |
| `geometry` | GeoJSON LineString or MultiLineString | Yes | Route path to render | Valid coordinate array within London bounds |
| `boundingBox` | [number, number, number, number] | Yes | Precomputed extent for viewport operations | Must enclose geometry |

**Relationships**:

- References many `BusStop` through `stopIds`
- Participates in `BusFilterState.selectedRouteIds`

---

### BusStop

Represents a bus stop that may be shown when the map is sufficiently zoomed in.

**Source**: `public/data/bus-stops.json`

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `stopId` | string | Yes | Unique stop identifier | Non-empty, unique |
| `displayName` | string | Yes | Stop name shown to users | Min 1 char, max 120 chars |
| `indicator` | string | No | Stop letter or local indicator | Max 20 chars |
| `coordinates` | [number, number] | Yes | `[longitude, latitude]` pair | Within Greater London bounds |
| `servedRouteIds` | string[] | Yes | Routes serving this stop | Must reference valid `BusRoute.routeId` values |
| `importance` | `major` \| `standard` | Yes | Rendering hint for dense views | Must be one of allowed values |

**Relationships**:

- Referenced by many `BusRoute`

---

### BusFilterState

Runtime state object for the bus page filter and map detail level.

**Source**: React state within the bus experience page  
**Lifecycle**: Created when bus page mounts, reset when page unmounts or visitor clears filters

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `selectedRouteIds` | string[] | Yes | Currently active routes | Must only contain valid route IDs |
| `selectedStopId` | string \| null | Yes | Currently highlighted stop | Null or valid stop ID |
| `highlightedRouteId` | string \| null | Yes | Route currently emphasized | Null or valid route ID |
| `showStops` | boolean | Yes | Whether stop markers are currently enabled | Derived from zoom/selection rules |
| `zoomBucket` | `overview` \| `route` \| `stop` | Yes | Simplified rendering mode | Must match current map zoom thresholds |

**State Transitions**:

1. **Default** → **Route Filtered**: visitor toggles one or more routes.
2. **Route Filtered** → **Route Highlighted**: visitor interacts with a visible route.
3. **Route Highlighted** → **Stop Detail**: visitor zooms in enough and selects a stop.
4. **Any Active State** → **Default**: visitor clears filters.

---

### BusViewportState

Derived runtime state that controls density-aware rendering.

**Source**: Derived from map zoom, bounds, and current route selection

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `zoomLevel` | number | Yes | Current map zoom level | Must match map instance value |
| `visibleRouteIds` | string[] | Yes | Routes intersecting the current rendering selection | Must contain valid route IDs |
| `visibleStopIds` | string[] | Yes | Stops eligible for current zoom bucket | Must contain valid stop IDs |
| `stopRenderCap` | number | Yes | Maximum stops allowed in active view | Positive integer |

## Validation Rules Summary

- Every `BusRoute.stopIds` entry must reference an existing `BusStop.stopId`.
- Every `BusStop.servedRouteIds` entry must reference an existing `BusRoute.routeId`.
- Route geometry and stop coordinates must stay within London bounds used elsewhere in the project.
- Build validation must reject orphaned stops, orphaned routes, empty geometry, duplicate IDs, and invalid bounding boxes.