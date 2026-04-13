import type { Station } from '@/app/types/transit'
import { RIGHTMOVE_STATION_TEMPLATE, type RightmoveStationTemplateEntry } from '@/docs/rightmove-station-template'

const RIGHTMOVE_STATION_MAP: Record<string, RightmoveStationTemplateEntry> = RIGHTMOVE_STATION_TEMPLATE.reduce(
  (acc, entry) => {
    acc[entry.stationId] = entry
    return acc
  },
  {} as Record<string, RightmoveStationTemplateEntry>
)

export interface RightmoveStationLink {
  label: string
  url: string
}

export interface RightmoveStationTarget {
  label: string
  locationIdentifier: string
  displayLocationIdentifier: string
}

interface RightmoveOverrideOption {
  locationIdentifier: string
  displayName: string
  label?: string
}

interface RightmoveSearchConfig {
  baseUrl: string
  params: Record<string, string>
}

const RIGHTMOVE_STATION_LINK_OVERRIDES: Record<string, RightmoveOverrideOption[]> = {
  HUBCHX: [{ locationIdentifier: '1940', displayName: 'Charing Cross Station' }],
  HUBEPH: [{ locationIdentifier: '3197', displayName: 'Elephant & Castle Station' }],
  HUBHDN: [{ locationIdentifier: '4238', displayName: 'Harlesden Station' }],
  HUBHRW: [{ locationIdentifier: '4283', displayName: 'Harrow & Wealdstone Station' }],
  HUBQPW: [{ locationIdentifier: '7502', displayName: "Queen's Park Station" }],
  HUBSOK: [{ locationIdentifier: '8420', displayName: 'South Kenton Station' }],
  '940GZZLUBLG': [{ locationIdentifier: '908', displayName: 'Bethnal Green (Underground) Station' }],
  HUBGFD: [{ locationIdentifier: '3986', displayName: 'Greenford Station' }],
  HUBSPB: [
    {
      locationIdentifier: '8153',
      displayName: "Shepherd's Bush (Central) Station",
      label: "Rightmove: Shepherd's Bush Central",
    },
    {
      locationIdentifier: '8156',
      displayName: "Shepherd's Bush (Hammersmith & City) Station",
      label: "Rightmove: Shepherd's Bush Hammersmith & City",
    },
  ],
  '940GZZLUERC': [{ locationIdentifier: '3170', displayName: 'Edgware Road (Circle, District, Hammersmith & City) Station' }],
  HUBHMS: [
    {
      locationIdentifier: '4172',
      displayName: 'Hammersmith (District & Piccadilly) Station',
      label: 'Rightmove: Hammersmith District & Piccadilly',
    },
    {
      locationIdentifier: '4175',
      displayName: 'Hammersmith (Hammersmith & City) Station',
      label: 'Rightmove: Hammersmith Hammersmith & City',
    },
  ],
  HUBWSM: [{ locationIdentifier: '9953', displayName: 'Westminster Station' }],
  '940GZZLUBBB': [{ locationIdentifier: '1445', displayName: 'Bromley-by-Bow Station' }],
  HUBKPA: [{ locationIdentifier: '5054', displayName: 'Kensington Olympia Station' }],
  HUBWEH: [{ locationIdentifier: '9842', displayName: 'West Ham Station' }],
  HUBWIM: [{ locationIdentifier: '10127', displayName: 'Wimbledon Station' }],
  '940GZZDLBEC': [{ locationIdentifier: '755', displayName: 'Beckton Station' }],
  '940GZZDLCYP': [{ locationIdentifier: '2567', displayName: 'Cyprus Station' }],
  '940GZZDLSTL': [{ locationIdentifier: '16810', displayName: 'Star Lane Station' }],
  HUBGNW: [
    { locationIdentifier: '4001', displayName: 'Greenwich Station', label: 'Rightmove: Greenwich Rail' },
    { locationIdentifier: '4004', displayName: 'Greenwich DLR Station', label: 'Rightmove: Greenwich DLR' },
  ],
  '910GHAYESAH': [{ locationIdentifier: '4385', displayName: 'Hayes & Harlington Station' }],
  '910GWOLWXR': [{ locationIdentifier: '15846', displayName: 'Woolwich Station' }],
  HUBABW: [{ locationIdentifier: '2', displayName: 'Abbey Wood Station' }],
  HUBH13: [{ locationIdentifier: '5807', displayName: 'London Heathrow Airport Terminals 1, 2 & 3 Station' }],
  HUBHX5: [{ locationIdentifier: '10465', displayName: 'Heathrow Terminal 5 Station' }],
  HUBWHD: [
    { locationIdentifier: '9848', displayName: 'West Hampstead Station', label: 'Rightmove: West Hampstead' },
    { locationIdentifier: '9854', displayName: 'West Hampstead Thameslink Station', label: 'Rightmove: West Hampstead Thameslink' },
  ],
  HUBCFO: [{ locationIdentifier: '1907', displayName: 'Chalfont & Latimer Station' }],
  HUBHOH: [{ locationIdentifier: '4289', displayName: 'Harrow-on-the-Hill Station' }],
  '940GZZLUTAW': [{ locationIdentifier: '9281', displayName: 'Totteridge & Whetstone Station' }],
  HUBEUS: [{ locationIdentifier: '3311', displayName: 'Euston Station' }],
  HUBKTN: [{ locationIdentifier: '5069', displayName: 'Kentish Town Station' }],
  HUBBRX: [{ locationIdentifier: '15726', displayName: 'Brixton Underground Station' }],
  HUBHHY: [{ locationIdentifier: '4583', displayName: 'Highbury & Islington Station' }],
}

