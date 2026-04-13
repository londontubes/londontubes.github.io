'use client'

import { useEffect, useState } from 'react'
import type { TransitDataset } from '@/app/types/transit'
import type { StationPropertyDataset } from '@/app/types/property'
import { loadPublicStationPropertyData, loadPublicTransitData } from '@/app/lib/data/load-public-data'
import PropertyExperience from './PropertyExperience'

export default function PropertyExperienceLoader() {
  const [transitDataset, setTransitDataset] = useState<TransitDataset | null>(null)
  const [propertyDataset, setPropertyDataset] = useState<StationPropertyDataset | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadDatasets() {
      try {
        const [nextTransitDataset, nextPropertyDataset] = await Promise.all([
          loadPublicTransitData(),
          loadPublicStationPropertyData(),
        ])

        if (cancelled) {
          return
        }

        setTransitDataset(nextTransitDataset)
        setPropertyDataset(nextPropertyDataset)
      } catch {
        if (!cancelled) {
          setLoadError(true)
        }
      }
    }

    void loadDatasets()

    return () => {
      cancelled = true
    }
  }, [])

  if (transitDataset && propertyDataset) {
    return <PropertyExperience dataset={transitDataset} propertyDataset={propertyDataset} />
  }

  return (
    <div className="map-experience">
      <header className="map-experience__header-inline">
        <h1 className="map-title">London Property Filter</h1>
        <span className="map-stats">
          {loadError ? 'Property dataset unavailable' : 'Loading property map...'}
        </span>
      </header>
      <section
        className="map-shell"
        aria-busy={!loadError}
        aria-label={loadError ? 'Property map unavailable' : 'Loading property map'}
      >
        <div className="map-status">
          {loadError ? 'Unable to load the property map right now.' : 'Loading property map...'}
        </div>
      </section>
    </div>
  )
}