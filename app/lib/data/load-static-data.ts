import type { TransitDataset, TransitLine, Station, TransitMetadata } from '@/app/types/transit'
import linesJson from '@/public/data/lines.json'
import stationsJson from '@/public/data/stations.json'
import metadataJson from '@/public/data/metadata.json'

export function loadStaticTransitData(): TransitDataset {
  const lines = (linesJson.lines ?? []) as TransitLine[]
  const stations = (stationsJson.stations ?? []) as Station[]
  const metadata = metadataJson as TransitMetadata

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
