/**
 * Example Usage: Travel Time-Based Filtering
 * 
 * This demonstrates how to use the new time-based filtering feature.
 */

import { calculateTimeBasedFilter } from '../app/lib/map/proximity'
import type { Station, TransitLine } from '../app/types/transit'

/**
 * Example: Find all stations reachable within 15 minutes from UCL Main Campus
 */
async function exampleUCLFiltering(
  stations: Station[],
  lines: TransitLine[]
) {
  // UCL Main Campus coordinates [longitude, latitude]
  const uclCoordinates: [number, number] = [-0.1339, 51.5246]
  
  console.log('🎓 Calculating stations reachable within 15 minutes from UCL...')
  
  try {
    const result = await calculateTimeBasedFilter(
      uclCoordinates,
      15, // 15 minutes
      stations,
      lines,
      'TRANSIT' // Use public transit
    )
    
    console.log('✅ Results:')
    console.log(`   Reachable Stations: ${result.reachableStationIds.length}`)
    console.log(`   Affected Lines: ${result.filteredLineCodes.join(', ')}`)
    console.log('\n📍 Sample Travel Times:')
    
    // Show first 5 stations with their travel times
    result.travelTimes.slice(0, 5).forEach(t => {
      const station = stations.find(s => s.stationId === t.stationId)
      console.log(`   ${station?.displayName}: ${t.durationMinutes} mins (${Math.round(t.distance)}m)`)
    })
    
    return result
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

/**
 * Example: Compare walking vs transit from LSE
 */
async function exampleLSEComparison(
  stations: Station[],
  lines: TransitLine[]
) {
  const lseCoordinates: [number, number] = [-0.1166, 51.5145]
  
  console.log('\n🏫 LSE: Comparing walking vs transit (10 minutes)...')
  
  // Walking
  const walkingResult = await calculateTimeBasedFilter(
    lseCoordinates,
    10,
    stations,
    lines,
    'WALKING'
  )
  
  // Transit
  const transitResult = await calculateTimeBasedFilter(
    lseCoordinates,
    10,
    stations,
    lines,
    'TRANSIT'
  )
  
  console.log(`\n🚶 Walking: ${walkingResult.reachableStationIds.length} stations`)
  console.log(`🚇 Transit: ${transitResult.reachableStationIds.length} stations`)
  console.log(`\n📊 Transit advantage: ${transitResult.reachableStationIds.length - walkingResult.reachableStationIds.length} more stations`)
}

/**
 * Example: Time series analysis - how does reachable area grow with time?
 */
async function exampleTimeSeriesAnalysis(
  stations: Station[],
  lines: TransitLine[]
) {
  const imperialCoordinates: [number, number] = [-0.1749, 51.4988]
  const timeIntervals = [5, 10, 15, 20, 25, 30]
  
  console.log('\n🏛️ Imperial College: Time series analysis...')
  console.log('Time (min) | Stations | Lines')
  console.log('-----------|----------|------')
  
  for (const minutes of timeIntervals) {
    const result = await calculateTimeBasedFilter(
      imperialCoordinates,
      minutes,
      stations,
      lines,
      'TRANSIT'
    )
    
    console.log(
      `${String(minutes).padStart(10)} | ${String(result.reachableStationIds.length).padStart(8)} | ${String(result.filteredLineCodes.length).padStart(5)}`
    )
    
    // Add small delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

/**
 * Example: Find optimal campus based on connectivity
 */
async function exampleOptimalCampus(
  stations: Station[],
  lines: TransitLine[]
) {
  const campuses = [
    { name: 'UCL Main', coords: [-0.1339, 51.5246] as [number, number] },
    { name: 'Imperial South Kensington', coords: [-0.1749, 51.4988] as [number, number] },
    { name: 'LSE', coords: [-0.1166, 51.5145] as [number, number] },
    { name: "King's Strand", coords: [-0.1159, 51.5115] as [number, number] },
  ]
  
  console.log('\n🏆 Finding most connected campus (15 min transit)...')
  
  const results = await Promise.all(
    campuses.map(async campus => {
      const result = await calculateTimeBasedFilter(
        campus.coords,
        15,
        stations,
        lines,
        'TRANSIT'
      )
      return {
        name: campus.name,
        stationCount: result.reachableStationIds.length,
        lineCount: result.filteredLineCodes.length,
      }
    })
  )
  
  const sorted = results.sort((a, b) => b.stationCount - a.stationCount)
  
  console.log('\nRankings:')
  sorted.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name}: ${r.stationCount} stations, ${r.lineCount} lines`)
  })
}

export {
  exampleUCLFiltering,
  exampleLSEComparison,
  exampleTimeSeriesAnalysis,
  exampleOptimalCampus,
}
