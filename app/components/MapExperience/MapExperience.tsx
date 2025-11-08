"use client"
// Restored client directive so that stateful hooks and map initialization run properly.

import { useMemo, useState, useCallback } from 'react'
import { describeActiveLines } from '@/app/lib/a11y'
import LineFilter from '@/app/components/LineFilter/LineFilter'
import MapCanvas, { type MapStatus } from '@/app/components/MapCanvas/MapCanvas'
import type { Station, TransitDataset } from '@/app/types/transit'
import { createLineLabelMap } from '@/app/lib/data/load-static-data'

interface MapExperienceProps {
  dataset: TransitDataset
}

export default function MapExperience({ dataset }: MapExperienceProps) {
  const { lines, stations, metadata } = dataset
  // Empty array => show all lines (MapCanvas treats no active codes as full network)
  const [activeLineCodes, setActiveLineCodes] = useState<string[]>([])
  const announceRef = useState<string>('')[0] // placeholder state for live region text
  const handleFilterChange = useCallback((codes: string[]) => {
    setActiveLineCodes(codes)
  }, [])
  const stationCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    lines.forEach(line => {
      counts[line.lineCode] = line.stationIds.length
    })
    return counts
  }, [lines])
  const handleAnnounce = useCallback((msg: string) => {
    // Could store for an actual live region later if needed
    // eslint-disable-next-line no-console
    console.info('live-region:', msg)
  }, [])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [mapStatus, setMapStatus] = useState<MapStatus>('idle')

  const lineLabels = useMemo(() => createLineLabelMap(lines), [lines])
  const activeLineSummary = useMemo(
    () => describeActiveLines(activeLineCodes, lineLabels),
    [activeLineCodes, lineLabels]
  )

  return (
    <div className="map-experience" aria-live="polite">
      <header className="map-experience__header-inline">
        <h1 className="map-title">London Tube &amp; DLR Network</h1>
        <span className="map-stats" data-testid="network-stats">
          {stations.length} stations · {lines.length} lines · {activeLineSummary}
        </span>
      </header>

      <LineFilter
        lines={lines}
        activeLineCodes={activeLineCodes}
        onChange={handleFilterChange}
        stationCounts={stationCounts}
        onAnnounce={handleAnnounce}
      />

      <MapCanvas
        lines={lines}
        stations={stations}
        activeLineCodes={activeLineCodes}
        selectedStation={selectedStation}
        onStationSelect={setSelectedStation}
        lineLabels={lineLabels}
        onStatusChange={setMapStatus}
      />
    </div>
  )
}
