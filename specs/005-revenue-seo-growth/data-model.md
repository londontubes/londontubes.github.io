# Data Model: Revenue SEO Growth

**Feature**: `005-revenue-seo-growth`  
**Date**: 2026-04-12  
**Related**: `spec.md`, `research.md`

## Overview

This feature introduces a static revenue-growth layer composed of landing-page definitions, monetization surface definitions, and standardized analytics events. The model is intentionally repository-driven so SEO and revenue changes remain reviewable and compatible with the site constitution.

## Entities

### RevenueLandingPage

Represents a static page or content section designed to capture high-intent organic traffic and route visitors into monetized journeys.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|------|------|----------|-------------|------------------|
| `slug` | string | Yes | URL-safe identifier for the landing experience | Unique within revenue pages |
| `pageType` | `home` \| `blog` \| `university` \| `landing` | Yes | Surface that hosts the content | Must be one of the supported types |
| `intentSegment` | `housing` \| `student-accommodation` \| `commute` \| `travel-upgrade` | Yes | Primary revenue intent targeted by the page | Must be one of the supported segments |
| `title` | string | Yes | SEO title or landing title | Non-empty; unique enough to avoid duplicates |
| `metaDescription` | string | Yes | Search-facing description | Non-empty; concise and unique |
| `canonicalPath` | string | Yes | Canonical relative URL | Must begin and end with `/` where route style requires |
| `primaryKeywords` | string[] | Yes | Main keyword cluster | At least one value |
| `relatedUniversityIds` | string[] | No | University context for the page | Values must map to known universities when present |
| `relatedStationIds` | string[] | No | Station context for the page | Values must map to known stations when present |
| `monetizationSurfaceIds` | string[] | Yes | IDs of monetized surfaces shown on the page | Every ID must map to a defined `MonetizationSurface` |
| `publishState` | `draft` \| `published` \| `noindex` | Yes | Publication control | `noindex` pages must not enter sitemap |

**Relationships**:

- References zero or more universities and stations.
- References one or more `MonetizationSurface` records.
- Emits `RevenueMeasurementEvent` records when monetized actions occur.

---

### MonetizationSurface

Represents a monetized placement such as an ad slot or affiliate CTA block.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|------|------|----------|-------------|------------------|
| `surfaceId` | string | Yes | Unique placement identifier | Unique across the site |
| `surfaceType` | `ad` \| `affiliate-cta` | Yes | Monetization type | Must be one of the supported types |
| `partner` | `adsense` \| `zoopla` \| `rightmove` \| `amber` \| `gyg` | Yes | Revenue partner behind the surface | Must be one of the configured partners |
| `placement` | string | Yes | Human-readable placement name | Non-empty |
| `pageTypes` | string[] | Yes | Surfaces where this placement can appear | Must contain only supported page types |
| `intentSegments` | string[] | Yes | Intent segments that justify this surface | Must contain only supported segments |
| `visibilityRule` | string | Yes | Rule used to hide or show the surface | Must be deterministic and documented |
| `trackingLabel` | string | Yes | Analytics label | Non-empty |
| `utmCampaign` | string | No | Attribution tag for outbound links | Required for affiliate CTAs where partner URL supports it |
| `adSlot` | string | No | AdSense slot ID for ad surfaces | Required when `surfaceType = ad` |

**Relationships**:

- Can be attached to multiple `RevenueLandingPage` records.
- Emits `RevenueMeasurementEvent` records.

---

### RevenueMeasurementEvent

Represents a standardized analytics event for a monetized interaction or ad view.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|------|------|----------|-------------|------------------|
| `eventName` | string | Yes | Analytics event identifier | Must follow site naming conventions |
| `pagePath` | string | Yes | Path where the event originated | Must be a valid route path |
| `intentSegment` | string | Yes | Revenue intent active at the time of the event | Must map to supported intent segments |
| `surfaceId` | string | Yes | Monetized placement responsible for the event | Must map to a known `MonetizationSurface` |
| `partner` | string | Yes | Revenue partner | Must map to a known partner |
| `placement` | string | Yes | Human-readable placement context | Non-empty |
| `ctaType` | `impression` \| `click` \| `lead` | Yes | Event subtype | Must be one of the supported values |
| `estimatedValue` | number | No | Optional proxy value for optimisation | Non-negative when present |
| `consentState` | `granted` \| `denied` \| `unknown` | Yes | Analytics consent state at event time | Must be one of the supported values |

**Relationships**:

- References one `MonetizationSurface`.
- Inherits context from the host `RevenueLandingPage`.

## Validation Rules Summary

- Revenue pages must stay static and version-controlled; no runtime-generated revenue records are allowed.
- `published` revenue pages must have unique metadata and at least one monetized surface.
- `noindex` pages must be excluded from sitemap output and must not be treated as primary landing pages.
- Affiliate surfaces must degrade safely when configuration is missing.
- Ad surfaces must remain responsive and must not violate the site performance budget.