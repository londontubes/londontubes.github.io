/**
 * Station Filtering Example
 * 
 * Demonstrates the difference between old (line-based) and new (station-based) filtering
 */

import { calculateProximityFilter } from '../app/lib/map/proximity'
import type { Station, TransitLine } from '../app/types/transit'

/**
 * Compare old vs new filtering approach for UCL Main Campus
 */
function demonstrateFilteringImprovement(
  stations: Station[],
  lines: TransitLine[]
) {
  const uclCoordinates: [number, number] = [-0.1339, 51.5246] // UCL Main Campus
  const radius = 0.25 // Quarter mile

  console.log('🎓 UCL Main Campus - 0.25 Mile Radius Comparison\n')
  console.log('═'.repeat(60))

  // Run proximity filter
  const filter = calculateProximityFilter(
    uclCoordinates,
    radius,
    stations,
    lines
  )

  // OLD APPROACH: Show all stations on filtered lines
  const oldApproachStations = stations.filter(station =>
    station.lineCodes.some(code => filter.filteredLineCodes.includes(code))
  )

  // NEW APPROACH: Show only nearby stations
  const newApproachStations = stations.filter(station =>
    filter.nearbyStationIds.includes(station.stationId)
  )

  console.log('\n📊 COMPARISON RESULTS:')
  console.log('─'.repeat(60))
  console.log(`Affected Lines: ${filter.filteredLineCodes.join(', ')}`)
  console.log()
  console.log(`❌ OLD: ${oldApproachStations.length} stations (entire lines visible)`)
  console.log(`✅ NEW: ${newApproachStations.length} stations (radius-filtered)`)
  console.log(`📉 Reduction: ${oldApproachStations.length - newApproachStations.length} stations hidden (${Math.round((1 - newApproachStations.length / oldApproachStations.length) * 100)}% less clutter)`)

  console.log('\n🗺️  STATIONS ACTUALLY WITHIN 0.25 MILES:')
  console.log('─'.repeat(60))
  newApproachStations.forEach(station => {
    console.log(`  • ${station.displayName}`)
  })

  console.log('\n🚫 EXAMPLE STATIONS NOW HIDDEN (but were visible before):')
  console.log('─'.repeat(60))
  const hiddenStations = oldApproachStations
    .filter(s => !filter.nearbyStationIds.includes(s.stationId))
    .slice(0, 10) // Show first 10
  
  hiddenStations.forEach(station => {
    console.log(`  • ${station.displayName} (on same lines, but too far away)`)
  })
  
  if (oldApproachStations.length - newApproachStations.length > 10) {
    console.log(`  ... and ${oldApproachStations.length - newApproachStations.length - 10} more`)
  }

  return {
    oldCount: oldApproachStations.length,
    newCount: newApproachStations.length,
    improvement: oldApproachStations.length - newApproachStations.length,
  }
}

/**
 * Test multiple universities at different radii
 */
function compareAcrossUniversities(
  stations: Station[],
  lines: TransitLine[]
) {
  const testCases = [
    { name: 'UCL Main', coords: [-0.1339, 51.5246] as [number, number] },
    { name: 'Imperial South Ken', coords: [-0.1749, 51.4988] as [number, number] },
    { name: 'LSE', coords: [-0.1166, 51.5145] as [number, number] },
    { name: "King's Strand", coords: [-0.1159, 51.5115] as [number, number] },
  ]

  const radii = [0.25, 0.5, 0.75, 1.0]

  console.log('\n\n📈 FILTERING EFFICIENCY ACROSS UNIVERSITIES')
  console.log('═'.repeat(80))
  console.log('\nRadius | University           | Old Stations | New Stations | Reduction')
  console.log('─'.repeat(80))

  for (const testCase of testCases) {
    for (const radius of radii) {
      const filter = calculateProximityFilter(
        testCase.coords,
        radius,
        stations,
        lines
      )

      const oldCount = stations.filter(s =>
        s.lineCodes.some(code => filter.filteredLineCodes.includes(code))
      ).length

      const newCount = filter.nearbyStationIds.length

      console.log(
        `${radius.toFixed(2)}   | ${testCase.name.padEnd(20)} | ${String(oldCount).padStart(12)} | ${String(newCount).padStart(12)} | ${String(oldCount - newCount).padStart(9)} (${Math.round((1 - newCount / oldCount) * 100)}%)`
      )
    }
    console.log('─'.repeat(80))
  }
}

/**
 * Visual demonstration of what users see
 */
function visualMapComparison() {
  console.log('\n\n🗺️  USER EXPERIENCE COMPARISON')
  console.log('═'.repeat(80))
  
  console.log('\n❌ BEFORE (showing entire lines):')
  console.log(`
  User selects Imperial College, 0.25 mile radius
  
  Map shows:
  ├─ Circle Line: All stations from Hammersmith to Aldgate (60+ stations!) ❌
  ├─ District Line: All stations from Richmond to Upminster (60+ stations!) ❌
  └─ Piccadilly Line: All stations from Uxbridge to Cockfosters (53 stations!) ❌
  
  Result: Overwhelming clutter, hard to identify nearby stations
  `)

  console.log('\n✅ AFTER (showing only nearby stations):')
  console.log(`
  User selects Imperial College, 0.25 mile radius
  
  Map shows:
  ├─ South Kensington ✓ (directly adjacent)
  ├─ Gloucester Road ✓ (0.2 miles)
  ├─ Knightsbridge ✓ (0.24 miles)
  └─ (3 stations total)
  
  Result: Clean, focused view of actually accessible stations
  `)
}

export {
  demonstrateFilteringImprovement,
  compareAcrossUniversities,
  visualMapComparison,
}
