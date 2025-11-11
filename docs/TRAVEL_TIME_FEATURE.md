# Travel Time-Based Area Highlighting Feature

## Overview
When a user selects a university and adjusts the travel time slider, the system calculates reachable stations via transit/walking using Google's Distance Matrix API and highlights those areas on the map.

## User Flow

1. **Select a University**: Click on a university icon or marker
2. **Adjust Travel Time**: Use the time slider (5–30 minutes) to set maximum travel duration
3. **View Results**: Map displays:
   - Green highlight circles around reachable stations
   - Filtered tube lines serving those stations
   - Live announcements of results

## Technical Implementation

### Components Modified

#### 1. `UniversityExperience.tsx`
- Added `filterMode` state: `'radius'` or `'time'`
- Added `travelTimeResults` state to store Distance Matrix API responses
- Modified `handleTimeChange` to trigger time-based filtering
- Passes travel time data to MapCanvas for visualization

#### 2. `MapCanvas.tsx`
- New props: `travelTimeResults`, `filterMode`
- New overlay type: `highlightCircles` (google.maps.Circle[])
- Effect hook renders green circles (150m radius) around reachable stations
- Color intensity varies based on travel duration (closer = more opaque)

#### 3. `proximity.ts`
- New function: `calculateTimeBasedFilter()`
- Integrates Distance Matrix API results with existing line filtering logic
- Returns reachable station IDs, line codes, and travel time details

#### 4. `travelTime.ts` (NEW)
- `calculateTravelTimes()`: Batch Distance Matrix API requests (25 destinations/batch)
- `deriveReachableLines()`: Extract tube lines from reachable stations
- `getReachableStationCoordinates()`: Helper for visualization
- Supports TRANSIT, WALKING, and BICYCLING modes

### API Integration

**Google Distance Matrix API**
- Endpoint: `google.maps.DistanceMatrixService`
- Request parameters:
  - `origins`: University campus coordinates
  - `destinations`: All station coordinates (batched)
  - `travelMode`: TRANSIT (default), WALKING, or BICYCLING
  - `transitOptions`: Subway, train, bus with fewer transfers preference
- Rate limiting: 100ms delay between batches
- Quota: Standard Google Maps API limits apply

### Data Flow

```
User adjusts TimeSlider
  ↓
handleTimeChange(newTime)
  ↓
calculateTimeBasedFilter(campus, time, stations, lines)
  ↓
calculateTravelTimes(origin, stations, {mode, maxDuration})
  ↓ [Google Distance Matrix API - batched requests]
Travel time results (durationMinutes, stationId)
  ↓
deriveReachableLines(results, stations) → filteredLineCodes
  ↓
setActiveLineCodes() + setTravelTimeResults()
  ↓
MapCanvas receives updated props
  ↓
useEffect creates Circle overlays for reachable stations
  ↓
Visual: Green highlight circles + filtered lines
```

### Accessibility

- **Live Region Announcements**:
  - "Calculating stations reachable within X minutes..."
  - "Found Y stations reachable within X minutes, showing Z lines"
  - "No stations reachable within X minutes"

- **ARIA Labels**: Time slider includes `aria-valuetext="15 minutes"`

- **Keyboard Support**: Time slider fully operable via keyboard (arrow keys, +/- buttons)

### Performance Considerations

1. **API Rate Limiting**: 100ms delay between batches to avoid quota exhaustion
2. **Debouncing**: 200ms debounce on slider changes before triggering API calls
3. **Caching**: Consider implementing local cache for common origin-destination pairs (future enhancement)
4. **Batch Size**: 25 stations per Distance Matrix request (API limit)
5. **Error Handling**: Try-catch with user-friendly error announcements

### Visual Design

**Highlight Circles**
- Radius: 150 meters
- Fill: Green (`rgba(76, 175, 80, opacity)`) with opacity based on travel time
- Stroke: `#4CAF50` (darker green), 1px width
- Z-index: 500 (above polylines, below markers)

**Intensity Calculation**
```typescript
const intensity = Math.min(1, durationMinutes / 20)
const fillOpacity = 0.3 - intensity * 0.15
// Closer stations (< 20 mins) = more opaque
```

## Testing Scenarios

### Unit Tests
- `travelTime.ts`: Mock Distance Matrix API responses
- `proximity.ts`: Verify `calculateTimeBasedFilter` with mock data
- Edge cases: Zero results, API errors, empty station lists

### Integration Tests
- Select university → adjust time slider → verify circles render
- Switch between radius and time modes
- Multi-campus universities
- Boundary conditions (min 5 mins, max 30 mins)

### User Acceptance
- UAT-001: User can adjust time slider and see updated highlights
- UAT-002: Announcements are clear and timely
- UAT-003: Map remains responsive during API calls
- UAT-004: Error states display helpful messages

## Future Enhancements

1. **Isochrone Polygons**: Replace circles with proper isochrone boundaries
2. **Caching Layer**: Redis/IndexedDB for frequent origin-destination pairs
3. **Alternative Routes**: Display multiple transit options
4. **Time of Day**: Factor in rush hour vs off-peak times
5. **Walking Radius**: Combine walking + transit for hybrid filtering
6. **Station Tooltips**: Show exact travel time on hover
7. **Export**: Allow users to export reachable areas as GeoJSON

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### API Quotas (Google Cloud Console)
- Distance Matrix API: Enable and set appropriate quota
- Recommended: 10,000 elements/day for typical usage

## Known Limitations

1. **Static Data**: Station locations are static (no real-time disruptions)
2. **Simplification**: 150m circles are approximations (not actual walksheds)
3. **API Cost**: Distance Matrix API has usage costs beyond free tier
4. **London-Only**: Coordinate validation restricts to Greater London bounds

## References

- [Google Distance Matrix API Documentation](https://developers.google.com/maps/documentation/distance-matrix)
- [Transport for London API](https://api.tfl.gov.uk/)
- Feature Specification: `specs/002-university-transit-filter/spec.md`
