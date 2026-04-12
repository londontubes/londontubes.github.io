# Revenue Reporting

This document defines the GA4 event names, parameters, and first useful reports for the revenue-growth rollout on `005-revenue-seo-growth`.

## Event Names

- `revenue_surface_view`: fires when a new monetized surface becomes visible in the viewport.
- `revenue_click`: fires when a visitor clicks a monetized CTA.
- `cta_click`: legacy affiliate click event still fires for backward compatibility.

## Required Event Parameters

- `partner`: revenue partner, for example `amber`, `zoopla`, `rightmove`, `adsense`, or `heathrow-express`.
- `placement`: the exact placement identifier, for example `home-launchpad-amber` or `ucl-student-accommodation-zoopla`.
- `intent_segment`: the revenue intent cluster, currently `student-housing`, `commuter-rentals`, or `airport-transfer`.
- `page_path`: the origin page path.
- `destination_url`: outbound URL when the surface is a click target.

## GA4 Setup

Create the following custom dimensions in GA4 as event-scoped dimensions:

1. `partner`
2. `placement`
3. `intent_segment`
4. `page_path`
5. `destination_url`

If you want the results in the standard GA4 UI quickly, register those dimensions before comparing placements. Historical data before registration will not backfill.

## First Report To Build

Create a GA4 Exploration named `Revenue Surfaces` with:

- Rows: `placement`
- Columns: `intent_segment`
- Values: `Event count`
- Filters:
  - `Event name` matches regex `revenue_surface_view|revenue_click`

Add a second tab named `Revenue Clicks by Partner` with:

- Rows: `partner`
- Rows secondary: `placement`
- Columns: `intent_segment`
- Values: `Event count`
- Filter: `Event name = revenue_click`

## Fast Questions This Answers

- Which placement gets seen most often?
- Which intent segment drives the most clicks?
- Is `home-launchpad` outperforming `universities-launchpad`?
- Are student-housing clicks concentrated on `amber`, `zoopla`, or `rightmove`?

## Suggested First Dashboard Sections

1. `Revenue clicks by placement`
2. `Revenue surface views by placement`
3. `CTR proxy by placement`
   Use `revenue_click / revenue_surface_view` outside GA4 if you need a quick proxy.
4. `Revenue clicks by page_path`
5. `Revenue clicks by intent_segment`

## Placement Groups To Watch First

- `home-launchpad-*`
- `universities-launchpad-*`
- `seo-content-*`
- `universities-seo-*`
- `station-popup`
- `blog-*`
- `*-amber`, `*-zoopla`, `*-rightmove`, `*-adsense`

## Notes

- `cta_click` remains in place so older reporting does not break immediately.
- New optimisation work should use `revenue_surface_view` and `revenue_click` as the primary event names.
- If you later move this into Looker Studio, keep `placement` and `intent_segment` as the first breakdowns. They are the fastest way to see whether copy or placement changes improved monetization.