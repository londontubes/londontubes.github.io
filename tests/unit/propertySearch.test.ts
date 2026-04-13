import type { Station } from '@/app/types/transit'
import {
  buildRightmoveStationBuyUrl,
  buildRightmoveStationBuyUrls,
  buildRightmoveStationUrl,
  buildRightmoveStationUrls,
  buildZooplaStationBuyUrl,
  buildZooplaStationUrl,
} from '@/app/lib/map/propertySearch'
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

const liverpoolStreet: Station = {
  stationId: 'HUBLST',
  displayName: 'Liverpool Street',
  position: {
    type: 'Point',
    coordinates: [-0.082965, 51.517338],
  },
  lineCodes: ['central', 'circle', 'elizabeth', 'hammersmith-city', 'metropolitan'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: 'Liverpool Street',
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

const westminster: Station = {
  stationId: 'HUBWSM',
  displayName: 'Westminster',
  position: {
    type: 'Point',
    coordinates: [-0.1247, 51.501],
  },
  lineCodes: ['circle', 'district', 'jubilee'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: 'Westminster',
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

const southall: Station = {
  stationId: '910GSTHALL',
  displayName: 'Southall Rail Station',
  position: {
    type: 'Point',
    coordinates: [-0.37861, 51.505957],
  },
  lineCodes: ['elizabeth'],
  isInterchange: false,
  markerIcon: 'default',
  tooltipSummary: 'Southall Rail Station',
  order: 0,
}

const ealingBroadway: Station = {
  stationId: 'HUBEAL',
  displayName: 'Ealing Broadway',
  position: {
    type: 'Point',
    coordinates: [-0.302131, 51.514993],
  },
  lineCodes: ['central', 'district', 'elizabeth'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: 'Ealing Broadway',
  order: 0,
}

const eustonSquare: Station = {
  stationId: '940GZZLUESQ',
  displayName: 'Euston Square Underground Station',
  position: {
    type: 'Point',
    coordinates: [-0.135829, 51.525604],
  },
  lineCodes: ['circle', 'hammersmith-city', 'metropolitan'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: 'Euston Square Underground Station',
  order: 0,
}

const stratford: Station = {
  stationId: 'HUBSRA',
  displayName: 'Stratford',
  position: {
    type: 'Point',
    coordinates: [-0.00399, 51.54199],
  },
  lineCodes: ['central', 'dlr', 'elizabeth', 'jubilee'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: 'Stratford',
  order: 0,
}

const kingsCrossStPancras: Station = {
  stationId: 'HUBKGX',
  displayName: "King's Cross & St Pancras International",
  position: {
    type: 'Point',
    coordinates: [-0.1236, 51.5308],
  },
  lineCodes: ['circle', 'hammersmith-city', 'metropolitan', 'northern', 'piccadilly', 'victoria'],
  isInterchange: true,
  markerIcon: 'default',
  tooltipSummary: "King's Cross & St Pancras International",
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

  it('increases the rental radius for Westminster across property portals', () => {
    const rightmoveUrl = buildRightmoveStationUrl(westminster)
    const zooplaUrl = buildZooplaStationUrl(westminster)

    expect(rightmoveUrl).not.toBeNull()
    expect(zooplaUrl).not.toBeNull()

    expect(new URL(rightmoveUrl!).searchParams.get('radius')).toBe('1')
    expect(new URL(zooplaUrl!).searchParams.get('radius')).toBe('1')
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

  it('builds a Zoopla buy search URL with the expected filters', () => {
    const url = buildZooplaStationBuyUrl(bakerStreet)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.origin).toBe('https://www.zoopla.co.uk')
    expect(parsed.pathname).toBe('/for-sale/map/property/baker-street/')
    expect(parsed.searchParams.get('beds_min')).toBe('3')
    expect(parsed.searchParams.getAll('feature')).toEqual(['has_garden', 'has_parking_garage'])
    expect(parsed.searchParams.get('is_auction')).toBe('false')
    expect(parsed.searchParams.get('is_retirement_home')).toBe('false')
    expect(parsed.searchParams.get('is_shared_ownership')).toBe('false')
    expect(parsed.searchParams.get('price_max')).toBe('700000')
    expect(parsed.searchParams.getAll('property_sub_type')).toEqual([
      'terraced',
      'bungalow',
      'detached',
      'semi_detached',
      'farms_land',
    ])
    expect(parsed.searchParams.get('q')).toBe('Baker Street, London')
    expect(parsed.searchParams.get('radius')).toBe('0.5')
    expect(parsed.searchParams.get('search_source')).toBe('for-sale')
    expect(parsed.searchParams.get('map_app')).toBe('true')
  })

  it('builds a Rightmove buy search URL for mapped stations', () => {
    const url = buildRightmoveStationBuyUrl(bakerStreet)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.origin).toBe('https://www.rightmove.co.uk')
    expect(parsed.pathname).toBe('/property-for-sale/map.html')
    expect(parsed.searchParams.get('locationIdentifier')).toBe('STATION^488')
    expect(parsed.searchParams.get('displayLocationIdentifier')).toBe('Baker-Street-Station')
    expect(parsed.searchParams.get('useLocationIdentifier')).toBe('true')
    expect(parsed.searchParams.get('buy')).toBe('For sale')
    expect(parsed.searchParams.get('radius')).toBe('0.5')
    expect(parsed.searchParams.get('maxPrice')).toBe('700000')
    expect(parsed.searchParams.get('minBedrooms')).toBe('3')
    expect(parsed.searchParams.get('_includeSSTC')).toBe('on')
    expect(parsed.searchParams.get('propertyTypes')).toBe('detached,semi-detached,terraced,bungalow')
    expect(parsed.searchParams.get('sortType')).toBe('2')
    expect(parsed.searchParams.get('viewType')).toBe('MAP')
    expect(parsed.searchParams.get('channel')).toBe('BUY')
    expect(parsed.searchParams.get('transactionType')).toBe('BUY')
    expect(parsed.searchParams.get('tenureTypes')).toBe('FREEHOLD')
    expect(parsed.searchParams.get('index')).toBe('0')
    expect(parsed.searchParams.get('mustHave')).toBe('garden,parking')
    expect(parsed.searchParams.get('dontShow')).toBe('retirement,sharedOwnership,auction')
  })

  it('uses the working Zoopla rail slug for West Ealing', () => {
    const url = buildZooplaStationUrl(westEaling)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.pathname).toBe('/to-rent/map/property/station/rail/west-ealing/')
    expect(parsed.searchParams.get('q')).toBe('West Ealing Rail Station, London')
  })

  it('uses the specific Zoopla buy area for Ealing Broadway', () => {
    const url = buildZooplaStationBuyUrl(ealingBroadway)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.pathname).toBe('/for-sale/map/property/london/the-broadway/ealing-broadway-centre/')
    expect(parsed.searchParams.get('beds_min')).toBe('3')
    expect(parsed.searchParams.get('price_max')).toBe('700000')
    expect(parsed.searchParams.get('q')).toBe('Ealing Broadway, London')
    expect(parsed.searchParams.get('radius')).toBe('0.5')
    expect(parsed.searchParams.get('search_source')).toBe('for-sale')
    expect(parsed.searchParams.getAll('feature')).toEqual([])
    expect(parsed.searchParams.getAll('property_sub_type')).toEqual([])
    expect(parsed.searchParams.get('map_app')).toBeNull()
  })

  it('uses the Fitzrovia Zoopla buy area for Euston Square', () => {
    const url = buildZooplaStationBuyUrl(eustonSquare)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.pathname).toBe('/for-sale/map/property/fitzrovia/')
    expect(parsed.searchParams.get('q')).toBe('Fitzrovia, London')
    expect(parsed.searchParams.get('radius')).toBe('0.5')
    expect(parsed.searchParams.get('search_source')).toBe('for-sale')
    expect(parsed.searchParams.getAll('feature')).toEqual([])
    expect(parsed.searchParams.getAll('property_sub_type')).toEqual([])
    expect(parsed.searchParams.get('map_app')).toBeNull()
  })

  it('uses a minimal area-based Zoopla buy search for Southall', () => {
    const url = buildZooplaStationBuyUrl(southall)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.pathname).toBe('/for-sale/map/property/southall/')
    expect(parsed.searchParams.get('beds_min')).toBe('3')
    expect(parsed.searchParams.get('price_max')).toBe('700000')
    expect(parsed.searchParams.get('q')).toBe('Southall, London')
    expect(parsed.searchParams.get('radius')).toBe('0.5')
    expect(parsed.searchParams.get('search_source')).toBe('for-sale')
    expect(parsed.searchParams.getAll('feature')).toEqual([])
    expect(parsed.searchParams.getAll('property_sub_type')).toEqual([])
    expect(parsed.searchParams.get('map_app')).toBeNull()
  })

  it('uses the Kings Cross Zoopla buy area for Kings Cross St Pancras', () => {
    const url = buildZooplaStationBuyUrl(kingsCrossStPancras)

    expect(url).not.toBeNull()

    const parsed = new URL(url!)
    expect(parsed.pathname).toBe('/for-sale/map/property/london/kings-cross/')
    expect(parsed.searchParams.get('q')).toBe('Kings Cross, London')
    expect(parsed.searchParams.get('radius')).toBe('0.5')
    expect(parsed.searchParams.get('search_source')).toBe('for-sale')
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

  it('uses the corrected Rightmove station identifier for Liverpool Street', () => {
    const rentUrl = buildRightmoveStationUrl(liverpoolStreet)
    const buyUrl = buildRightmoveStationBuyUrl(liverpoolStreet)

    expect(rentUrl).not.toBeNull()
    expect(buyUrl).not.toBeNull()

    expect(new URL(rentUrl!).searchParams.get('locationIdentifier')).toBe('STATION^5615')
    expect(new URL(buyUrl!).searchParams.get('locationIdentifier')).toBe('STATION^5615')
  })

  it('uses the corrected Rightmove station identifier for Stratford', () => {
    const rentUrl = buildRightmoveStationUrl(stratford)
    const buyUrl = buildRightmoveStationBuyUrl(stratford)

    expect(rentUrl).not.toBeNull()
    expect(buyUrl).not.toBeNull()

    expect(new URL(rentUrl!).searchParams.get('locationIdentifier')).toBe('STATION^8813')
    expect(new URL(buyUrl!).searchParams.get('locationIdentifier')).toBe('STATION^8813')
  })

  it('uses the corrected Rightmove station identifier for Kings Cross St Pancras', () => {
    const rentUrl = buildRightmoveStationUrl(kingsCrossStPancras)
    const buyUrl = buildRightmoveStationBuyUrl(kingsCrossStPancras)

    expect(rentUrl).not.toBeNull()
    expect(buyUrl).not.toBeNull()

    expect(new URL(rentUrl!).searchParams.get('locationIdentifier')).toBe('STATION^5165')
    expect(new URL(buyUrl!).searchParams.get('locationIdentifier')).toBe('STATION^5165')
    expect(new URL(buyUrl!).searchParams.get('displayLocationIdentifier')).toBe("King's-Cross-St.-Pancras-Station")
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

  it('returns both Rightmove buy searches for Hammersmith', () => {
    const urls = buildRightmoveStationBuyUrls(hammersmith)

    expect(urls).toHaveLength(2)
    expect(urls.map((item) => item.label)).toEqual([
      'Rightmove: Hammersmith District & Piccadilly',
      'Rightmove: Hammersmith Hammersmith & City',
    ])

    const first = new URL(urls[0].url)
    const second = new URL(urls[1].url)

    expect(first.pathname).toBe('/property-for-sale/map.html')
    expect(first.searchParams.get('locationIdentifier')).toBe('STATION^4172')
    expect(second.searchParams.get('locationIdentifier')).toBe('STATION^4175')
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
    const missingZooplaBuy = stations.filter((station) => !buildZooplaStationBuyUrl(station))
    const missingRightmoveBuy = stations.filter((station) => buildRightmoveStationBuyUrls(station).length === 0)

    expect(missingZoopla).toEqual([])
    expect(missingRightmove).toEqual([])
    expect(missingZooplaBuy).toEqual([])
    expect(missingRightmoveBuy).toEqual([])
  })
})