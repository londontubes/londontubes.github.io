# Research: Bus Filter Page

**Feature**: `003-bus-filter-page`  
**Date**: 2026-04-11  
**Purpose**: Document technical decisions and research findings for a static London bus route filter experience

## Bus Data Source and Build Pipeline

### Decision

Extend the existing TfL build-time data pipeline to fetch and transform bus data into dedicated static datasets, rather than introducing a new runtime data source.

### Rationale

- **Static-first compliance**: The site constitution forbids adding runtime servers or databases without governance approval.
- **Operational consistency**: The repository already fetches and transforms transit data during build time, so bus data should follow the same traceable path.
- **Deployment safety**: Data validation can fail the build before broken route geometry or stop references reach production.
- **SEO/discoverability**: A statically generated bus page is crawlable like the current map pages.

### Alternatives Considered

1. **Runtime TfL API calls from the browser**
   - Rejected: violates static-first delivery, adds latency, introduces availability risk, and weakens determinism.
2. **Manual bus JSON checked into the repository without pipeline integration**
   - Rejected: update workflow becomes brittle, validation is easier to bypass, and data freshness depends on ad hoc manual edits.
3. **Third-party bus datasets outside TfL**
   - Rejected: lower confidence in schema stability and route authority than the existing TfL source family.

### Implementation Approach

- Extend `scripts/data/fetch-tfl.ts` to fetch bus route and stop data alongside current transit modes.
- Extend transform/validate steps to emit `public/data/buses.json` and `public/data/bus-stops.json`.
- Add schema checks for route identity, geometry presence, and stop-to-route relationships.

---

## Page and Component Architecture

### Decision

Implement the bus feature as a new top-level page that follows the simpler `MapExperience` pattern used by the line filter, not the more state-heavy university flow.

### Rationale

- **Closer UX match**: The user asked for bus filtering "just like the tube filter," which aligns directly with the existing line-filter mental model.
- **Lower implementation risk**: The university page includes campus selection and proximity logic that bus filtering does not need.
- **Navigation consistency**: A dedicated `/bus` page fits cleanly into `NavigationTabs` beside the current experiences.
- **Reuse opportunity**: Existing map scaffolding, filter-panel patterns, and page metadata structure can be adapted rather than rebuilt.

### Alternatives Considered

1. **Fold bus filtering into the existing homepage line filter**
   - Rejected: would blur tube and bus modes, inflate the main page state model, and make the filter UI harder to scan.
2. **Extend the university page with a secondary bus mode**
   - Rejected: the university experience is organized around a different user goal and would create avoidable state coupling.
3. **Add a separate map implementation just for buses**
   - Rejected: duplicates existing map infrastructure without a compelling technical need.

### Implementation Approach

- Add `app/bus/page.tsx` for the new route.
- Add a `BusExperience` container and bus-focused filter/detail components.
- Extend `NavigationTabs` with a bus entry and clear active-state styling.

---

## Rendering Strategy for a Large Bus Network

### Decision

Use density-aware rendering that prioritizes route geometry and only reveals stop-level detail when zoom level and active selection make it readable.

### Rationale

- **Scale reality**: London bus data is significantly larger than the current rail dataset, especially at the stop layer.
- **Leaflet limits**: Rendering all routes and all stops simultaneously risks poor pan/zoom responsiveness and excessive DOM work.
- **Mobile performance**: The constitution requires keeping the page usable on smaller devices and constrained networks.
- **User value**: At overview zoom levels, route corridors matter more than individual stop pins.

### Alternatives Considered

1. **Render every route and every stop at all zoom levels**
   - Rejected: highest implementation simplicity, but likely unacceptable map clutter and performance cost.
2. **Introduce vector tiles or a separate map server**
   - Rejected: conflicts with the current static-first architecture and adds infrastructure complexity too early.
3. **Show only textual route lists with no stop rendering**
   - Rejected: avoids clutter, but removes too much of the map value users expect from the feature.

### Implementation Approach

- Render route polylines as the primary overview layer.
- Gate stop marker rendering by zoom threshold and active-route selection.
- Prefer incremental or derived viewport calculations over recomputing the full stop layer for every interaction.
- Keep the default initial view useful before any heavy per-stop overlays are activated.