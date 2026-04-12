# Feature Specification: Revenue SEO Growth

**Feature Branch**: `005-revenue-seo-growth`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "I would like you to max the revenue for my website. currently it only earned £12 since Dec 2025. Increase the SEO for ad revenue or whatevery you think can increase the earning."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Land High-Intent Organic Visitors (Priority: P1)

As a visitor looking for London accommodation or commute-friendly areas, I want dedicated pages and on-page guidance for housing-related searches so I can reach relevant property-search tools directly from Google instead of only discovering them after exploring the map.

**Why this priority**: More qualified organic traffic is the biggest multiplier for both ad impressions and affiliate clicks. Without higher-intent landing traffic, monetization changes alone will stay small.

**Independent Test**: Publish a small set of housing- and commute-intent landing pages, confirm they render with unique metadata, internal links, structured data, and clear monetized actions, and verify they are included in the sitemap.

**Acceptance Scenarios**:

1. **Given** a visitor searches for a housing or university commute query, **When** they land on a relevant page, **Then** the page presents tailored content, strong metadata, and a clear next action to explore flats or commute areas.
2. **Given** a new revenue-focused page is published, **When** the site builds, **Then** the page is indexable, canonically linked, and included in the sitemap unless explicitly marked otherwise.
3. **Given** a landing page targets a university or station cluster, **When** it renders, **Then** it links users to the most relevant map, blog, or affiliate search surfaces.

---

### User Story 2 - Surface Monetized Actions Earlier (Priority: P2)

As a visitor already interested in flats, student housing, or travel planning, I want monetized actions such as property-search CTAs and ads to appear in natural, visible places so I can act without digging through multiple interactions.

**Why this priority**: The current monetized flows are present but buried. Better visibility is the fastest path to improving revenue per visitor.

**Independent Test**: Add new monetization surfaces to selected pages and verify they are visible above or near high-intent content, responsive, accessible, and safe when third-party scripts or affiliate URLs are unavailable.

**Acceptance Scenarios**:

1. **Given** a visitor lands on a high-intent page, **When** they scroll through the page, **Then** they encounter at least one visible monetized surface without needing to click a map marker first.
2. **Given** a monetized surface depends on missing affiliate configuration or blocked ad scripts, **When** the page renders, **Then** the page remains usable and no broken UI is shown.
3. **Given** a visitor is on mobile, **When** monetized surfaces render, **Then** they remain readable, non-overlapping, and keyboard/touch accessible down to 320px width.

---

### User Story 3 - Measure Revenue Drivers Clearly (Priority: P3)

As the site owner, I want analytics that attribute revenue-oriented interactions to page type, placement, and partner so I can see what actually grows earnings and optimise with evidence.

**Why this priority**: Revenue cannot be maximised if traffic and monetization changes are not attributable.

**Independent Test**: Trigger monetized actions in the UI and verify analytics events include partner, placement, and intent context, with consistent naming across ads and affiliate CTAs.

**Acceptance Scenarios**:

1. **Given** a visitor clicks a monetized CTA, **When** the analytics event fires, **Then** it includes the partner, placement, page path, and intent segment.
2. **Given** a page contains multiple monetized surfaces, **When** events are reviewed, **Then** each surface can be distinguished without manual guesswork.
3. **Given** a revenue experiment is introduced later, **When** analytics are queried, **Then** the data is sufficient to compare surfaces and content clusters.

---

### Edge Cases

- AdSense is still pending approval or ad blockers suppress ad rendering entirely.
- Affiliate environment variables are missing for some partners or some pages should not show every partner.
- New SEO landing pages risk thin or duplicate content if generated too mechanically.
- Additional scripts or ad placements risk pushing performance beyond the mobile budget.
- Revenue tracking must not break consent handling or leak personal data through outbound tags.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add a revenue-growth content layer focused on high-intent housing, commute, and student accommodation queries rather than only broad tourism-style content.
- **FR-002**: System MUST create indexable landing experiences for the highest-value revenue intents, including university, station, or neighbourhood-led discovery journeys.
- **FR-003**: System MUST expose monetized surfaces earlier in the visitor journey than the current map-marker-only property CTA flow.
- **FR-004**: System MUST support multiple monetization surface types, including display ads and affiliate CTAs, without introducing runtime servers or databases.
- **FR-005**: System MUST preserve and extend canonical metadata, sitemap coverage, and structured data for revenue-focused pages.
- **FR-006**: System MUST instrument monetized interactions with analytics fields for partner, placement, page path, and intent segment.
- **FR-007**: System MUST standardize outbound affiliate links with attribution-friendly query metadata where partner URLs allow it.
- **FR-008**: System MUST keep monetization surfaces responsive and WCAG 2.1 AA compliant on desktop and mobile screens down to 320px width.
- **FR-009**: System MUST fail safely when ad scripts are blocked or affiliate URLs are unavailable by hiding or degrading the affected surface without breaking the page.
- **FR-010**: System MUST preserve the existing map, blog, and university journeys while layering revenue improvements into them.
- **FR-011**: System MUST provide a static, versioned configuration approach for revenue pages, monetization surfaces, and measurement labels so changes remain reviewable in Git.
- **FR-012**: System MUST document the implementation and validation workflow for SEO, monetization placement, and analytics verification.

### Key Entities *(include if feature involves data)*

- **RevenueLandingPage**: A static page definition for a high-intent organic query, including slug, metadata, intent segment, related stations/universities, content blocks, and monetized surfaces.
- **MonetizationSurface**: A definition of an ad or affiliate CTA placement, including partner, placement, visibility rules, and tracking label.
- **RevenueMeasurementEvent**: A standardized analytics payload describing a revenue-oriented visitor action with intent, page, placement, and partner context.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The site ships at least 10 revenue-focused, indexable landing experiences or content sections tied to housing, commute, or student accommodation intent.
- **SC-002**: At least 3 monetized surfaces become visible without requiring a user to click a station popup first.
- **SC-003**: 100% of newly introduced monetized surfaces emit analytics events containing partner, placement, and intent segment fields.
- **SC-004**: Revenue-focused pages and placements maintain the constitution budgets for accessibility, mobile responsiveness, and static-site performance.
