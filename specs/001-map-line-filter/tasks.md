# Tasks: London Tube Map Line Filter

**Input**: plan.md, spec.md, research.md, data-model.md, contracts/
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure (excluding any test harness work)

- [x] T001 Configure `app/` App Router scaffolding and baseline layout/page files per plan tree
- [x] T002 Install and verify essential runtime dependencies (`@googlemaps/js-api-loader`) with lockfile update (removed test/audit deps)
- [x] T003 [P] Add lint + data scripts in `package.json` (`npm run data:refresh`) (removed test/audit scripts)
- [x] T004 [P] Commit sample GeoJSON (`public/data/lines.geojson`, `public/data/stations.geojson`, `public/data/metadata.json`) sourced from research scripts for local dev

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T100 Implement `scripts/data/fetch-tfl.ts` to download and cache TfL RouteSequence + GeoJSON assets
- [x] T101 Transform raw exports into normalized GeoJSON using `scripts/data/transform.ts`, enforcing schema alignment with `contracts/`
- [x] T102 Add schema validation step (`npm run data:validate`) using Ajv against `contracts/*.schema.json`
- [x] T103 [P] Build `app/lib/map/google-loader.ts` wrapper to lazy-load Google Maps via `@googlemaps/js-api-loader`
- [x] T104 [P] Create accessibility utilities (`app/lib/a11y/`) supplying focus management and aria labels for map markers
- [x] T105 (removed) Playwright baseline project – not required per updated directive
- [x] T106 (removed) Lighthouse / accessibility audit script – not required per updated directive

**Checkpoint**: Foundational processing & validation complete (test harness work intentionally excluded)

---

## Phase 3: User Story 1 - View Full Network (Priority: P1) 🎯 MVP

**Goal**: Render all Underground + DLR lines with all stations on initial load to provide comprehensive baseline context

<!-- Independent test removed: no testing tasks required -->

**Status**: ✅ Core implementation complete (2025-11-08)

### Implementation for User Story 1

- [x] T202 Build `app/components/MapCanvas/MapCanvas.tsx` supporting keyboard navigation and map initialization state
- [x] T203 Implement `app/components/StationTooltip/StationTooltip.tsx` with accessible descriptions and focus trapping
- [x] T204 Wire `app/page.tsx` to fetch static GeoJSON, render `MapCanvas`, and expose data timestamp banner
- [x] T205 Add fallback static image + notice when Google Maps script fails per FR-010
- [x] T206 Update sitemap metadata (title, description, Open Graph) to reflect map availability
- [x] T207 (superseded) Previous Northern-only default replaced by full network (empty `activeLineCodes` => show all)

**Checkpoint**: Homepage shows full network (all lines & stations) with accessible markers (filter UI pending)

---

## Phase 4: User Story 2 - Filter By Individual Line (Priority: P2)

**Goal**: Allow users to isolate a single line and its stations with responsive feedback

### Implementation for User Story 2

- [ ] T302 Create `app/components/LineFilter/LineFilter.tsx` with accessible listbox/checkbox UX and legend display
- [ ] T303 Integrate filter state into `MapCanvas` overlays, hiding non-selected lines within 500 ms target
- [ ] T304 Surface filter reset control + explanatory copy for no-selection edge case
- [ ] T305 Log filter interactions to analytics stub complying with privacy rules
- [ ] T306 Provide line legend component with color swatches + total station count per active line
- [ ] T307 Add ARIA live region announcing filter changes (e.g., "Victoria line now visible: 16 stations")

**Checkpoint**: Single-line filtering operational with measurable response times and observability hooks

---

## Phase 5: User Story 3 - Combine Multiple Lines (Priority: P3)

**Goal**: Enable selection of multiple lines simultaneously and highlight interchange clarity

<!-- Independent test removed: no testing tasks required -->


### Implementation for User Story 3

- [ ] T402 Enhance filter component to support multi-select UI patterns with proper keyboard shortcuts
- [ ] T403 Update map overlays to merge polylines and markers without color conflicts, including interchange emphasis
- [ ] T404 Render alternative textual station list filtered by active lines for screen reader parity
- [ ] T405 Track analytics events for multi-line combinations to support future optimization
- [ ] T406 Compute dynamic bounds across all selected line segments (branches included) without excessive zooming
- [ ] T407 Add interchange badge styling (e.g., thicker marker stroke) when >1 active line serves station
- [ ] T408 Aggregate tooltip to list all active lines serving selected station when multi-select is used
- [ ] T409 Performance guard: skip polyline reconstruction if selection set unchanged (idempotent update)

**Checkpoint**: Multi-line planning experience validated and inclusive for non-map users

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T501 Optimize bundle (code-splitting, tree shaking) to maintain < 1.5 MB initial payload
- [ ] T502 [P] Document data refresh runbook in `docs/data-refresh.md`
- [ ] T503 [P] Update README quickstart section with deployment verification checklist
- [ ] T504 Finalize changelog entry and version tag for static artifact release
- [ ] T505 Conduct quarterly governance checklist entry ensuring principle compliance
- [ ] T506 Add simple data freshness banner logic (red if >7 days)
- [ ] T507 Implement client-side caching of line/station JSON (etag compare) to reduce reload payload
- [ ] T508 Verify static export (`next export`) includes data files and document any manual post-processing

---

## Phase 7: Branch & Geometry Enhancements

**Goal**: Improve visual clarity and maintainability for branched lines now that MultiLineString is implemented.

- [ ] T601 Slight opacity variation for branch segments (primary segment 1.0, secondary 0.85)
- [ ] T602 Console diagnostic grouping for skipped/errored lineStrings during transform
- [ ] T603 Optional curve smoothing evaluation (document decision; keep raw if performance impact too high)
- [ ] T604 Add developer README section explaining MultiLineString support & fallback logic
- [ ] T605 Implement quick continuity check (ensure successive coords aren’t >5km apart unless branch break)

**Checkpoint**: Branch visualization is consistent, documented, and monitored for data integrity.

---

## Phase 8: Release & Deployment

**Goal**: Prepare production-ready artifact and governance-compliant release notes.

- [ ] T701 Version bump in `package.json` and generate CHANGELOG section summarizing map + branch features
- [ ] T702 Generate asset checksums (SHA256) for data files: lines.json, stations.json, metadata.json
- [ ] T703 Add deployment README subsection with environment variable list & static export steps
- [ ] T704 Tag git release `v0.1.0-network-full` (or next) with annotated message
- [ ] T705 Post-release validation checklist (load map, verify filter UI, console clean of errors)
- [ ] T706 Archive previous Northern-only spec note in docs/history.md

**Checkpoint**: Release tagged with documented artifacts, integrity verified, and environment guidance published.

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 precedes Phase 2; Partial completion blocks data pipeline
- Phase 2 completion is mandatory before any user story work begins
- User stories run sequentially by priority but may have parallelizable tasks marked [P]
- Phase 6 occurs after desired stories are complete

### Parallel Opportunities

- Tasks marked [P] may run in parallel when touching independent files
- Data refresh script development (T100-T102) can run alongside map loader utilities (T103-T104)

<!-- All test-related parallelization notes removed per directive to exclude testing tasks -->
