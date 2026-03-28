# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Dev server at localhost:3000
npm run build            # Validate data + export static site to ./out
npm run lint             # ESLint (covers app/, scripts/, tests/)
npm test                 # Unit tests
npm run test:e2e         # Playwright E2E tests
npm run audit:accessibility  # Lighthouse CI accessibility audit
npm run data:validate    # JSON schema + data integrity checks
npm run data:refresh     # Fetch latest TfL data + re-transform
npm run start:static     # Serve the ./out static export locally
```

**Note:** `prebuild` automatically runs `data:validate`, so `npm run build` validates before building.

## Architecture

This is a **Next.js 14 static export** (`output: 'export'`) — no server-side rendering at runtime. The site is deployed to GitHub Pages.

### Data Pipeline (Build-Time)

```
scripts/data/fetch-tfl.ts → transform.ts → validate.ts → public/data/*.json
```

- `fetch-tfl.ts` pulls from TfL Unified API (tube + DLR modes)
- `transform.ts` converts to GeoJSON FeatureCollections
- `validate.ts` checks against JSON schemas in `specs/*/contracts/`
- JSON files in `public/data/` are bundled into the static export

At runtime, `app/lib/data/load-static-data.ts` imports these JSON files directly and applies coordinate overrides from `station-overrides.json`.

### Key Data Types (`app/types/`)

- `TransitDataset` — `lines[]` + `stations[]` + `metadata`
- `TransitLine` — lineCode, displayName, brandColor, polyline (GeoJSON), stations
- `Station` — stationId, position, lineCodes, accessibility info
- `University` / `Campus` — university with multi-campus support; campuses have pre-calculated `nearestStation`

### Features

- **Line Filter** (spec 001): Interactive toggle of tube/DLR lines on Leaflet map
- **University Transit Filter** (spec 002): Proximity filtering of stations around 8 London universities; radius slider 0.25–1.0 miles; Haversine formula; performance target < 2ms for ~450 stations
- **Contact API** (`app/api/contact`): Nodemailer/SMTP email form (server-only)
- **Health check** (`app/api/health`)

### Map Rendering

Uses **Leaflet 1.9.4** + **react-leaflet 4.2.1**. Leaflet CSS is imported in `app/globals.css`. Map components are client components (`'use client'`).

### Environment Variables

Public (browser):
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY           # Required
NEXT_PUBLIC_GA4_MEASUREMENT_ID            # Optional (G-XXXXXXXXXX)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION      # Optional
NEXT_PUBLIC_GYG_HEATHROW_EXPRESS_AFFILIATE_URL  # Optional
NEXT_PUBLIC_AMBER_UCL_AFFILIATE_URL       # Optional
```

Server-only (Node.js):
```
TFL_APP_ID / TFL_APP_KEY                  # Optional TfL API credentials
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE  # Contact form email
```

## Before Merging to Main

1. Rebase on latest main: `git fetch origin && git rebase origin/main`
2. Run `npm run lint` and fix all issues — unused vars, conditional hook violations, `any` types, missing imports
3. Confirm `npm run build` succeeds with no errors
4. Merge with `--no-ff` and push; hotfix immediately if CI breaks

The `main` branch must always be deployable (CI deploys to GitHub Pages on push to main).
