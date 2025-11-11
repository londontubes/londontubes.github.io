# Research: University Transit Filter

**Feature**: `002-university-transit-filter`  
**Date**: 2025-11-09  
**Purpose**: Document technical decisions and research findings for university proximity-based transit filtering

## University Data Sources

### Decision
Use manual curation of London universities from official higher education registers (HESA, UCAS) combined with Google Maps Places API for coordinate validation.

### Rationale
- **Authoritative source**: HESA (Higher Education Statistics Agency) and UCAS maintain comprehensive lists of UK universities
- **Coordinate accuracy**: Google Maps Places API provides precise geocoding for campus locations
- **Data stability**: University locations change infrequently (quarterly updates sufficient)
- **Control**: Manual curation allows us to:
  - Filter to Greater London boundary only
  - Verify campus names and locations
  - Group multi-campus institutions correctly
  - Pre-calculate nearest stations offline

### Alternatives Considered
1. **OpenStreetMap Overpass API**: Dynamic university querying
   - Rejected: Requires runtime API calls (violates static-first); data quality varies; rate limits
2. **Wikidata SPARQL queries**: Structured institution data
   - Rejected: Complex query syntax; incomplete campus location data; not optimized for UK institutions
3. **TfL StopPoint API university tags**: Transit-centric data
   - Rejected: Limited to stations with university associations; doesn't include all campuses; misses independent institutions

