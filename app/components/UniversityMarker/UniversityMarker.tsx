/**
 * UniversityMarker Component
 * 
 * Renders a Google Maps marker for a university location with click handling.
 * This is a helper component used by MapCanvas.
 * 
 * Feature: 002-university-transit-filter
 */

import type { University } from '@/app/types/university'

export interface UniversityMarkerProps {
  university: University
  isSelected: boolean
  onClick: (universityId: string) => void
  map: google.maps.Map
  coordinates: [number, number]
}

export function createUniversityMarker(
  props: UniversityMarkerProps
): google.maps.Marker {
  const { university, isSelected, onClick, map, coordinates } = props
  
  const nearestStation = university.campuses[0].nearestStation
  const title = `${university.displayName}\nNearest station: ${nearestStation.name}`
  
  const marker = new google.maps.Marker({
    title,
    position: {
      lng: coordinates[0],
      lat: coordinates[1],
    },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isSelected ? '#FFD700' : '#DC241F', // Gold when selected, TfL red otherwise
      fillOpacity: 1,
      strokeColor: '#000000',
      strokeWeight: isSelected ? 3 : 2,
      scale: isSelected ? 16 : 12,
    },
    map,
    zIndex: isSelected ? 3000 : 2000,
  })
  
  marker.addListener('click', () => {
    onClick(university.universityId)
  })
  
  return marker
}
