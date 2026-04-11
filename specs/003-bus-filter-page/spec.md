# Feature Specification: Bus Filter Page

**Feature Branch**: `003-bus-filter-page`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "build bus filter next to the University filter. A new page which shows bus route around london and people can filter bus just like the tube filter."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and filter London bus routes on a dedicated page (Priority: P1)

As a visitor, I want a dedicated bus page that shows London bus routes on the map and lets me filter visible routes so I can focus on the services relevant to my journey.

**Why this priority**: This is the core product ask. Without a dedicated page plus route filtering, there is no independently useful bus feature.

**Independent Test**: Open the bus page, confirm bus routes render from static data, toggle one or more routes in the filter, and verify the map updates to only show the selected routes.

**Acceptance Scenarios**:

1. **Given** a visitor opens the bus page, **When** the page finishes loading, **Then** the map shows London bus routes and a bus-specific filter panel without affecting the existing tube and universities pages.
2. **Given** multiple bus routes are visible, **When** the visitor selects or deselects route filters, **Then** the map updates to reflect only the active routes.
3. **Given** no route filters are selected, **When** the page is first opened or reset, **Then** the system shows a sensible default state that keeps the page immediately usable.

---

### User Story 2 - Inspect route and stop context without overwhelming the map (Priority: P2)

As a visitor, I want to inspect the routes and nearby stops currently in view so I can understand where a route goes without the map becoming unreadable.

**Why this priority**: Once route filtering exists, the next user need is understanding the selected routes. This adds value without changing the feature’s core shape.

**Independent Test**: On the bus page, select a route, interact with the route or a stop marker, and confirm the UI reveals route and stop context while keeping performance acceptable.

**Acceptance Scenarios**:

1. **Given** a visitor has selected a bus route, **When** they interact with that route on the map, **Then** the UI presents route-identifying information and keeps the selected route visually distinct.
2. **Given** the map is zoomed in enough to support stop exploration, **When** the visitor interacts with a displayed stop, **Then** the UI shows the stop name and relevant route associations.
3. **Given** the map is zoomed out to a broad London view, **When** the visitor has many routes active, **Then** the page avoids rendering stop information in a way that makes the map unusable.

---

### User Story 3 - Move between tube, university, and bus experiences consistently (Priority: P3)

As a returning visitor, I want the new bus page to appear in the same top-level navigation as the existing map experiences so I can switch between them without relearning the interface.

**Why this priority**: Navigation consistency matters, but the bus page still provides value even before the cross-page polish is complete.

**Independent Test**: Navigate between the line filter, university filter, and bus filter pages on desktop and mobile and confirm the active tab state is correct for each route.

**Acceptance Scenarios**:

1. **Given** a visitor is on any top-level map page, **When** they use the navigation tabs, **Then** they can reach the bus page with a clear active state.
2. **Given** a visitor is using a narrow mobile viewport, **When** the tab list exceeds available width, **Then** the tabs remain accessible without breaking layout or obscuring the active page.

### Edge Cases

- What happens when the bus dataset is unavailable, empty, or fails validation during the build pipeline?
- What happens when a route has missing or malformed stop geometry but otherwise valid line geometry?
- How does the page behave when a visitor enables many routes at once on a low-powered mobile device?
- How does the filter behave when multiple routes share the same stop or overlapping street segments?
- What happens when the visitor deep-links directly to the bus page before any cached map assets are available?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated bus page reachable from the site’s primary map navigation.
- **FR-002**: System MUST load bus route data from static, versioned files generated during the existing build-time data pipeline.
- **FR-003**: System MUST render bus route geometry on the map using visual treatment distinct from the existing tube and university experiences.
- **FR-004**: Users MUST be able to filter which bus routes are visible using a route selection UI comparable in clarity to the existing tube line filter.
- **FR-005**: System MUST keep bus filter state isolated to the bus page so it does not alter the current line filter or university filter behavior.
- **FR-006**: System MUST support map interactions that identify the currently selected route.
- **FR-007**: System MUST provide stop-level context for active routes when the map zoom level and route density make that interaction readable.
- **FR-008**: System MUST suppress or reduce stop-level rendering when the map density would otherwise make the view unreadable or too slow.
- **FR-009**: System MUST validate generated bus route and stop data before those files are bundled into the static site.
- **FR-010**: System MUST preserve WCAG 2.1 AA keyboard and screen-reader access for route filtering, navigation tabs, and map-adjacent controls.
- **FR-011**: System MUST preserve mobile usability down to 320px viewport width.
- **FR-012**: System MUST fail safely at build time if the bus dataset cannot be generated or validated, rather than publishing broken static data.

### Key Entities *(include if feature involves data)*

- **BusRoute**: A London bus service with a route identifier, display label, styling metadata, stop references, and map geometry.
- **BusStop**: A physical stop with a unique identifier, name, location, and references to one or more serving bus routes.
- **BusDataset**: The build-generated static collection of bus routes, bus stops, and dataset metadata used by the bus page.
- **BusFilterState**: The runtime state tracking selected routes, viewport-derived rendering mode, and any selected route or stop.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can open the bus page and isolate a specific route in 3 interactions or fewer.
- **SC-002**: On a standard mobile 3G profile, the new bus page remains within the site constitution’s target of First Contentful Paint under 2 seconds and total page weight below 1.5 MB.
- **SC-003**: In manual QA, route filtering and top-level navigation work correctly on the latest two major versions of iOS Safari and Android Chrome.
- **SC-004**: Build validation rejects malformed bus data before deployment in 100% of intentionally corrupted test cases used during feature verification.
