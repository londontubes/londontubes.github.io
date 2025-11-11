# Implementation Tasks: University Transit Filter

**Feature**: `002-university-transit-filter`  
**Generated**: 2025-11-09  
**Related**: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md)

## Task Overview

**Total Tasks**: 47  
**Organized by**: User Story Priority (P1 → P4 → Polish)  
**Parallel Opportunities**: 18 tasks marked with [P]  
**MVP Scope**: Phase 3 (User Story 1) - 8 tasks

### Task Count by Phase

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 8 tasks
- **Phase 3 (US1)**: 8 tasks
- **Phase 4 (US2)**: 10 tasks
- **Phase 5 (US3)**: 7 tasks
- **Phase 6 (US4)**: 3 tasks
- **Phase 7 (Polish)**: 5 tasks

### Task Format Legend

- `- [ ]` = Checkbox (incomplete)
- `T###` = Task ID (sequential)
- `[P]` = Parallelizable (can run alongside other [P] tasks)
- `[US#]` = User Story number from spec.md
- File paths = Exact location for implementation

---

## Phase 1: Project Setup

**Goal**: Initialize project structure and prepare development environment

**Tasks**:

- [x] T001 Verify existing project structure matches plan.md expectations in app/, lib/, public/, tests/
- [x] T002 [P] Create universities data directory at public/data/ (verify lines.json and stations.json exist)
- [x] T003 [P] Create university components directory structure at app/components/NavigationTabs/, app/components/RadiusSlider/, app/components/CampusSelector/, app/components/UniversityMarker/
- [x] T004 [P] Create university utilities directory at lib/map/ (verify overlays.ts exists) and lib/data/ (verify load-static-data.ts exists)
- [x] T005 [P] Create test directories at tests/e2e/, tests/accessibility/, tests/unit/ (verify existing test structure)
- [x] T006 Install any additional TypeScript type dependencies for Google Maps markers and GeoJSON (verify @googlemaps/js-api-loader exists)

**Dependencies**: None (start here)

**Parallel Execution**: T002-T005 can all run simultaneously

---

## Phase 2: Foundational Infrastructure

**Goal**: Build blocking prerequisites needed by all user stories

**Tasks**:

