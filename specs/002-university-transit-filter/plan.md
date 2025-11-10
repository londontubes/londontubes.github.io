# Implementation Plan: University Transit Filter

**Branch**: `002-university-transit-filter` | **Date**: 2025-11-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-university-transit-filter/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a new "Universities Filter" page to the existing London Tube map application that displays all London universities as clickable markers on an interactive Google Maps canvas. When users click a university marker, the system automatically filters and highlights only the tube and DLR lines within a user-adjustable radius (0.25-1 mile, default 0.5 miles). Multi-campus universities present a campus selector before filtering. The page reuses existing map infrastructure while introducing navigation tabs, university data layer, proximity calculation logic, radius adjustment controls, and campus selection UI to help students and visitors identify convenient transit options for reaching universities.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js static export  
**Primary Dependencies**: Next.js App Router, React 19, `@googlemaps/js-api-loader`, Transport for London Unified API GeoJSON exports for lines and stations, university location dataset (JSON)  
**Storage**: N/A (static data files bundled at build time - reuses existing lines.json, stations.json; adds universities.json)  
**Testing**: Playwright E2E suite (extend existing tests), Lighthouse CI for performance/accessibility, Jest + React Testing Library for component behavior  
**Target Platform**: Modern desktop and mobile browsers (Chrome, Safari, Edge) with responsive layouts down to 320px  
**Project Type**: Web (static site) - extends existing single-page application  
**Performance Goals**: Navigation tab switch < 200 ms; university marker click → line filter update < 500 ms; radius slider adjustment < 300 ms; First Contentful Paint < 2 s on throttled 3G  
**Constraints**: Must remain fully static (no server runtime), Google Maps JS API reused from existing implementation, university dataset refreshed quarterly with visible timestamp, total payload increase < 100 KB (universities data + new components)  
**Scale/Scope**: Add second page to existing app with navigation tabs; ~50-100 London universities with 2-5 campuses each for multi-campus institutions; proximity calculations for ~450 stations per university selection; reuses existing 12 Underground lines + DLR infrastructure

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Static-First Delivery**: Plan extends existing Next.js static export; university data stored as static JSON file; no server runtime introduced; Google Maps API reused. ✅
- **Accessible Content as Default**: Commitments to Lighthouse audits, keyboard-accessible navigation tabs, campus selector, radius slider with ARIA labels, and screen reader announcements for university selections ensure WCAG 2.1 AA coverage. ✅
- **Mobile-Responsive Layouts**: Mobile-first UI with performance budgets (< 500 ms interactions, < 100 KB payload increase); radius slider and campus selector designed for touch; existing responsive framework reused. ✅
- **Baseline Standards**: University data structured as GeoJSON-compatible format; HTTPS-only deployment via existing static hosting; metadata includes data refresh timestamp. ✅
- **Workflow Expectations**: PR reviews include constitution checklist; builds produce immutable artifacts; quarterly university data refresh scheduled in ops docs. ✅

Gate outcome: PASS (no violations identified; feature extends existing infrastructure without introducing new complexity).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── layout.tsx (update with navigation tabs)
├── page.tsx (existing line filter page)
├── universities/
│   └── page.tsx (new university filter page)
├── components/
│   ├── MapCanvas/ (reuse with extensions for university markers)
│   ├── LineFilter/ (reuse)
│   ├── StationTooltip/ (reuse)
│   ├── NavigationTabs/ (new)
│   ├── UniversityMarker/ (new)
│   ├── RadiusSlider/ (new)
│   └── CampusSelector/ (new)
├── lib/
│   ├── data/
│   │   ├── fetch-tfl.ts (existing)
│   │   ├── transform.ts (existing)
│   │   ├── fetch-universities.ts (new)
│   │   └── load-static-data.ts (extend for universities)
│   ├── map/
│   │   ├── overlays.ts (extend for university markers)
│   │   └── proximity.ts (new - distance calculations)
│   └── a11y.ts (extend for university announcements)
public/
├── data/
│   ├── lines.json (existing)
│   ├── stations.json (existing)
│   └── universities.json (new)
└── images/
    └── icons/
        └── university-marker.svg (new)
tests/
├── e2e/
│   ├── map-filter.spec.ts (existing)
│   └── university-filter.spec.ts (new)
├── accessibility/
│   ├── map-axe.spec.ts (existing)
│   └── university-axe.spec.ts (new)
└── unit/
    ├── line-filter.test.tsx (existing)
    ├── proximity.test.ts (new)
    └── campus-selector.test.tsx (new)
