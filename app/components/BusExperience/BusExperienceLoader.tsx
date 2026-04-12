'use client'

import { useEffect, useState } from 'react'
import type {
  BusDataset,
  BusRoutesCollection,
  BusStopsCollection,
} from '@/app/types/transit'
import { buildBusRouteColorMap, getBusRouteColor } from '@/app/lib/map/busRouteColors'
import BusExperience from './BusExperience'

function createBusDataset(
  routesCollection: BusRoutesCollection,
  stopsCollection: BusStopsCollection,
): BusDataset {
  const routeColorMap = buildBusRouteColorMap((routesCollection.routes ?? []).map((route) => route.routeCode))
  const routes = (routesCollection.routes ?? []).map((route) => {
    const colors = getBusRouteColor(route.routeCode, routeColorMap)

    return {
      ...route,
      brandColor: colors.brand,
      textColor: colors.text,
    }
  })

  return {
    routes,
    stops: stopsCollection.stops ?? [],
    generatedAt: routesCollection.generatedAt ?? stopsCollection.generatedAt,
    source: routesCollection.source ?? stopsCollection.source,
  }
}

export default function BusExperienceLoader() {
  const [dataset, setDataset] = useState<BusDataset | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadDataset() {
      try {
        const [routesResponse, stopsResponse] = await Promise.all([
          fetch('/data/buses.json'),
          fetch('/data/bus-stops.json'),
        ])

        if (!routesResponse.ok || !stopsResponse.ok) {
          throw new Error('Failed to load bus dataset')
        }

        const [routesCollection, stopsCollection] = await Promise.all([
          routesResponse.json() as Promise<BusRoutesCollection>,
          stopsResponse.json() as Promise<BusStopsCollection>,
        ])

        if (cancelled) {
          return
        }

        setDataset(createBusDataset(routesCollection, stopsCollection))
      } catch {
        if (!cancelled) {
          setLoadError(true)
        }
      }
    }

    void loadDataset()

    return () => {
      cancelled = true
    }
  }, [])

  if (dataset) {
    return <BusExperience dataset={dataset} />
  }

  return (
    <div className="map-experience">
      <header className="map-experience__header-inline">
        <h1 className="map-title">London Bus Routes</h1>
        <span className="map-stats" data-testid="bus-network-stats">
          {loadError ? 'Bus dataset unavailable' : 'Loading bus routes...'}
        </span>
      </header>
      <section
        className="map-shell"
        aria-busy={!loadError}
        aria-label={loadError ? 'Bus map unavailable' : 'Loading bus map'}
      >
        <div className="map-status">
          {loadError ? 'Unable to load the bus map right now.' : 'Loading bus map...'}
        </div>
      </section>
    </div>
  )
}