- [x] T007 Implement Haversine distance calculation function in lib/map/proximity.ts (calculateDistance with Earth radius constant 3958.8 miles)
- [x] T008 Implement findNearbyStations function in lib/map/proximity.ts (filters stations within radius using Haversine)
- [x] T009 Implement deriveLineCodes function in lib/map/proximity.ts (maps station IDs to line codes from lines.json)
- [x] T010 [P] Create unit tests for proximity calculations in tests/unit/proximity.test.ts (test edge cases: 0 miles, exact radius, > 5 miles)
- [x] T011 [P] Create universities.json data file structure in public/data/universities.json (GeoJSON FeatureCollection with version 1.0.0, empty features array)
- [x] T012 [P] Add 5-10 sample London universities to universities.json (UCL, Imperial, LSE, King's College, Queen Mary) with single-campus data
- [x] T013 [P] Calculate nearest stations for sample universities using proximity functions (pre-compute nearestStation field for each campus)
- [x] T014 Validate universities.json schema matches data-model.md (check required fields, coordinate bounds, station ID references)

**Dependencies**: T001-T006 complete

**Parallel Execution**: T010-T013 can run after T007-T009 complete

**Test Criteria**: 
- Distance calculations accurate within 0.01 miles for known coordinates
- Sample universities load without errors
- All station IDs reference valid entries in stations.json

---

## Phase 3: User Story 1 - Navigate to University View (P1)

**Goal**: Users access a dedicated "Universities Filter" page via top navigation tab, where they see an interactive map displaying all London universities as markers overlaid on the full Underground and DLR network.

**Independent Test**: Click the "Universities Filter" navigation tab and verify the page loads showing the complete tube/DLR network with university markers visible.

**Tasks**:

- [x] T015 [P] [US1] Create NavigationTabs component in app/components/NavigationTabs/NavigationTabs.tsx (horizontal tabs: "Line Filter" | "Universities Filter")
- [x] T016 [P] [US1] Style NavigationTabs component in app/components/NavigationTabs/NavigationTabs.module.css (active state, hover, responsive layout)
- [x] T017 [P] [US1] Add NavigationTabs to app/layout.tsx (render above {children}, use Next.js Link for routing)
- [x] T018 [US1] Create universities page at app/universities/page.tsx (Next.js App Router page component)
- [x] T019 [US1] Load universities.json data in app/universities/page.tsx (fetch from public/data/, parse GeoJSON, validate schema)
- [x] T020 [US1] Pass transit data (lines, stations) to universities page (reuse existing data loading from app/page.tsx)
- [x] T021 [US1] Extend MapCanvas component in app/components/MapCanvas/ to accept universities prop (add universitiesMode boolean, universities?: UniversitiesDataset)
- [x] T022 [US1] Render university markers on MapCanvas when in universities mode (use google.maps.Marker with custom icon)

**Dependencies**: T007-T014 complete

**Parallel Execution**: T015-T017 can run simultaneously; T021-T022 after T018-T020

**Test Criteria**:
- Navigation tab switches between pages without page refresh (Next.js client-side routing)
- Universities page shows all tube/DLR lines plus university markers
- Page loads within 3 seconds on 3G connection
- University markers are visually distinct from station markers

---

## Phase 4: User Story 2 - Discover Nearby Transit Lines (P2)

**Goal**: Users click a university marker on the map and the system automatically highlights and selects only the tube and DLR lines within the current radius setting (default 0.25 miles) of that university, hiding other lines to provide focused transit options.

**Independent Test**: Click any university marker and verify that only lines within the set radius are highlighted, with all stations on those lines displayed, while distant lines are hidden or de-emphasized.

**Tasks**:

- [ ] T023 [P] [US2] Create UniversityMarker component in app/components/UniversityMarker/UniversityMarker.tsx (renders Google Maps marker with click handler)
- [ ] T024 [P] [US2] Design university marker SVG icon in public/images/icons/university-marker.svg (graduation cap or building icon, 32x32px, scalable)
- [ ] T025 [P] [US2] Create CampusSelector modal component in app/components/CampusSelector/CampusSelector.tsx (dialog with radio button list, "Apply" and "Cancel" buttons)
- [ ] T026 [P] [US2] Style CampusSelector modal in app/components/CampusSelector/CampusSelector.module.css (centered overlay, mobile-responsive, focus trap)
- [ ] T027 [US2] Implement university marker click handler in app/universities/page.tsx (check isMultiCampus, show CampusSelector if needed, calculate proximity)
- [ ] T028 [US2] Implement ProximityFilter state management in app/universities/page.tsx (useState for selected university, campus, radius, nearby stations, filtered lines)
- [ ] T029 [US2] Calculate nearby stations on university selection using lib/map/proximity.ts functions (call findNearbyStations with current radius; initial default now 0.25 miles)
- [ ] T030 [US2] Derive filtered line codes from nearby stations using deriveLineCodes function in lib/map/proximity.ts
- [ ] T031 [US2] Update MapCanvas to highlight only filtered lines in app/components/MapCanvas/ (dim or hide non-selected lines, keep filtered lines at full opacity)
- [ ] T032 [US2] Display university tooltip on marker hover showing university name and nearest station in app/components/UniversityMarker/

**Dependencies**: T015-T022 complete

**Parallel Execution**: T023-T026 can run simultaneously

**Test Criteria**:
- Clicking single-campus university filters lines within 500ms
- Multi-campus universities show campus selector before filtering
- Only lines within the current radius (initial default 0.25 miles) are highlighted
- Tooltip shows university name + nearest station
- Clicking same marker again deselects and shows all lines

---

## Phase 5: User Story 3 - Adjust Distance Radius (P3)

**Goal**: Users can adjust the distance radius using a slider control (0.25 to 1 mile) to customize how far from a university they're willing to walk, with the filtered lines updating dynamically based on the new radius.

**Independent Test**: Select a university, then adjust the radius slider and verify the filtered lines update to reflect stations within the new distance threshold.

**Tasks**:

- [ ] T033 [P] [US3] Create RadiusSlider component in app/components/RadiusSlider/RadiusSlider.tsx (HTML5 range input, min=0.25, max=1, step=0.05, default=0.25)
- [ ] T034 [P] [US3] Style RadiusSlider component in app/components/RadiusSlider/RadiusSlider.module.css (thumb styling, track fill, value label display)
- [ ] T035 [P] [US3] Add ARIA labels to RadiusSlider in app/components/RadiusSlider/RadiusSlider.tsx (aria-label="Distance radius in miles", aria-valuetext with current value)
- [ ] T036 [US3] Implement debounced onChange handler in app/components/RadiusSlider/RadiusSlider.tsx (200ms debounce using useMemo or useCallback)
- [ ] T037 [US3] Add RadiusSlider to universities page layout in app/universities/page.tsx (position near map controls, disabled when no university selected)
- [ ] T038 [US3] Implement radius change handler in app/universities/page.tsx (update ProximityFilter state, recalculate nearby stations, update filtered lines)
- [ ] T039 [US3] Display "No stations within X miles" message when proximity filter returns empty results in app/universities/page.tsx (conditional rendering near map)

**Dependencies**: T023-T032 complete

**Parallel Execution**: T033-T035 can run simultaneously

**Test Criteria**:
- Slider adjusts from 0.25 to 1 mile in 0.05 increments
- Radius changes update filtered lines within 300ms
- Slider disabled when no university selected
- Empty results show appropriate message

---

## Phase 6: User Story 4 - Compare Transit Options Between Universities (P4)

**Goal**: Users can click different university markers sequentially to compare which transit lines serve different campuses, helping with accommodation or campus choice decisions.

**Independent Test**: Click multiple university markers in succession and verify the line filter updates each time to reflect the proximity-based selection for each university.

**Tasks**:

- [ ] T040 [US4] Implement university deselection logic in app/universities/page.tsx (clicking different marker clears previous selection, updates ProximityFilter)
- [ ] T041 [US4] Add visual indication of currently selected university in app/components/UniversityMarker/ (different icon size or color when selected)
- [ ] T042 [US4] Ensure radius setting persists across university selections in app/universities/page.tsx (maintain radiusMiles state when switching universities)

**Dependencies**: T033-T039 complete

**Parallel Execution**: T040-T042 can run in sequence (tight coupling)

**Test Criteria**:
- Clicking different universities updates filter within 500ms
- Previous university deselects automatically
- Radius setting applies to all university selections
- Selected university marker visually distinct from unselected

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Finalize accessibility, error handling, performance, and documentation

**Tasks**:

- [ ] T043 [P] Add screen reader announcements for university selections in lib/a11y.ts (ARIA live region updates: "Selected [University Name], showing [N] nearby lines")
- [ ] T044 [P] Add screen reader announcements for radius changes in lib/a11y.ts (ARIA live region: "Radius adjusted to [X] miles, [N] lines within range")
- [ ] T045 [P] Implement graceful error handling for universities.json load failure in app/universities/page.tsx (try-catch, display error message, maintain navigation)
- [ ] T046 [P] Add loading states for university page in app/universities/page.tsx (skeleton loader for map, spinner for university markers)
- [ ] T047 Update README.md or docs/ with university filter feature documentation (user guide, data refresh process, troubleshooting)

**Dependencies**: T015-T042 complete

**Parallel Execution**: T043-T046 can all run simultaneously

**Test Criteria**:
- Screen reader announces university selections and radius changes
- Error scenarios don't break navigation
- Loading states visible on slow connections
- Documentation complete and accurate

---

## Testing Tasks (Run After Implementation)

**Note**: Tests are included for completeness but not marked with task IDs since they're validation rather than implementation.

### E2E Tests

- Create university-filter.spec.ts at tests/e2e/university-filter.spec.ts
  - Test: Navigate to universities page via tab
  - Test: Click university marker, verify line filtering
  - Test: Adjust radius slider, verify filter updates
  - Test: Click multiple universities, verify switching
  - Test: Multi-campus university shows campus selector

### Accessibility Tests

- Create university-axe.spec.ts at tests/accessibility/university-axe.spec.ts
  - Test: NavigationTabs keyboard navigation (Tab, Enter, Arrow keys)
  - Test: RadiusSlider keyboard control (Arrow keys, Home, End)
  - Test: CampusSelector focus trap and Escape key
  - Test: Screen reader announces university selections
  - Test: Color contrast meets WCAG 2.1 AA

### Unit Tests

- Create campus-selector.test.tsx at tests/unit/campus-selector.test.tsx
  - Test: Renders campus list correctly
  - Test: Selection updates on radio button change
  - Test: Apply button triggers onSelect callback
  - Test: Cancel button closes modal without selection
  - Test: Escape key closes modal

### Performance Tests

- Extend existing Lighthouse CI configuration
  - Test: Universities page First Contentful Paint < 2s on 3G
  - Test: University marker click → filter update < 500ms
  - Test: Radius slider adjustment → update < 300ms
  - Test: Page maintains 60fps during map interactions

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Order)

