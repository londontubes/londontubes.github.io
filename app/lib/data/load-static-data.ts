import type { TransitDataset, TransitLine, Station, TransitMetadata } from '@/app/types/transit'
import linesJson from '@/public/data/lines.json'
import stationsJson from '@/public/data/stations.json'
import metadataJson from '@/public/data/metadata.json'
import overridesJson from '@/public/data/station-overrides.json'

export function loadStaticTransitData(): TransitDataset {
  const lines = (linesJson.lines ?? []) as TransitLine[]
  let stations = (stationsJson.stations ?? []) as Station[]
  const metadata = metadataJson as TransitMetadata

  // Apply coordinate overrides
  const overrides = overridesJson.overrides as Record<string, { coordinates: number[] }>
  if (overrides) {
    stations = stations.map(station => {
      const override = overrides[station.stationId]
      if (override && override.coordinates.length === 2) {
        return {
          ...station,
          position: {
            ...station.position,
            coordinates: override.coordinates as [number, number],
          },
        }
      }
      return station
    })
  }

  return {
    lines,
    stations,
    metadata,
  }
}

export function createLineLabelMap(lines: TransitLine[]): Record<string, string> {
  return lines.reduce<Record<string, string>>((acc, line) => {
    acc[line.lineCode] = line.displayName
    return acc
  }, {})
}
