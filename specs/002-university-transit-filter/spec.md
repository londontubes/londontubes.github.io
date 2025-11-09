# Feature Specification: University Transit Filter

**Feature Branch**: `002-university-transit-filter`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "create a second page with a tab on the top line called 'universities filter'. This new page should show google map and highlight all the London universities. Just like the first page, it will show all the london tube and DLR network, when user clicked a university on the google map, the nearest tube line or lines within 0.5 miles should be shown and selected."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate to University View (Priority: P1)

Users access a dedicated "Universities Filter" page via top navigation tab, where they see an interactive map displaying all London universities as markers overlaid on the full Underground and DLR network.

**Why this priority**: Provides immediate access to university-specific transit information, establishing the foundation for all subsequent interactions with university transit data.

**Independent Test**: Click the "Universities Filter" navigation tab and verify the page loads showing the complete tube/DLR network with university markers visible.

**Acceptance Scenarios**:

1. **Given** a user on the main line filter page, **When** they click the "Universities Filter" tab in the top navigation, **Then** the page transitions to show the university view with all tube/DLR lines and university markers displayed.
2. **Given** a user on the university filter page, **When** the page loads, **Then** all London universities appear as distinct markers on the map with the full transport network visible in the background.
3. **Given** standard 3G network conditions, **When** the university page loads, **Then** the map becomes interactive within 3 seconds with all university markers clickable.

---

### User Story 2 - Discover Nearby Transit Lines (Priority: P2)

Users click a university marker on the map and the system automatically highlights and selects only the tube and DLR lines within the current radius setting (default 0.5 miles) of that university, hiding other lines to provide focused transit options. For multi-campus universities, users first select the specific campus before filtering is applied.

**Why this priority**: Directly addresses the core value proposition of helping students and visitors identify convenient transit options for reaching specific universities.

**Independent Test**: Click any university marker and verify that only lines within the set radius are highlighted, with all stations on those lines displayed, while distant lines are hidden or de-emphasized.

**Acceptance Scenarios**:

1. **Given** the university view is displayed with all lines visible, **When** a user clicks on a single-campus university marker (e.g., University College London), **Then** only tube and DLR lines within 0.5 miles (default) of that university are highlighted and selected, while other lines fade or hide, and the marker tooltip shows the university name and nearest station.
2. **Given** the university view is displayed, **When** a user clicks on a multi-campus university marker (e.g., Imperial College), **Then** a campus selector UI appears listing available campuses (e.g., "South Kensington Campus", "White City Campus").
3. **Given** a campus selector is displayed, **When** the user selects a specific campus, **Then** the proximity filtering is applied based on that campus's coordinates and the marker displays the campus-specific nearest station.
4. **Given** a university is selected, **When** the filtering applies, **Then** all stations on the nearby lines remain visible with standard station markers, and the university marker remains prominently displayed.
5. **Given** a university is selected, **When** the user views the line filter control, **Then** it updates to show which specific lines are auto-selected based on proximity (e.g., Northern, Central lines for UCL).
6. **Given** a selected university with filtered lines, **When** the user clicks the same university marker again or clicks a "clear selection" action, **Then** the map returns to showing all tube and DLR lines with all universities visible.

---

### User Story 3 - Adjust Distance Radius (Priority: P3)

Users can adjust the distance radius using a slider control (0.25 to 1 mile) to customize how far from a university they're willing to walk, with the filtered lines updating dynamically based on the new radius.

**Why this priority**: Provides flexibility for users with different walking preferences or physical abilities, enhancing the utility of the proximity-based filtering.

**Independent Test**: Select a university, then adjust the radius slider and verify the filtered lines update to reflect stations within the new distance threshold.

**Acceptance Scenarios**:

1. **Given** a university is selected with lines filtered at 0.5 miles, **When** the user moves the radius slider to 0.25 miles, **Then** the filtered lines update within 300 ms to show only lines with stations within 0.25 miles (typically fewer lines).
2. **Given** a university is selected with lines filtered at 0.5 miles, **When** the user moves the radius slider to 1 mile, **Then** the filtered lines update to include additional lines with stations between 0.5 and 1 mile away.
3. **Given** no university is selected, **When** the user adjusts the radius slider, **Then** the setting updates but no filtering occurs until a university is clicked.
4. **Given** a university is selected at a small radius (0.25 miles) with no nearby stations, **When** the system displays "No stations within 0.25 miles", **Then** the user can increase the radius to find transit options.

---

### User Story 4 - Compare Transit Options Between Universities (Priority: P4)

