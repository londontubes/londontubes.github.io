# Data Model: Rightmove Flat Search

**Feature**: `004-rightmove-flat-search`  
**Date**: 2026-04-11  
**Related**: `spec.md`, `research.md`

## Overview

This feature adds a second property-search CTA to the existing station card. The data model is intentionally static: the app uses a checked-in mapping from TfL station IDs to Rightmove station IDs and a small fixed search-config object to build Rightmove URLs on demand.

## Entities

### RightmoveStationMapping

Represents one reviewed mapping from a TfL station to a Rightmove station result.

**Source**: Checked-in mapping artifact derived from `docs/rightmove-station-template.ts` and developer-reviewed Rightmove lookups.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|------|------|----------|-------------|------------------|
| `stationId` | string | Yes | TfL station identifier used throughout the app | Must reference an existing station in `public/data/stations.json` |
| `searchLocation` | string | Yes | Human-readable search name used for lookup and audit | Non-empty |
| `locationIdentifier` | string | No | Numeric Rightmove station identifier without the `STATION^` prefix | Digits only when present |
| `displayName` | string | No | Canonical Rightmove result label returned by typeahead | Non-empty when `locationIdentifier` is present |
| `displayLocationIdentifier` | string | No | Existing slug-like helper field for legacy/manual review | Non-empty when present |
| `matchStatus` | `matched` \| `unmatched` \| `ambiguous` | Yes | Review outcome for this station | Must be one of the allowed values |
| `lastVerifiedAt` | string | No | ISO review timestamp | Must be valid ISO timestamp when present |

**Relationships**:

- References one existing TfL `Station` by `stationId`.
- Enables one `RightmoveSearchUrl` to be built for that station when `matchStatus = matched`.

---

### RightmoveSearchConfig

Represents the fixed filter set used to shape a Rightmove rental search around a mapped station.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|------|------|----------|-------------|------------------|
| `propertyTypes` | string | Yes | Rightmove property-type filter | Initial value must be `flat` |
| `minBedrooms` | number | Yes | Minimum bedroom count | Must be >= 0 |
| `maxBedrooms` | number | Yes | Maximum bedroom count | Must be >= `minBedrooms` |
| `maxPrice` | number | Yes | Max monthly price | Positive integer |
| `radius` | number | Yes | Search radius in miles | Positive decimal |
| `includeLetAgreed` | boolean | Yes | Whether let-agreed listings are included | Default false |

**Relationships**:

- Combines with one `RightmoveStationMapping` to produce one outbound URL.

---

### StationPropertyCtaState

Represents which external search CTAs are available in the station card for the current station.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|------|------|----------|-------------|------------------|
| `stationId` | string | Yes | Current station card station | Must reference an existing station |
| `zooplaUrl` | string \| null | Yes | Existing Zoopla outbound URL | Must be a valid HTTPS URL or null |
| `rightmoveUrl` | string \| null | Yes | Computed Rightmove outbound URL | Must be a valid HTTPS URL or null |
| `showZoopla` | boolean | Yes | Whether Zoopla CTA is shown | Derived from existing logic |
| `showRightmove` | boolean | Yes | Whether Rightmove CTA is shown | True only when mapping is valid |

**State Transitions**:

1. **No station selected** → no CTA state rendered.
2. **Station selected with matched mapping** → Zoopla and Rightmove CTAs may both render.
3. **Station selected without matched mapping** → Zoopla may render; Rightmove remains hidden.

## Validation Rules Summary

- Every `RightmoveStationMapping.stationId` must exist in the static station dataset.
- `locationIdentifier` must be digits only at rest; the `STATION^` prefix is added by the URL builder.
- A mapping marked `matched` must include both `locationIdentifier` and `displayName`.
- A mapping marked `unmatched` or `ambiguous` must not silently generate a Rightmove CTA.