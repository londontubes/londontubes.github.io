# Implementation Plan: London Tube Map Line Filter

**Branch**: `001-map-line-filter` | **Date**: 2025-11-07 | **Spec**: [specs/001-map-line-filter/spec.md](specs/001-map-line-filter/spec.md)
**Input**: Feature specification from `/specs/001-map-line-filter/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a static Next.js site that renders the complete London Underground and DLR network on a Google Maps canvas, including line-aware station markers. Provide an intuitive filter to toggle individual or multiple lines with fast, accessible updates while preserving static hosting constraints and mobile-first performance budgets.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x with Next.js static export
**Primary Dependencies**: Next.js App Router, React 19, `@googlemaps/js-api-loader`, Transport for London Unified API GeoJSON exports for lines and stations
**Storage**: N/A (static data files bundled at build time)
**Testing**: Playwright E2E suite, Lighthouse CI for performance/accessibility, Jest + React Testing Library for component behavior
**Target Platform**: Modern desktop and mobile browsers (Chrome, Safari, Edge) with responsive layouts down to 320px
**Project Type**: Web (static site)
**Performance Goals**: First Contentful Paint < 2 s on throttled 3G; filter interactions < 500 ms; total payload < 1.5 MB on initial load
**Constraints**: Must remain fully static (no server runtime), Google Maps JS API loaded asynchronously, station dataset refreshed weekly with visible timestamp, credentials stored outside client bundle per governance
**Scale/Scope**: Single-page map experience plus supporting content sections; covers 12 Underground lines + DLR with ~450 stations and weekly data refresh pipeline

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Static-First Delivery**: Plan uses Next.js static export with data pre-bundled; Google Maps loaded via client script without introducing server components. ✅
- **Accessible Content as Default**: Commitments to Lighthouse audits, keyboard-accessible filters, and alt text for station info ensure WCAG 2.1 AA coverage. ✅
- **Mobile-Responsive Layouts**: Mobile-first UI with performance budgets and cross-browser testing (Playwright + throttled profiles) aligns with responsive mandate. ✅
- **Baseline Standards**: Repository will hold canonical geojson files, metadata, and HTTPS-only deployment via static hosting; structured metadata handled during build. ✅
- **Workflow Expectations**: PR reviews include constitution checklist, builds produce immutable artifacts tagged by commit, and quarterly governance tasks scheduled in ops docs. ✅

Gate outcome: PASS (no violations identified).

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── layout.tsx
├── page.tsx
├── lines/
│   ├── [line-code]/page.tsx (optional deep links)
├── components/
│   ├── MapCanvas/
│   ├── LineFilter/
│   └── StationTooltip/
├── lib/
│   ├── data/
│   │   ├── fetch-tfl.ts
│   │   └── transform.ts
│   └── map/
│       └── overlays.ts
public/
├── data/
│   ├── lines.json
│   └── stations.json
└── images/
    └── favicons/
tests/
├── e2e/
│   └── map-filter.spec.ts
├── accessibility/
│   └── map-axe.spec.ts
└── unit/
    └── line-filter.test.tsx


**Structure Decision**: Single Next.js App Router project keeps feature components, data transforms, and static assets co-located for static export while consolidating automated tests under `tests/` to satisfy governance without introducing multi-repo complexity.

## Implementation Decisions

### Data File Format (2025-11-08)
- **Decision**: Use `.json` extension instead of `.geojson` for static data files.
- **Rationale**: Next.js webpack lacks native support for `.geojson` files, causing "Module parse failed" errors. Using standard `.json` extension enables direct imports without custom webpack loaders.
- **Files affected**: `public/data/lines.json`, `public/data/stations.json`
- **GeoJSON compliance**: Content remains valid GeoJSON; only file extension changed.

### Environment Configuration (2025-11-08)
- **Required**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` environment variable must be set in `.env.local`
- **Fallback behavior**: When API key is missing, MapCanvas displays simplified station list instead of interactive map
- **Error handling**: Console logs clear error message; user sees "Live map unavailable" alert

### Testing Setup (2025-11-08)
- **Jest configuration**: Uses `ts-jest` preset with CommonJS module format for setup files
- **Temporary flag**: `passWithNoTests: true` allows Jest to pass when no unit tests exist yet
- **Playwright**: E2E tests configured for map interactions; accessibility tests use `@axe-core/playwright`
## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | – | – |

## Constitution Re-Check (Post Design)

- **Static-First Delivery**: Data model outputs GeoJSON cached in repo; no runtime services introduced. ✅
- **Accessible Content as Default**: Contracts enforce text alternatives and quickstart mandates Lighthouse audits. ✅
- **Mobile-Responsive Layouts**: Quickstart and testing strategy include mobile emulation and performance budgets. ✅

Outcome: PASS — design artifacts uphold all constitutional principles.
