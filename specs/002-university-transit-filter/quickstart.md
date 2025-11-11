# Quickstart Guide: University Transit Filter

**Feature**: `002-university-transit-filter`  
**For**: Developers implementing the university proximity filtering feature

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v18.17.0 or later
- **npm**: v9.x or later
- **Google Maps API Key**: With Maps JavaScript API enabled
- **Git**: For version control
- **Code Editor**: VS Code recommended (TypeScript IntelliSense support)

### System Check

```bash
node --version  # Should be >= 18.17.0
npm --version   # Should be >= 9.0.0
git --version   # Any recent version
```

---

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd London-tube

# Checkout the feature branch
git checkout 002-university-transit-filter

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env.local` file in the project root:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Getting a Google Maps API Key**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps JavaScript API"
4. Create credentials → API Key
5. Restrict key to your domain (for production)

### 3. Verify Existing Data

Ensure the following files exist:

```bash
ls public/data/lines.json     # Transit lines (from Feature 001)
ls public/data/stations.json  # Tube/DLR stations (from Feature 001)
```

If missing, these need to be regenerated from TfL API data (see Feature 001 documentation).

---

## University Data Setup

### 1. Create University Data File

The university data doesn't exist yet - you'll need to create it. We provide a data generation script:

```bash
# Run the university data fetcher
npm run fetch-universities

# This will:
# 1. Load university list from HESA/UCAS data
# 2. Geocode addresses using Google Places API
# 3. Calculate nearest stations using Haversine formula
# 4. Generate public/data/universities.json
```

**Manual Alternative** (if script doesn't exist yet):

Create `public/data/universities.json` manually using this template:

```json
{
  "type": "FeatureCollection",
  "version": "1.0.0",
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
        "isMultiCampus": false,
        "primaryCampusId": "UCL-MAIN",
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
        ]
      }
    }
  ]
}
```

See `specs/002-university-transit-filter/data-model.md` for full schema.

### 2. Validate University Data

```bash
# Run data validation script
npm run validate-universities

# Checks:
# - Schema compliance (GeoJSON structure)
# - Required fields present
# - Coordinates within London bounds
# - Station IDs reference valid stations
# - Nearest station distances < 5 miles
```

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000/universities](http://localhost:3000/universities)

**Expected Behavior**:
- Navigation tabs appear at top (Line Filter | University Filter)
- Map loads centered on London
- University markers appear as graduation cap icons
- Clicking marker selects university and filters lines within the current radius (default 0.25 mile)

### 2. File Structure

Key files you'll be working with:

```
app/
├── universities/
│   └── page.tsx              # University filter page (new)
├── components/
│   ├── NavigationTabs/       # Tab navigation (new)
│   ├── RadiusSlider/         # Distance control (new)
│   ├── CampusSelector/       # Campus modal (new)
│   ├── UniversityMarker/     # University marker (new)
│   ├── MapCanvas/            # Extended with university mode
│   └── LineFilter/           # Existing, reused
lib/
├── map/
│   └── proximity.ts          # Haversine calculations (new)
└── data/
    └── university-loader.ts  # University data loader (new)
public/
└── data/
    └── universities.json     # University dataset (new)
specs/
└── 002-university-transit-filter/
    ├── spec.md               # Feature specification
    ├── data-model.md         # Entity definitions
    ├── contracts/            # TypeScript interfaces
    └── research.md           # Technical decisions
```

### 3. Component Development Order

Recommended implementation sequence:

1. **Proximity calculations** (`lib/map/proximity.ts`)
   - Haversine distance function
   - Find nearby stations
   - Derive line codes
   - **Test**: Unit tests in `lib/map/proximity.test.ts`

2. **Data loader** (`lib/data/university-loader.ts`)
   - Load universities.json
   - Validate schema
   - Parse GeoJSON
   - **Test**: Unit tests in `lib/data/university-loader.test.ts`

3. **Navigation tabs** (`app/components/NavigationTabs/`)
   - Horizontal tab layout
   - Next.js Link integration
   - Active tab highlight
   - **Test**: Visual inspection

4. **Radius slider** (`app/components/RadiusSlider/`)
   - HTML5 range input
   - Debounced onChange
   - Value display
   - **Test**: Storybook story + accessibility

5. **Campus selector** (`app/components/CampusSelector/`)
   - Modal dialog
   - Radio button list
   - Focus management
   - **Test**: E2E test in `tests/e2e/campus-selector.spec.ts`

6. **University marker** (`app/components/UniversityMarker/`)
   - Custom SVG icon
   - Tooltip rendering
   - Click handler
   - **Test**: Visual inspection

7. **Map integration** (extend `app/components/MapCanvas/`)
   - University mode prop
   - Render university markers
   - Handle marker clicks
   - Apply proximity filter
   - **Test**: E2E test in `tests/e2e/university-filter.spec.ts`

8. **Main page** (`app/universities/page.tsx`)
   - Orchestrate components
   - State management
   - Event handlers
   - **Test**: E2E test + Lighthouse CI

---

## Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- proximity.test.ts

# Coverage report
npm test -- --coverage
```

