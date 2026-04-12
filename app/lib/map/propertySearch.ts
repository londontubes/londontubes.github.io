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

interface RightmoveOverrideOption {
  locationIdentifier: string
  displayName: string
  label?: string
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

const RIGHTMOVE_SEARCH_CONFIG = {
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
} as const

const RENTAL_SEARCH_LIMITS = {
  minBedrooms: '0',
  maxBedrooms: '2',
  maxPrice: '2000',
  radius: '0.5',
  zooplaPropertySubType: 'detached,semi-detached,terraced,flat,bungalow',
} as const

function sanitizeZooplaSearchLocation(value: string): string {
  return value.replace(/[\u2018\u2019]/g, '')
}

const ZOOPLA_SLUG_OVERRIDES: Record<string, { slug?: string; type?: 'tube' | 'rail' | 'dlr'; path?: string }> = {
  '910GBNHAM': { slug: 'burnham-bucks' },
  '910GWOLWXR': { slug: 'woolwich-arsenal', type: 'rail' },
  '940GZZDLCLA': { slug: 'crossharbour-and-london-arena' },
  '940GZZLUERC': { slug: 'edgware-road-circle' },
  'HUBCFO': { path: 'chalfont-st-giles' },
  'HUBKGX': { slug: 'kings-cross-st-pancras' },
  'HUBH13': { slug: 'heathrow-terminals-1-2-3' },
  'HUBHX4': { slug: 'heathrow-terminal-4' },
  'HUBHX5': { slug: 'heathrow-terminal-4' },
  'HUBCUS': { slug: 'custom-house', type: 'dlr' },
}

function normalizeStationSearchLocation(rawName: string): string {
  return rawName
    .replace(/underground/gi, '')
    .replace(/\bdlr\b/gi, '')
    .replace(/\brail\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeRightmoveLocationIdentifier(locationIdentifier: string): string | null {
  if (!locationIdentifier) return null
  const normalized = locationIdentifier.replace(/^STATION\^/i, '').trim()
  return /^\d+$/.test(normalized) ? normalized : null
}

function toRightmoveDisplayLocationIdentifier(displayName: string): string {
  return displayName.replace(/\s+/g, '-')
}

function buildRightmoveUrlFromMapping(
  locationIdentifier: string,
  displayLocationIdentifier: string
): string | null {
  const normalizedLocationIdentifier = normalizeRightmoveLocationIdentifier(locationIdentifier)
  if (!normalizedLocationIdentifier) return null

  const baseUrl = new URL('https://www.rightmove.co.uk/property-to-rent/map.html')
  const params = baseUrl.searchParams
  params.set('locationIdentifier', `STATION^${normalizedLocationIdentifier}`)
  params.set('displayLocationIdentifier', displayLocationIdentifier)
  params.set('propertyTypes', RIGHTMOVE_SEARCH_CONFIG.propertyTypes)
  params.set('minBedrooms', RIGHTMOVE_SEARCH_CONFIG.minBedrooms)
  params.set('maxBedrooms', RIGHTMOVE_SEARCH_CONFIG.maxBedrooms)
  params.set('maxPrice', RIGHTMOVE_SEARCH_CONFIG.maxPrice)
  params.set('radius', RIGHTMOVE_SEARCH_CONFIG.radius)
  params.set('sortType', RIGHTMOVE_SEARCH_CONFIG.sortType)
  params.set('areaSizeUnit', RIGHTMOVE_SEARCH_CONFIG.areaSizeUnit)
  params.set('viewType', RIGHTMOVE_SEARCH_CONFIG.viewType)
  params.set('channel', RIGHTMOVE_SEARCH_CONFIG.channel)
  params.set('dontShow', RIGHTMOVE_SEARCH_CONFIG.dontShow)
  params.set('index', RIGHTMOVE_SEARCH_CONFIG.index)
  params.set('numberOfPropertiesPerPage', RIGHTMOVE_SEARCH_CONFIG.numberOfPropertiesPerPage)
  params.set('includeLetAgreed', RIGHTMOVE_SEARCH_CONFIG.includeLetAgreed)
  return baseUrl.toString()
}

export function getRightmoveStationEntry(stationId?: string | null): RightmoveStationTemplateEntry | null {
  if (!stationId) return null
  return RIGHTMOVE_STATION_MAP[stationId] ?? null
}

export function buildRightmoveStationUrls(station?: Station, fallbackName?: string): RightmoveStationLink[] {
  const rawName = station?.displayName || fallbackName
  if (!rawName) return []

  const stationId = station?.stationId
  if (stationId) {
    const overrideLinks = RIGHTMOVE_STATION_LINK_OVERRIDES[stationId]
    if (overrideLinks) {
      return overrideLinks
        .map((override) => {
          const url = buildRightmoveUrlFromMapping(
            override.locationIdentifier,
            toRightmoveDisplayLocationIdentifier(override.displayName)
          )
          return url
            ? { label: override.label ?? 'Rightmove rental search', url }
            : null
        })
        .filter((link): link is RightmoveStationLink => link !== null)
    }
  }

  const mappingEntry = station ? RIGHTMOVE_STATION_MAP[station.stationId] : undefined
  if (mappingEntry?.matchStatus && mappingEntry.matchStatus !== 'matched') return []
  if (!mappingEntry?.locationIdentifier) return []

  const url = buildRightmoveUrlFromMapping(mappingEntry.locationIdentifier, mappingEntry.displayLocationIdentifier)
  if (!url) return []

  return [{ label: 'Rightmove rental search', url }]
}

export function buildZooplaStationUrl(station?: Station, fallbackName?: string): string | null {
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

  if (override?.path) {
    const baseUrl = new URL(`https://www.zoopla.co.uk/to-rent/map/flats/${override.path}/`)
    return baseUrl.toString()
  }

  const slugBase = baseSearchLocation.replace(/\s+Station$/i, '')
  const slug = override?.slug ?? slugBase
    .replace(/&/g, 'and')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const hasTubeLine = station?.lineCodes.some(code => code !== 'dlr' && code !== 'elizabeth')
  const isDlr = station?.lineCodes.includes('dlr')
  const isElizabeth = station?.lineCodes.includes('elizabeth')
  const stationType = override?.type
    ?? (hasTubeLine ? 'tube' : isElizabeth && !isDlr ? 'rail' : isDlr ? 'dlr' : 'tube')
  const baseUrl = new URL(`https://www.zoopla.co.uk/to-rent/map/property/station/${stationType}/${slug}/`)
  const params = baseUrl.searchParams
  params.set('beds_max', RENTAL_SEARCH_LIMITS.maxBedrooms)
  params.set('beds_min', RENTAL_SEARCH_LIMITS.minBedrooms)
  params.set('is_retirement_home', 'false')
  params.set('is_shared_accommodation', 'false')
  params.set('property_sub_type', RENTAL_SEARCH_LIMITS.zooplaPropertySubType)
  params.set('price_max', RENTAL_SEARCH_LIMITS.maxPrice)
  params.set('price_frequency', 'per_month')
  params.set('q', `${baseSearchLocation}, London`)
  params.set('radius', RENTAL_SEARCH_LIMITS.radius)
  params.set('search_source', 'to-rent')
  params.set('results_sort', 'lowest_price')
  params.set('pn', '1')
  params.set('map_app', 'true')
  return baseUrl.toString()
}

export function buildRightmoveStationUrl(station?: Station, fallbackName?: string): string | null {
  return buildRightmoveStationUrls(station, fallbackName)[0]?.url ?? null
}