import type { Station } from '@/app/types/transit'
import { buildRightmoveStationUrl, buildZooplaStationUrl } from '@/app/lib/map/propertySearch'

const bakerStreet: Station = {
  stationId: '940GZZLUBST',
  displayName: 'Baker Street Underground Station',
  position: {
    type: 'Point',
    coordinates: [-0.15713, 51.522883],
  },
  lineCodes: ['bakerloo', 'circle', 'hammersmith-city', 'jubilee', 'metropolitan'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: 'Baker Street Underground Station',
  order: 0,
}

const regentsPark: Station = {
  stationId: '940GZZLURGP',
  displayName: "Regent's Park Underground Station",
  position: {
    type: 'Point',
    coordinates: [-0.146444, 51.523393],
  },
  lineCodes: ['bakerloo'],
  isInterchange: false,
  markerIcon: 'default',
  tooltipSummary: "Regent's Park Underground Station",
  order: 0,
}

const paddington: Station = {
  stationId: 'HUBPAD',
  displayName: 'Paddington',
  position: {
    type: 'Point',
    coordinates: [-0.17616, 51.516981],
  },
  lineCodes: ['bakerloo', 'circle', 'district', 'elizabeth', 'hammersmith-city'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: 'Paddington',
  order: 0,
}

const bondStreet: Station = {
  stationId: 'HUBBDS',
  displayName: 'Bond Street',
  position: {
    type: 'Point',
    coordinates: [-0.1494, 51.5142],
  },
  lineCodes: ['central', 'jubilee', 'elizabeth'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: 'Bond Street',
  order: 0,
}

describe('propertySearch helpers', () => {
  it('builds a Zoopla station search URL with the expected filters', () => {
    const url = buildZooplaStationUrl(bakerStreet)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)

    expect(parsed.origin).toBe('https://www.zoopla.co.uk')
    expect(parsed.pathname).toBe('/to-rent/map/property/station/tube/baker-street/')
    expect(parsed.searchParams.get('beds_min')).toBe('0')
    expect(parsed.searchParams.get('beds_max')).toBe('2')
    expect(parsed.searchParams.get('property_sub_type')).toBe('detached,semi-detached,terraced,flat,bungalow')
    expect(parsed.searchParams.get('is_shared_accommodation')).toBe('false')
    expect(parsed.searchParams.get('is_retirement_home')).toBe('false')
    expect(parsed.searchParams.get('price_max')).toBe('2000')
    expect(parsed.searchParams.get('price_frequency')).toBe('per_month')
    expect(parsed.searchParams.get('radius')).toBe('0.5')
    expect(parsed.searchParams.get('q')).toBe('Baker Street Station, London')
  })

  it('builds a Rightmove station search URL for mapped stations', () => {
    const url = buildRightmoveStationUrl(bakerStreet)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.origin).toBe('https://www.rightmove.co.uk')
    expect(parsed.pathname).toBe('/property-to-rent/map.html')
    expect(parsed.searchParams.get('locationIdentifier')).toBe('STATION^488')
    expect(parsed.searchParams.get('displayLocationIdentifier')).toBe('Baker-Street-Station')
    expect(parsed.searchParams.get('propertyTypes')).toBe('detached,semi-detached,terraced,flat,bungalow,private-halls')
    expect(parsed.searchParams.get('minBedrooms')).toBe('0')
    expect(parsed.searchParams.get('maxBedrooms')).toBe('2')
    expect(parsed.searchParams.get('maxPrice')).toBe('2000')
    expect(parsed.searchParams.get('radius')).toBe('0.5')
    expect(parsed.searchParams.get('sortType')).toBe('6')
    expect(parsed.searchParams.get('areaSizeUnit')).toBe('sqft')
    expect(parsed.searchParams.get('viewType')).toBe('MAP')
    expect(parsed.searchParams.get('channel')).toBe('RENT')
    expect(parsed.searchParams.get('mustHave')).toBeNull()
    expect(parsed.searchParams.get('dontShow')).toBe('houseShare,retirement')
    expect(parsed.searchParams.get('index')).toBe('0')
    expect(parsed.searchParams.get('numberOfPropertiesPerPage')).toBe('95')
    expect(parsed.searchParams.get('includeLetAgreed')).toBe('false')
  })

  it('omits the Rightmove URL when a station has no reviewed mapping', () => {
    expect(buildRightmoveStationUrl({
      ...regentsPark,
      stationId: 'HUBCHX',
      displayName: 'Charing Cross Underground Station',
    })).toBeNull()
  })

  it('uses the corrected Paddington Rightmove station identifier', () => {
    const url = buildRightmoveStationUrl(paddington)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.searchParams.get('locationIdentifier')).toBe('STATION^6965')
    expect(parsed.searchParams.get('displayLocationIdentifier')).toBe('Paddington-Station')
  })

  it('shows a Rightmove URL for Bond Street once the station mapping is verified', () => {
    const url = buildRightmoveStationUrl(bondStreet)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.searchParams.get('locationIdentifier')).toBe('STATION^1166')
    expect(parsed.searchParams.get('displayLocationIdentifier')).toBe('Bond-Street-Station')
  })
})