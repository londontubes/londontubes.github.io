/**
 * React component prop contracts for the bus filter feature.
 *
 * Feature: 003-bus-filter-page
 */

import type { BusRoute, BusStop } from "./bus-data";
import type { BusFilterState, BusViewportState } from "./bus-filter-state";

export interface BusExperienceProps {
  routes: BusRoute[];
  stops: BusStop[];
}

export interface BusRouteFilterProps {
  routes: BusRoute[];
  selectedRouteIds: string[];
  onToggleRoute: (routeId: string) => void;
  onClearRoutes: () => void;
}

export interface BusStopInfoCardProps {
  stop: BusStop | null;
  routesById: Record<string, BusRoute>;
  onClose: () => void;
}

export interface BusMapCanvasProps {
  routes: BusRoute[];
  stops: BusStop[];
  filterState: BusFilterState;
  viewportState: BusViewportState;
  onHighlightRoute: (routeId: string | null) => void;
  onSelectStop: (stopId: string | null) => void;
}