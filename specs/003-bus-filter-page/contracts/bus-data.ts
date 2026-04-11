/**
 * Bus data contracts for the static bus filter feature.
 *
 * Feature: 003-bus-filter-page
 */

export interface BusDatasetMeta {
  version: string;
  generatedAt: string;
  network: "london-bus";
  routeCount: number;
  stopCount: number;
}

export interface BusRoutesDataset extends BusDatasetMeta {
  routes: BusRoute[];
}

export interface BusStopsDataset extends BusDatasetMeta {
  stops: BusStop[];
}

export interface BusRoute {
  routeId: string;
  routeCode: string;
  displayName: string;
  originName: string;
  destinationName: string;
  color: string;
  stopIds: string[];
  geometry: BusRouteGeometry;
  boundingBox: [number, number, number, number];
}

export interface BusStop {
  stopId: string;
  displayName: string;
  indicator?: string;
  coordinates: [number, number];
  servedRouteIds: string[];
  importance: "major" | "standard";
}

export type BusRouteGeometry =
  | {
      type: "LineString";
      coordinates: [number, number][];
    }
  | {
      type: "MultiLineString";
      coordinates: [number, number][][];
    };

export const BUS_DATA_CONSTRAINTS = {
  routeCode: {
    minLength: 1,
    maxLength: 12,
  },
  displayName: {
    minLength: 1,
    maxLength: 120,
  },
  coordinates: {
    lat: { min: 51.2, max: 51.7 },
    lng: { min: -0.6, max: 0.3 },
  },
  minimumRouteStops: 2,
} as const;