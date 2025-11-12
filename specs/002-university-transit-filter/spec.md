# Feature Specification: University Transit Filter

**Feature Branch**: `002-university-transit-filter`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description (updated): "create a second page with a tab on the top line called 'universities filter'. This new page should show google map and highlight all the London universities. Just like the first page, it will show all the london tube and DLR network, when user clicked a university on the google map, the nearest tube line or lines within 0.25 miles (new default, adjustable) should be shown and selected."

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

Users click a university marker on the map or select a university from the name list, and the system automatically highlights and selects only the tube and DLR lines within the current radius setting (default 0.25 miles, adjustable up to 1 mile) of that university, hiding other lines to provide focused transit options. The map zooms and centers on the selected university for better visibility. For multi-campus universities, users first select the specific campus before filtering is applied.

**Why this priority**: Directly addresses the core value proposition of helping students and visitors identify convenient transit options for reaching specific universities.

**Independent Test**: Click any university marker or name button and verify that only lines within the set radius are highlighted, the map zooms to the university, with all stations on those lines displayed, while distant lines are hidden or de-emphasized.

**Acceptance Scenarios**:

1. **Given** the university view is displayed with all lines visible, **When** a user clicks on a single-campus university marker or name button (e.g., University College London), **Then** only tube and DLR lines within 0.25 miles (default) of that university are highlighted and selected, the map smoothly zooms to the university location (zoom level 14), the university marker changes to gold color and increases in size, while other lines fade or hide, and other university markers become smaller.
2. **Given** the university view is displayed, **When** a user clicks on a multi-campus university marker or name button (e.g., Imperial College), **Then** a campus selector modal appears with radio buttons listing available campuses showing campus name, nearest station, and distance (e.g., "South Kensington Campus - Nearest: South Kensington (0.1 mi)").
3. **Given** a campus selector is displayed, **When** the user selects a specific campus and clicks "Apply", **Then** the proximity filtering is applied based on that campus's coordinates, the map zooms to that campus location, and the modal closes.
4. **Given** a campus selector is displayed, **When** the user presses Escape or clicks "Cancel" or clicks outside the modal, **Then** the modal closes without applying any filter.
5. **Given** a university is selected, **When** the filtering applies, **Then** all stations on the nearby lines remain visible with standard station markers, the selected university marker is displayed prominently in gold with larger size (scale 16), and the map view is centered on the university.
6. **Given** a university is selected, **When** the user views the line filter control, **Then** it updates to show which specific lines are auto-selected based on proximity (e.g., Northern, Central lines for UCL).
7. **Given** a selected university with filtered lines, **When** the user clicks the same university marker or name button again, **Then** the university is deselected, the map returns to showing all tube and DLR lines with all universities visible at normal size and color, and the map zoom returns to show the full network.
8. **Given** the university view is displayed, **When** the user views the Universities section below the line filter, **Then** all 8 universities are listed alphabetically by name as clickable buttons, with multi-campus universities showing a badge indicating the number of campuses.

---

### User Story 3 - Adjust Distance Radius (Priority: P3)

Users can adjust the distance radius using a slider control (0.25 to 10 miles, with miles/kilometers toggle) to customize how far from a university they're willing to walk, with the filtered lines updating dynamically based on the new radius. The slider displays min/max value labels and is disabled when no university is selected.

**Why this priority**: Provides flexibility for users with different walking preferences or physical abilities, enhancing the utility of the proximity-based filtering.

**Independent Test**: Select a university, then adjust the radius slider and verify the filtered lines update to reflect stations within the new distance threshold.

**Acceptance Scenarios**:

