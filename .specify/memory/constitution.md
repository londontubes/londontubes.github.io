<!--
Sync Impact Report
Version: (unset) → 1.0.0
Modified Principles:
- Introduced I. Static-First Delivery
- Introduced II. Accessible Content as Default
- Introduced III. Mobile-Responsive Layouts
Added Sections:
- Baseline Standards
- Workflow Expectations
Removed Sections:
- None
Templates Requiring Updates:
- .specify/templates/spec-template.md ✅ aligned
- .specify/templates/plan-template.md ✅ aligned
- .specify/templates/tasks-template.md ✅ aligned
Follow-up TODOs:
- None
-->

# London Tube Static Site Constitution

## Core Principles

### I. Static-First Delivery

- Build pipeline MUST output versioned static HTML, CSS, and JS assets; no runtime servers or databases may be introduced without prior governance approval.
- Content updates MUST flow through repository commits or approved CMS build hooks to maintain traceability and audit history.
- Third-party scripts MUST be limited to essential analytics or maps and loaded asynchronously to preserve static performance guarantees.

**Rationale**: A static architecture keeps hosting simple, lowers maintenance effort, and ensures the site stays portable across CDNs.

### II. Accessible Content as Default

- All pages MUST meet WCAG 2.1 AA for semantics, color contrast, and keyboard navigation.
- Media assets MUST include text alternatives (alt text, captions, transcripts) authored with the same rigor as the primary copy.
- New content MUST be reviewed with automated accessibility tooling plus a manual spot check before deployment approval.

**Rationale**: Accessibility is foundational for a public transit resource and prevents regressions that create legal and usability risks.

### III. Mobile-Responsive Layouts

- Layouts MUST be designed mobile-first, ensuring critical journeys (e.g., viewing line status) remain usable on screens down to 320px wide.
- Performance budgets MUST keep First Contentful Paint under 2 seconds on a 3G mobile profile and total page weight below 1.5 MB.
- Visual changes MUST be regression-tested across the latest two major versions of iOS Safari and Android Chrome before release.

**Rationale**: Most riders check service information on phones, so responsiveness and speed directly impact usefulness.


## Governance

- This constitution supersedes other practice guides for the static web app; conflicting guidance MUST be escalated to the product owner and governance reviewer before adoption.
- Amendments REQUIRE consensus from the product owner and design lead, with rationale captured in the amendment log and version incremented per semantic rules.
- Compliance reviews MUST occur before each release; reviewers log adherence outcomes and remediation actions in the pull request and quarterly governance report.
- Emergency deviations (e.g., temporary script inclusion) MUST include an expiry date and follow-up task to restore compliance within one sprint.

**Version**: 1.0.0 | **Ratified**: 2025-11-07 | **Last Amended**: 2025-11-07