Users can click different university markers sequentially to compare which transit lines serve different campuses, helping with accommodation or campus choice decisions.

**Why this priority**: Supports advanced planning scenarios where users evaluate multiple university locations before making travel or housing decisions.

**Independent Test**: Click multiple university markers in succession and verify the line filter updates each time to reflect the proximity-based selection for each university.

**Acceptance Scenarios**:

1. **Given** one university is already selected with its nearby lines highlighted, **When** the user clicks a different university marker, **Then** the previous university's selection clears and the new university's nearby lines (within current radius) are highlighted instead.
2. **Given** the user is comparing universities, **When** they switch between two universities with different nearby lines, **Then** the line filter control updates within 500 ms to reflect the new proximity-based line selection.
3. **Given** the user is comparing universities with different radius settings, **When** they select each university, **Then** each uses the current radius setting for its proximity calculation.

---

### Edge Cases

- What happens when a university has no tube or DLR lines within the selected radius? The system MUST display a message indicating "No tube or DLR stations within [X] miles of [University Name]" and show the full network with the university marker highlighted but no line filtering applied.
- How does the system handle universities very close to line boundaries at exactly the selected radius distance? The system MUST use inclusive distance measurement (≤ radius) to avoid excluding borderline stations, erring on the side of showing additional options.
- What if university location data is unavailable or fails to load? The page MUST display the full tube/DLR network with an error message: "University data temporarily unavailable" and still allow navigation back to the main line filter page.
- How are multi-campus universities handled when campus locations are very close together? If campuses are within 0.1 miles of each other, they MAY be combined into a single marker to avoid visual clutter; otherwise, the campus selector UI is displayed.
- What happens when the user adjusts the radius slider while no university is selected? The slider updates the setting, but no filtering occurs until a university is clicked; the new radius is then applied immediately.
- What if a user selects a university, adjusts the radius to a smaller value where no stations exist, then increases it again? The system MUST dynamically recalculate at each radius change, showing appropriate messages or filtered results based on current settings.
- How is the radius calculation performed for stations? Distance MUST be measured as straight-line (Euclidean) distance from the university/campus coordinates to each station's coordinates to ensure consistent and performant filtering.
- What happens when clicking a university marker for a multi-campus institution? The system MUST display the campus selector UI first; proximity filtering only begins after the user selects a specific campus from the list.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a top-level navigation tab labeled "Universities Filter" that remains persistently accessible from all pages in the application.
- **FR-002**: Navigation to the universities page MUST preserve browser history, allowing users to use back/forward buttons to switch between the line filter and university filter views.
- **FR-003**: The university filter page MUST display the full London Underground and DLR network (all lines and stations) as the base map layer, matching the visual styling of the main line filter page.
- **FR-004**: System MUST overlay markers for all major London universities on the map, positioned at their primary campus coordinates.
- **FR-005**: University markers MUST be visually distinct from station markers using different icon styling (shape, size, or color) to prevent confusion.
- **FR-006**: University markers MUST be clickable and display a tooltip or info panel showing the university name on hover or focus.
- **FR-007**: When a user clicks a university marker, the system MUST calculate which tube and DLR stations are within 0.5 miles (straight-line distance) of that university's coordinates.
- **FR-008**: System MUST automatically filter the map to highlight only the lines serving stations within the 0.5-mile radius, updating the view within 500 ms of the click.
- **FR-009**: Stations outside the 0.5-mile radius MUST either be hidden or significantly de-emphasized (e.g., reduced opacity) to focus attention on relevant transit options.
- **FR-010**: The line filter control MUST update to show which lines are currently selected based on the university proximity calculation, maintaining consistency with the main filter page behavior.
- **FR-011**: Users MUST be able to manually modify the auto-selected line filter after a university selection, with changes reflected immediately on the map.
- **FR-012**: System MUST provide a clear action (button or clicking the same marker) to deselect a university and return to showing all lines and universities.
- **FR-013**: System MUST source university location data from a curated dataset of London universities including their official names and geographic coordinates (latitude/longitude).
- **FR-014**: University data MUST be stored in a static JSON file (similar to lines.json and stations.json) that can be updated independently of application code.
- **FR-015**: The map MUST maintain interactive controls (zoom, pan, keyboard navigation) consistent with the main line filter page for accessibility.
- **FR-016**: System MUST handle scenarios where no stations exist within 0.5 miles by displaying an appropriate message while keeping the university marker highlighted.
- **FR-017**: Page MUST degrade gracefully when university data fails to load, showing the full transport network with an error notification and maintaining navigation functionality.
- **FR-018**: System MUST log university selection interactions for analytics while respecting privacy requirements.
- **FR-019**: System MUST provide a user-adjustable distance radius control (slider ranging from 0.25 to 1 mile) allowing users to customize the proximity threshold for filtering nearby transit lines.
- **FR-020**: When multiple campuses exist for one institution, system MUST display a single marker at a representative location; clicking the marker MUST present a campus selector UI (dropdown or modal) allowing users to choose which campus to use for proximity filtering.
- **FR-021**: University markers MUST display the university name and the name of the nearest tube/DLR station in the tooltip or info panel to provide helpful context for users.
- **FR-022**: The distance radius control MUST default to 0.5 miles on initial page load.
- **FR-023**: When a user adjusts the radius slider, the system MUST immediately recalculate and update the filtered lines if a university is currently selected, with updates completing within 300 ms.
- **FR-024**: The campus selector UI MUST clearly list all campuses for a multi-campus university with their specific location names (e.g., "Strand Campus", "Waterloo Campus").
- **FR-025**: After selecting a specific campus from the selector, the system MUST filter lines based on that campus's exact coordinates and the current radius setting.

