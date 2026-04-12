import type { Station } from '@/app/types/transit'
import { RIGHTMOVE_STATION_TEMPLATE, type RightmoveStationTemplateEntry } from '@/docs/rightmove-station-template'

const RIGHTMOVE_STATION_MAP: Record<string, RightmoveStationTemplateEntry> = RIGHTMOVE_STATION_TEMPLATE.reduce(
  (acc, entry) => {
    acc[entry.stationId] = entry
    return acc
  },
  {} as Record<string, RightmoveStationTemplateEntry>
)

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

export function getRightmoveStationEntry(stationId?: string | null): RightmoveStationTemplateEntry | null {
  if (!stationId) return null
  return RIGHTMOVE_STATION_MAP[stationId] ?? null
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
  const rawName = station?.displayName || fallbackName
  if (!rawName) return null

  const mappingEntry = station ? RIGHTMOVE_STATION_MAP[station.stationId] : undefined
  if (mappingEntry?.matchStatus && mappingEntry.matchStatus !== 'matched') return null
  if (!mappingEntry?.locationIdentifier) return null

  const locationIdentifier = normalizeRightmoveLocationIdentifier(mappingEntry.locationIdentifier)
  if (!locationIdentifier) return null

  const baseUrl = new URL('https://www.rightmove.co.uk/property-to-rent/map.html')
  const params = baseUrl.searchParams
  params.set('locationIdentifier', `STATION^${locationIdentifier}`)
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