# Research: Revenue SEO Growth

**Feature**: `005-revenue-seo-growth`  
**Date**: 2026-04-12  
**Purpose**: Resolve the best static-site strategy for growing revenue from SEO, ads, and affiliate actions in this repository.

## Organic Growth Strategy

### Decision

Focus the revenue plan on high-intent housing, commute, and student accommodation content clusters rather than expanding the existing tourism-style blog footprint.

### Rationale

- The repo already has monetizable property and student-housing flows through Zoopla, Rightmove, Amber, and Heathrow Express.
- The current blog footprint is broad but low-intent for revenue, which limits the value of additional generic traffic.
- Revenue improves more reliably when landing traffic is closer to a monetizable decision, such as finding flats near stations or universities.

### Alternatives Considered

1. Expand the current tourism and general London guides further.
   Rejected because it is likely to increase impressions without materially improving affiliate conversion intent.
2. Focus only on ads rather than SEO.
   Rejected because low traffic quality would still cap earnings even if ad placements improved.

---

## Delivery Model

### Decision

Implement the revenue program as static pages, content modules, metadata updates, and configuration-driven monetization surfaces inside the existing Next.js App Router app.

### Rationale

- The constitution requires static-first delivery and limits new runtime dependencies.
- The existing site already uses static metadata, sitemap generation, and content modules, which are natural extension points.
- Static landing pages provide better crawlability and reviewability than runtime-generated or CMS-managed pages for this use case.

### Alternatives Considered

1. Add a CMS or database-backed content system.
   Rejected because it adds runtime complexity and governance overhead for a problem the current repository structure can solve statically.
2. Generate revenue pages at runtime from query parameters only.
   Rejected because dedicated static pages are easier to index, test, and internally link.

---

## Monetization Surface Strategy

### Decision

Increase revenue through a mix of more discoverable affiliate CTAs and additional responsive AdSense placements on high-intent pages rather than relying on the current buried map-popup surfaces.

### Rationale

- Existing property-search CTAs are currently several interactions deep, which suppresses click-through.
- The codebase already has an `AdUnit` component and affiliate tracking helpers, so expansion can reuse existing implementation patterns.
- Multiple surface types let the site monetize both casual visitors (ads) and high-intent visitors (affiliates).

### Alternatives Considered

1. Keep monetization only inside station popups.
   Rejected because the current discoverability is too low to materially improve revenue.
2. Add aggressive ad density across every page.
   Rejected because it would risk accessibility, performance, and user trust.

---

## Measurement Strategy

### Decision

Standardize revenue analytics around intent segment, partner, placement, and page context, using the current GA4-style helper layer and attribution-friendly outbound links.

### Rationale

- The repo already tracks affiliate CTA clicks, but the current measurements are too coarse to optimise placements or content clusters.
- Revenue work without attribution will quickly become guesswork.
- Page-level and placement-level fields are enough to support later experiments without introducing backend event processing.

### Alternatives Considered

1. Measure only pageviews and total clicks.
   Rejected because it cannot identify which surfaces or content clusters deserve more investment.
2. Build a custom event ingestion backend.
   Rejected because it conflicts with the static-first architecture and is unnecessary for the current scale.

---

## SEO Enhancement Pattern

### Decision

Enhance existing metadata, structured data, sitemap coverage, and internal linking for revenue pages while keeping content unique and intent-specific.

### Rationale

- The repo already has strong metadata and JSON-LD foundations in `app/layout.tsx`, `app/page.tsx`, and blog pages.
- High-intent landing pages will benefit from this existing framework if they receive unique copy, canonical paths, and clear internal linking.
- This approach improves indexability without introducing brittle SEO automation.

### Alternatives Considered

1. Mass-produce thin station pages.
   Rejected because thin content risks index bloat and weak ranking performance.
2. Leave SEO foundations unchanged and only add more content.
   Rejected because discoverability and monetization depend on metadata and link architecture as well as copy.

---

## Implementation Tightening

### Decision

Prioritise one revenue cluster first: student accommodation and commute-friendly rental intent. Deliver that cluster through a new static landing-page hub, 10 indexable landing pages, earlier monetized surfaces on the home and universities journeys, and consistent partner/placement analytics.

### Rationale

- The current site already has strong student and university relevance, making student-housing intent the closest fit for both SEO and affiliate conversion.
- A narrower first cluster reduces the risk of shipping generic pages that rank poorly or distract from the strongest monetization path.
- Home, universities, and blog pages already attract the right users, so surfacing monetized actions there increases revenue before any new SEO pages rank.

### Delivery Implications

1. Build a static hub at `/student-accommodation/` plus 10 landing pages for the highest-intent commute and university searches.
2. Reuse the existing property-search and Amber affiliate flows instead of inventing new partner integrations.
3. Treat AdSense as a supplemental surface, not the main strategy, until traffic and placement data improve.
4. Standardise all new surface tracking around `partner`, `placement`, `intent_segment`, and `page_path` so future optimisation is evidence-based.