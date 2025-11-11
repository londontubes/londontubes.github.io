"use client"
// Restored client directive so that stateful hooks and map initialization run properly.

import { useMemo, useState, useCallback, useEffect } from 'react'
import LineFilter from '@/app/components/LineFilter/LineFilter'
import MapCanvas from '@/app/components/MapCanvas/MapCanvasWrapper'
import type { Station, TransitDataset } from '@/app/types/transit'
import { createLineLabelMap } from '@/app/lib/data/load-static-data'

interface MapExperienceProps {
  dataset: TransitDataset
}

export default function MapExperience({ dataset }: MapExperienceProps) {
  const { lines, stations } = dataset
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

  const lineLabels = useMemo(() => createLineLabelMap(lines), [lines])
  const activeLineSummary = useMemo(() => {
    if (activeLineCodes.length === 0) return 'All lines'
    if (activeLineCodes.length === 1) return `${lineLabels[activeLineCodes[0]] || activeLineCodes[0]}`
    return `${activeLineCodes.length} lines selected`
  }, [activeLineCodes, lineLabels])

  return (
    <div className="map-experience">
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
      />
    </div>
  )
}
