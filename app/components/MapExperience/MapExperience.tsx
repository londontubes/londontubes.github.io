"use client"
// Restored client directive so that stateful hooks and map initialization run properly.

import { useMemo, useState, useCallback, useEffect } from 'react'
import { describeActiveLines } from '@/app/lib/a11y'
import LineFilter from '@/app/components/LineFilter/LineFilter'
import MapCanvas, { type MapStatus } from '@/app/components/MapCanvas/MapCanvas'
import AdUnit from '@/app/components/ads/AdUnit'
import type { Station, TransitDataset } from '@/app/types/transit'
import { createLineLabelMap } from '@/app/lib/data/load-static-data'

interface MapExperienceProps {
  dataset: TransitDataset
}

export default function MapExperience({ dataset }: MapExperienceProps) {
  const { lines, stations, metadata } = dataset
  // Empty array => show all lines (MapCanvas treats no active codes as full network)
  const [activeLineCodes, setActiveLineCodes] = useState<string[]>([])
  const [liveMessage, setLiveMessage] = useState<string>('')
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
    setLiveMessage(msg)
    // eslint-disable-next-line no-console
    console.info('live-region:', msg)
  }, [])

  // Push announcements into hidden live region in layout
  useEffect(() => {
    if (!liveMessage) return
    const region = document.getElementById('live-region')
    if (region) {
      region.textContent = liveMessage
    }
  }, [liveMessage])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [mapStatus, setMapStatus] = useState<MapStatus>('idle')

  const lineLabels = useMemo(() => createLineLabelMap(lines), [lines])
  const activeLineSummary = useMemo(
    () => describeActiveLines(activeLineCodes, lineLabels),
    [activeLineCodes, lineLabels]
  )

  return (
    <div className="map-experience" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'flex-start' }}>
      <div className="map-experience__left" style={{ flex: 1, minWidth: 0 }}>
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
      <aside className="map-experience__right" style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AdUnit
          style={{ display: 'block' }}
          format="auto"
          responsive="true"
          layoutKey="-fb+5w+4e-db+86"
        />
      </aside>
    </div>
  )
}