1. **Given** a university is selected with lines filtered at the default 0.25 miles, **When** the user moves the radius slider to 0.25 miles (no change), **Then** the filtered lines remain consistent (baseline comparison state).
2. **Given** a university is selected with lines filtered at 0.25 miles, **When** the user moves the radius slider to 0.5 miles, **Then** the filtered lines update within 300 ms to include additional lines with stations between 0.25 and 0.5 miles away.
3. **Given** a university is selected with lines filtered at 0.5 miles, **When** the user moves the radius slider to 10 miles, **Then** the filtered lines update to include additional lines with stations between 0.5 and 10 miles away.
4. **Given** no university is selected, **When** the user attempts to adjust the radius slider, **Then** the slider is disabled (grayed out with cursor: not-allowed) and displays a hint message.
5. **Given** a university is selected at a small radius (0.25 miles) with no nearby stations, **When** the system displays "No stations within 0.25 miles", **Then** the user can increase the radius to find transit options.
6. **Given** a user prefers metric units, **When** they toggle the miles/kilometers switch, **Then** the slider values and labels update to show kilometers with appropriate conversion (1 mile = 1.609 km) and filtered results remain consistent.
7. **Given** the radius slider is being adjusted, **When** the user drags the slider rapidly, **Then** updates are debounced by 200ms to prevent excessive recalculation, with final results appearing within 300ms of the slider stopping.

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
- **FR-005**: University markers MUST be visually distinct from station markers using different icon styling (shape, size, or color) to prevent confusion. Selected university markers MUST be displayed in gold (#FFD700) with thick blue stroke (#0066cc, 8px weight) and larger size (scale 20), while unselected markers use TfL red (#DC241F) with standard size (scale 12) and black stroke (2px weight).
- **FR-006**: University markers MUST be clickable and display a tooltip showing the university name and nearest station on hover or focus.
- **FR-006b**: System MUST provide a "Universities" section below the line filter displaying all universities as clickable name buttons in alphabetical order, allowing users to select universities by name in addition to clicking map markers.
- **FR-006c**: University name buttons MUST show the university display name and, for multi-campus institutions, display a badge indicating the number of campuses (e.g., "2 campuses").
- **FR-006d**: Selected university name buttons MUST be visually highlighted with blue background (#e6f2ff), blue border (#0066cc, 3px), and blue text color to indicate active selection state.
- **FR-007**: When a user clicks a university marker or name button, the system MUST calculate which tube and DLR stations are within the current radius (default 0.25 miles, straight-line distance) of that university's coordinates.
- **FR-007b**: When a university is selected, the map MUST smoothly animate to center on the university location and zoom to level 14 within 700ms to provide better visibility of the nearby transit options.
- **FR-008**: System MUST automatically filter the map to highlight only the lines serving stations within the selected radius, updating the view within 500 ms of the selection.
- **FR-009**: Stations outside the 0.5-mile radius MUST either be hidden or significantly de-emphasized (e.g., reduced opacity) to focus attention on relevant transit options.
- **FR-010**: The line filter control MUST update to show which lines are currently selected based on the university proximity calculation, maintaining consistency with the main filter page behavior.
- **FR-011**: Users MUST be able to manually modify the auto-selected line filter after a university selection, with changes reflected immediately on the map.
- **FR-012**: System MUST provide multiple clear actions to deselect a university: clicking the same marker again, double-clicking the marker, or clicking on empty map space. Deselection MUST reset all filters, clear filtered stations, remove radius circle overlay, reset filter mode to 'radius', reset radius slider to minimum (0.25 miles), clear travel time results, and return all university markers to default styling.
- **FR-013**: System MUST source university location data from a curated dataset of London universities including their official names and geographic coordinates (latitude/longitude).
- **FR-014**: University data MUST be stored in a static JSON file (similar to lines.json and stations.json) that can be updated independently of application code.
- **FR-015**: The map MUST maintain interactive controls (zoom, pan, keyboard navigation) consistent with the main line filter page for accessibility.
- **FR-016**: System MUST handle scenarios where no stations exist within the current radius (including the default 0.25 miles) by displaying an appropriate message while keeping the university marker highlighted.
- **FR-017**: Page MUST degrade gracefully when university data fails to load, showing the full transport network with an error notification and maintaining navigation functionality.
- **FR-018**: System MUST log university selection interactions for analytics while respecting privacy requirements. (Implemented via Google Analytics 4 – events: university_select, university_deselect, campus_apply, line_filter_change, station_select. Measurement ID configured with `NEXT_PUBLIC_GA_ID`.)
- **FR-019**: System MUST provide a user-adjustable distance radius control (slider ranging from 0.25 to 10 miles with miles/kilometers toggle) allowing users to customize the proximity threshold for filtering nearby transit lines. The slider MUST display min/max value labels and be disabled when no university is selected.
- **FR-019b**: System MUST provide a travel time filter control (slider ranging from 5 to 60 minutes) as an alternative to distance-based filtering, allowing users to filter stations reachable within a specified commute time via the tube network.
- **FR-019c**: Filter mode (radius vs travel time) MUST be selectable via clickable slider container UI, with active mode showing white background and blue border, inactive mode showing gray background with reduced opacity. Switching modes MUST clear previous mode's results and overlays.
- **FR-019d**: Map zoom and pan controls MUST remain fully functional during filtering, with scroll wheel zoom enabled and zoom controls (+/-) visible. Tooltip overlays MUST use proper pointer-events layering to avoid blocking map interactions.
- **FR-020**: When multiple campuses exist for one institution, system MUST display a single marker at a representative location; clicking the marker or name button MUST present a campus selector modal with radio buttons allowing users to choose which campus to use for proximity filtering.
- **FR-020b**: Campus selector modal MUST implement a focus trap (Tab and Shift+Tab cycle within modal), support Escape key to close, and provide Apply/Cancel buttons with clear visual feedback.
- **FR-020c**: Campus selector modal MUST show each campus with its name, nearest station name, and distance from campus to nearest station (e.g., "South Kensington Campus - Nearest: South Kensington (0.1 mi)").
- **FR-021**: University markers MUST display the university name and the name of the nearest tube/DLR station in the tooltip to provide helpful context for users.
- **FR-022**: The distance radius control MUST default to 0.25 miles on initial page load, with max value of 10 miles to accommodate users willing to walk longer distances or use connecting transport.
- **FR-022b**: Filtered station markers (green circles) MUST be clickable to display station tooltip with station name and tube lines served. Background map clicks within 500 meters of a filtered station MUST also select that station using Haversine distance calculation.
- **FR-023**: When a user adjusts the radius slider, the system MUST debounce updates by 200ms and recalculate the filtered lines if a university is currently selected, with updates completing within 300 ms of the final slider position.
- **FR-023b**: The radius slider MUST be disabled (visually grayed out with cursor: not-allowed) when no university is selected, with a hint message "Select a university to adjust radius".
- **FR-024**: The campus selector modal MUST clearly list all campuses for a multi-campus university with their specific location names using radio buttons for single-selection (e.g., "Strand Campus", "Waterloo Campus").
- **FR-025**: After selecting a specific campus from the selector and clicking Apply, the system MUST filter lines based on that campus's exact coordinates and the current radius setting, close the modal, and zoom the map to the selected campus location.

### Key Entities

- **University**: Represents a higher education institution in London; attributes include official name, marker coordinates (latitude/longitude for map placement), campus list (for multi-campus institutions), and nearest station reference.
- **Campus**: Represents a specific campus location for multi-campus universities; attributes include campus name, exact coordinates, parent university reference, and nearest station calculation.
- **ProximityFilter**: Represents the automatic line selection state; attributes include selected university/campus ID, user-selected distance radius (0.25-1 mile), calculated nearby station IDs (within radius), derived line codes, and filter timestamp.
- **UniversityMarker**: Map overlay element representing a university; attributes include display position, icon styling (gold #FFD700 with thick blue stroke #0066cc 8px scale 20 when selected, TfL red #DC241F black stroke 2px scale 12 when not selected), tooltip content (name + nearest station), click interaction state, double-click handler for deselection, z-index (3000 when selected, 2000 otherwise), and multi-campus indicator flag.
- **UniversitySelector**: UI component displaying list of universities by name; attributes include university list (alphabetically sorted), selected university ID, click handlers, visual styling for selected state (blue background, border, text), and multi-campus badges showing campus count.
- **CampusSelector**: Modal dialog for campus selection; attributes include university name, campus list with radio buttons, selected campus ID, Apply/Cancel buttons, focus trap implementation, Escape key handler, and overlay click-to-close behavior.
- **RadiusControl**: UI component for distance adjustment; attributes include current radius value (0.25-10 miles with miles/kilometers toggle), slider position, default value (0.25 miles), debounce timer (200ms), disabled state when no university selected, change event handlers, live value display, and min/max labels.
- **TimeControl**: UI component for travel time adjustment; attributes include current time value (5-60 minutes), slider position, debounce timer (200ms), disabled state when no university selected, change event handlers, live value display, and min/max labels.
- **FilterModeToggle**: UI component for switching between radius and travel time modes; attributes include current mode ('radius' | 'time'), clickable slider containers with active/inactive visual states, keyboard support (Enter/Space), ARIA pressed states, and mode change handlers that clear previous mode's results.
- **StationTooltip**: Overlay component displaying station information; attributes include station name, tube lines served, position calculation via map projection, close button handler, pointer-events layering to avoid blocking zoom, and z-index (3000) above markers.
- **MapZoomAnimation**: Animation controller for smooth map transitions; attributes include from/to center coordinates, from/to zoom levels, easing function (cubic ease-in-out), duration (700ms), current animation frame, and cancellation handler.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of users successfully navigate from the main page to the university filter page via the navigation tab within 5 seconds of page load.
- **SC-002**: University marker clicks and name button clicks trigger line filtering, marker style updates, and map zoom animation completing within 700 ms on standard 3G connections across latest two major versions of mobile browsers.
- **SC-003**: Users can identify relevant transit lines for any university within two interactions (click university marker/name button, optionally select campus if multi-campus, view highlighted lines and zoomed map).
- **SC-004**: 95% of proximity calculations correctly identify all stations within the selected radius with no false negatives (missing nearby stations) across all radius settings (0.25, 0.5, 0.75, 1 mile).
- **SC-005**: Page maintains performance with 8 university markers displayed simultaneously and all university name buttons rendered without degrading map responsiveness (zoom, pan remain smooth at 60fps).
- **SC-006**: Accessibility audit scores maintain WCAG 2.1 AA compliance including keyboard navigation between university markers, university name buttons, radius slider control, campus selector modal with focus trap, and screen reader announcements for university selections, campus selections, and radius changes.
- **SC-007**: 85% of test users can successfully compare transit options between at least two universities within 45 seconds of viewing the page using either map markers or name buttons.
- **SC-008**: Radius slider adjustments (0.25-10 miles with miles/km toggle) trigger debounced line filter updates within 500 ms total (200ms debounce + 300ms calculation) when a university is selected, with smooth visual transitions, min/max labels visible, and disabled state when no selection exists. Travel time slider adjustments (5-60 minutes) follow the same performance characteristics.
- **SC-009**: Campus selector modal loads and displays within 200 ms of marker/button click, with all campuses listed clearly with radio buttons, nearest stations, distances, and functional focus trap (Tab/Shift+Tab cycling, Escape to close).
- **SC-010**: University deselection (via single-click same marker, double-click marker, or background map click) completes state reset within 300ms, clearing all filtered stations, removing overlays, resetting filter mode to 'radius', resetting sliders to minimum values, and restoring all markers to default styling.
- **SC-011**: Map zoom and pan interactions remain fully responsive (60fps smooth scrolling) during filtering, with scroll wheel zoom functional and tooltip overlays not blocking zoom controls. Zoom debug logging confirms zoom_changed and bounds_changed events fire correctly.
- **SC-012**: Filtered station (green circle) clicks and background clicks near filtered stations (within 500m using Haversine distance) successfully select the station and display tooltip with name and tube lines within 200ms.

## Assumptions

- London universities are defined as institutions with undergraduate or postgraduate programs located within Greater London boundaries, sourced from official higher education registers (e.g., HESA, UCAS).
- The distance radius is measured as straight-line distance (Euclidean), not walking distance, as an approximation of "reasonable walking distance" for students and visitors; updated default of 0.25 miles provides a tighter focus on immediately adjacent transit options while remaining adjustable up to 10 miles to accommodate various user preferences including those willing to use connecting transport.
- University marker coordinates represent a central or prominent location for each institution; for multi-campus universities, the marker is placed at a representative location (e.g., main administrative building or campus center).
- Multi-campus universities have a manageable number of campuses (typically 2-5); if an institution has more than 10 distinct locations, they may be grouped or filtered by geographic area.
- The nearest station calculation for each university/campus is pre-computed and stored in the data file to avoid real-time calculation overhead on initial page load.
- Users access this feature primarily for planning commutes or accommodation searches, so the focus is on proximity-based filtering rather than route planning or journey times.
- **Map implementation uses Leaflet/OpenStreetMap** instead of Google Maps for cost-free, open-source mapping with react-leaflet integration, TileLayer, CircleMarker, Circle, Polyline, and Popup components. Google Analytics 4 integrated site-wide via `<Analytics />` in `app/layout.tsx` and helper functions in `app/lib/analytics.ts` (requires `NEXT_PUBLIC_GA_ID`).
- **MultiLineString geometries** (e.g., Piccadilly line branches) are rendered as separate Polyline components per segment to avoid false visual connections between branches.
- University location data is relatively stable and updated quarterly or as needed when new institutions open, campuses relocate, or nearest station calculations change.
- The line filter control UI component from the main page can be reused with minor modifications to display auto-selected lines from university proximity.
- The radius slider UI is intuitive and accessible, with clear visual indication of the current distance setting (e.g., "0.50 mi" label next to slider), min/max value labels (0.25 mi to 10 mi), miles/kilometers toggle for international users, smooth interaction on both desktop and mobile devices, 200ms debounce to prevent excessive recalculation, and disabled state when no university selected.
- Travel time filtering (5-60 minutes) provides an alternative mode using pre-calculated journey times, with similar UI patterns including debouncing, disabled state management, and min/max labels, allowing users to find stations reachable within specified commute times via the tube network.
- The university name list provides an alternative selection method to map markers, particularly useful on mobile devices or for users who prefer text-based navigation over map interaction.
- The implementation reuses the existing LineFilter component for consistency, adding UniversitySelector, RadiusSlider, TimeSlider, FilterModeToggle, and CampusSelector as new components.
- **Mobile UX (≤640px)**: Line Filter page shows tube filter buttons above map with header hidden; Universities page hides tube line filter entirely as filtering is automatic based on university selection.
- Map zoom animations use cubic ease-in-out timing function over 700ms duration for smooth, natural-feeling transitions that don't cause motion sickness.
- University markers are rendered using Leaflet CircleMarker with conditional styling based on selection state (gold fill #FFD700, thick blue stroke #0066cc 4px weight, scale 14 when selected; orange fill #FFA500, black stroke 2px weight, scale 10 when unselected), updating dynamically via useEffect hooks. Selection persists regardless of cursor position until explicitly deselected.
- Deselection can occur via single-click on selected marker, double-click on marker (with debounce to prevent rapid toggle), or clicking empty map space (with 150ms debounce to distinguish from marker clicks), all triggering complete state reset including filter clearing and overlay removal.
- Map controls (scroll wheel zoom, zoom buttons, pan) remain fully functional during filtering with proper tooltip overlay pointer-events layering (pointerEvents: 'none' on container, 'auto' only on tooltip content) to prevent blocking interactions.
- Filtered station markers (blue circles with scale 6 for standard stations) are clickable via Leaflet Popup to display station tooltip with actual tube line colors (using brandColor from line data); background map clicks are not implemented for station selection in Leaflet version.
- Debug logging is enabled for university selection, deselection, station selection, and zoom events to facilitate monitoring and troubleshooting in production, with console logs using structured format (e.g., [StationSelectDebug], [MapZoomDebug]).
- The system stores 8 universities in universities.json (UCL, Imperial, LSE, King's, QMUL, City, SOAS, Westminster) with 11 total campuses, including pre-calculated nearest station data to optimize initial load performance.
- Campus selector modal implements proper modal accessibility patterns including focus trap, ARIA attributes (role="dialog", aria-modal="true"), and keyboard navigation (Tab/Shift+Tab cycling, Escape to close, Enter to apply).
- Screen reader announcements use ARIA live regions to communicate university selection ("Selected UCL, showing 3 nearby lines within 0.25 miles" when at default), campus selection, radius changes, and deselection events.

