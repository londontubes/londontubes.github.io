# Implementation Plan: Rightmove Flat Search

**Branch**: `004-rightmove-flat-search` | **Date**: 2026-04-11 | **Spec**: `/Users/jessiezhu/personal/LondonTube/specs/004-rightmove-flat-search/spec.md`
**Input**: Feature specification from `/specs/004-rightmove-flat-search/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a Rightmove flat search CTA beside the existing Zoopla CTA in station cards by extending the current external-property-link pattern. The implementation will keep a checked-in TfL-station-to-Rightmove-station mapping, build pre-filtered Rightmove rental URLs with `locationIdentifier=STATION^<id>`, and avoid runtime or normal-build Rightmove scraping by using a developer-assisted mapping workflow instead.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x with Next.js App Router and React 19  
**Primary Dependencies**: Next.js static export, React, existing Leaflet map components, existing analytics helpers, repository-checked-in Rightmove station mapping template  
**Storage**: Static repository files in `docs/`, `scripts/`, and content/config updates in `app/`  
**Testing**: `npm run lint`, `npm test`, direct `next build`, targeted unit tests for URL building, and manual browser verification of outbound Rightmove links  
**Target Platform**: Static web app on desktop/mobile browsers plus Node-based developer tooling for mapping maintenance  
**Project Type**: Single Next.js web application  
**Performance Goals**: Preserve FCP under 2 seconds on 3G and total page weight under 1.5 MB with no new runtime Rightmove dependency on initial page load  
**Constraints**: Static-first delivery, WCAG 2.1 AA, mobile-first down to 320px, no runtime or normal-build Rightmove scraping, preserve existing Zoopla CTA behaviour  
**Scale/Scope**: Hundreds of stations across the current TfL dataset, with a checked-in mapping covering most station-card search journeys

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate

- **Static-First Delivery**: Pass if Rightmove lookup remains a developer-maintained repository artifact and not a runtime or standard-build dependency.
- **Accessible Content as Default**: Pass with implementation requirement. The new CTA must be keyboard reachable, clearly labelled, and visually consistent in the station card.
- **Mobile-Responsive Layouts**: Pass with implementation requirement. Two property CTAs must fit within the current station card layout on narrow screens.

### Post-Design Re-Check

- **Static-First Delivery**: Pass. The planned approach stores Rightmove IDs in a checked-in mapping and builds links client-side with no runtime Rightmove lookup.
- **Accessible Content as Default**: Pass if the CTA reuses semantic anchor markup, visible focus states, and existing accessible station-card content structure.
- **Mobile-Responsive Layouts**: Pass if the station card CTA row wraps cleanly and avoids pushing critical content below unusable fold thresholds on 320px screens.

## Project Structure

### Documentation (this feature)

```text
specs/004-rightmove-flat-search/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── components/
│   └── MapCanvas/
│       └── LeafletMapCanvas.tsx
├── data/
│   └── faqData.ts
├── blog/
│   └── content.ts
└── lib/
  └── analytics.ts

docs/
└── rightmove-station-template.ts

scripts/
├── generate-rightmove-station-template.js
└── rightmove-station-template-output.json

tests/
├── accessibility/
├── e2e/
└── unit/
```

**Structure Decision**: Keep the feature inside the existing Next.js app and repository tooling. The runtime work belongs in the current map canvas and analytics files, while the Rightmove ID maintenance remains a checked-in mapping artifact under `docs/` plus lightweight developer scripts under `scripts/`.

## Complexity Tracking

No constitution exceptions are required. The main external risk is Rightmove’s anti-scraping posture, which is handled by keeping Rightmove lookup out of the runtime path and out of normal automated builds.
