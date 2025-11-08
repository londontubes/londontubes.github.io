# Research Summary: London Tube Map Line Filter

## Task 1: Confirm downloadable line and station geometry for static builds

- **Decision**: Use Transport for London Unified API `Line/{id}/RouteSequence` for ordered station lists combined with TfL open GeoJSON overlays published at `https://api.tfl.gov.uk/Line/Meta/RouteSequence/` to generate static `lines.geojson` and `stations.geojson` during build.
- **Rationale**: The Unified API guarantees authoritative coverage across Underground and DLR lines with refreshes multiple times per day. GeoJSON output can be cached locally and transformed offline, satisfying static-first delivery without custom scraping.
- **Alternatives considered**:
  - OpenStreetMap exports: richer map attributes but require more complex filtering and licensing attribution overhead.
  - Manually maintained datasets: highest control but prone to drift and violates baseline standards for a single source of truth.

## Task 2: Pattern for embedding Google Maps in Next.js static export

- **Decision**: Load the Google Maps JavaScript API client-side using `@googlemaps/js-api-loader`, coupled with a static placeholder to ensure the page remains valid when JavaScript is disabled.
- **Rationale**: The loader defers script injection until after hydration, keeping bundle size small and preventing build-time references to the `window` object. This satisfies static export constraints and allows tree shaking.
- **Alternatives considered**:
  - Direct `<script>` tags in `_document`: increases risk of blocking render and complicates CSP management.
  - Third-party React map wrappers: faster to integrate but add abstractions that may hide accessibility hooks and conflict with fine-grained line overlays.

## Task 3: Accessibility best practices for interactive transit maps

- **Decision**: Provide keyboard-accessible filter controls, focusable station markers with text descriptions, and an alternative tabular view of filtered stations rendered beneath the map.
- **Rationale**: WCAG 2.1 AA requires non-pointer access; pairing map markers with textual lists supports screen readers and satisfies constitution accessibility mandates.
- **Alternatives considered**:
  - Relying solely on ARIA labels on map markers: still necessary but insufficient for users who cannot interact with the map canvas.
  - Offering downloadable PDFs: helpful fallback but lacks real-time filtering and interactivity expected from the site.
