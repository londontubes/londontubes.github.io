# Quickstart: Rightmove Flat Search

**Feature**: `004-rightmove-flat-search`

## Goal

Add a Rightmove flat search CTA next to the existing Zoopla CTA in station cards, using a checked-in station mapping and a deterministic URL builder.

## Prerequisites

- Node dependencies installed
- Existing static data already present in `public/data/stations.json`
- Access to browser tooling for developer-assisted Rightmove lookup verification

## Workflow

### 1. Regenerate the station template if station coverage changed

```bash
node scripts/generate-rightmove-station-template.js
```

### 2. Review or enrich missing Rightmove station mappings

- Start from `docs/rightmove-station-template.ts`.
- For missing stations, use the Rightmove typeahead flow or developer browser tools to look up a station by `searchLocation`.
- Save the reviewed numeric station ID into `locationIdentifier` and store the corresponding Rightmove display name.
- Do not make Rightmove lookup part of the normal user runtime path.

Example verified lookup shape:

```text
https://los.rightmove.co.uk/typeahead?query=Baker+Street+Station&limit=10&exclude=STREET
```

Sample response fragment:

```json
{
  "matches": [
    {
      "id": "488",
      "type": "STATION",
      "displayName": "Baker Street Station"
    }
  ]
}
```

### 3. Implement the Rightmove URL builder

- Extend `app/components/MapCanvas/LeafletMapCanvas.tsx` beside `buildZooplaStationUrl()`.
- Build URLs in the form:

```text
https://www.rightmove.co.uk/property-to-rent/find.html?locationIdentifier=STATION^<id>&propertyTypes=flat&minBedrooms=0&maxBedrooms=2&maxPrice=2000&radius=0.5&includeLetAgreed=false
```

### 4. Add CTA, analytics, and copy updates

- Add the Rightmove CTA next to Zoopla in the station card.
- Add `trackRightmoveClick()` in `app/lib/analytics.ts`.
- Update FAQ/blog copy only where the property-search CTA pattern is described.

### 5. Validate

```bash
npm run lint
npm test
./node_modules/.bin/next build
```

### 6. Manual checks

1. Open a mapped station card and verify the Rightmove CTA appears beside Zoopla.
2. Open the Rightmove link and verify it resolves a station results page.
3. Open an unmapped station card and verify Rightmove is hidden rather than broken.
4. Check the station card on a narrow viewport to confirm both CTAs remain usable.