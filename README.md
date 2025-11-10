# London Tube Map - Interactive Line Filter

A modern, accessible static web application for exploring the London Underground and DLR network with interactive line filtering.

## Features

- Interactive Google Maps-based visualization
- Filter by individual or multiple tube/DLR lines
- **Universities & Transit**: View London universities and filter nearby tube/DLR lines by proximity
  - 8 major London universities with campus locations
  - Proximity-based filtering (0.25 - 1.0 mile radius)
  - Multi-campus support with selection modal
  - Real-time radius adjustment with debounced updates
- Accessible keyboard navigation
- Mobile-responsive design
- Static site generation for fast loading

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Google Maps JavaScript API key

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file (see `.env.example` for the authoritative list):

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-browser-key
TFL_APP_ID=your-tfl-app-id (optional)
TFL_APP_KEY=your-tfl-app-key (optional)
```

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the client. Keep any secret (if added later) unprefixed and server-only.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Building for Production

```bash
npm run build    # builds + exports static site to ./out
npm run start:static  # serves exported static site locally
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Accessibility audit
npm run audit:accessibility
```

### Data Refresh & Validation

```bash
npm run data:validate   # schema + integrity checks
npm run data:refresh    # fetch + transform latest TfL data
```

The build pipeline runs `data:validate` automatically before `data:refresh`.

## Project Structure

- `app/` - Next.js App Router pages and components
  - `app/page.tsx` - Line filter page (default)
  - `app/universities/page.tsx` - Universities & transit filter page
  - `app/components/` - Reusable React components
  - `app/lib/` - Utility functions (proximity calculations, data loading, accessibility)
  - `app/types/` - TypeScript type definitions
- `public/data/` - Static GeoJSON data files
  - `lines.json` - Tube and DLR line geometries
  - `stations.json` - Station locations and metadata
  - `universities.json` - University campus locations with nearest stations
- `scripts/` - Data fetching and transformation scripts
- `tests/` - E2E and accessibility tests
  - `tests/unit/` - Unit tests for utility functions

## Universities Data

The universities dataset (`public/data/universities.json`) includes:
- 8 major London universities
- 11 total campuses
- Pre-calculated nearest station for each campus
- Distance to nearest station in miles
- Multi-campus support for institutions with multiple locations

To add more universities or update locations:
1. Edit `public/data/universities.json` following the GeoJSON FeatureCollection schema
2. Each campus requires: coordinates, name, nearest station ID, and distance
3. Run `npm run data:validate` to verify schema compliance
4. Rebuild with `npm run build`

## Troubleshooting

### Universities not loading
- Check that `public/data/universities.json` exists
- Verify JSON is valid GeoJSON FeatureCollection v1.0.0
- Check console for error messages
- Ensure all required properties are present (universityId, displayName, campuses)

### Proximity filtering not working
- Verify Google Maps API key is valid and has Marker library enabled
- Check that stations.json and lines.json are loaded correctly
- Ensure university coordinates are within London bounds (lat 51.2-51.7, lng -0.6-0.3)

## License

MIT