### Key Entities

- **University**: Represents a higher education institution in London; attributes include official name, marker coordinates (latitude/longitude for map placement), campus list (for multi-campus institutions), and nearest station reference.
- **Campus**: Represents a specific campus location for multi-campus universities; attributes include campus name, exact coordinates, parent university reference, and nearest station calculation.
- **ProximityFilter**: Represents the automatic line selection state; attributes include selected university/campus ID, user-selected distance radius (0.25-1 mile), calculated nearby station IDs (within radius), derived line codes, and filter timestamp.
- **UniversityMarker**: Map overlay element representing a university; attributes include display position, icon styling, tooltip content (name + nearest station), click interaction state, and multi-campus indicator flag.
- **RadiusControl**: UI component for distance adjustment; attributes include current radius value (0.25-1 mile), slider position, default value (0.5 miles), and change event handlers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of users successfully navigate from the main page to the university filter page via the navigation tab within 5 seconds of page load.
- **SC-002**: University marker clicks trigger line filtering and map updates within 500 ms on standard 3G connections across latest two major versions of mobile browsers.
- **SC-003**: Users can identify relevant transit lines for any university within three interactions (click university marker, optionally select campus if multi-campus, review highlighted lines).
- **SC-004**: 95% of proximity calculations correctly identify all stations within the selected radius with no false negatives (missing nearby stations) across all radius settings (0.25, 0.5, 0.75, 1 mile).
- **SC-005**: Page maintains performance with 50+ university markers displayed simultaneously without degrading map responsiveness (zoom, pan remain smooth).
- **SC-006**: Accessibility audit scores maintain WCAG 2.1 AA compliance including keyboard navigation between university markers, radius slider control, campus selector, and screen reader announcements for university selections and radius changes.
- **SC-007**: 85% of test users can successfully compare transit options between at least two universities within 1 minute of viewing the page.
- **SC-008**: Radius slider adjustments trigger line filter updates within 300 ms when a university is selected, with smooth visual transitions.
- **SC-009**: Campus selector UI (for multi-campus universities) loads and displays within 200 ms of marker click, with all campuses listed clearly.

## Assumptions

- London universities are defined as institutions with undergraduate or postgraduate programs located within Greater London boundaries, sourced from official higher education registers (e.g., HESA, UCAS).
- The distance radius is measured as straight-line distance (Euclidean), not walking distance, as an approximation of "reasonable walking distance" for students and visitors; default of 0.5 miles represents typical comfortable walking distance.
- University marker coordinates represent a central or prominent location for each institution; for multi-campus universities, the marker is placed at a representative location (e.g., main administrative building or campus center).
- Multi-campus universities have a manageable number of campuses (typically 2-5); if an institution has more than 10 distinct locations, they may be grouped or filtered by geographic area.
- The nearest station calculation for each university/campus is pre-computed and stored in the data file to avoid real-time calculation overhead on initial page load.
- Users access this feature primarily for planning commutes or accommodation searches, so the focus is on proximity-based filtering rather than route planning or journey times.
- The same Google Maps integration used for the main line filter page is reused for the university view, with no additional API keys or services required.
- University location data is relatively stable and updated quarterly or as needed when new institutions open, campuses relocate, or nearest station calculations change.
- The line filter control UI component from the main page can be reused with minor modifications to display auto-selected lines from university proximity.
- The radius slider UI is intuitive and accessible, with clear visual indication of the current distance setting (e.g., "0.5 miles" label) and smooth interaction on both desktop and mobile devices.
