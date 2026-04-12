import type {
  TransitDataset,
  TransitLine,
  Station,
  TransitMetadata,
} from '@/app/types/transit'
import type { UniversitiesDataset } from '@/app/types/university'

let transitDatasetPromise: Promise<TransitDataset> | null = null
let universitiesDatasetPromise: Promise<UniversitiesDataset> | null = null

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load ${url}`)
  }

  return response.json() as Promise<T>
}

export async function loadPublicTransitData(): Promise<TransitDataset> {
  if (!transitDatasetPromise) {
    transitDatasetPromise = Promise.all([
      fetchJson<{ lines?: TransitLine[] }>('/data/lines.json'),
      fetchJson<{ stations?: Station[] }>('/data/stations.json'),
      fetchJson<TransitMetadata>('/data/metadata.json'),
      fetchJson<{ overrides?: Record<string, { coordinates: number[] }> }>('/data/station-overrides.json'),
    ]).then(([linesJson, stationsJson, metadataJson, overridesJson]) => {
      const overrides = overridesJson.overrides ?? {}
      const stations = (stationsJson.stations ?? []).map((station) => {
        const override = overrides[station.stationId]

        if (!override || override.coordinates.length !== 2) {
          return station
        }

        return {
          ...station,
          position: {
            ...station.position,
            coordinates: override.coordinates as [number, number],
          },
        }
      })

      return {
        lines: linesJson.lines ?? [],
        stations,
        metadata: metadataJson,
      }
    }).catch((error) => {
      transitDatasetPromise = null
      throw error
    })
  }

  return transitDatasetPromise
}

export async function loadPublicUniversitiesData(): Promise<UniversitiesDataset> {
  if (!universitiesDatasetPromise) {
    universitiesDatasetPromise = fetchJson<UniversitiesDataset>('/data/universities.json').catch((error) => {
      universitiesDatasetPromise = null
      throw error
    })
  }

  return universitiesDatasetPromise
}