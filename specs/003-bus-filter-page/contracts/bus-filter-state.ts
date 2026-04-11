/**
 * Runtime state contracts for the bus filter page.
 *
 * Feature: 003-bus-filter-page
 */

export interface BusFilterState {
  selectedRouteIds: string[];
  selectedStopId: string | null;
  highlightedRouteId: string | null;
  showStops: boolean;
  zoomBucket: BusZoomBucket;
}

export interface BusViewportState {
  zoomLevel: number;
  visibleRouteIds: string[];
  visibleStopIds: string[];
  stopRenderCap: number;
}

export interface BusSelectionSummary {
  activeRouteCount: number;
  activeStopCount: number;
  highlightedRouteLabel: string | null;
}

export type BusZoomBucket = "overview" | "route" | "stop";

export const BUS_FILTER_CONSTRAINTS = {
  stopRenderCaps: {
    overview: 0,
    route: 150,
    stop: 400,
  },
} as const;