const RIGHTMOVE_RENT_SEARCH_CONFIG: RightmoveSearchConfig = {
  baseUrl: 'https://www.rightmove.co.uk/property-to-rent/map.html',
  params: {
  propertyTypes: 'detached,semi-detached,terraced,flat,bungalow,private-halls',
  minBedrooms: '0',
  maxBedrooms: '2',
  maxPrice: '2000',
  radius: '0.5',
  sortType: '6',
  areaSizeUnit: 'sqft',
  viewType: 'MAP',
  channel: 'RENT',
  index: '0',
  numberOfPropertiesPerPage: '95',
  includeLetAgreed: 'false',
  dontShow: 'houseShare,retirement',
  },
} as const

const RIGHTMOVE_BUY_SEARCH_CONFIG: RightmoveSearchConfig = {
  baseUrl: 'https://www.rightmove.co.uk/property-for-sale/map.html',
  params: {
    useLocationIdentifier: 'true',
    buy: 'For sale',
    radius: '0.5',
    maxPrice: '700000',
    minBedrooms: '3',
    _includeSSTC: 'on',
    propertyTypes: 'detached,semi-detached,terraced,bungalow',
    sortType: '2',
    viewType: 'MAP',
    channel: 'BUY',
    transactionType: 'BUY',
    tenureTypes: 'FREEHOLD',
    index: '0',
    mustHave: 'garden,parking',
    dontShow: 'retirement,sharedOwnership,auction',
  },
} as const

const ZOOPLA_RENT_SEARCH_LIMITS = {
  minBedrooms: '0',
  maxBedrooms: '2',
  maxPrice: '2000',
  radius: '0.5',
  zooplaPropertySubType: 'detached,semi-detached,terraced,flat,bungalow',
} as const

const ZOOPLA_BUY_SEARCH_LIMITS = {
  minBedrooms: '3',
  maxPrice: '700000',
  radius: '0.5',
  propertySubTypes: ['terraced', 'bungalow', 'detached', 'semi_detached', 'farms_land'] as const,
  features: ['has_garden', 'has_parking_garage'] as const,
} as const

function sanitizeZooplaSearchLocation(value: string): string {
  return value.replace(/[\u2018\u2019]/g, '')
}

interface ZooplaOverride {
  slug?: string
  type?: 'tube' | 'rail' | 'dlr'
  path?: string
  buyPath?: string
  buySearchLocation?: string
  buyRadius?: string
  buyMode?: 'default' | 'minimal'
}

