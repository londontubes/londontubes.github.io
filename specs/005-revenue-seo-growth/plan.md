# Implementation Plan: Revenue SEO Growth

**Branch**: `005-revenue-seo-growth` | **Date**: 2026-04-12 | **Spec**: `/Users/jessiezhu/personal/LondonTube/specs/005-revenue-seo-growth/spec.md`
**Input**: Feature specification from `/specs/005-revenue-seo-growth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Increase revenue by focusing the site on higher-intent SEO traffic and more visible monetization flows. The implementation will add static revenue-focused landing pages and content clusters, improve monetized CTA and ad placement discovery across key pages, and standardize analytics attribution so the site owner can measure what actually drives earnings.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js App Router and React 18.3  
**Primary Dependencies**: Next.js 14 static export, React, Leaflet/react-leaflet, existing GA4 analytics helpers, existing AdSense component, static JSON/content modules  
**Storage**: Static repository files in `app/`, `public/`, and `specs/`; no runtime database  
**Testing**: `npm run lint`, `npm test`, `npm run build`, `npm run audit:accessibility`, manual GA4/Search Console verification  
**Target Platform**: Static web app on desktop/mobile browsers plus search crawlers and analytics platforms
**Project Type**: Single Next.js web application  
**Performance Goals**: Maintain First Contentful Paint under 2 seconds on a 3G mobile profile, keep page weight below 1.5 MB, and load ad/analytics scripts asynchronously  
**Constraints**: Static-first delivery, WCAG 2.1 AA, mobile-first down to 320px, no runtime server or database, consent-safe analytics, preserve existing map UX  
**Scale/Scope**: Revenue improvements across home, blog, university, and monetized map journeys, with 10+ revenue-focused landing experiences and shared monetization instrumentation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate

- **Static-First Delivery**: Pass if revenue and SEO improvements are implemented as static pages, content modules, client-side analytics, and existing third-party scripts only.
- **Accessible Content as Default**: Pass with implementation requirement. New ads, CTAs, and landing sections must preserve semantics, contrast, and keyboard access.
- **Mobile-Responsive Layouts**: Pass with implementation requirement. Any new ad or affiliate surface must fit narrow viewports without obscuring the map or critical content.

### Post-Design Re-Check

- **Static-First Delivery**: Pass. The design uses static page definitions, existing Next.js metadata, and configuration-driven monetization surfaces; no new runtime backend is introduced.
- **Accessible Content as Default**: Pass if monetized surfaces reuse semantic anchors/buttons, keep clear labels, and remain navigable with consent-safe degradation when scripts fail.
- **Mobile-Responsive Layouts**: Pass if monetization surfaces are placement-aware, responsive, and tested on 320px layouts and the existing map/blog/university shells.

## Project Structure

### Documentation (this feature)

```text
specs/005-revenue-seo-growth/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

### Source Code (repository root)

```text
app/
├── layout.tsx
├── page.tsx
├── sitemap.ts
├── blog/
├── universities/
├── components/
│   ├── ads/
│   ├── FAQ/
│   ├── MapCanvas/
│   └── SEOContent/
├── data/
│   └── faqData.ts
└── lib/
    ├── analytics.ts
    └── map/

public/
├── ads.txt
└── robots.txt

tests/
├── accessibility/
├── e2e/
└── unit/
```

**Structure Decision**: Keep the feature inside the existing Next.js static app. Revenue-focused content and metadata changes belong in `app/`, monetization surfaces live in existing components such as ads and map surfaces, and the measurement logic extends the current analytics helpers.

## Complexity Tracking

No constitution exceptions are required. The main delivery risk is overloading the site with low-value pages or intrusive monetization, which is handled by a static, measured, accessibility-aware rollout rather than broad uncontrolled page generation.