1. **Phase 1 (Setup)** → **Phase 2 (Foundational)** → **Phase 3 (US1)** → **Phase 4 (US2)** → **Phase 5 (US3)** → **Phase 6 (US4)** → **Phase 7 (Polish)**

### User Story Dependencies

- **US1** (Navigate): No dependencies (can start after Foundational)
- **US2** (Discover): Depends on US1 (needs page and markers)
- **US3** (Adjust Radius): Depends on US2 (needs proximity filtering)
- **US4** (Compare): Depends on US3 (needs complete filtering logic)

### Parallel Work Opportunities

**During Phase 2 (Foundational)**:
- While T007-T009 (proximity functions) are being written:
  - Create test files (T010)
  - Create data file structure (T011)
  - Add sample universities (T012)
  - Calculate nearest stations (T013)

**During Phase 3 (US1)**:
- Create NavigationTabs (T015), style it (T016), and add to layout (T017) simultaneously
- Extend MapCanvas (T021) and render markers (T022) can overlap if coordinated

**During Phase 4 (US2)**:
- Create all UI components simultaneously: UniversityMarker (T023), SVG icon (T024), CampusSelector (T025), style modal (T026)

**During Phase 5 (US3)**:
- Create RadiusSlider (T033), style it (T034), and add ARIA (T035) simultaneously

