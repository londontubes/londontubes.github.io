# Feature Specification: London Tube Map Line Filter

**Feature Branch**: `001-map-line-filter`  
**Created**: 2025-11-07  
**Updated**: 2025-11-08  
**Status**: In Development  
**Input**: User description: "I am building a modern London Tube website. I want it to show all the London Tube stations including DLR line and its stations over google maps. Website should provide a simple clickable feature to filter all the tube lines. The website should show selected tube lines with its stations overlay on top of the google maps."

**Update (2025-11-08)**: (Superseded) Temporary Northern line–only default used to validate filtering mechanics.  
**Update (2025-11-08 later)**: Implemented full branch support using GeoJSON `MultiLineString` via consumption of all TfL `lineStrings` route geometry entries (Northern line rendered as 16 segments).  
**Update (2025-11-08 revert)**: Restored default view to show the full Underground + DLR network (all lines visible initially) for comprehensive overview.

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

### User Story 1 - View Full Network (Priority: P1)

Visitors open the site and immediately see an interactive map displaying all London Underground and DLR lines with every station rendered over the base map.

**Why this priority**: Provides an immediate comprehensive overview of the network and establishes trust in data completeness before users begin filtering.

**Acceptance Scenarios**:

1. **Given** a new visitor on the homepage, **When** the page loads, **Then** the map displays all lines with correct colors and all station markers labeled by their names.
2. **Given** standard 3G network conditions, **When** the homepage loads, **Then** the map becomes interactive within 3 seconds and retains keyboard navigation for panning and zooming.

---

### User Story 2 - Filter By Individual Line (Priority: P2)

Visitors choose a single line (e.g., Victoria line) and the map updates to highlight only that line and its stations while hiding others for clarity.

**Why this priority**: Enables focused journey planning by letting users isolate a single line, addressing the most common filtering need with minimal UI effort.

**Independent Test**: From the homepage, select a line via the filter control and confirm the map updates within the defined response time, showing only the selected line and stations.

**Acceptance Scenarios**:

1. **Given** the full network map is visible, **When** a user selects the Victoria line filter, **Then** only the Victoria line path and its stations remain visible while other lines and stations hide.
2. **Given** a line filter is active, **When** the user clears the selection, **Then** the map returns to showing the full network with original styling.

---

### User Story 3 - Combine Multiple Lines (Priority: P3)

Visitors select multiple lines (e.g., Jubilee and DLR) to see how they intersect and plan transfers, with the map updating to include all chosen lines and stations simultaneously.

**Why this priority**: Supports advanced trip planning by exposing interchange points and broader coverage without overwhelming users who only need a single line.

**Independent Test**: Activate at least two line filters and verify that all selected lines display concurrently, the legend updates accordingly, and performance remains within thresholds.

**Acceptance Scenarios**:

1. **Given** the line filter control, **When** a user selects both Jubilee and DLR, **Then** the map shows both lines with distinct colors and displays all associated stations.
2. **Given** multiple lines are visible, **When** the user deselects one of the active lines, **Then** the map immediately hides the deselected line while retaining the others without requiring a full page reload.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- What happens when no line is selected? The UI MUST show all lines (full network) with guidance on using the line filter.
- How does the system handle an invalid filter combination? Selecting an unavailable line MUST surface a clear message and maintain the previous valid selection.
- What if station data is temporarily unavailable? The map MUST show a fallback message and prevent blank map renders by displaying last-known data with staleness timestamp.
- How is the experience handled on low-bandwidth connections? The map MUST prioritize lightweight map visuals first and progressively enhance details only after the initial view loads.
- What if geolocation permissions are denied? The map MUST still load centered on Greater London without requesting user location repeatedly.
- How are branched / forked lines represented? Branches MUST render as separate polyline segments (MultiLineString) sharing color & strokeWeight; bounds MUST include all segments.
- If a branch fails to parse from TfL `lineStrings`, remaining branches MUST still render; failure logged (non-blocking) for future diagnostics.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST render an interactive base map centered on Greater London with zoom and pan controls accessible via mouse, touch, and keyboard inputs.
- **FR-002**: System MUST overlay all London Underground and DLR lines using accurate geographic polylines; branched lines MUST serialize as GeoJSON `MultiLineString` where multiple segments exist; apply official line color.
- **FR-003**: System MUST display station markers for every station served by the mapped lines, including station name tooltips and focusable elements for accessibility.
- **FR-004**: Users MUST be able to select any individual line from a persistent filter control, causing the map to show only that line (including all branch segments) and its stations within 500 ms.
- **FR-005**: Users MUST be able to select multiple lines simultaneously, with the map aggregating those lines and stations while maintaining distinct styling per line.
- **FR-006**: The filter control MUST provide a clear legend indicating which lines are active, including a “show all lines” reset action.
- **FR-007**: System MUST source station and line data from the authoritative Transport for London dataset refreshed at least weekly and expose the data timestamp on the page; all `lineStrings` entries MUST be consumed for geometry.
- **FR-008**: System MUST load the Google Maps base layer (or approved equivalent per governance) and safeguard any required credentials per security policy while reporting initialization failures with a user-friendly message.
- **FR-009**: System MUST log filter interactions (line selections and resets) for analytics while complying with privacy requirements defined in governance reviews.
- **FR-010**: System MUST degrade gracefully when the map provider is unreachable by presenting an accessible fallback list of stations and prominent status notice (image optional future enhancement).
- **FR-011**: Default initial view MUST render the full Underground + DLR network (all lines, all stations) until user changes filter state.
- **FR-012**: Bounds calculation MUST include every segment of a branched line to avoid clipping extreme termini.