**Test Files to Create**:
- `lib/map/proximity.test.ts`: Haversine calculations, edge cases
- `lib/data/university-loader.test.ts`: Data loading and validation
- `app/components/RadiusSlider/RadiusSlider.test.tsx`: Slider interactions
- `app/components/CampusSelector/CampusSelector.test.tsx`: Modal behavior

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- university-filter.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

**E2E Test Files to Create**:
- `tests/e2e/university-filter.spec.ts`: Full user journey
- `tests/e2e/university-axe.spec.ts`: Accessibility checks
- `tests/e2e/campus-selector.spec.ts`: Multi-campus selection flow

### Accessibility Testing

```bash
# Run axe-core accessibility tests
npm run test:a11y

# Run with specific test
npm run test:a11y -- university-axe.spec.ts
```

**Manual Accessibility Checks**:
1. Keyboard navigation: Tab through all controls
2. Screen reader: Test with VoiceOver (Mac) or NVDA (Windows)
3. Focus management: Ensure visible focus indicators
4. ARIA labels: Check with browser DevTools

---

## Proximity Calculation Testing

### Manual Testing

Use browser console to test proximity calculations:

```javascript
// In browser console at http://localhost:3000/universities

// Import proximity functions
const { calculateDistance, findNearbyStations } = await import('/lib/map/proximity.js');

// Test distance calculation
const uclCoords = [-0.1339, 51.5246];
const eustonSquare = [-0.1357, 51.5254];
const distance = calculateDistance(uclCoords, eustonSquare);
console.log(`Distance: ${distance.toFixed(2)} miles`); // Should be ~0.08 miles

// Test nearby stations
const imperialCoords = [-0.1749, 51.4988];
const nearby = findNearbyStations(imperialCoords, 0.5, stations);
console.log(`Found ${nearby.length} stations within ${radiusMiles} miles (default now 0.25)`);
```

### Performance Benchmarks

Target performance metrics:

| Operation | Target | Test Command |
|-----------|--------|--------------|
| Haversine calculation (single) | < 1ms | `npm run bench -- proximity` |
| Find nearby stations (450 stations) | < 2ms | `npm run bench -- proximity` |
| Derive line codes (50 stations) | < 1ms | `npm run bench -- proximity` |
| Full proximity filter update | < 5ms | `npm run bench -- proximity` |
| Radius slider interaction (debounced) | < 100ms | Manual testing |

---

## Adding New Universities

### 1. Update universities.json

Add a new feature to the `features` array:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-0.1234, 51.5678]
  },
  "properties": {
    "universityId": "NEW-UNIV",
    "displayName": "New University Name",
    "isMultiCampus": false,
    "primaryCampusId": "NEW-UNIV-MAIN",
    "campuses": [
      {
        "campusId": "NEW-UNIV-MAIN",
        "name": "Main Campus (Area Name)",
        "coordinates": [-0.1234, 51.5678],
        "nearestStation": {
          "stationId": "940GZZLU...",
          "name": "Station Name",
          "distance": 0.3
        }
      }
    ]
  }
}
```

### 2. Calculate Nearest Station

Use the proximity utility:

```bash
npm run calc-nearest-station -- --coords="-0.1234,51.5678"

# Output:
# Nearest station: Euston Square (940GZZLUEUS)
# Distance: 0.3 miles
```

### 3. Validate Addition

```bash
npm run validate-universities
```

### 4. Test Locally

```bash
npm run dev
# Navigate to /universities
# Click the new university marker
# Verify proximity filter works correctly
```

---

## Updating University Data

### Quarterly Refresh Process

1. **Fetch Latest Data**:
   ```bash
   npm run fetch-universities -- --force
   ```

2. **Review Changes**:
   ```bash
   git diff public/data/universities.json
   ```

3. **Validate**:
   ```bash
   npm run validate-universities
   ```

4. **Test**:
   ```bash
   npm run test
   npm run test:e2e
   ```

5. **Commit**:
   ```bash
   git add public/data/universities.json
   git commit -m "chore: update universities data (Q4 2025)"
   ```

### Version Tracking

Update the `version` field in `universities.json` when making changes:

- **Major (X.0.0)**: Schema changes (breaking)
- **Minor (1.X.0)**: Add/remove universities
- **Patch (1.0.X)**: Fix coordinates/typos

Example:
```json
{
  "type": "FeatureCollection",
  "version": "1.1.0",  // Incremented from 1.0.0
  "generatedAt": "2025-12-15T12:00:00.000Z",
  "features": [...]
}
```

---

## Deployment

### Build for Production

```bash
# Create static export
npm run build

