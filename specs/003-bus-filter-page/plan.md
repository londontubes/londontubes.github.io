# Implementation Plan: Bus Filter Page

**Branch**: `003-bus-filter-page` | **Date**: 2026-04-11 | **Spec**: `/specs/003-bus-filter-page/spec.md`
**Input**: Feature specification from `/specs/003-bus-filter-page/spec.md`

## Summary

Add a dedicated `/bus` experience beside the existing line and university views, backed by build-time TfL bus data. The implementation will extend the current static data pipeline to generate bus route and stop datasets, introduce a bus-specific page and filter UI following the simpler `MapExperience` pattern, and apply density-aware rendering rules so the much larger bus network remains usable on mobile and within the constitution’s performance budget.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js App Router and React 19  
**Primary Dependencies**: Next.js static export, React, Leaflet 1.9.4, react-leaflet 4.2.1, existing TfL Unified API data scripts  
**Storage**: Static JSON files in `public/data/`; no runtime database  
**Testing**: `npm run lint`, `npm test`, `npm run build`, targeted data-validation scripts, Playwright E2E for primary journeys  
**Target Platform**: Static web app on modern desktop/mobile browsers, especially iOS Safari and Android Chrome  
**Project Type**: Web application with static build-time data generation  
**Performance Goals**: Preserve FCP under 2 seconds on 3G, total page weight under 1.5 MB, and keep bus filter interactions responsive during map pan/zoom and route toggling  
**Constraints**: Static-first delivery only, WCAG 2.1 AA, mobile-first layout down to 320px, no runtime TfL dependency, bus rendering must avoid overwhelming Leaflet with full-network stop markers  
**Scale/Scope**: London-wide bus network with hundreds of routes and substantially more stops than the current tube/DLR/elizabeth dataset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate

- **Static-First Delivery**: Pass. Planned approach extends the existing build-time TfL data pipeline and publishes static JSON only.
- **Accessible Content as Default**: Pass with explicit implementation requirement. Route filter controls, navigation tabs, and map-adjacent route/stop details will need keyboard and screen-reader coverage.
- **Mobile-Responsive Layouts**: Pass with risk called out. The bus dataset is materially larger than the current line dataset, so rendering must be density-aware to stay inside the mobile performance budget.

### Post-Design Re-Check

- **Static-First Delivery**: Pass. No runtime server or database additions are required.
- **Accessible Content as Default**: Pass if the bus filter reuses native form controls and existing tab semantics, with manual accessibility QA before release.
- **Mobile-Responsive Layouts**: Pass if implementation limits stop rendering by zoom level and/or active route selection, and avoids shipping the full stop layer into the initial paint path.

## Project Structure

### Documentation (this feature)

```text
specs/003-bus-filter-page/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── bus/
│   └── page.tsx
├── components/
│   ├── BusExperience/
│   ├── BusRouteFilter/
│   ├── BusStopInfoCard/
│   ├── MapCanvas/
│   └── NavigationTabs/
├── lib/
│   ├── data/
│   │   └── load-static-data.ts
│   └── map/
│       └── busViewport.ts
└── types/
    └── transit.ts

public/
└── data/
    ├── buses.json
    └── bus-stops.json

scripts/
└── data/
    ├── fetch-tfl.ts
    ├── transform.ts
    └── validate.ts

tests/
├── e2e/
│   └── bus-filter.spec.ts
└── unit/
    ├── busViewport.test.ts
    └── busDataLoader.test.ts
```

**Structure Decision**: Use the existing single Next.js web app structure. The feature fits naturally into the current `app/`, `public/data/`, `scripts/data/`, and `tests/` layout, with a dedicated page and a small set of new bus-focused components rather than a parallel app or backend.

## Complexity Tracking

No constitution exceptions are currently required. The main complexity is dataset scale, which is handled through static preprocessing and density-aware rendering rather than architectural expansion.
