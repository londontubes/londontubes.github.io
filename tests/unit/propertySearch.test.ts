import type { Station } from '@/app/types/transit'
import { buildRightmoveStationUrl, buildRightmoveStationUrls, buildZooplaStationUrl } from '@/app/lib/map/propertySearch'
import stationsData from '@/public/data/stations.json'

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

const hammersmith: Station = {
  stationId: 'HUBHMS',
  displayName: 'Hammersmith',
  position: {
    type: 'Point',
    coordinates: [-0.225, 51.4936],
  },
  lineCodes: ['district', 'piccadilly', 'circle', 'hammersmith-city'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: 'Hammersmith',
  order: 0,
}

const westEaling: Station = {
  stationId: '910GWEALING',
  displayName: 'West Ealing Rail Station',
  position: {
    type: 'Point',
    coordinates: [-0.320133, 51.513506],
  },
  lineCodes: ['elizabeth'],
  isInterchange: false,
  markerIcon: 'default',
  tooltipSummary: 'West Ealing Rail Station',
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

  it('uses the working Zoopla rail slug for West Ealing', () => {
    const url = buildZooplaStationUrl(westEaling)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.pathname).toBe('/to-rent/map/property/station/rail/west-ealing/')
    expect(parsed.searchParams.get('q')).toBe('West Ealing Rail Station, London')
  })

  it('builds a Rightmove URL for Charing Cross via the fallback override mapping', () => {
    const url = buildRightmoveStationUrl({
      ...regentsPark,
      stationId: 'HUBCHX',
      displayName: 'Charing Cross Underground Station',
    })

    expect(url).not.toBeNull()
    const parsed = new URL(url!)
    expect(parsed.searchParams.get('locationIdentifier')).toBe('STATION^1940')
    expect(parsed.searchParams.get('displayLocationIdentifier')).toBe('Charing-Cross-Station')
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

  it('returns both Rightmove station searches for Hammersmith', () => {
    const urls = buildRightmoveStationUrls(hammersmith)

    expect(urls).toHaveLength(2)
    expect(urls.map((item) => item.label)).toEqual([
      'Rightmove: Hammersmith District & Piccadilly',
      'Rightmove: Hammersmith Hammersmith & City',
    ])

    const first = new URL(urls[0].url)
    const second = new URL(urls[1].url)

    expect(first.searchParams.get('locationIdentifier')).toBe('STATION^4172')
    expect(first.searchParams.get('displayLocationIdentifier')).toBe('Hammersmith-(District-&-Piccadilly)-Station')
    expect(second.searchParams.get('locationIdentifier')).toBe('STATION^4175')
    expect(second.searchParams.get('displayLocationIdentifier')).toBe('Hammersmith-(Hammersmith-&-City)-Station')
  })

  it('keeps the single Rightmove helper backward compatible for Hammersmith', () => {
    const url = buildRightmoveStationUrl(hammersmith)

    expect(url).not.toBeNull()
    expect(new URL(url!).searchParams.get('locationIdentifier')).toBe('STATION^4172')
  })

  it('provides both Zoopla and Rightmove links for every station in the dataset', () => {
    const stations = (Array.isArray(stationsData) ? stationsData : stationsData.stations) as Station[]
    const missingZoopla = stations.filter((station) => !buildZooplaStationUrl(station))
    const missingRightmove = stations.filter((station) => buildRightmoveStationUrls(station).length === 0)

    expect(missingZoopla).toEqual([])
    expect(missingRightmove).toEqual([])
  })
})