const ZOOPLA_SLUG_OVERRIDES: Record<string, ZooplaOverride> = {
  '910GBNHAM': { slug: 'burnham-bucks' },
  '910GWEALING': { slug: 'west-ealing', type: 'rail' },
  '910GSTHALL': { slug: 'southall', buyPath: 'southall', buyMode: 'minimal' },
  '910GWOLWXR': { slug: 'woolwich-arsenal', type: 'rail' },
  '940GZZDLCLA': { slug: 'crossharbour-and-london-arena' },
  '940GZZLUERC': { slug: 'edgware-road-circle' },
  '940GZZLUESQ': { buyPath: 'fitzrovia', buySearchLocation: 'Fitzrovia', buyMode: 'minimal' },
  'HUBCFO': { path: 'chalfont-st-giles' },
  'HUBEAL': { buyPath: 'london/the-broadway/ealing-broadway-centre', buyRadius: '0.5', buyMode: 'minimal' },
  'HUBKGX': { slug: 'kings-cross-st-pancras', buyPath: 'london/kings-cross', buySearchLocation: 'Kings Cross' },
  'HUBH13': { slug: 'heathrow-terminals-1-2-3' },
  'HUBHX4': { slug: 'heathrow-terminal-4' },
  'HUBHX5': { slug: 'heathrow-terminal-4' },
  'HUBCUS': { slug: 'custom-house', type: 'dlr' },
}

type PropertySearchMode = 'rent' | 'buy'

interface PropertySearchRadiusOverride {
  rent?: string
  buy?: string
}

const PROPERTY_SEARCH_RADIUS_OVERRIDES: Record<string, PropertySearchRadiusOverride> = {
  '940GZZLUTHB': { rent: '1' },
  '940GZZLUHNX': { rent: '1' },
  '940GZZLUMPK': { rent: '1' },
  '940GZZLUMRH': { buy: '3' },
  '940GZZLUMSH': { buy: '3' },
  '940GZZLUMTC': { buy: '3' },
  '940GZZLUNHG': { buy: '3' },
  '940GZZLUOXC': { buy: '3' },
  '940GZZLUPCC': { buy: '3' },
  '940GZZLUPSG': { buy: '3' },
  '940GZZLUPYB': { buy: '3' },
  '940GZZLUQWY': { buy: '3' },
  '940GZZLURGP': { buy: '3' },
  '940GZZLURVP': { buy: '3' },
  '940GZZLURSQ': { buy: '3' },
  '940GZZLURYO': { buy: '3' },
  '940GZZLUSFB': { buy: '3' },
  '940GZZLUSJP': { buy: '3' },
  '940GZZLUSKS': { buy: '3' },
  '940GZZLUSPU': { buy: '3' },
  '940GZZLUSSQ': { buy: '3' },
  '940GZZLUSWK': { buy: '3' },
  '940GZZLUTMP': { buy: '3' },
  '940GZZLUTNG': { buy: '3' },
  '940GZZLUTFP': { buy: '3' },
  '940GZZLUWKA': { buy: '3' },
  '940GZZLUWKN': { buy: '3' },
  '940GZZLUWRR': { buy: '3' },
  '940GZZLUWSP': { buy: '3' },
  HUBBAL: { buy: '3' },
  HUBBDS: { buy: '3' },
  HUBBFR: { buy: '3' },
  HUBCHX: { buy: '3' },
  HUBCST: { buy: '3' },
  HUBEUS: { buy: '3' },
  HUBEPH: { buy: '3' },
  HUBGUN: { buy: '3' },
  HUBH13: { rent: '1' },
  HUBHHY: { buy: '3' },
  HUBHMS: { buy: '3' },
  HUBHX5: { rent: '1' },
  HUBKGX: { rent: '10' },
  HUBKNL: { buy: '3' },
  HUBKPA: { buy: '3' },
  HUBKTN: { buy: '3' },
  HUBKWG: { buy: '3' },
  HUBLBG: { buy: '3' },
  HUBLST: { buy: '3' },
  HUBMYB: { buy: '3' },
  HUBOLD: { buy: '3' },
  HUBPAD: { buy: '3' },
  HUBRMD: { buy: '3' },
  HUBTCR: { buy: '3' },
  HUBVIC: { buy: '3' },
  HUBWBP: { buy: '3' },
  HUBWSM: { rent: '1', buy: '3' },
  HUBZFD: { buy: '3' },
  HUBZMG: { buy: '3' },
}