### Key Entities *(include if feature involves data)*

- **TransitLine**: Represents each Underground or DLR line; attributes include canonical name, line code, brand color, service status, and ordered list of station IDs.
- **Station**: Represents a network station; attributes include station ID, display name, latitude/longitude, served line codes, accessibility notes, and last-updated timestamp.
- **LineSelectionState**: Captures the user’s active filter; attributes include array of active line codes, default state (all lines), and derived legend metadata.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 90% of first-time visitors see an interactive map with the Northern line (all branches) within 3 seconds on a simulated 3G connection.
- **SC-002**: 95% of line filter interactions (single-line switch) complete map updates (including branch segment visibility changes) within 500 ms across latest two major versions of iOS Safari & Android Chrome.
- **SC-003**: Accessibility audit scores meet or exceed WCAG 2.1 AA with zero critical violations for map navigation, filter controls, station info, and branch rendering.
- **SC-004**: At least 80% of usability test participants successfully plan a multi-line journey (identify an interchange across branched segments) within two filter interactions.
- **SC-005**: 100% of branched lines render all available TfL segments with no visually disconnected stations (manual visual QA + automated coordinate continuity check future).

## Assumptions

- TfL open data exposes reliable geospatial coordinates for all Underground and DLR stations and lines.
- A valid Google Maps API key and billing-enabled project are already provisioned for the site's hosting environment.
- Content editors will maintain line descriptions and accessibility notes in the repository when data exports change.

## Implementation Status (2025-11-08)

### Completed Foundation
- ✅ Next.js 14 static export configuration with App Router
- ✅ TypeScript project scaffolding with ESLint
- ✅ Full TfL dataset integrated (12 lines, 310 stations) in `public/data/` (lines.json, stations.json, metadata.json)
- ✅ Data transformation script consumes all TfL `lineStrings` per line (branch-aware) & validation scripts (Ajv)
- ✅ Google Maps loader with lazy initialization and error handling
- ✅ MapCanvas component renders branched lines (MultiLineString support) + interactive fallback UI
- ✅ StationTooltip component for station details
- ✅ MapExperience wrapper integrating map and state management (default Northern line)
- ✅ Accessibility helpers for ARIA labels
- ✅ Playwright E2E test framework configured
- ✅ Jest unit test framework configured with ts-jest (tests pending)
- ✅ Lighthouse CI configuration for performance audits

### Active Development
- 🚧 Line filter UI component (User Story 2)
- 🚧 Multi-line selection support (User Story 3)
- 🚧 Unit test coverage (MapCanvas branching logic, data pipeline)
- 🚧 Analytics logging for filter interactions (FR-009)

### Known Issues
- Google Maps API key must be set in `.env.local` or map falls back to simplified station list
- Jest configured with `passWithNoTests: true` temporarily (remove after adding tests)
- Filter UI not yet implemented (only Northern line visible by design)
- No visual distinction between branches of same line (future enhancement)

### File Format Change
- **Original plan**: Use `.geojson` file extensions  
- **Implementation**: Use `.json` file extensions (GeoJSON content preserved)  
- **Reason**: Next.js webpack lacks native `.geojson` loader support; simpler imports for static export.

### Branch Rendering Implementation Notes (2025-11-08)
- TfL `RouteSequence` provides multiple `lineStrings` per line; each value parsed as JSON whose first element is the coordinate array.
- Transformation aggregates every parsed segment with ≥2 coordinate pairs; invalid segments skipped with console diagnostic.
- Lines with >1 segment serialized as `MultiLineString`; single-segment lines remain `LineString`.
- Bounds calculated over union of all segment points.
- Fallback: if no segments parsed, station lat/lon sequence used to create synthetic single `LineString`.
