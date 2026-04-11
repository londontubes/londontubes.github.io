# Feature Specification: Rightmove Flat Search

**Feature Branch**: `004-rightmove-flat-search`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "now add rightmove flat search next to Zoopla flat search. Rightmove maps the tube station using their internal ID. To get them, you can use MCP server to call the rightmove UI and scrape the data and save them. Then build the rightmove URL filter just like what we did for zoopla search."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Open Rightmove Searches From Station Cards (Priority: P1)

As a renter exploring journey-time-friendly areas, I want a Rightmove flat search button next to the existing Zoopla button so I can compare listings from both portals from the same station context.

**Why this priority**: This is the direct user-facing value. Without the in-card Rightmove CTA, there is no deliverable feature for visitors.

**Independent Test**: Open the map, select a station that has a Rightmove mapping, and verify a Rightmove button appears next to the Zoopla button and opens a Rightmove rental search filtered for flats near that station.

**Acceptance Scenarios**:

1. **Given** a station card with a valid Rightmove station mapping, **When** the visitor opens the card, **Then** the card shows a Rightmove flat search CTA beside the Zoopla flat search CTA.
2. **Given** a visitor clicks the Rightmove CTA, **When** the new tab opens, **Then** the Rightmove URL targets the mapped station and applies the agreed flat-rental filters.
3. **Given** a station has no valid Rightmove mapping, **When** the visitor opens the card, **Then** the UI does not show a broken Rightmove CTA.

---

### User Story 2 - Maintain a Stable Rightmove Station Mapping (Priority: P2)

As a developer maintaining the station search experience, I want a checked-in mapping from TfL station IDs to Rightmove station IDs so the Rightmove links stay deterministic and do not depend on runtime lookups.

**Why this priority**: The Rightmove CTA cannot be reliable unless the station mapping is stored and versioned in the repository.

**Independent Test**: Regenerate the Rightmove station template, enrich a sample of stations with Rightmove IDs, and confirm the mapping file validates and supports URL generation without network calls at runtime.

**Acceptance Scenarios**:

1. **Given** the current station dataset, **When** the developer runs the Rightmove mapping workflow, **Then** the repository produces a maintained station mapping artifact keyed by TfL station ID.
2. **Given** Rightmove returns a station match from its typeahead lookup, **When** the developer saves that result, **Then** the stored mapping includes the numeric Rightmove station ID and the display name used for auditability.
3. **Given** a station has ambiguous or missing Rightmove results, **When** the mapping is reviewed, **Then** the workflow preserves the station record without inventing an ID.

---

### User Story 3 - Keep Affiliate CTAs Consistent And Accessible (Priority: P3)

As a visitor using the map on mobile or desktop, I want the new Rightmove CTA to follow the same visual, analytics, and accessibility patterns as the existing Zoopla CTA so the station card stays clear and trustworthy.

**Why this priority**: The Rightmove button should extend the existing property-search pattern rather than introduce a one-off UI inconsistency.

**Independent Test**: Review a station card on desktop and mobile, confirm the Rightmove CTA is keyboard reachable, labelled clearly, tracked consistently, and does not break the existing layout.

**Acceptance Scenarios**:

1. **Given** a station card with both property CTAs, **When** the card renders on a narrow viewport, **Then** both buttons remain readable and usable without overflowing the card.
2. **Given** a visitor activates the Rightmove CTA with keyboard or pointer, **When** the click is handled, **Then** the app records a matching analytics event using the existing affiliate tracking pattern.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- A TfL station name maps to multiple Rightmove station suggestions, including line-specific variants such as the two Edgware Road stations.
- Rightmove typeahead returns a locality or street result instead of a `STATION` result for a valid TfL station.
- A stored Rightmove station ID becomes stale and returns a generic or empty search results page.
- The existing Zoopla CTA is available for a station but the Rightmove CTA is not, and the card must remain visually balanced.
- Rightmove changes its typeahead response shape or its `locationIdentifier=STATION^...` URL convention after IDs have already been curated.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST add a Rightmove flat search CTA in the same station card area that currently renders the Zoopla flat search CTA.
- **FR-002**: System MUST show the Rightmove CTA only when the selected station has a valid stored Rightmove station mapping.
- **FR-003**: System MUST build Rightmove rental URLs from stored Rightmove station IDs rather than performing runtime Rightmove lookups in the browser.
- **FR-004**: System MUST preserve the existing Zoopla CTA behaviour and placement while adding the Rightmove CTA next to it.
- **FR-005**: System MUST use a checked-in, versioned Rightmove station mapping artifact keyed by TfL `stationId`.
- **FR-006**: System MUST provide a developer-maintained workflow to enrich missing Rightmove station IDs using Rightmove’s public search UI or typeahead endpoint during development, not during normal page runtime.
- **FR-007**: System MUST store the Rightmove mapping with enough metadata to audit the chosen match, including the human-readable station name returned by Rightmove.
- **FR-008**: System MUST build the Rightmove search URL with the agreed rental filters for flats, mirroring the intent of the Zoopla search CTA.
- **FR-009**: System MUST track Rightmove CTA clicks through the existing affiliate/CTA analytics pattern.
- **FR-010**: System MUST keep station card CTA layout usable at 320px viewport width.
- **FR-011**: System MUST preserve WCAG 2.1 AA semantics, color contrast, keyboard focus, and accessible naming for the new CTA.
- **FR-012**: System MUST fail safely when a station lacks a Rightmove mapping by omitting the CTA instead of generating a best-guess URL.
- **FR-013**: System MUST document the Rightmove mapping workflow and any legal or operational constraints around Rightmove ID collection.

### Key Entities *(include if feature involves data)*

- **RightmoveStationMapping**: A stored mapping between a TfL station ID and a Rightmove station result, including the Rightmove numeric ID, Rightmove display name, and local search label used to build the URL.
- **RightmoveSearchConfig**: The fixed filter set used to build Rightmove rental URLs, such as property type, bedroom bounds, max price, and radius.
- **StationPropertyCtaState**: The runtime decision model for which external property CTAs can be shown for the currently selected station.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: For any mapped station, a visitor can open a Rightmove flat search in 1 click from the station card.
- **SC-002**: At least 95% of stations that currently expose the Zoopla CTA also have a reviewed Rightmove mapping before release, or are explicitly documented as unavailable.
- **SC-003**: Adding the Rightmove CTA does not introduce new accessibility violations in station-card-related automated checks.
- **SC-004**: The map experience continues to meet the site constitution performance budget, with no new runtime Rightmove network dependency added to primary page load.
