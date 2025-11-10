/**
 * UniversityExperience Component
 * 
 * Main orchestration component for the universities filter page.
 * Manages university selection, proximity filtering, and map display.
 * 
 * Feature: 002-university-transit-filter
 */

'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { describeActiveLines } from '@/app/lib/a11y'
import LineFilter from '@/app/components/LineFilter/LineFilter'
import MapCanvas, { type MapStatus } from '@/app/components/MapCanvas/MapCanvas'
import { CampusSelector } from '@/app/components/CampusSelector'
import { RadiusSlider } from '@/app/components/RadiusSlider'
import { UniversitySelector } from '@/app/components/UniversitySelector'
import type { Station, TransitDataset } from '@/app/types/transit'
import type { UniversitiesDataset, University } from '@/app/types/university'
import { createLineLabelMap } from '@/app/lib/data/load-static-data'
import { calculateProximityFilter } from '@/app/lib/map/proximity'

interface UniversityExperienceProps {
  transitDataset: TransitDataset
  universitiesDataset: UniversitiesDataset
}

export default function UniversityExperience({ 
  transitDataset,
  universitiesDataset 
}: UniversityExperienceProps) {
  const { lines, stations, metadata } = transitDataset
  
  // University selection state
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null)
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)
  const [showCampusSelector, setShowCampusSelector] = useState(false)
  const [campusSelectorUniversity, setCampusSelectorUniversity] = useState<University | null>(null)
  
  // Default radius: 0.5 miles
  const [radiusMiles, setRadiusMiles] = useState(0.5)
  
  // Filter state - empty array shows all lines
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
    console.info('live-region:', msg)
  }, [])

  // Handle university marker click
  const handleUniversityClick = useCallback((universityId: string) => {
    // If clicking same university, deselect it
    if (selectedUniversityId === universityId) {
      setSelectedUniversityId(null)
      setSelectedCampusId(null)
      setActiveLineCodes([]) // Show all lines
      handleAnnounce('University deselected, showing all lines')
      return
    }

    // Find the university
    const feature = universitiesDataset.features.find(
      f => f.properties.universityId === universityId
    )
    
    if (!feature) return
    
    const university = feature.properties

    // If multi-campus, show campus selector
    if (university.isMultiCampus) {
      setCampusSelectorUniversity(university)
      setShowCampusSelector(true)
      setSelectedUniversityId(universityId)
      return
    }

    // Single campus - apply filter immediately
    const campus = university.campuses[0]
    setSelectedUniversityId(universityId)
    setSelectedCampusId(campus.campusId)
    
    // Calculate proximity filter
    const filter = calculateProximityFilter(
      campus.coordinates,
      radiusMiles,
      stations,
      lines
    )
    
    setActiveLineCodes(filter.filteredLineCodes)
    handleAnnounce(
      `Selected ${university.displayName}, showing ${filter.filteredLineCodes.length} nearby lines within ${radiusMiles} miles`
    )
  }, [selectedUniversityId, universitiesDataset, radiusMiles, stations, lines, handleAnnounce])

  // Handle campus selection from modal
  const handleCampusSelect = useCallback((campusId: string) => {
    if (!campusSelectorUniversity) return

    setSelectedCampusId(campusId)
    setShowCampusSelector(false)

    // Find the selected campus
    const campus = campusSelectorUniversity.campuses.find(c => c.campusId === campusId)
    if (!campus) return

    // Calculate proximity filter
    const filter = calculateProximityFilter(
      campus.coordinates,
      radiusMiles,
      stations,
      lines
    )

    setActiveLineCodes(filter.filteredLineCodes)
    handleAnnounce(
      `Selected ${campus.name}, showing ${filter.filteredLineCodes.length} nearby lines within ${radiusMiles} miles`
    )
  }, [campusSelectorUniversity, radiusMiles, stations, lines, handleAnnounce])

  // Handle campus selector cancel
  const handleCampusCancel = useCallback(() => {
    setShowCampusSelector(false)
    setCampusSelectorUniversity(null)
    setSelectedUniversityId(null)
  }, [])

  // Handle radius change
  const handleRadiusChange = useCallback((newRadius: number) => {
    setRadiusMiles(newRadius)

    // If a university is selected, recalculate proximity filter
    if (!selectedUniversityId || !selectedCampusId) return

    // Find the selected university and campus
    const universityFeature = universitiesDataset.features.find(
      f => f.properties.universityId === selectedUniversityId
    )
    if (!universityFeature) return

    const university = universityFeature.properties
    const campus = university.campuses.find(c => c.campusId === selectedCampusId)
    if (!campus) return

    // Recalculate proximity filter with new radius
    const filter = calculateProximityFilter(
      campus.coordinates,
      newRadius,
      stations,
      lines
    )

    setActiveLineCodes(filter.filteredLineCodes)

    // Announce change
    if (filter.filteredLineCodes.length === 0) {
      handleAnnounce(
        `No tube or DLR stations within ${newRadius.toFixed(2)} miles of ${campus.name}`
      )
    } else {
      handleAnnounce(
        `Radius adjusted to ${newRadius.toFixed(2)} miles, showing ${filter.filteredLineCodes.length} nearby lines`
      )
    }
  }, [selectedUniversityId, selectedCampusId, universitiesDataset, stations, lines, handleAnnounce])

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
    <div className="map-experience">
      <header className="map-experience__header-inline">
        <h1 className="map-title">London Universities & Transit</h1>
        <span className="map-stats" data-testid="network-stats">
          {universitiesDataset.features.length} universities · {stations.length} stations · {lines.length} lines · {activeLineSummary}
        </span>
      </header>

      <LineFilter
        lines={lines}
        activeLineCodes={activeLineCodes}
        onChange={handleFilterChange}
        stationCounts={stationCounts}
        onAnnounce={handleAnnounce}
      />

      <UniversitySelector
        universities={universitiesDataset}
        selectedUniversityId={selectedUniversityId}
        onUniversitySelect={handleUniversityClick}
      />

      <RadiusSlider
        value={radiusMiles}
        onChange={handleRadiusChange}
        min={0.25}
        max={1.0}
        step={0.05}
        disabled={!selectedUniversityId}
      />

      <MapCanvas
        lines={lines}
        stations={stations}
        activeLineCodes={activeLineCodes}
        selectedStation={selectedStation}
        onStationSelect={setSelectedStation}
        lineLabels={lineLabels}
        onStatusChange={setMapStatus}
        universities={universitiesDataset}
        universityMode={true}
        selectedUniversityId={selectedUniversityId}
        onUniversityClick={handleUniversityClick}
      />

      {showCampusSelector && campusSelectorUniversity && (
        <CampusSelector
          universityName={campusSelectorUniversity.displayName}
          campuses={campusSelectorUniversity.campuses}
          selectedCampusId={selectedCampusId}
          onSelect={handleCampusSelect}
          onCancel={handleCampusCancel}
          isOpen={showCampusSelector}
        />
      )}
    </div>
  )
}