### Implementation Approach
- Create `scripts/data/fetch-universities.ts` to:
  - Read curated CSV list of universities (name, main address)
  - Geocode each using Google Maps Places API
  - Identify multi-campus institutions (King's College London, Imperial College, etc.)
  - Calculate nearest tube/DLR station for each campus using existing `stations.json`
  - Output to `public/data/universities.json` in GeoJSON-compatible format
- Update quarterly via manual script execution before data refresh

---

## Proximity Calculation Algorithm

### Decision
Use Haversine formula for straight-line (great-circle) distance calculation between university and station coordinates, filtered by user-selected radius threshold.

### Rationale
- **Performance**: Haversine calculation is O(1) per station; filtering 450 stations takes ~1-2ms client-side
- **Accuracy**: Great-circle distance provides reasonable approximation for walking distance at scales < 5 miles
- **Simplicity**: No external routing API required; works offline; deterministic results
- **User expectation (updated)**: Users understand the tighter default "within 0.25 miles" as focusing on immediately adjacent transit; they can expand to 0.5–1 mile for broader options

### Alternatives Considered
1. **Google Maps Distance Matrix API**: Actual walking distances and times
   - Rejected: Requires runtime API calls (violates static-first); API quota limits; adds latency; costs scale with usage
2. **Pre-computed walking distances**: Store distances in data file
   - Rejected: Combinatorial explosion (50 universities × 450 stations × 4 radius settings = 90K distances); large file size; inflexible to radius changes
3. **Euclidean distance (simple x²+y² in lat/lng space)**: Faster than Haversine
   - Rejected: Inaccurate at London's latitude (~51°N); errors up to 15% for 1-mile distances; confusing for users

### Implementation Approach
- Create `lib/map/proximity.ts` with:
  ```typescript
  calculateDistance(lat1, lon1, lat2, lon2): number // Haversine in miles
  filterStationsByProximity(university, stations, radiusMiles): Station[]
  findLinesServingStations(stations, lines): LineCode[]
  ```
- Haversine formula:
  ```
  a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
  c = 2 × atan2(√a, √(1−a))
  distance = R × c  // R = 3959 miles (Earth's radius)
  ```
- Memoize results for current university+radius combination to avoid recalculating on slider bounce

---

## Navigation Tabs Pattern

### Decision
Implement horizontal tab navigation using Next.js Link components with active state styling, positioned below the header.

### Rationale
- **Familiarity**: Standard UI pattern for switching between related views
- **Performance**: Client-side navigation via Next.js routing (no page reload)
- **Accessibility**: Native keyboard navigation (Tab, Arrow keys, Enter) via `role="tablist"`
- **Mobile**: Horizontal scroll on small screens keeps both tabs visible

### Alternatives Considered
1. **Dropdown menu**: Select-based navigation
   - Rejected: Less discoverable on desktop; requires extra click to see options
2. **Split screen**: Show both pages simultaneously
   - Rejected: Map views too complex to split effectively; confusing dual-filter state
3. **Toggle switch**: Binary line/university view
   - Rejected: Doesn't scale if more views added later; less semantic than tabs

### Implementation Approach
- Create `app/components/NavigationTabs/NavigationTabs.tsx`:
  - ARIA roles: `role="tablist"`, `role="tab"`, `aria-selected`
  - Active tab styling: bold text, bottom border, focus indicator
  - Next.js `<Link>` with `pathname` check for active state
- Update `app/layout.tsx` to include tabs in header
- CSS: Flexbox layout with `overflow-x: auto` for mobile; sticky positioning optional

---

## Radius Slider UI Component

### Decision
Use HTML5 `<input type="range">` with custom styling and value labels, controlled by React state.

### Rationale
- **Native accessibility**: Built-in keyboard support (Arrow keys, Home, End), ARIA semantics
- **Touch-friendly**: Large tap targets on mobile; smooth gesture interaction
- **Performance**: No external library required; minimal bundle size
- **Customizable**: CSS custom properties for styling; JavaScript for value display

### Alternatives Considered
1. **Third-party slider library (rc-slider, react-slider)**: Rich features
   - Rejected: Adds 10-15 KB to bundle; over-engineered for simple 0.25-1 mile range
2. **Button-based increment/decrement**: -0.25 / +0.25 buttons
   - Rejected: Less intuitive for continuous range; more clicks to reach desired value
3. **Preset buttons only**: 0.25, 0.5, 0.75, 1 mile buttons
   - Rejected: Less flexible; doesn't allow 0.4 or 0.6 mile values if user wants them

### Implementation Approach
- Create `app/components/RadiusSlider/RadiusSlider.tsx`:
  ```tsx
  <label htmlFor="radius-slider">
    Distance radius: {radiusMiles} miles
  </label>
  <input
    id="radius-slider"
    type="range"
    min={0.25}
    max={1}
    step={0.05}
    value={radiusMiles}
    onChange={(e) => setRadiusMiles(parseFloat(e.target.value))}
    aria-valuemin={0.25}
    aria-valuemax={1}
    aria-valuenow={radiusMiles}
    aria-label="Adjust distance radius for nearby stations"
  />
  ```
- CSS: Thumb size 24px for touch; track color indicates selectable range; focus ring
- Debounce onChange by 200ms to avoid excessive recalculations while dragging

---

## Campus Selector UI Pattern

### Decision
Use modal dialog with radio button list for campus selection, triggered by clicking multi-campus university markers.

### Rationale
- **Clarity**: Forces explicit campus choice before filtering; prevents ambiguity
- **Accessibility**: Modal focus trap, ESC to dismiss, radio buttons keyboard-navigable
- **Mobile**: Full-screen modal on small screens provides sufficient tap targets
- **Scalability**: Handles institutions with 2-10 campuses without cluttering map

### Alternatives Considered
1. **Dropdown select on marker tooltip**: Inline selection
   - Rejected: Tooltip hover/focus conflicts with dropdown interaction; poor mobile experience
2. **Separate markers per campus**: No selector needed
   - Rejected: Clutters map when institutions have many close campuses; violates spec requirement for grouped markers
3. **Bottom sheet**: Slide-up panel with campus list
   - Rejected: More complex implementation; non-standard pattern on desktop

### Implementation Approach
- Create `app/components/CampusSelector/CampusSelector.tsx`:
  - Modal overlay with `role="dialog"`, `aria-modal="true"`
  - Heading: "Select campus for [University Name]"
  - Radio button group: `role="radiogroup"`, `aria-labelledby`
  - Each option shows: Campus name, nearest station in parentheses
  - Buttons: "Apply" (primary), "Cancel" (secondary)
- Focus management: Trap focus in modal; restore focus to marker on close
- Keyboard: ESC dismisses; Enter on radio selects and applies; Tab cycles through options

---

## University Marker Icon Design

### Decision
Use custom SVG icon (graduation cap or building) with distinct color (e.g., university blue #003C71) to differentiate from station markers (white circles).

### Rationale
- **Visual distinction**: Prevents confusion with tube stations (per FR-005)
- **Semantic clarity**: Recognizable education symbol
- **Performance**: SVG scales without pixelation; small file size (~1 KB)
- **Accessibility**: Icon paired with text label in tooltip

### Alternatives Considered
1. **Google Maps default marker pins**: Standard red/blue pins
   - Rejected: Generic appearance; doesn't convey "university"; similar to station markers
2. **Text labels only**: No icon, just university name
   - Rejected: Clutters map at zoom-out levels; poor visibility
3. **Photo thumbnails**: University building images
   - Rejected: Large file sizes; inconsistent quality; slower rendering

### Implementation Approach
- Design SVG icon: 32×32px graduation cap in university blue
- Export to `public/images/icons/university-marker.svg`
- Load in `UniversityMarker` component via Google Maps `icon` property
- Hover/focus: Scale icon to 40×40px; add drop shadow for emphasis
- Selected state: Add blue border ring; keep marker at 40×40px

---

## Data Schema for universities.json

### Decision
Use GeoJSON FeatureCollection format with extended properties for campuses and nearest station metadata.

### Rationale
- **Consistency**: Matches existing `lines.json` and `stations.json` GeoJSON format
- **Standard**: GeoJSON is widely supported; future-proof for mapping tools
- **Extensibility**: Properties object allows arbitrary metadata without schema changes
- **Validation**: Existing JSON Schema validators can check structure

### Schema Structure
```json
{
  "type": "FeatureCollection",
  "generatedAt": "2025-11-09T12:00:00.000Z",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-0.1339, 51.5246]
      },
      "properties": {
        "universityId": "UCL",
        "displayName": "University College London",
        "campuses": [
          {
            "campusId": "UCL-MAIN",
            "name": "Main Campus (Bloomsbury)",
            "coordinates": [-0.1339, 51.5246],
            "nearestStation": {
              "stationId": "940GZZLUEUS",
              "name": "Euston Square",
              "distance": 0.2
            }
          }
        ],
        "isMultiCampus": false,
        "primaryCampusId": "UCL-MAIN"
      }
    }
  ]
}
```

### Alternatives Considered
1. **Flat array of university objects**: Simple list
   - Rejected: Not GeoJSON-compliant; inconsistent with existing data format
2. **Separate files per university**: `universities/ucl.json`
   - Rejected: Too many HTTP requests; poor caching; harder to maintain
3. **Embed in stations.json**: Add university references to stations
   - Rejected: Reverses relationship (stations don't "belong" to universities); inflexible for non-station queries

---

## Performance Optimization Strategy

### Decision
Implement lazy loading for university page, memoization for proximity calculations, and virtualization for campus selectors with >5 options.

### Rationale
- **Initial load**: Line filter page unaffected; university page only loads when accessed
- **Calculation cost**: 450 stations × Haversine = ~1ms; repeated calculations on slider drag add up
- **Memory**: University data (~50 KB) only loaded on university page navigation
- **Interaction**: Slider debounce + memoization keeps UI responsive during rapid changes

### Techniques
1. **Next.js dynamic import**: `app/universities/page.tsx` code-split automatically
2. **React.useMemo**: Cache filtered stations for current university+radius
3. **Debounce slider onChange**: 200ms delay before recalculating
4. **Virtual scrolling**: If >5 campuses, render only visible options in modal (unlikely needed for London)

### Benchmarks
- University data load: <50ms (50 KB JSON parse)
- Proximity calculation: <2ms per university (450 Haversine calls)
- Filter update: <100ms (calculate + re-render map lines)
- Total interaction time: <300ms (meets FR-023 requirement)

---

## Accessibility Enhancements

### Decision
Add ARIA live region announcements for university selections, label all interactive controls, ensure full keyboard navigation, and test with screen readers (NVDA, VoiceOver).

### Rationale
- **Compliance**: WCAG 2.1 AA requires operable keyboard interface and status messages
- **User feedback**: Blind users need confirmation when university selection changes map state
- **Inclusive**: Benefits users with motor disabilities (keyboard-only) and cognitive disabilities (clear labels)

### Implementation Checklist
- [x] Navigation tabs: `role="tablist"`, arrow key navigation, `aria-selected`
- [x] Radius slider: `aria-label`, `aria-valuemin/max/now`, value display
- [x] Campus selector modal: Focus trap, `role="dialog"`, radio group
- [x] University markers: `title` attribute, keyboard focusable (tabindex=0), Enter to activate
- [x] Live region: Announce "Selected [University Name], filtering [N] lines within [X] miles"
- [x] Skip link: "Skip to university map" for keyboard users to bypass tabs

### Testing Plan
- Run `@axe-core/playwright` on `/universities` page
- Manual keyboard test: Tab through all controls without mouse
- Screen reader test: NVDA on Windows, VoiceOver on Mac
- Color contrast: Check tab active state, slider thumb against track

---

## Integration with Existing Codebase

### Decision
Extend `MapCanvas` component with `universityMode` prop; reuse `LineFilter`, `StationTooltip`; create new `UniversityExperience` wrapper analogous to `MapExperience`.

### Rationale
- **Code reuse**: MapCanvas logic for map initialization, polylines, markers is 80% shared
- **Separation of concerns**: University-specific logic (proximity, campus selector) isolated in new components
- **Maintainability**: Shared components get bug fixes automatically; university mode doesn't fork map code

### Architectural Pattern
```
/universities/page.tsx
  → <UniversityExperience>
      → <NavigationTabs activeTab="universities" />
      → <RadiusSlider value={radius} onChange={setRadius} />
      → <MapCanvas
           lines={lines}
           stations={stations}
           universities={universities}
           mode="university"
           selectedUniversity={selected}
           radiusMiles={radius}
           onUniversitySelect={handleSelect}
           lineLabels={lineLabels}
         />
           → (renders university markers)
           → (on marker click) <CampusSelector> if multi-campus
           → (filters lines via proximity.ts)
      → <LineFilter> (displays auto-selected lines, allows manual override)
```

### Shared Components Modified
- `MapCanvas`: Add optional `universities`, `mode`, `selectedUniversity`, `radiusMiles` props
- `load-static-data.ts`: Add `loadUniversities()` function
- `a11y.ts`: Add `describeUniversitySelection()` helper

### New Components Created
- `UniversityExperience`: Top-level wrapper (similar to MapExperience)
- `NavigationTabs`: Tab switcher (used in both pages eventually)
- `RadiusSlider`: Distance control
- `CampusSelector`: Modal for multi-campus
- `UniversityMarker`: Marker renderer (called by MapCanvas in university mode)

---

## Testing Strategy

### Decision
Add E2E tests for university page navigation, marker clicks, radius adjustments, campus selection; extend accessibility tests; add unit tests for proximity calculations.

### Test Cases

**E2E Tests** (`tests/e2e/university-filter.spec.ts`):
1. Navigate from line filter to university filter via tabs
2. Click single-campus university → verify lines filtered
3. Adjust radius slider → verify line filter updates
4. Click multi-campus university → verify campus selector appears
5. Select campus from selector → verify filtering applied
6. Click same university again → verify filter cleared
7. Click different university → verify previous selection cleared

**Accessibility Tests** (`tests/accessibility/university-axe.spec.ts`):
1. Run Axe on `/universities` page
2. Keyboard-only navigation through tabs, slider, markers
3. Screen reader announcement verification (via aria-live region)
4. Focus management in campus selector modal

**Unit Tests**:
- `proximity.test.ts`: Haversine distance calculation accuracy
- `proximity.test.ts`: filterStationsByProximity correctness
- `campus-selector.test.tsx`: Modal open/close, radio selection
- `radius-slider.test.tsx`: Value changes, debouncing

### Performance Tests
- Lighthouse CI: Run on `/universities` page, ensure scores ≥90
- Custom metric: Measure proximity calculation time for all universities
- Load test: Verify page handles 100 universities without degradation

---

## Data Refresh Workflow

### Decision
Manual quarterly update via script execution; document process in `scripts/data/README.md`; include data version and timestamp in UI.

### Rationale
- **Frequency**: Universities open/close/relocate infrequently (1-2 changes per year in London)
- **Quality control**: Manual review ensures accuracy before publication
- **No automation needed**: Quarterly cadence doesn't justify CI/CD pipeline for data

### Process
1. Developer runs `npm run data:universities:fetch` (calls `fetch-universities.ts`)
2. Script queries Google Places API, calculates nearest stations, outputs JSON
3. Developer reviews diff in git (new universities, coordinate changes)
4. If valid: Commit `universities.json`, update `generatedAt` timestamp
5. Deploy via normal release process
6. UI displays "University data updated: 2025-11-09" in footer

### Data Versioning
- `universities.json` includes `"version": "1.0.0"` (semantic versioning)
- Breaking schema changes (e.g., rename `campuses` field) bump major version
- New universities or coordinate updates bump minor version
- Typo fixes bump patch version

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Data Source | Manual HESA/UCAS curation + Google Places geocoding | Authoritative, controlled, static-compatible |
| Proximity Algorithm | Haversine great-circle distance | Fast, accurate enough, no API needed |
| Navigation Pattern | Horizontal tabs with Next.js routing | Standard, accessible, performant |
| Radius Control | HTML5 range input | Native accessibility, minimal bundle |
| Campus Selector | Modal with radio buttons | Clear choice, accessible, scalable |
| Marker Icon | Custom SVG graduation cap | Distinct, semantic, performant |
| Data Format | GeoJSON FeatureCollection | Consistent, standard, extensible |
| Performance | Lazy loading + memoization + debouncing | Meets <300ms requirement |
| Accessibility | ARIA live regions + keyboard nav + screen reader testing | WCAG 2.1 AA compliance |
| Code Integration | Extend MapCanvas, reuse filters, new wrapper | Maximize reuse, minimize coupling |
| Testing | E2E + accessibility + unit tests | Comprehensive coverage |
| Data Refresh | Manual quarterly script | Matches change frequency |

All decisions prioritize static-first delivery, accessibility, and performance while maximizing code reuse from existing implementation.
