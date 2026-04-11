# Quickstart Guide: Bus Filter Page

**Feature**: `003-bus-filter-page`  
**For**: Developers implementing the London bus filter experience

## Prerequisites

Before starting, ensure you have:

- Node.js version supported by the repository
- npm installed
- Existing project dependencies installed with `npm install`
- Access to the TfL data refresh workflow already used by the project

## Initial Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Confirm current app quality gates

```bash
npm run lint
npm test
```

### 3. Identify the bus feature branch

```bash
git checkout 003-bus-filter-page
```

## Implementation Flow

### 1. Extend the build-time data pipeline

Update the existing TfL data scripts so the project can generate:

- `public/data/buses.json`
- `public/data/bus-stops.json`

Validation must fail the build if route geometry, stop references, or metadata are malformed.

### 2. Add the new page and navigation entry

Create a dedicated `/bus` page and expose it through the existing `NavigationTabs` component so visitors can move between:

- Line Filter
- University Filter
- Bus Filter

### 3. Build the bus filter experience

Implement the following in the new bus page flow:

- Bus route loading from static data
- Route filter controls comparable to the existing line filter
- Route highlighting and route-identifying details
- Density-aware stop rendering at appropriate zoom levels

### 4. Reuse existing map infrastructure where possible

Prefer extending the current map canvas and static data loading utilities over introducing a separate map stack.

## Suggested File Targets

```text
app/bus/page.tsx
app/components/BusExperience/
app/components/BusRouteFilter/
app/components/BusStopInfoCard/
app/components/NavigationTabs/
app/components/MapCanvas/
app/lib/data/load-static-data.ts
app/lib/map/
app/types/transit.ts
scripts/data/fetch-tfl.ts
scripts/data/transform.ts
scripts/data/validate.ts
public/data/buses.json
public/data/bus-stops.json
tests/unit/
tests/e2e/
```

## Validation Checklist

After implementation, verify:

```bash
npm run lint
npm test
npm run build
```

Manual validation should also confirm:

1. The bus tab appears correctly on desktop and mobile.
2. The bus page loads with a usable default map state.
3. Route toggling changes visible routes immediately.
4. Stop markers only appear when zoom level and selected routes make them readable.
5. Existing line and university pages still behave unchanged.

## Release Notes

This feature should ship only after validating that the added static bus data does not push the site beyond the constitution’s mobile performance budget.