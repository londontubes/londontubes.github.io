/**
 * UniversityExperience Component
 * 
 * Main orchestration component for the universities filter page.
 * Manages university selection, proximity filtering, and map display.
 * 
 * Feature: 002-university-transit-filter
 */

'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { trackUniversitySelect, trackUniversityDeselect, trackCampusApply, trackLineFilterChange, trackRadiusChange, trackTimeFilterChange, trackFilterModeChange } from '@/app/lib/analytics'
import styles from './UniversityExperience.module.css'
import LineFilter from '@/app/components/LineFilter/LineFilter'
import MapCanvas from '@/app/components/MapCanvas/MapCanvasWrapper'
import { CampusSelector } from '@/app/components/CampusSelector'
import { RadiusSlider } from '@/app/components/RadiusSlider'
import { TimeSlider } from '@/app/components/TimeSlider'
import { UniversitySelector } from '@/app/components/UniversitySelector'
import type { Station, TransitDataset } from '@/app/types/transit'
import type { UniversitiesDataset, University } from '@/app/types/university'
import { createLineLabelMap } from '@/app/lib/data/load-static-data'
import { calculateProximityFilter, calculateTimeBasedFilter } from '@/app/lib/map/proximity'
import { type TravelTimeResult } from '@/app/lib/map/travelTime'

const MILES_TO_KILOMETRES = 1.60934
const MIN_RADIUS_MILES = 0.25
const MAX_RADIUS_MILES = 10
const STEP_RADIUS_MILES = 0.05

interface UniversityExperienceProps {
  transitDataset: TransitDataset
  universitiesDataset: UniversitiesDataset
}

