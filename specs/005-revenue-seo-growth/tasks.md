# Tasks: Revenue SEO Growth

**Input**: Design documents from `/specs/005-revenue-seo-growth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the static revenue content model and monetization helpers used by all stories.

- [x] T001 Create the revenue landing-page configuration layer in `/Users/jessiezhu/personal/LondonTube/app/data/revenuePages.ts`.
- [x] T002 Create shared monetization URL helpers in `/Users/jessiezhu/personal/LondonTube/app/lib/revenue.ts`.
- [x] T003 [P] Create reusable revenue surface components in `/Users/jessiezhu/personal/LondonTube/app/components/revenue/RevenueSurface.tsx` and `/Users/jessiezhu/personal/LondonTube/app/components/revenue/RevenueSurface.module.css`.
- [x] T004 [P] Create the reusable revenue launchpad section in `/Users/jessiezhu/personal/LondonTube/app/components/revenue/RevenueLaunchpad.tsx` and `/Users/jessiezhu/personal/LondonTube/app/components/revenue/RevenueLaunchpad.module.css`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend analytics and route structure before story-specific rollout.

- [x] T005 Extend analytics event metadata and revenue-specific helpers in `/Users/jessiezhu/personal/LondonTube/app/lib/analytics.ts`.
- [x] T006 Create the static student-accommodation hub route in `/Users/jessiezhu/personal/LondonTube/app/student-accommodation/page.tsx`.
- [x] T007 Create the dynamic revenue landing-page route in `/Users/jessiezhu/personal/LondonTube/app/student-accommodation/[slug]/page.tsx`.
- [x] T008 [P] Create shared landing-page styles in `/Users/jessiezhu/personal/LondonTube/app/student-accommodation/RevenueLanding.module.css`.
- [x] T009 Update sitemap coverage in `/Users/jessiezhu/personal/LondonTube/app/sitemap.ts`.

**Checkpoint**: Revenue page infrastructure is ready for independently testable rollout.

---

## Phase 3: User Story 1 - Land High-Intent Organic Visitors (Priority: P1) 🎯 MVP

**Goal**: Ship static, indexable landing pages for student accommodation and commute-friendly rental intent.

**Independent Test**: Visit the hub and generated landing pages, confirm unique metadata, structured data, internal links, and sitemap entries.

### Tests for User Story 1

- [x] T010 [P] [US1] Add unit tests for revenue page helpers in `/Users/jessiezhu/personal/LondonTube/tests/unit/revenuePages.test.ts`.

### Implementation for User Story 1

- [x] T011 [US1] Populate 10 revenue landing pages in `/Users/jessiezhu/personal/LondonTube/app/data/revenuePages.ts`.
- [x] T012 [US1] Render landing-page cards, intent copy, and internal links in `/Users/jessiezhu/personal/LondonTube/app/student-accommodation/page.tsx`.
- [x] T013 [US1] Render page-specific hero, commute content, structured data, and CTA rows in `/Users/jessiezhu/personal/LondonTube/app/student-accommodation/[slug]/page.tsx`.
- [x] T014 [US1] Add internal discovery links to the existing home and universities content in `/Users/jessiezhu/personal/LondonTube/app/page.tsx` and `/Users/jessiezhu/personal/LondonTube/app/universities/page.tsx`.

**Checkpoint**: High-intent landing pages are indexable and independently useful.

---

## Phase 4: User Story 2 - Surface Monetized Actions Earlier (Priority: P2)

**Goal**: Make monetized actions visible before users click a map marker.

**Independent Test**: Load home, universities, and selected blog pages and confirm ads or affiliate CTAs are visible without map interaction and degrade safely when URLs/scripts are missing.

### Tests for User Story 2

- [x] T015 [P] [US2] Add unit tests for revenue URL attribution helpers in `/Users/jessiezhu/personal/LondonTube/tests/unit/revenuePages.test.ts`.

### Implementation for User Story 2

- [x] T016 [US2] Add revenue launchpad sections to `/Users/jessiezhu/personal/LondonTube/app/page.tsx` and `/Users/jessiezhu/personal/LondonTube/app/universities/page.tsx`.
- [x] T017 [US2] Upgrade monetized CTA handling in `/Users/jessiezhu/personal/LondonTube/app/components/SEOContent/SEOContent.tsx`.
- [x] T018 [US2] Upgrade monetized CTA handling in `/Users/jessiezhu/personal/LondonTube/app/components/SEOContent/UniversitySEOContent.tsx`.
- [x] T019 [US2] Add article-level monetization surfaces in `/Users/jessiezhu/personal/LondonTube/app/blog/[slug]/page.tsx`.

**Checkpoint**: Visitors can reach monetized surfaces from high-intent pages without relying on station popups.

---

## Phase 5: User Story 3 - Measure Revenue Drivers Clearly (Priority: P3)

**Goal**: Track partner, placement, and intent on newly introduced revenue surfaces.

**Independent Test**: Click or view each new revenue surface and inspect GA4 event payloads for partner, placement, intent segment, and page path fields.

### Tests for User Story 3

- [x] T020 [P] [US3] Add analytics helper tests in `/Users/jessiezhu/personal/LondonTube/tests/unit/analytics.test.ts`.

### Implementation for User Story 3

- [x] T021 [US3] Add revenue click and view helpers in `/Users/jessiezhu/personal/LondonTube/app/lib/analytics.ts`.
- [x] T022 [US3] Wire revenue analytics into `/Users/jessiezhu/personal/LondonTube/app/components/revenue/RevenueSurface.tsx`.
- [x] T023 [US3] Extend legacy property CTA tracking in `/Users/jessiezhu/personal/LondonTube/app/lib/analytics.ts` and `/Users/jessiezhu/personal/LondonTube/app/components/MapCanvas/LeafletMapCanvas.tsx`.

**Checkpoint**: All new revenue surfaces produce attribution-friendly analytics.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish validation and ensure the rollout stays inside the constitution guardrails.

- [x] T024 [P] Update implementation notes in `/Users/jessiezhu/personal/LondonTube/specs/005-revenue-seo-growth/quickstart.md` if validation steps change.
- [x] T025 Run `npm run lint` and targeted unit tests for revenue helpers.
- [x] T026 Run `npm run build` to confirm static export compatibility.

## Dependencies & Execution Order

- Phase 1 must complete before analytics and route work in Phase 2.
- Phase 2 blocks all story implementation because the shared routes, styles, and analytics hooks are reused across stories.
- User Story 1 is the MVP and should ship first.
- User Story 2 builds on the shared revenue components but does not depend on all landing pages being perfect.
- User Story 3 depends on the new surfaces existing so view and click tracking can be wired and verified.

## Parallel Opportunities

- T003 and T004 can run in parallel.
- T008 and T009 can run in parallel.
- T010 and T015 can run in parallel once helpers exist.
- T017, T018, and T019 can run in parallel after the shared revenue surface component is in place.

## Implementation Strategy

1. Ship the student-accommodation hub and landing pages first as the SEO MVP.
2. Surface monetized actions on existing high-intent journeys second.
3. Complete analytics standardisation and validation last so optimisation decisions are grounded in comparable data.