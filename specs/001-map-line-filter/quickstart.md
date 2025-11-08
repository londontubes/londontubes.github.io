# Quickstart: London Tube Map Line Filter

## Prerequisites

- Node.js 20 LTS and npm 10+
- Google Maps JavaScript API key with Maps Static & JS APIs enabled
- TfL Unified API application ID/key (optional but recommended for higher rate limits)

## Environment Setup

1. Copy `.env.example` to `.env.local` and set:
   - `GOOGLE_MAPS_API_KEY=your-key`
   - `TFL_APP_ID` and `TFL_APP_KEY` if available (optional)
2. Install dependencies:

```bash
npm install
```

## Local Development

```bash
npm run dev
```

- Opens `http://localhost:3000`
- Automatically loads mock GeoJSON under `public/data/`
- Use `npm run data:refresh` to pull fresh TfL datasets and regenerate GeoJSON

## Static Build & Preview

```bash
npm run build
npm run start:static
```

- `npm run build` triggers static export (`out/` directory)
- `npm run start:static` serves the export locally for regression checks

## Testing

```bash
npm run test
npm run test:e2e
npm run lint
npm run audit:accessibility
```

- `test` runs Jest component suites
- `test:e2e` runs Playwright flows for map rendering and filters
- `lint` enforces coding standards and GeoJSON schema validation
- `audit:accessibility` executes Lighthouse CI in mobile emulation mode

## Deployment Checklist

- Ensure `public/data/metadata.json` shows a `generatedAt` timestamp within the last 7 days
- Verify Google Maps API quota and billing status
- Run Lighthouse mobile performance (< 2 s FCP) and attach report to PR
- Confirm PR reviewer signs off on constitution checklist before merging
