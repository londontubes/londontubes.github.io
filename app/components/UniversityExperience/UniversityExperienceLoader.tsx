'use client'

import { useEffect, useState } from 'react'
import type { StationPropertyDataset } from '@/app/types/property'
import type { TransitDataset } from '@/app/types/transit'
import type { UniversitiesDataset } from '@/app/types/university'
import { loadPublicStationPropertyData, loadPublicTransitData, loadPublicUniversitiesData } from '@/app/lib/data/load-public-data'
import UniversityExperience from './UniversityExperience'

export default function UniversityExperienceLoader() {
  const [transitDataset, setTransitDataset] = useState<TransitDataset | null>(null)
  const [universitiesDataset, setUniversitiesDataset] = useState<UniversitiesDataset | null>(null)
  const [propertyDataset, setPropertyDataset] = useState<StationPropertyDataset | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadDatasets() {
      try {
        const [nextTransitDataset, nextUniversitiesDataset, nextPropertyDataset] = await Promise.all([
          loadPublicTransitData(),
          loadPublicUniversitiesData(),
          loadPublicStationPropertyData(),
        ])

        if (cancelled) {
          return
        }

        setTransitDataset(nextTransitDataset)
        setUniversitiesDataset(nextUniversitiesDataset)
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

  if (transitDataset && universitiesDataset && propertyDataset) {
    return (
      <UniversityExperience
        transitDataset={transitDataset}
        universitiesDataset={universitiesDataset}
        propertyDataset={propertyDataset}
      />
    )
  }

  return (
    <div className="map-experience">
      <header className="map-experience__header-inline">
        <h1 className="map-title">London Student Areas Map</h1>
        <span className="map-stats">
          {loadError ? 'University dataset unavailable' : 'Loading university commute map...'}
        </span>
      </header>
      <section
        className="map-shell"
        aria-busy={!loadError}
        aria-label={loadError ? 'University map unavailable' : 'Loading university map'}
      >
        <div className="map-status">
          {loadError ? 'Unable to load the university commute map right now.' : 'Loading university commute map...'}
        </div>
      </section>
    </div>
  )
}