# Tasks: Bus Filter Page

**Input**: Design documents from `/specs/003-bus-filter-page/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Include validation, unit, and end-to-end coverage for the new static bus pipeline and core user journeys.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story mapping: `US1`, `US2`, `US3`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the planning and code scaffolding for the bus feature.

- [ ] T001 Create implementation scaffolding for `app/bus/`, `app/components/BusExperience/`, `app/components/BusRouteFilter/`, and supporting loader/types files.
- [ ] T002 Create bus data contracts in `specs/003-bus-filter-page/contracts/` and add JSON Schemas for `public/data/buses.json` and `public/data/bus-stops.json`.
- [ ] T003 [P] Add placeholder static datasets in `public/data/buses.json` and `public/data/bus-stops.json` so validation can pass before the first live refresh.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the static data pipeline and shared loading primitives before user-facing work starts.

**⚠️ CRITICAL**: No user story work should ship before this phase is complete.

- [ ] T004 Extend `scripts/data/fetch-tfl.ts` to fetch bus lines and cache bus route-sequence payloads.
- [ ] T005 Extend `scripts/data/transform.ts` to generate `public/data/buses.json` and `public/data/bus-stops.json` from cached bus payloads.
- [ ] T006 Extend `scripts/data/validate.ts` to validate bus output against `specs/003-bus-filter-page/contracts/buses.schema.json` and `specs/003-bus-filter-page/contracts/bus-stops.schema.json`.
- [ ] T007 Extend `app/types/transit.ts` and `app/lib/data/load-static-data.ts` with shared bus route, bus stop, and bus dataset loader types.

**Checkpoint**: Static bus data can be fetched, transformed, validated, and loaded by the app.

---

## Phase 3: User Story 1 - Browse and filter London bus routes on a dedicated page (Priority: P1) 🎯 MVP

**Goal**: Deliver a working `/bus` page with route rendering and route filtering.

**Independent Test**: Open `/bus`, confirm routes render from static data, and verify filter toggles update visible routes without affecting the homepage or universities page.

### Tests for User Story 1

- [ ] T008 [P] [US1] Add a unit test for the bus data loader in `tests/unit/busDataLoader.test.ts`.
- [ ] T009 [P] [US1] Add an end-to-end smoke test for `/bus` navigation and route filtering in `tests/e2e/bus-filter.spec.ts`.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Add the Bus Filter tab to `app/components/NavigationTabs/NavigationTabs.tsx` and update `app/components/NavigationTabs/NavigationTabs.module.css` for desktop/mobile layout.
- [ ] T011 [P] [US1] Create the bus page entry in `app/bus/page.tsx` with metadata and static bus-data loading.
- [ ] T012 [P] [US1] Implement `app/components/BusRouteFilter/BusRouteFilter.tsx` using the existing filter interaction pattern.
- [ ] T013 [P] [US1] Implement `app/components/BusExperience/BusMapCanvas.tsx` for route rendering and route selection.
- [ ] T014 [US1] Implement `app/components/BusExperience/BusExperience.tsx` to connect the filter, map, and summary state.
- [ ] T015 [US1] Add any supporting shared styling in `app/globals.css` required for the bus experience.

**Checkpoint**: `/bus` is usable as an MVP.

---

## Phase 4: User Story 2 - Inspect route and stop context without overwhelming the map (Priority: P2)

**Goal**: Add density-aware stop rendering and stop context for filtered routes.

**Independent Test**: Select a route, zoom in, and verify stops appear only when the zoom/detail threshold is reached.

### Tests for User Story 2

- [ ] T016 [P] [US2] Add a unit test for viewport or stop-density logic in `tests/unit/busViewport.test.ts`.

### Implementation for User Story 2

- [ ] T017 [P] [US2] Add viewport threshold helpers in `app/lib/map/busViewport.ts`.
- [ ] T018 [US2] Extend `app/components/BusExperience/BusMapCanvas.tsx` with zoom-aware stop rendering and stop selection.
- [ ] T019 [US2] Extend `app/components/BusExperience/BusExperience.tsx` with selected-route and selected-stop context.

**Checkpoint**: Bus route context and stop detail work without overwhelming the map.

---

## Phase 5: User Story 3 - Move between tube, university, and bus experiences consistently (Priority: P3)

**Goal**: Ensure the new bus experience fits the existing top-level information architecture.

**Independent Test**: Switch between `/`, `/universities/`, and `/bus/` on desktop and mobile and confirm active tab state and layout remain correct.

### Implementation for User Story 3

- [ ] T020 [US3] Review `app/layout.tsx`, route metadata, and any discoverability surfaces so the bus page is integrated consistently with the existing site structure.
- [ ] T021 [US3] Update sitemap or other top-level navigation metadata if required by the final implementation scope.

**Checkpoint**: Navigation consistency work is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the feature end-to-end and tighten performance.

- [ ] T022 [P] Run `npm run lint` and fix implementation issues.
- [ ] T023 [P] Run `npm run data:validate` against placeholder or refreshed bus outputs.
- [ ] T024 [P] Refresh TfL data with `npm run data:refresh` and inspect generated bus files.
- [ ] T025 Run `npm run build` and confirm the bus page stays within the existing static-site build flow.
- [ ] T026 Perform manual mobile QA for `/bus` and navigation tab overflow behavior.

## Dependencies & Execution Order

- Phase 1 must complete before foundational pipeline work is finalized.
- Phase 2 blocks all user-facing work because the app needs a stable bus dataset contract and loader.
- `US1` can ship once Phases 1 and 2 are complete.
- `US2` depends on `US1` route rendering being present.
- `US3` can be finalized after `US1`, though the tab entry itself is required during MVP work.

## Parallel Opportunities

- `T002` and `T003` can run in parallel.
- `T004`, `T005`, and `T006` can be split across contributors after the data shapes are agreed.
- `T010`, `T011`, `T012`, and `T013` can proceed in parallel once the bus loader is available.
- Validation tasks in Phase 6 can run independently once implementation is complete.