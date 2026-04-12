'use client'

import { useEffect, useState } from 'react'
import type { TransitDataset } from '@/app/types/transit'
import { loadPublicTransitData } from '@/app/lib/data/load-public-data'
import MapExperience from './MapExperience'

export default function MapExperienceLoader() {
  const [dataset, setDataset] = useState<TransitDataset | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadDataset() {
      try {
        const nextDataset = await loadPublicTransitData()
        if (!cancelled) {
          setDataset(nextDataset)
        }
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
    return <MapExperience dataset={dataset} />
  }

  return (
    <div className="map-experience">
      <header className="map-experience__header-inline">
        <h1 className="map-title">London Tube &amp; DLR Network</h1>
        <span className="map-stats" data-testid="network-stats">
          {loadError ? 'Network dataset unavailable' : 'Loading network...'}
        </span>
      </header>
      <section
        className="map-shell"
        aria-busy={!loadError}
        aria-label={loadError ? 'Map unavailable' : 'Loading map'}
      >
        <div className="map-status">
          {loadError ? 'Unable to load the map right now.' : 'Loading map...'}
        </div>
      </section>
    </div>
  )
}