# Output will be in out/ directory
ls out/
```

### Verify Static Export

```bash
# Serve locally
npx serve out

# Open http://localhost:3000/universities
# Test all features work without server
```

### Deploy to GitHub Pages

```bash
# Push to main branch
git push origin 002-university-transit-filter

# Merge PR (triggers GitHub Actions)
# Wait for deployment
# Verify at https://londontubes.co.uk/universities
```

---

## Troubleshooting

### Map Doesn't Load

**Symptom**: Blank map area or error in console

**Check**:
1. Google Maps API key is set in `.env.local`
2. API key has "Maps JavaScript API" enabled
3. Browser console for errors
4. Network tab for failed requests

**Fix**:
```bash
# Verify environment variable
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Restart dev server
npm run dev
```

### Universities Don't Appear

**Symptom**: Map loads but no university markers

**Check**:
1. `public/data/universities.json` exists
2. File is valid JSON (no syntax errors)
3. Browser console for loading errors
4. Network tab shows 200 OK for universities.json

**Fix**:
```bash
# Validate JSON syntax
npm run validate-universities

# Check file permissions
ls -l public/data/universities.json
```

### Proximity Filter Not Working

**Symptom**: Clicking university doesn't filter lines

**Check**:
1. Browser console for JavaScript errors
2. Check if proximity calculations complete
3. Verify station IDs in universities.json are valid
4. Check if stations.json and lines.json loaded

**Debug**:
```javascript
// In browser console
console.log(window.__DEBUG_PROXIMITY__);
// Should show last calculation results
```

### Performance Issues

**Symptom**: Slow radius slider interactions or laggy map

**Check**:
1. Proximity calculation time (should be < 5ms)
2. Number of markers rendered (should be ~50 universities)
3. Browser DevTools Performance tab

**Optimize**:
```bash
# Run performance benchmarks
npm run bench -- proximity

# Check for memory leaks
npm run test:e2e -- --project=chromium --headed
# Use DevTools Memory profiler
```

### Accessibility Failures

**Symptom**: axe-core test failures

**Check**:
1. ARIA labels on slider and buttons
2. Focus visible on all interactive elements
3. Color contrast ratios
4. Keyboard navigation works

**Fix**:
```bash
# Run accessibility tests
npm run test:a11y

# Review report
open playwright-report/index.html
```

---

## Common Tasks

### Generate Mock University Data

For testing without full dataset:

```bash
npm run generate-mock-universities -- --count=5
# Creates public/data/universities.mock.json with 5 entries
```

### Benchmark Proximity Calculations

```bash
npm run bench -- proximity

# Output:
# calculateDistance: 0.5ms (single)
# findNearbyStations: 1.8ms (450 stations)
# deriveLineCodes: 0.3ms (50 stations)
```

### Clear Cache

If experiencing stale data issues:

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules (nuclear option)
rm -rf node_modules package-lock.json
npm install
```

---

## Resources

### Documentation
- **Feature Spec**: `specs/002-university-transit-filter/spec.md`
- **Data Model**: `specs/002-university-transit-filter/data-model.md`
- **Research**: `specs/002-university-transit-filter/research.md`
- **Contracts**: `specs/002-university-transit-filter/contracts/README.md`

### External References
- **Next.js Docs**: https://nextjs.org/docs
- **Google Maps API**: https://developers.google.com/maps/documentation/javascript
- **Haversine Formula**: https://en.wikipedia.org/wiki/Haversine_formula
- **GeoJSON Spec**: https://geojson.org/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

### Community
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Contributing**: [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

## Next Steps

Once development environment is set up:

1. Review the [specification](spec.md) to understand requirements
2. Read the [research document](research.md) for technical context
3. Study the [data model](data-model.md) for entity relationships
4. Review [contracts](contracts/README.md) for TypeScript interfaces
5. Start implementing in the recommended order (see Component Development Order above)
6. Run tests frequently to catch regressions early
7. Commit code following conventional commits format

**Happy coding! 🎓🚇**
