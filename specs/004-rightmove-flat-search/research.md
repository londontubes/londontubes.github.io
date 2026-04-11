# Research: Rightmove Flat Search

**Feature**: `004-rightmove-flat-search`  
**Date**: 2026-04-11  
**Purpose**: Resolve the Rightmove integration approach for station-card rental searches without breaking the site’s static-first architecture.

## Rightmove Station Identifier Strategy

### Decision

Use a checked-in mapping from TfL `stationId` to Rightmove `STATION` search results, populated through a developer-assisted lookup workflow and committed to the repository.

### Rationale

- The existing code already has a natural home for this data in `docs/rightmove-station-template.ts`.
- Runtime lookups are unnecessary because the station card only needs a stable Rightmove station identifier when the user clicks the CTA.
- A stored mapping keeps the main app static and deterministic.
- Rightmove’s live search lookup returns a numeric station ID through `https://los.rightmove.co.uk/typeahead?...`, which can be persisted after review.

### Evidence

- The repo already contains `docs/rightmove-station-template.ts` and `scripts/generate-rightmove-station-template.js`.
- A sampled Rightmove typeahead response for `Baker Street Station` returned `{"id":"488","type":"STATION","displayName":"Baker Street Station"}`.

### Alternatives Considered

1. Perform a Rightmove lookup at runtime for every station-card open.
   Rejected because it adds a new live dependency to the user journey and weakens determinism.
2. Generate Rightmove IDs automatically on every build.
   Rejected because it adds third-party fragility to normal builds and increases operational risk.
3. Build Rightmove URLs from names only with no stored ID.
   Rejected because Rightmove uses internal location IDs for station searches, so name-only URLs are not reliable enough.

---

## Rightmove URL Format

### Decision

Build Rightmove station search URLs with `https://www.rightmove.co.uk/property-to-rent/find.html?locationIdentifier=STATION^<id>` plus fixed flat-rental filters that mirror the intent of the current Zoopla CTA.

### Rationale

- A direct sample URL using `locationIdentifier=STATION^488` loads Baker Street station rental results successfully.
- The query-string approach aligns with the current Zoopla builder pattern: construct a stable, pre-filtered outbound URL rather than deep-linking through runtime UI interactions.
- The resulting URL is small, shareable, and easy to unit test.

### Verified Parameters

- `locationIdentifier=STATION^488` resolves a station search results page.
- Sample filter parameters such as `propertyTypes=flat`, `maxBedrooms=2`, `minBedrooms=0`, `maxPrice=2000`, `radius=0.5`, and `includeLetAgreed=false` are accepted in the results-page URL.

### Alternatives Considered

1. Launch Rightmove’s home page with only a plain-text query.
   Rejected because it leaves too much work to the user and does not guarantee station-specific results.
2. Store complete per-station Rightmove URLs in the mapping file.
   Rejected because a small reusable URL builder is easier to maintain than a large list of fully composed URLs.

---

## Data Collection Workflow For Missing Rightmove IDs

### Decision

Use a developer-assisted lookup workflow to fill missing Rightmove station IDs, with browser automation allowed only as a review aid for individual station matches, then save the reviewed mapping into the repository.

### Rationale

- Rightmove’s page footer explicitly states that it prohibits scraping its content, so bulk unattended scraping should not become part of the product or normal build.
- The feature only needs identifiers, not listing content.
- A curated workflow avoids introducing a fragile background harvesting system while still letting developers complete missing mappings efficiently.

### Operational Shape

- Generate the station template from TfL station data.
- Look up missing entries individually or in small reviewed batches.
- Save reviewed IDs and display names back into the checked-in mapping artifact.
- Keep the app runtime fully static.

### Alternatives Considered

1. Fully automate Rightmove scraping across the entire station catalogue in build scripts.
   Rejected because it creates legal and operational risk and conflicts with a low-friction static build pipeline.
2. Abandon the Rightmove CTA entirely when IDs are missing.
   Rejected because the feature remains valuable if the workflow can fill the high-value stations safely and incrementally.

---

## UI Integration Pattern

### Decision

Integrate the Rightmove CTA in `app/components/MapCanvas/LeafletMapCanvas.tsx` beside the existing Zoopla CTA and extend `app/lib/analytics.ts` with a matching click tracker.

### Rationale

- The Zoopla CTA already lives in the station hover card and sets the user expectation for property-search links.
- The station card already computes the selected station, current CTA eligibility, and outbound URL state.
- Analytics, FAQ copy, and blog copy already contain a clear pattern that Rightmove can mirror.

### Alternatives Considered

1. Move both Zoopla and Rightmove CTAs into a new shared component first.
   Rejected for initial scope because it adds refactor cost before the Rightmove behaviour is proven.
2. Add Rightmove only to a separate station detail page.
   Rejected because the current user journey happens directly from the map card.