'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import LineFilter from '@/app/components/LineFilter/LineFilter'
import MapCanvas from '@/app/components/MapCanvas/MapCanvasWrapper'
import { trackLineFilterChange } from '@/app/lib/analytics'
import { createLineLabelMap } from '@/app/lib/data/load-static-data'
import type { Station, TransitDataset } from '@/app/types/transit'
import type { StationPropertyDataset } from '@/app/types/property'
import PropertyStationCard from './PropertyStationCard'

interface PropertyExperienceProps {
  dataset: TransitDataset
  propertyDataset: StationPropertyDataset
}

export default function PropertyExperience({ dataset, propertyDataset }: PropertyExperienceProps) {
  const { lines, stations } = dataset
  const [activeLineCodes, setActiveLineCodes] = useState<string[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  const stationCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    lines.forEach((line) => {
      counts[line.lineCode] = line.stationIds.length
    })
    return counts
  }, [lines])

  const lineLabels = useMemo(() => createLineLabelMap(lines), [lines])
  const lineColorMap = useMemo(() => {
    return lines.reduce<Record<string, string>>((acc, line) => {
      acc[line.lineCode] = line.brandColor
      return acc
    }, {})
  }, [lines])
  const summariesByStationId = useMemo(() => {
    return propertyDataset.stations.reduce<Record<string, StationPropertyDataset['stations'][number]>>((acc, summary) => {
      acc[summary.stationId] = summary
      return acc
    }, {})
  }, [propertyDataset.stations])

  const stationsWithAnyData = useMemo(() => {
    return propertyDataset.stations.filter((summary) => summary.rentListingCount > 0 || summary.saleListingCount > 0).length
  }, [propertyDataset.stations])

  const activeLineSummary = useMemo(() => {
    if (activeLineCodes.length === 0) return 'All lines'
    if (activeLineCodes.length === 1) return lineLabels[activeLineCodes[0]] || activeLineCodes[0]
    return `${activeLineCodes.length} lines selected`
  }, [activeLineCodes, lineLabels])

  const handleFilterChange = useCallback((codes: string[]) => {
    setActiveLineCodes(codes)
  }, [])

  const handleAnnounce = useCallback((message: string) => {
    setLiveMessage(message)
  }, [])

  useEffect(() => {
    if (!liveMessage) return
    const region = document.getElementById('live-region')
    if (region) {
      region.textContent = liveMessage
    }
  }, [liveMessage])

  useEffect(() => {
    trackLineFilterChange(activeLineCodes)
  }, [activeLineCodes])

  return (
    <div className="map-experience">
      <header className="map-experience__header-inline">
        <h1 className="map-title">London Property Filter</h1>
        <span className="map-stats">
          {stationsWithAnyData} priced stations · {propertyDataset.radiusMiles} mile radius · {activeLineSummary}
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
        renderStationCardContent={(station) => (
          <PropertyStationCard
            station={station}
            summary={summariesByStationId[station.stationId]}
            lineLabels={lineLabels}
            lineColorMap={lineColorMap}
          />
        )}
      />
    </div>
  )
}