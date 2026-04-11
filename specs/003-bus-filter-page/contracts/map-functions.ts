/**
 * Bus map helper contracts.
 *
 * Feature: 003-bus-filter-page
 */

import type { BusRoute, BusStop } from "./bus-data";
import type { BusFilterState, BusViewportState, BusZoomBucket } from "./bus-filter-state";

export interface MapBoundsLike {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DeriveBusViewportArgs {
  zoomLevel: number;
  bounds: MapBoundsLike;
  routes: BusRoute[];
  stops: BusStop[];
  filterState: BusFilterState;
}

export interface VisibleBusData {
  routes: BusRoute[];
  stops: BusStop[];
}

export declare function getBusZoomBucket(zoomLevel: number): BusZoomBucket;

export declare function deriveBusViewportState(
  args: DeriveBusViewportArgs,
): BusViewportState;

export declare function getVisibleBusData(
  routes: BusRoute[],
  stops: BusStop[],
  viewportState: BusViewportState,
): VisibleBusData;

export const BUS_MAP_THRESHOLDS = {
  routeDetailZoom: 12,
  stopDetailZoom: 14,
} as const;