```

**Structure Decision**: Extends existing Next.js App Router project with new `/universities` route and supporting components. Reuses existing map infrastructure (MapCanvas, LineFilter, map utilities) while adding university-specific components (markers, campus selector, radius slider) and proximity calculation logic. All university data co-located in `public/data/` alongside existing transit data for consistent static export.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. Feature extends existing single-project architecture without introducing additional complexity or deviating from constitutional principles.

## Constitution Re-Check (Post Design)

- **Static-First Delivery**: Data model outputs university GeoJSON cached in repo; proximity calculations performed client-side; no runtime services introduced. ✅
- **Accessible Content as Default**: Contracts enforce ARIA labels for all new interactive elements (tabs, slider, campus selector); quickstart mandates Lighthouse audits including new page. ✅
- **Mobile-Responsive Layouts**: Quickstart and testing strategy include mobile emulation for radius slider touch interactions and campus selector UI; performance budgets maintained. ✅

Outcome: PASS — design artifacts uphold all constitutional principles.

---

## Phase 1 Completion Report

**Status**: ✅ COMPLETE  
**Date**: 2025-11-09

### Artifacts Generated

All Phase 1 deliverables have been created:

1. **Data Model** (`data-model.md`) - 600+ lines
   - 8 entity definitions with field tables and validation rules
   - State transition diagrams for ProximityFilter
   - GeoJSON schema examples
   - TypeScript interface definitions
   - Data versioning strategy

2. **Contracts** (`contracts/` directory) - 5 files
   - `university-data.ts`: University/Campus/NearestStation interfaces
   - `proximity-state.ts`: Runtime state interfaces (ProximityFilter, UI controls)
   - `component-props.ts`: React component prop interfaces
   - `transit-data.ts`: Reference interfaces for existing transit data
   - `proximity-functions.ts`: Function signatures for Haversine calculations
   - `README.md`: Contract usage guide with examples

3. **Quickstart Guide** (`quickstart.md`) - 500+ lines
   - Prerequisites and system requirements
   - Step-by-step setup instructions
   - Development workflow guidance
   - Testing procedures (unit, E2E, accessibility)
   - Proximity calculation testing
   - Adding/updating university data
   - Deployment procedures
   - Troubleshooting guide
   - Resource links

4. **Agent Context** (`.github/copilot-instructions.md`)
   - Updated with Feature 002 technologies
   - Added Haversine proximity calculations
   - Added HTML5 range input patterns
   - Added GeoJSON data handling
   - Preserved existing Feature 001 context

### Artifact Locations

```
specs/002-university-transit-filter/
├── spec.md                    ✅ (Phase 0 - spec workflow)
├── checklists/
│   └── requirements.md        ✅ (Phase 0 - spec workflow)
├── plan.md                    ✅ (This file)
├── research.md                ✅ (Phase 0 - 400+ lines)
├── data-model.md              ✅ (Phase 1 - 600+ lines)
├── quickstart.md              ✅ (Phase 1 - 500+ lines)
└── contracts/                 ✅ (Phase 1 - 5 files)
    ├── README.md
    ├── university-data.ts
    ├── proximity-state.ts
    ├── component-props.ts
    ├── transit-data.ts
    └── proximity-functions.ts

.github/
└── copilot-instructions.md    ✅ (Updated with Feature 002)
```

### Key Design Decisions Documented

1. **Data Architecture**: GeoJSON FeatureCollection format with embedded campuses
2. **Proximity Algorithm**: Haversine formula for client-side distance calculations
3. **UI Components**: HTML5 range slider, modal campus selector, custom SVG markers
4. **State Management**: React component state with debounced radius updates
5. **Performance**: Memoization, lazy loading, <5ms proximity calculation target
6. **Accessibility**: ARIA live regions, keyboard navigation, screen reader support
7. **Testing**: Comprehensive E2E, accessibility, and unit test strategy
8. **Data Refresh**: Quarterly manual workflow with semantic versioning

### Next Steps

The planning phase (Phase 1) is now complete. To proceed with implementation:

**Option A - Generate Tasks** (Recommended):
```bash
# Run the speckit.tasks command to break down implementation into granular tasks
/speckit.tasks
```

**Option B - Start Implementation Directly**:
1. Review all Phase 1 artifacts (data-model.md, contracts/, quickstart.md)
2. Follow component development order in quickstart.md
3. Start with proximity calculations (lib/map/proximity.ts)
4. Build incrementally with tests at each step

**Option C - Further Refinement**:
- Review generated artifacts with team
- Request clarifications or modifications
- Run `/speckit.plan` again if major changes needed

### Quality Checklist

- ✅ All Phase 1 deliverables created
- ✅ Constitution principles upheld (static-first, accessible, mobile-responsive)
- ✅ Data model covers all entities from spec
- ✅ Contracts define all TypeScript interfaces
- ✅ Quickstart provides complete developer onboarding
- ✅ Agent context updated with new patterns
- ✅ No complexity violations introduced
- ✅ All documentation cross-referenced

**Planning phase complete. Ready for implementation or task breakdown.**
