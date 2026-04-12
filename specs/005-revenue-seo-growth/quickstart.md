# Quickstart: Revenue SEO Growth

**Feature**: `005-revenue-seo-growth`

## Goal

Increase earnings by attracting higher-intent organic traffic, surfacing monetized actions earlier, and instrumenting revenue attribution more clearly.

## Prerequisites

- Node dependencies installed
- Existing static site build working locally
- GA4 measurement ID configured for development verification
- Affiliate environment variables available for the surfaces being tested

## Workflow

### 1. Add or update high-intent landing content

- Create or expand static landing experiences targeting housing, student accommodation, and commute-intent queries.
- Reuse existing page shells such as home, blog, and university pages where possible.
- Give each page unique metadata, internal links, and monetized next actions.

### 2. Add monetization surfaces intentionally

- Extend `app/components/ads/AdUnit.tsx` usage only on high-intent, high-visibility placements.
- Add affiliate CTA blocks where the visitor intent is strongest, not only inside deep map interactions.
- Ensure all new placements degrade safely if ads or affiliate configuration are unavailable.

### 3. Standardize analytics and attribution

- Extend `app/lib/analytics.ts` with placement-aware revenue events.
- Add partner, placement, page path, and intent segment to monetized interactions.
- Where partner URLs support it, append UTM tags for attribution consistency.

### 4. Preserve technical SEO

- Update per-page metadata, canonicals, and structured data.
- Ensure new revenue pages are added to the sitemap when published.
- Avoid thin or duplicate landing pages; ship fewer, stronger pages first.

### 5. Validate

```bash
npm run lint
npm test
npm run build
npm run audit:accessibility
```

### 6. Manual checks

1. Open each new landing page on desktop and mobile and verify monetized surfaces are visible and accessible.
2. Confirm pages still feel useful without ads or with blocked third-party scripts.
3. Verify GA4 receives events with partner, placement, page path, and intent segment.
4. Confirm sitemap, canonical tags, and structured data reflect the new landing experiences.