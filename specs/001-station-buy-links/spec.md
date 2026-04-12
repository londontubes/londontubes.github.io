# Feature Specification: Station Buy Links

**Feature Branch**: `[001-station-buy-links]`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Add Zoopla and Rightmove Buy link in the existing station card, just like the rental search link. Buy should have these filter: Use these filter in this link: https://www.rightmove.co.uk/property-for-sale/find.html?searchLocation=Hammersmith%2C+West+London&useLocationIdentifier=true&locationIdentifier=REGION%5E85329&buy=For+sale&radius=0.5&maxPrice=700000&minBedrooms=3&_includeSSTC=on&propertyTypes=detached%2Csemi-detached%2Cterraced%2Cbungalow&sortType=2&channel=BUY&transactionType=BUY&displayLocationIdentifier=undefined&tenureTypes=FREEHOLD&index=0&mustHave=garden%2Cparking&dontShow=retirement%2CsharedOwnership%2Cauction Zoopla example: https://www.zoopla.co.uk/for-sale/map/property/ealing/?beds_min=3&feature=has_garden&feature=has_parking_garage&is_auction=false&is_retirement_home=false&is_shared_ownership=false&price_max=700000&property_sub_type=terraced&property_sub_type=bungalow&property_sub_type=detached&property_sub_type=semi_detached&property_sub_type=farms_land&q=Ealing%2C%20London&radius=0.5&search_source=for-sale"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Buy Searches From Station Cards (Priority: P1)

As a visitor exploring where to live near a station, I want buy-search buttons beside the rental-search buttons so I can jump straight from map research into homes for sale near that station.

**Why this priority**: This is the direct feature outcome. Without visible buy CTAs in the station card, the feature does not exist for users.

**Independent Test**: Open a station card on the map and verify that buy CTAs appear beside the existing rental CTAs and open pre-filtered Zoopla and Rightmove sale searches for that station area.

**Acceptance Scenarios**:

1. **Given** a visitor opens a station card, **When** sale links can be built for that station, **Then** the card shows a Zoopla buy button and a Rightmove buy button alongside the existing rental buttons.
2. **Given** a visitor clicks a buy button, **When** the property portal opens, **Then** the search is already filtered for family-style homes for sale within the defined price, bedroom, radius, and amenity constraints.

---

### User Story 2 - Preserve Station-Specific Search Accuracy (Priority: P2)

As a visitor comparing stations, I want the buy links to stay centered on the chosen station area so I do not have to rebuild the search after leaving the map.

**Why this priority**: A visible button is not useful if it opens a generic or mismatched location page.

**Independent Test**: Open buy CTAs from several mapped stations, including stations with special naming or multiple Rightmove mappings, and verify the destination stays aligned with the selected station.

**Acceptance Scenarios**:

1. **Given** a station with a verified Rightmove mapping, **When** the visitor opens the Rightmove buy link, **Then** the destination uses that station mapping rather than a broad London-area fallback.
2. **Given** a station with a known Zoopla naming exception, **When** the visitor opens the Zoopla buy link, **Then** the destination uses the corrected area slug rather than a broken or empty page.

---

### User Story 3 - Keep The Card Usable With More Outbound Choices (Priority: P3)

As a visitor using the station card on desktop or mobile, I want the extra buy buttons to remain readable and clickable so the card still feels quick to use.

**Why this priority**: The station card already carries several actions. Adding more links must not make the popup confusing or hard to interact with.

**Independent Test**: Open a station card that shows rental, buy, and sponsored actions and confirm all buttons remain visible, distinct, and clickable without overlapping.

**Acceptance Scenarios**:

1. **Given** a station card contains multiple outbound buttons, **When** the card renders on a narrow viewport, **Then** the buttons wrap cleanly and remain individually usable.
2. **Given** a visitor sees both rental and buy buttons, **When** they scan the card, **Then** each button label clearly distinguishes rent from buy intent.

### Edge Cases

- What happens when a station has multiple Rightmove mappings? The card should show multiple Rightmove buy buttons using distinct labels, matching the existing rental-link pattern.
- How does the system handle station names with portal-specific slug exceptions? The buy links should reuse the same exception handling rules so they do not open empty or mismatched results pages.
- What happens when a station has rental links and student-room links at the same time? The station card should continue to wrap actions cleanly without hiding or overlapping buttons.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show a Zoopla buy search CTA in the existing station card whenever a sale-search URL can be built for the selected station.
- **FR-002**: The system MUST show one or more Rightmove buy search CTAs in the existing station card whenever sale-search URLs can be built from the station’s verified Rightmove mapping data.
- **FR-003**: The system MUST preserve the existing Zoopla and Rightmove rental CTAs and display the buy CTAs alongside them rather than replacing them.
- **FR-004**: The system MUST prefill Rightmove buy searches with the requested sale filters for price cap, minimum bedrooms, radius, property types, freehold-only preference, must-have features, and excluded listing types.
- **FR-005**: The system MUST prefill Zoopla buy searches with the requested sale filters for price cap, minimum bedrooms, radius, required features, excluded listing types, and approved house-style property sub-types.
- **FR-006**: The system MUST derive buy search locations from the same station-specific mapping and naming rules already used to keep rental links accurate.
- **FR-007**: The system MUST keep button labels explicit about buy intent so visitors can distinguish sale searches from rental searches at a glance.
- **FR-008**: The system MUST continue recording outbound click analytics for the new buy CTAs with enough context to distinguish them from rental CTA clicks.
- **FR-009**: The system MUST keep the station card layout usable when rental, buy, and other monetized actions are all present.

### Key Entities *(include if feature involves data)*

- **Station Property CTA**: An outbound action shown in the station card for a selected station, including its partner, intent type, label, and destination URL.
- **Sale Search Profile**: The fixed set of user-facing filters applied to buy searches, including bedroom minimum, price cap, radius, property style, included features, and excluded listing categories.
- **Station Mapping Entry**: The reviewed station-to-portal location record used to keep Rightmove and Zoopla search destinations aligned with the selected station.

## Assumptions

- Buy CTAs are required only in the interactive station card for this feature scope.
- The existing reviewed Rightmove station mapping dataset remains the source of truth for Rightmove sale searches.
- The requested sale-search filters apply uniformly across all stations unless a known station-specific portal override is already needed for naming accuracy.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of station cards that already support rental portals also present working buy-search links for both Zoopla and Rightmove.
- **SC-002**: In manual verification across at least one normal station and one multi-mapping station, every buy CTA opens a property-for-sale search already filtered to the requested bedroom, price, radius, amenity, and exclusion settings.
- **SC-003**: Visitors can distinguish rent versus buy CTAs in the station card without ambiguity, with no duplicate labels that describe different intents.
- **SC-004**: The station card remains usable on both desktop and mobile-sized layouts with all visible outbound actions rendered as separate clickable controls.