function normalizeStationSearchLocation(rawName: string): string {
  return rawName
    .replace(/underground/gi, '')
    .replace(/\bdlr\b/gi, '')
    .replace(/\brail\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getPropertySearchRadius(stationId: string | undefined, mode: PropertySearchMode, defaultRadius: string): string {
  if (!stationId) return defaultRadius
  return PROPERTY_SEARCH_RADIUS_OVERRIDES[stationId]?.[mode] ?? defaultRadius
}

function formatRightmoveRadius(radius: string, mode: PropertySearchMode): string {
  if (mode === 'buy' && /^\d+$/.test(radius)) {
    return `${radius}.0`
  }

  return radius
}

function normalizeRightmoveLocationIdentifier(locationIdentifier: string): string | null {
  if (!locationIdentifier) return null
  const normalized = locationIdentifier.replace(/^STATION\^/i, '').trim()
  return /^\d+$/.test(normalized) ? normalized : null
}

function toRightmoveDisplayLocationIdentifier(displayName: string): string {
  return displayName.replace(/\s+/g, '-')
}

function toRightmoveBuyLabel(label?: string): string {
  if (!label) return 'Rightmove'
  if (label.startsWith('Rightmove:')) {
    return label
  }

  return `Rightmove: ${label}`
}

function buildRightmoveUrlFromMapping(
  locationIdentifier: string,
  displayLocationIdentifier: string,
  searchConfig: RightmoveSearchConfig,
  radiusOverride?: string
): string | null {
  const normalizedLocationIdentifier = normalizeRightmoveLocationIdentifier(locationIdentifier)
  if (!normalizedLocationIdentifier) return null

  const baseUrl = new URL(searchConfig.baseUrl)
  const params = baseUrl.searchParams
  params.set('locationIdentifier', `STATION^${normalizedLocationIdentifier}`)
  params.set('displayLocationIdentifier', displayLocationIdentifier)
  Object.entries(searchConfig.params).forEach(([key, value]) => {
    params.set(key, value)
  })
  if (radiusOverride) {
    params.set('radius', radiusOverride)
  }
  return baseUrl.toString()
}

function buildZooplaSearchLocation(station?: Station, fallbackName?: string) {
  const rawName = station?.displayName || fallbackName
  if (!rawName) return null

  const override = station ? ZOOPLA_SLUG_OVERRIDES[station.stationId] : undefined
  const cleanedName = normalizeStationSearchLocation(rawName)
  const mappingEntry = station ? RIGHTMOVE_STATION_MAP[station.stationId] : undefined
  let baseSearchLocation = mappingEntry?.searchLocation || cleanedName

  if (!/\bStation$/i.test(baseSearchLocation)) {
    baseSearchLocation = `${baseSearchLocation} Station`
  }

  baseSearchLocation = sanitizeZooplaSearchLocation(baseSearchLocation)

  return {
    override,
    baseSearchLocation,
  }
}

function buildZooplaSlug(baseSearchLocation: string, override?: ZooplaOverride) {
  const slugBase = baseSearchLocation.replace(/\s+Station$/i, '')
  return override?.slug ?? slugBase
    .replace(/&/g, 'and')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getRightmoveStationEntry(stationId?: string | null): RightmoveStationTemplateEntry | null {
  if (!stationId) return null
  return RIGHTMOVE_STATION_MAP[stationId] ?? null
}

export function getRightmoveStationTargets(stationId?: string | null): RightmoveStationTarget[] {
  if (!stationId) return []

  const overrideLinks = RIGHTMOVE_STATION_LINK_OVERRIDES[stationId]
  if (overrideLinks) {
    return overrideLinks.map((override) => ({
      label: override.label ?? override.displayName,
      locationIdentifier: override.locationIdentifier,
      displayLocationIdentifier: toRightmoveDisplayLocationIdentifier(override.displayName),
    }))
  }

  const mappingEntry = RIGHTMOVE_STATION_MAP[stationId]
  if (!mappingEntry?.locationIdentifier || (mappingEntry.matchStatus && mappingEntry.matchStatus !== 'matched')) {
    return []
  }

  return [{
    label: mappingEntry.displayName ?? mappingEntry.searchLocation,
    locationIdentifier: mappingEntry.locationIdentifier,
    displayLocationIdentifier: mappingEntry.displayLocationIdentifier,
  }]
}

export function buildRightmoveStationUrls(station?: Station, fallbackName?: string): RightmoveStationLink[] {
  const rawName = station?.displayName || fallbackName
  if (!rawName) return []

  const stationId = station?.stationId
  const radius = formatRightmoveRadius(
    getPropertySearchRadius(stationId, 'rent', RIGHTMOVE_RENT_SEARCH_CONFIG.params.radius),
    'rent'
  )
  if (stationId) {
    const overrideLinks = RIGHTMOVE_STATION_LINK_OVERRIDES[stationId]
    if (overrideLinks) {
      return overrideLinks
        .map((override) => {
          const url = buildRightmoveUrlFromMapping(
            override.locationIdentifier,
            toRightmoveDisplayLocationIdentifier(override.displayName),
            RIGHTMOVE_RENT_SEARCH_CONFIG,
            radius
          )
          return url
            ? { label: override.label ?? 'Rightmove', url }
            : null
        })
        .filter((link): link is RightmoveStationLink => link !== null)
    }
  }

  const mappingEntry = station ? RIGHTMOVE_STATION_MAP[station.stationId] : undefined
  if (mappingEntry?.matchStatus && mappingEntry.matchStatus !== 'matched') return []
  if (!mappingEntry?.locationIdentifier) return []

  const url = buildRightmoveUrlFromMapping(
    mappingEntry.locationIdentifier,
    mappingEntry.displayLocationIdentifier,
    RIGHTMOVE_RENT_SEARCH_CONFIG,
    radius
  )
  if (!url) return []

  return [{ label: 'Rightmove', url }]
}

export function buildRightmoveStationBuyUrls(station?: Station, fallbackName?: string): RightmoveStationLink[] {
  const rawName = station?.displayName || fallbackName
  if (!rawName) return []

  const stationId = station?.stationId
  const radius = formatRightmoveRadius(
    getPropertySearchRadius(stationId, 'buy', RIGHTMOVE_BUY_SEARCH_CONFIG.params.radius.replace(/\.0$/, '')),
    'buy'
  )
  if (stationId) {
    const overrideLinks = RIGHTMOVE_STATION_LINK_OVERRIDES[stationId]
    if (overrideLinks) {
      return overrideLinks
        .map((override) => {
          const url = buildRightmoveUrlFromMapping(
            override.locationIdentifier,
            toRightmoveDisplayLocationIdentifier(override.displayName),
            RIGHTMOVE_BUY_SEARCH_CONFIG,
            radius
          )
          return url
            ? { label: toRightmoveBuyLabel(override.label), url }
            : null
        })
        .filter((link): link is RightmoveStationLink => link !== null)
    }
  }

  const mappingEntry = station ? RIGHTMOVE_STATION_MAP[station.stationId] : undefined
  if (mappingEntry?.matchStatus && mappingEntry.matchStatus !== 'matched') return []
  if (!mappingEntry?.locationIdentifier) return []

  const url = buildRightmoveUrlFromMapping(
    mappingEntry.locationIdentifier,
    mappingEntry.displayLocationIdentifier,
    RIGHTMOVE_BUY_SEARCH_CONFIG,
    radius
  )
  if (!url) return []

  return [{ label: 'Rightmove', url }]
}

export function buildZooplaStationUrl(station?: Station, fallbackName?: string): string | null {
  const searchLocation = buildZooplaSearchLocation(station, fallbackName)
  if (!searchLocation) return null

  const { override, baseSearchLocation } = searchLocation

  if (override?.path) {
    const baseUrl = new URL(`https://www.zoopla.co.uk/to-rent/map/flats/${override.path}/`)
    return baseUrl.toString()
  }

  const slug = buildZooplaSlug(baseSearchLocation, override)

  const hasTubeLine = station?.lineCodes.some(code => code !== 'dlr' && code !== 'elizabeth')
  const isDlr = station?.lineCodes.includes('dlr')
  const isElizabeth = station?.lineCodes.includes('elizabeth')
  const stationType = override?.type
    ?? (hasTubeLine ? 'tube' : isElizabeth && !isDlr ? 'rail' : isDlr ? 'dlr' : 'tube')
  const baseUrl = new URL(`https://www.zoopla.co.uk/to-rent/map/property/station/${stationType}/${slug}/`)
  const params = baseUrl.searchParams
  params.set('beds_max', ZOOPLA_RENT_SEARCH_LIMITS.maxBedrooms)
  params.set('beds_min', ZOOPLA_RENT_SEARCH_LIMITS.minBedrooms)
  params.set('is_retirement_home', 'false')
  params.set('is_shared_accommodation', 'false')
  params.set('property_sub_type', ZOOPLA_RENT_SEARCH_LIMITS.zooplaPropertySubType)
  params.set('price_max', ZOOPLA_RENT_SEARCH_LIMITS.maxPrice)
  params.set('price_frequency', 'per_month')
  params.set('q', `${baseSearchLocation}, London`)
  params.set('radius', getPropertySearchRadius(station?.stationId, 'rent', ZOOPLA_RENT_SEARCH_LIMITS.radius))
  params.set('search_source', 'to-rent')
  params.set('results_sort', 'lowest_price')
  params.set('pn', '1')
  params.set('map_app', 'true')
  return baseUrl.toString()
}

export function buildZooplaStationBuyUrl(station?: Station, fallbackName?: string): string | null {
  const searchLocation = buildZooplaSearchLocation(station, fallbackName)
  if (!searchLocation) return null

  const { override, baseSearchLocation } = searchLocation
  const areaSearchLocation = override?.buySearchLocation
    ?? baseSearchLocation
      .replace(/\s+Station$/i, '')
      .replace(/\s+(Rail|Underground|DLR)$/i, '')
      .trim()
  const slug = override?.buyPath ?? override?.path ?? buildZooplaSlug(baseSearchLocation, override)

  const baseUrl = new URL(`https://www.zoopla.co.uk/for-sale/map/property/${slug}/`)
  const params = baseUrl.searchParams
  params.set('beds_min', ZOOPLA_BUY_SEARCH_LIMITS.minBedrooms)
  params.set('price_max', ZOOPLA_BUY_SEARCH_LIMITS.maxPrice)
  params.set('q', `${areaSearchLocation}, London`)
  params.set(
    'radius',
    getPropertySearchRadius(station?.stationId, 'buy', override?.buyRadius ?? ZOOPLA_BUY_SEARCH_LIMITS.radius)
  )
  params.set('search_source', 'for-sale')

  if (override?.buyMode !== 'minimal') {
    ZOOPLA_BUY_SEARCH_LIMITS.features.forEach((feature) => {
      params.append('feature', feature)
    })
    params.set('is_auction', 'false')
    params.set('is_retirement_home', 'false')
    params.set('is_shared_ownership', 'false')
    ZOOPLA_BUY_SEARCH_LIMITS.propertySubTypes.forEach((propertyType) => {
      params.append('property_sub_type', propertyType)
    })
    params.set('map_app', 'true')
  }

  return baseUrl.toString()
}

export function buildRightmoveStationUrl(station?: Station, fallbackName?: string): string | null {
  return buildRightmoveStationUrls(station, fallbackName)[0]?.url ?? null
}

export function buildRightmoveStationBuyUrl(station?: Station, fallbackName?: string): string | null {
  return buildRightmoveStationBuyUrls(station, fallbackName)[0]?.url ?? null
}