**During Phase 7 (Polish)**:
- All polish tasks (T043-T046) can run in parallel

---

## Implementation Strategy

### MVP Scope (Minimal Viable Product)

**Recommended MVP**: Complete through **Phase 3 (User Story 1)** only

**Rationale**: 
- Provides core navigation and visualization (tab navigation, university markers on map)
- Establishes infrastructure for remaining features
- Delivers user value (can see university locations on transit map)
- Testable independently (navigation and display work without filtering)

**MVP Tasks**: T001-T022 (28 tasks)

**Post-MVP**: Add filtering (US2), radius adjustment (US3), comparison (US4), and polish incrementally

### Incremental Delivery

**Sprint 1** (Setup + Foundational): T001-T014
- Deliverable: Proximity calculations working, sample data ready

**Sprint 2** (US1 - Navigation): T015-T022
- Deliverable: Universities page accessible via tab, markers visible on map

**Sprint 3** (US2 - Filtering): T023-T032
- Deliverable: Click university → see nearby lines

**Sprint 4** (US3 - Radius): T033-T039
- Deliverable: Adjust radius → filter updates

**Sprint 5** (US4 + Polish): T040-T047
- Deliverable: Feature complete, polished, documented

### Risk Mitigation

**High-Risk Tasks**:
- T007-T009 (Proximity calculations): Core algorithm, must be accurate
- T021-T022 (MapCanvas extension): Integration with existing complex component
- T029-T031 (Filtering logic): Performance-critical path

**Mitigation**:
- Write unit tests (T010) immediately after proximity functions
- Test MapCanvas extension with small dataset before full university list
- Profile proximity calculations to ensure < 5ms performance target

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 47 tasks completed
- [ ] All user stories testable independently
- [ ] Navigation tabs work on desktop and mobile
- [ ] University markers load within 3 seconds on 3G
- [ ] Proximity filtering completes within 500ms
- [ ] Radius slider updates within 300ms
- [ ] Multi-campus selector appears and functions correctly
- [ ] Screen reader announces all interactions
- [ ] Keyboard navigation works for all controls
- [ ] Error scenarios handled gracefully
- [ ] universities.json data complete (50+ universities)
- [ ] Documentation updated
- [ ] Lighthouse CI passes (performance, accessibility, best practices)
- [ ] E2E tests pass
- [ ] Accessibility audit passes (WCAG 2.1 AA)

---

## Notes

- **Task IDs**: Sequential (T001-T047) for easy reference and progress tracking
- **[P] Markers**: 18 tasks marked parallelizable based on file independence
- **[US#] Labels**: 28 tasks labeled with user story numbers for traceability
- **File Paths**: Every task includes exact file location for implementation
- **Test Independence**: Each user story has independent test criteria
- **Iterative Approach**: MVP-first strategy allows early validation and feedback

**Ready to begin implementation!** Start with Phase 1 (Setup) and proceed sequentially through phases while leveraging parallel opportunities within each phase.
