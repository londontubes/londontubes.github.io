# Data Model: London Tube Map Line Filter

## Overview

The static site consumes Transport for London GeoJSON exports to render Tube and DLR assets. Data is versioned in the repository to keep builds deterministic and refreshed weekly. Transform scripts normalize field names, enforce accessibility metadata, and generate derived indices for fast client lookups.

## Entities

### TransitLine

- **Identifiers**: `lineCode` (string, enum of TfL line IDs), `displayName` (string)
- **Visual attributes**: `brandColor` (hex string), `textColor` (hex string auto-generated for contrast), `strokeWeight` (integer, pixels)
- **Geometry**: `polyline` (GeoJSON LineString array in EPSG:4326), `bounds` (calculated bounding box for quick viewport fits)
- **Operational metadata**: `mode` (string: `tube` | `dlr`), `serviceStatus` (string), `lastUpdated` (ISO timestamp)
- **Relationships**: ordered array of `stationIds` linking to Station entity; optional `interchanges` property listing station pairs shared with other lines
- **Validation rules**:
  - `lineCode` MUST match known TfL identifiers.
  - `brandColor` MUST pass contrast ratio ≥ 4.5:1 against `#ffffff` or `#000000`; choose text color dynamically if necessary.
  - `polyline` MUST contain at least two coordinate pairs and stay within Greater London lat/long bounds.

### Station

- **Identifiers**: `stationId` (string, TfL StopPoint ID), `displayName` (string)
- **Location**: `position` (GeoJSON Point with latitude, longitude), `borough` (string optional)
- **Services**: array of `lineCodes` served, `isInterchange` (boolean), `accessibilityNotes` (string, optional)
- **Presentation**: `markerIcon` (enum referencing accessible SVG names), `tooltipSummary` (string ≤ 140 chars), `order` (integer relative to line sequence)
- **Validation rules**:
  - `position.coordinates` MUST be present and valid floats.
  - `lineCodes` MUST reference existing TransitLine `lineCode` values.
  - `tooltipSummary` MUST mirror display name pronunciation if special characters present.

### LineSelectionState

- **Fields**: `activeLineCodes` (array of strings), `isAllSelected` (boolean), `legendItems` (array of objects with `lineCode`, `label`, `color`), `lastChangedAt` (ISO timestamp for analytics)
- **Derivations**: computed on load using default state (`isAllSelected = true`, `activeLineCodes = all`)
- **Validation rules**:
  - When `activeLineCodes` is empty, `isAllSelected` MUST be set to true to trigger the full-network view.
  - `legendItems` MUST keep display order stable across sessions to support keyboard navigation.

## Relationships

- Station has a many-to-many relationship with TransitLine via `lineCodes` and `stationIds` arrays.
- LineSelectionState references TransitLine entries only for current filters and has no persistent storage.

## Data Refresh Workflow

1. Scheduled script fetches TfL RouteSequence endpoints for each line, then combines them into canonical `lines.raw.json` and `stations.raw.json` files stored under `scripts/cache/`.
2. Transformation step deduplicates stations, enriches accessibility notes, and outputs versioned GeoJSON into `public/data/lines.json` and `public/data/stations.json`.
3. Build step includes a manifest (`public/data/metadata.json`) containing `generatedAt`, data source URLs, and dataset version tags.
4. Plan includes regression guard: Playwright smoke test loads filtered view using generated data to ensure no schema regressions before deployment.

## Implementation Notes

### File Format Decision (2025-11-08)
- **Change**: Switched from `.geojson` to `.json` file extensions for `lines` and `stations` data files.
- **Reason**: Next.js webpack lacks a built-in loader for `.geojson` files, causing module parse failures during development. Standard `.json` files are natively supported and avoid the need for custom webpack configuration.
- **Impact**: All references updated in `load-static-data.ts`, `transform.ts`, and `validate.ts`. GeoJSON structure preserved; only file extension changed.