export default function UniversityExperience({ 
  transitDataset,
  universitiesDataset 
}: UniversityExperienceProps) {
  const { lines, stations } = transitDataset
  
  // University selection state
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null)
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)
  const [showCampusSelector, setShowCampusSelector] = useState(false)
  const [campusSelectorUniversity, setCampusSelectorUniversity] = useState<University | null>(null)
  
  // Default radius: 0.5 miles
  const [radiusMiles, setRadiusMiles] = useState(0.5)
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi')
  
  // Travel time filter state (in minutes)
  const [travelTimeMins, setTravelTimeMins] = useState(15)
  
  // Travel time results (populated when time-based filtering is active)
  const [travelTimeResults, setTravelTimeResults] = useState<TravelTimeResult[]>([])
  
  // Filter mode: 'radius' (default) or 'time'
  const [filterMode, setFilterMode] = useState<'radius' | 'time'>('radius')
  
  // Filtered station IDs (only stations within radius/time should be visible)
  const [filteredStationIds, setFilteredStationIds] = useState<string[]>([])
  
  // Filter state - empty array shows all lines
  const [activeLineCodes, setActiveLineCodes] = useState<string[]>([])
  const [liveMessage, setLiveMessage] = useState<string>('')
  // Track last deselection to suppress immediate reselect on double click
  const lastDeselectionRef = useRef<{ id: string; time: number } | null>(null)
  
  const handleFilterChange = useCallback((codes: string[]) => {
    setActiveLineCodes(codes)
  }, [])

  const formatDistance = useCallback((miles: number) => {
    if (distanceUnit === 'mi') {
      return `${miles.toFixed(2)} miles`
    }
    return `${(miles * MILES_TO_KILOMETRES).toFixed(2)} kilometres`
  }, [distanceUnit])
  
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
    console.log('handleUniversityClick called:', { universityId, selectedUniversityId })
    
    // If clicking same university, deselect it
    if (selectedUniversityId === universityId) {
      console.log('Deselecting university')
      setSelectedUniversityId(null)
      setSelectedCampusId(null)
      setActiveLineCodes([]) // Show all lines
      setFilteredStationIds([]) // Show all stations
      setTravelTimeResults([]) // Clear travel time results
      setRadiusMiles(MIN_RADIUS_MILES) // Reset radius to minimum
      setFilterMode('radius') // Reset to radius mode
      // Record deselection to suppress immediate reselect on double click
      ;(lastDeselectionRef.current = { id: universityId, time: Date.now() })
      handleAnnounce('University deselected, map reset to show all lines and stations')
      trackUniversityDeselect(universityId)
      return
    }

    // Suppress immediate reselect if just deselected (double click scenario)
    if (!selectedUniversityId && lastDeselectionRef.current && lastDeselectionRef.current.id === universityId) {
      const elapsed = Date.now() - lastDeselectionRef.current.time
      if (elapsed < 450) { // 450ms tolerance for double click
        console.log('Ignoring rapid reselect after deselect (double click). Elapsed:', elapsed)
        return
      }
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
      trackUniversitySelect(universityId)
      return
    }

    // Single campus - apply filter immediately
    const campus = university.campuses[0]
  setSelectedUniversityId(universityId)
    setSelectedCampusId(campus.campusId)
  trackUniversitySelect(universityId)
    
    // Calculate proximity filter
    const filter = calculateProximityFilter(
      campus.coordinates,
      radiusMiles,
      stations
    )
    
    setActiveLineCodes(filter.filteredLineCodes)
    setFilteredStationIds(filter.nearbyStationIds)
    setFilterMode('radius') // Ensure we're in radius mode
    setTravelTimeResults([]) // Clear time-based results
    handleAnnounce(
      `Selected ${university.displayName}, showing ${filter.nearbyStationIds.length} stations within ${formatDistance(radiusMiles)} on ${filter.filteredLineCodes.length} lines`
    )
  }, [selectedUniversityId, universitiesDataset, radiusMiles, stations, handleAnnounce, formatDistance])

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
      stations
    )

    setActiveLineCodes(filter.filteredLineCodes)
    setFilteredStationIds(filter.nearbyStationIds)
    setFilterMode('radius') // Ensure we're in radius mode
    setTravelTimeResults([]) // Clear time-based results
    handleAnnounce(
      `Selected ${campus.name}, showing ${filter.nearbyStationIds.length} stations within ${formatDistance(radiusMiles)} on ${filter.filteredLineCodes.length} lines`
    )
  trackCampusApply(campusSelectorUniversity.universityId, campusId)
  }, [campusSelectorUniversity, radiusMiles, stations, handleAnnounce, formatDistance])

  // Handle campus selector cancel
  const handleCampusCancel = useCallback(() => {
    setShowCampusSelector(false)
    setCampusSelectorUniversity(null)
    setSelectedUniversityId(null)
    setSelectedCampusId(null)
    setActiveLineCodes([]) // Show all lines
    setFilteredStationIds([]) // Show all stations
    setTravelTimeResults([]) // Clear travel time results
    setRadiusMiles(MIN_RADIUS_MILES) // Reset radius to minimum
    setFilterMode('radius') // Reset to radius mode
    handleAnnounce('Selection cancelled, map reset')
  }, [handleAnnounce])

  // Handle radius change
  const handleRadiusChange = useCallback((rawValue: number) => {
    const candidateMiles = distanceUnit === 'mi' ? rawValue : rawValue / MILES_TO_KILOMETRES
    const newRadiusMiles = Math.min(MAX_RADIUS_MILES, Math.max(MIN_RADIUS_MILES, candidateMiles))
    setRadiusMiles(newRadiusMiles)

    // Switch back to radius-based filtering mode
    setFilterMode('radius')
    trackFilterModeChange('radius')
    setTravelTimeResults([])

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
      newRadiusMiles,
      stations
    )

  setActiveLineCodes(filter.filteredLineCodes)
    setFilteredStationIds(filter.nearbyStationIds)
  trackRadiusChange(newRadiusMiles, selectedUniversityId)

    // Announce change
    if (filter.filteredLineCodes.length === 0) {
      handleAnnounce(
        `No tube or DLR stations within ${formatDistance(newRadiusMiles)} of ${campus.name}`
      )
    } else {
      handleAnnounce(
        `Radius adjusted to ${formatDistance(newRadiusMiles)}, showing ${filter.nearbyStationIds.length} stations on ${filter.filteredLineCodes.length} lines`
      )
    }
  }, [distanceUnit, selectedUniversityId, selectedCampusId, universitiesDataset, stations, handleAnnounce, formatDistance])

  const toggleDistanceUnit = useCallback(() => {
    setDistanceUnit(prev => {
      const next = prev === 'mi' ? 'km' : 'mi'
      handleAnnounce(`Distance radius now shown in ${next === 'mi' ? 'miles' : 'kilometres'}`)
      return next
    })
  }, [handleAnnounce])

  // Handle travel time change
  const handleTimeChange = useCallback(async (newTime: number) => {
    setTravelTimeMins(newTime)
    
    // Switch to time-based filtering mode
    setFilterMode('time')
    trackFilterModeChange('time')
    
    // If no university selected, just update state
    if (!selectedUniversityId || !selectedCampusId) {
      handleAnnounce(`Travel time filter set to ${newTime} minutes`)
      trackTimeFilterChange(newTime)
      return
    }

    // Find the selected university and campus
    const universityFeature = universitiesDataset.features.find(
      f => f.properties.universityId === selectedUniversityId
    )
    if (!universityFeature) return

    const university = universityFeature.properties
    const campus = university.campuses.find(c => c.campusId === selectedCampusId)
    if (!campus) return

    handleAnnounce(`Calculating stations reachable within ${newTime} minutes from ${campus.name}...`)

    try {
      // Calculate time-based filter
      const filter = await calculateTimeBasedFilter(
        campus.coordinates,
        newTime,
        stations,
        lines,
        'TRANSIT'
      )

      setTravelTimeResults(filter.travelTimes)
      setActiveLineCodes(filter.filteredLineCodes)
      setFilteredStationIds(filter.reachableStationIds)

      if (filter.filteredLineCodes.length === 0) {
        handleAnnounce(
          `No stations reachable within ${newTime} minutes from ${campus.name}`
        )
      } else {
        handleAnnounce(
          `Found ${filter.reachableStationIds.length} stations reachable within ${newTime} minutes, showing ${filter.filteredLineCodes.length} lines`
        )
      }
      trackTimeFilterChange(newTime, selectedUniversityId)
    } catch (error) {
      console.error('Travel time calculation error:', error)
      handleAnnounce(`Error calculating travel times. Please try again.`)
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

  // Clear radius results when switching to time mode
  useEffect(() => {
    if (filterMode === 'time') {
      // Clear all filters to show full map with just university selected
      setActiveLineCodes([])
      setFilteredStationIds([])
      setTravelTimeResults([])
      
      if (selectedUniversityId) {
        handleAnnounce('Travel time mode activated. Adjust the slider to filter stations.')
      }
    }
  }, [filterMode, selectedUniversityId, handleAnnounce])

  // Track line filter changes driven by university proximity or campus selection
  useEffect(() => {
    trackLineFilterChange(activeLineCodes)
  }, [activeLineCodes])

  // Ensure when university is deselected, we're in radius mode
  useEffect(() => {
    if (!selectedUniversityId) {
      setFilterMode('radius')
    }
  }, [selectedUniversityId])
  
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)

  const lineLabels = useMemo(() => createLineLabelMap(lines), [lines])

  const radiusSliderValue = distanceUnit === 'mi'
    ? Number(radiusMiles.toFixed(2))
    : Number((radiusMiles * MILES_TO_KILOMETRES).toFixed(2))

  const radiusMinValue = distanceUnit === 'mi'
    ? MIN_RADIUS_MILES
    : Number((MIN_RADIUS_MILES * MILES_TO_KILOMETRES).toFixed(2))

  const radiusMaxValue = distanceUnit === 'mi'
    ? MAX_RADIUS_MILES
    : Number((MAX_RADIUS_MILES * MILES_TO_KILOMETRES).toFixed(2))

  const radiusStepValue = distanceUnit === 'mi'
    ? STEP_RADIUS_MILES
    : Number((STEP_RADIUS_MILES * MILES_TO_KILOMETRES).toFixed(2))

  return (
    <div className="map-experience university-experience">
      <LineFilter
        lines={lines}
        activeLineCodes={activeLineCodes}
        onChange={handleFilterChange}
        stationCounts={stationCounts}
        onAnnounce={handleAnnounce}
      />

      {/* Show university selection grid when no university is selected */}
      {!selectedUniversityId ? (
        <div style={{ padding: '0.5rem 0' }}>
          <UniversitySelector
            universities={universitiesDataset}
            selectedUniversityId={selectedUniversityId}
            onUniversitySelect={handleUniversityClick}
            inline={false}
          />
        </div>
      ) : (
        /* Show inline controls when a university is selected */
        <div className={styles.universityInlineBar} aria-label="University selection and distance radius">
          <div className={styles.iconsArea}>
            <UniversitySelector
              universities={universitiesDataset}
              selectedUniversityId={selectedUniversityId}
              onUniversitySelect={handleUniversityClick}
              inline
            />
          </div>
          <div className={styles.filterModeContainer}>
            <div 
              className={`${styles.filterOption} ${filterMode === 'radius' ? styles.active : styles.inactive}`}
              onClick={() => selectedUniversityId && setFilterMode('radius')}
              role="radio"
              tabIndex={selectedUniversityId ? 0 : -1}
              aria-label="Distance radius filter"
              aria-checked={filterMode === 'radius'}
              onKeyDown={(e) => {
                if (selectedUniversityId && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  setFilterMode('radius')
                }
              }}
            >
              <RadiusSlider
                value={radiusSliderValue}
                onChange={handleRadiusChange}
                min={radiusMinValue}
                max={radiusMaxValue}
                step={radiusStepValue}
                disabled={!selectedUniversityId || filterMode !== 'radius'}
                unit={distanceUnit}
                onToggleUnit={toggleDistanceUnit}
              />
            </div>
            <div 
              className={`${styles.filterOption} ${filterMode === 'time' ? styles.active : styles.inactive}`}
              onClick={() => selectedUniversityId && setFilterMode('time')}
              role="radio"
              tabIndex={selectedUniversityId ? 0 : -1}
              aria-label="Travel time filter"
              aria-checked={filterMode === 'time'}
              onKeyDown={(e) => {
                if (selectedUniversityId && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  setFilterMode('time')
                }
              }}
            >
              <TimeSlider
                value={travelTimeMins}
                onChange={handleTimeChange}
                min={5}
                max={60}
                step={1}
                disabled={!selectedUniversityId || filterMode !== 'time'}
              />
            </div>
          </div>
        </div>
      )}

      <MapCanvas
        lines={lines}
        stations={stations}
        activeLineCodes={activeLineCodes}
        selectedStation={selectedStation}
        onStationSelect={setSelectedStation}
        lineLabels={lineLabels}
        universities={universitiesDataset}
        universityMode={true}
        selectedUniversityId={selectedUniversityId}
        onUniversityClick={handleUniversityClick}
        travelTimeResults={travelTimeResults}
        filterMode={filterMode}
        filteredStationIds={filteredStationIds}
        radiusMiles={radiusMiles}
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
