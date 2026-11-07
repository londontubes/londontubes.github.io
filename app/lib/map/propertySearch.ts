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
  // Overground stations the Rightmove typeahead can't pick automatically.
  '910GCLDNNRB': [{ locationIdentifier: '1682', displayName: 'Caledonian Road & Barnsbury Station' }],
  '910GFNCHLYR': [{ locationIdentifier: '3512', displayName: 'Finchley Road & Frognal Station' }],
  '910GSTJMSST': [{ locationIdentifier: '8615', displayName: 'St. James Street Station' }],
  // London National Rail stations the typeahead can't pick automatically;
  // each id checked on Rightmove to open the London station.
  '910GFENCHRS': [{ locationIdentifier: '3470', displayName: 'Fenchurch Street Station' }],
  '910GRNHAME': [{ locationIdentifier: '7556', displayName: 'Rainham (Essex) Station' }],
  '910GSDBRYHR': [{ locationIdentifier: '8870', displayName: 'Sudbury & Harrow Road Station' }],
  '910GWLOE': [{ locationIdentifier: '9671', displayName: 'Waterloo East Station' }],
  '910GSTMGTS': [{ locationIdentifier: '8552', displayName: 'St. Margarets Station' }],
  '910GCTMSLNK': [{ locationIdentifier: '2138', displayName: 'City Thameslink Station' }],
  '910GELTR': [{ locationIdentifier: '3236', displayName: 'Elstree & Borehamwood Station' }],
  // The Overground station, ~500 m from the Underground one (908).
  '910GBTHNLGR': [{ locationIdentifier: '905', displayName: 'Bethnal Green (Mainline) Station' }],
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

const RAIL_LINE_CODES = new Set([
  'elizabeth',
  'liberty',
  'lioness',
  'mildmay',
  'suffragette',
  'weaver',
  'windrush',
  'tram',
])
// Listed explicitly: anything else (DLR, Overground, Trams, National Rail
// operators) is not a Zoopla "tube" station.
const TUBE_LINE_CODES = new Set([
  'bakerloo',
  'central',
  'circle',
  'district',
  'hammersmith-city',
  'jubilee',
  'metropolitan',
  'northern',
  'piccadilly',
  'victoria',
  'waterloo-city',
])

interface ZooplaOverride {
  slug?: string
  type?: 'tube' | 'rail' | 'dlr'
  path?: string
  buyPath?: string
  buySearchLocation?: string
  buyRadius?: string
  buyMode?: 'default' | 'minimal'
  // Exact Zoopla location id, as its search box returns it (e.g.
  // "station/rail/sydenham-london", "station/chorleywood"). Use when the
  // generated station/<type>/<slug> is not a real Zoopla page.
  zooplaId?: string
  // Search around this postcode instead of a station page. Zoopla has no
  // station pages for London Trams stops: a "station/rail/<name>-tram-stop"
  // URL falls through to a fuzzy match (Sandilands landed in Cheshunt).
  postcode?: string
}

// Nearest postcode to each tram-only stop (postcodes.io reverse lookup of the
// TfL stop coordinates, all within 150 m). Interchanges with National Rail,
// e.g. East Croydon, keep their Zoopla station pages.
const ZOOPLA_TRAM_STOP_POSTCODES: Record<string, string> = {
  '940GZZCRADD': 'CR0 7AA', // Addiscombe
  '940GZZCRADV': 'CR0 5AR', // Addington Village
  '940GZZCRAMP': 'CR0 3JX', // Ampere Way
  '940GZZCRARA': 'SE25 4RY', // Arena
  '940GZZCRAVE': 'BR3 4NJ', // Avenue Road
  '940GZZCRBED': 'CR0 4TS', // Beddington Lane
  '940GZZCRBGV': 'CR4 3FU', // Belgrave Walk
  '940GZZCRBLA': 'CR0 6NL', // Blackhorse Lane
  '940GZZCRBRD': 'BR3 4RR', // Beckenham Road
  '940GZZCRCEN': 'CR0 1LA', // George Street
  '940GZZCRCHR': 'CR0 1RN', // Church Street
  '940GZZCRCOO': 'CR0 5RF', // Coombe Lane
  '940GZZCRCTR': 'CR0 1XZ', // Centrale
  '940GZZCRDDR': 'SW19 3SA', // Dundonald Road
  '940GZZCRFLD': 'CR0 0QA', // Fieldway
  '940GZZCRGRA': 'CR0 5BJ', // Gravel Hill
  '940GZZCRHAR': 'SE25 4NG', // Harrington Road
  '940GZZCRKGH': 'CR0 0LA', // King Henry's Drive
  '940GZZCRLEB': 'CR0 6SF', // Lebanon Road
  '940GZZCRLOY': 'CR0 5RA', // Lloyd Park
  '940GZZCRMCH': 'CR4 4BD', // Mitcham
  '940GZZCRMDN': 'SW19 3BX', // Morden Road
  '940GZZCRMTP': 'SW19 3AL', // Merton Park
  '940GZZCRNWA': 'CR0 0DE', // New Addington
  '940GZZCRPHI': 'CR4 3PH', // Phipps Bridge
  '940GZZCRRVC': 'CR0 1GE', // Reeves Corner
  '940GZZCRSAN': 'CR0 5PN', // Sandilands
  '940GZZCRTPA': 'CR0 3DD', // Therapia Lane
  '940GZZCRWAD': 'CR0 4XT', // Waddon Marsh
  '940GZZCRWAN': 'CR0 4FN', // Wandle Park
  '940GZZCRWEL': 'CR0 2DD', // Wellesley Road
  '940GZZCRWOD': 'SE25 5DP', // Woodside
}

function toZooplaPostcodeSlug(postcode: string): string {
  return postcode.trim().toLowerCase().replace(/\s+/g, '-')
}

// Stations whose generated station/<type>/<slug> is not a Zoopla page. The ids
// come from Zoopla's own location search and were each checked to resolve to
// the named station (e.g. DLR stations have no "-dlr" suffix, apostrophes are
// dropped rather than hyphenated, some ids have no type segment at all).
const ZOOPLA_LOCATION_IDS: Record<string, string> = {
  '940GZZLURGP': 'station/tube/regents-park',
  'HUBQPW': 'station/tube/queens-park',
  '940GZZLUSPU': 'station/tube/st-pauls',
  'HUBSPB': 'station/rail/shepherds-bush',
  '940GZZLUSJP': 'station/tube/st-jamess-park',
  'HUBZFD': 'station/farringdon',
  '940GZZLUECT': 'station/tube/earls-court',
  '940GZZLUSJW': 'station/tube/st-johns-wood',
  'HUBCLW': 'station/chorleywood',
  'HUBWHC': 'station/walthamstow-central',
  'HUBNXG': 'station/new-cross-gate',
  'HUBGNW': 'station/greenwich',
  'HUBSDE': 'station/rail/shadwell',
  'HUBSYD': 'station/rail/sydenham-london',
  'HUBCFO': 'station/chalfont-and-latimer',
  '940GZZDLABR': 'station/dlr/abbey-road',
  '940GZZDLALL': 'station/dlr/all-saints',
  '940GZZDLBEC': 'station/dlr/beckton',
  '940GZZDLBLA': 'station/dlr/blackwall',
  '940GZZDLBOW': 'station/dlr/bow-church',
  '940GZZDLBPK': 'station/dlr/beckton-park',
  '940GZZDLCYP': 'station/dlr/cyprus',
  '940GZZDLDEP': 'station/dlr/deptford-bridge',
  '940GZZDLDEV': 'station/dlr/devons-road',
  '940GZZDLEIN': 'station/dlr/east-india',
  '940GZZDLELV': 'station/dlr/elverson-road',
  '940GZZDLGAL': 'station/dlr/gallions-reach',
  '940GZZDLHEQ': 'station/dlr/heron-quays',
  '940GZZDLISL': 'station/dlr/island-gardens',
  '940GZZDLKGV': 'station/dlr/king-george-v',
  '940GZZDLLDP': 'station/dlr/langdon-park',
  '940GZZDLMUD': 'station/dlr/mudchute',
  '940GZZDLPDK': 'station/dlr/pontoon-dock',
  '940GZZDLPOP': 'station/dlr/poplar',
  '940GZZDLPRE': 'station/dlr/prince-regent',
  '940GZZDLPUD': 'station/dlr/pudding-mill-lane',
  '940GZZDLRAL': 'station/dlr/royal-albert',
  '940GZZDLSHS': 'station/dlr/stratford-high-street',
  '940GZZDLSIT': 'station/dlr/stratford-international',
  '940GZZDLSOQ': 'station/dlr/south-quay',
  '940GZZDLSTL': 'station/dlr/star-lane',
  '940GZZDLWFE': 'station/dlr/westferry',
  '940GZZDLWIQ': 'station/dlr/west-india-quay',
  '940GZZDLWSV': 'station/dlr/west-silvertown',
  '910GACTONML': 'station/rail/acton-main-line',
  '910GBRTWOOD': 'station/rail/brentwood',
  '910GCHDWLHT': 'station/rail/chadwell-heath',
  '910GFRSTGT': 'station/rail/forest-gate',
  '910GGIDEAPK': 'station/rail/gidea-park',
  '910GGODMAYS': 'station/rail/goodmayes',
  '910GHANWELL': 'station/rail/hanwell',
  '910GHAYESAH': 'station/rail/hayes-and-harlington',
  '910GHRLDWOD': 'station/rail/harold-wood',
  '910GILFORD': 'station/rail/ilford',
  '910GIVER': 'station/rail/iver',
  '910GLANGLEY': 'station/rail/langley-berks',
  '910GMANRPK': 'station/rail/manor-park',
  '910GMDNHEAD': 'station/rail/maidenhead',
  '910GMRYLAND': 'station/rail/maryland',
  '910GRDNGSTN': 'station/rail/reading',
  '910GROMFORD': 'station/rail/romford',
  '910GSHENFLD': 'station/rail/shenfield',
  '910GSLOUGH': 'station/rail/slough',
  '910GSVNKNGS': 'station/rail/seven-kings',
  '910GTAPLOW': 'station/rail/taplow',
  '910GTWYFORD': 'station/rail/twyford',
  '910GWDRYTON': 'station/rail/west-drayton',
  '910GCAMHTH': 'station/rail/cambridge-heath',
  '910GSTJMSST': 'station/rail/st-james-street-walthamstow',
  // National Rail: Zoopla qualifies some names by (old) county.
  '910GASCOT': 'station/rail/ascot-berks',
  '910GEPSM': 'station/rail/epsom-surrey',
  '910GFSHBORN': 'station/rail/fishbourne-sussex',
  '910GLEEE': 'station/rail/lee-london',
  '910GRNHAME': 'station/rail/rainham-essex',
  '910GSHLIER': 'station/rail/st-helier-surrey',
  '910GSTRETHM': 'station/rail/streatham-greater-london',
  '910GSUTTON': 'station/rail/sutton-surrey',
  '910GWHTTON': 'station/rail/whitton-london',
  // Meridian Water replaced Angel Road (2019); Zoopla still uses the old name.
  '910GMWRWSTN': 'station/rail/angel-road',
}

// Stations Zoopla has no page for at all; search around the nearest postcode.
const ZOOPLA_STATION_POSTCODES: Record<string, string> = {
  '940GZZLUSBM': 'W12 7JS', // Shepherd's Bush Market
  '940GZZLUWLA': 'W12 7FX', // Wood Lane
  '910GCLDNNRB': 'N1 1DN', // Caledonian Road & Barnsbury
  '940GZZBPSUST': 'SW11 8AL', // Battersea Power Station
  '940GZZNEUGST': 'SW8 2GE', // Nine Elms
  '910GBARKRIV': 'IG11 0YP', // Barking Riverside
  '910GBRENTX': 'NW2 8AU', // Brent Cross West (opened 2023)
}

const ZOOPLA_SLUG_OVERRIDES: Record<string, ZooplaOverride> = {
  ...Object.fromEntries(
    Object.entries({ ...ZOOPLA_TRAM_STOP_POSTCODES, ...ZOOPLA_STATION_POSTCODES })
      .map(([stationId, postcode]) => [stationId, { postcode }])
  ),
  ...Object.fromEntries(
    Object.entries(ZOOPLA_LOCATION_IDS).map(([stationId, zooplaId]) => [stationId, { zooplaId }])
  ),
  '910GBNHAM': { slug: 'burnham-bucks' },
  '910GWEALING': { slug: 'west-ealing', type: 'rail' },
  '910GSTHALL': { slug: 'southall', buyPath: 'southall', buyMode: 'minimal' },
  // No Zoopla page for the Elizabeth line's Woolwich station; search around it.
  '910GWOLWXR': { postcode: 'SE18 6ZF' },
  '940GZZDLCLA': { slug: 'crossharbour-and-london-arena' },
  '940GZZLUERC': { slug: 'edgware-road-circle' },
  '940GZZLUESQ': { buyPath: 'fitzrovia', buySearchLocation: 'Fitzrovia', buyMode: 'minimal' },
  'HUBEAL': { buyRadius: '0.5', buyMode: 'minimal' },
  'HUBKGX': { slug: 'kings-cross-st-pancras', buyPath: 'london/kings-cross', buySearchLocation: 'Kings Cross' },
  'HUBH13': { slug: 'heathrow-terminals-1-2-3' },
  'HUBHX4': { slug: 'heathrow-terminal-4' },
  // No Zoopla page for Terminal 5 (Terminal 4 is ~2 miles away).
  'HUBHX5': { postcode: 'TW6 2GA' },
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

/**
 * The Zoopla location segment shared by rent and buy links: a station page
 * (`station/<type>/<slug>`) or, for stops Zoopla has no station page for, a
 * postcode. Plain area slugs are avoided because Zoopla resolves them by
 * place name: "bank" is a village in Hampshire, not Bank station.
 */
function buildZooplaLocationSegment(station: Station | undefined, baseSearchLocation: string, override?: ZooplaOverride) {
  if (override?.zooplaId) return override.zooplaId
  if (override?.postcode) return toZooplaPostcodeSlug(override.postcode)

  const slug = buildZooplaSlug(baseSearchLocation, override)
  const hasTubeLine = station?.lineCodes.some(code => TUBE_LINE_CODES.has(code))
  const isDlr = station?.lineCodes.includes('dlr')
  // Elizabeth line, Overground and Tram stops have no Zoopla "tube" page; use the rail station type.
  const isRail = station?.lineCodes.some(code => RAIL_LINE_CODES.has(code) || !TUBE_LINE_CODES.has(code) && code !== 'dlr')
  const stationType = override?.type
    ?? (hasTubeLine ? 'tube' : isRail && !isDlr ? 'rail' : isDlr ? 'dlr' : 'tube')
  return `station/${stationType}/${slug}`
}

export function buildZooplaStationUrl(station?: Station, fallbackName?: string): string | null {
  const searchLocation = buildZooplaSearchLocation(station, fallbackName)
  if (!searchLocation) return null

  const { override, baseSearchLocation } = searchLocation

  if (override?.path) {
    const baseUrl = new URL(`https://www.zoopla.co.uk/to-rent/map/flats/${override.path}/`)
    return baseUrl.toString()
  }

  const segment = buildZooplaLocationSegment(station, baseSearchLocation, override)
  const baseUrl = new URL(`https://www.zoopla.co.uk/to-rent/map/property/${segment}/`)
  const params = baseUrl.searchParams
  params.set('beds_max', ZOOPLA_RENT_SEARCH_LIMITS.maxBedrooms)
  params.set('beds_min', ZOOPLA_RENT_SEARCH_LIMITS.minBedrooms)
  params.set('is_retirement_home', 'false')
  params.set('is_shared_accommodation', 'false')
  params.set('property_sub_type', ZOOPLA_RENT_SEARCH_LIMITS.zooplaPropertySubType)
  params.set('price_max', ZOOPLA_RENT_SEARCH_LIMITS.maxPrice)
  params.set('price_frequency', 'per_month')
  params.set('q', override?.postcode ?? `${baseSearchLocation}, London`)
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
  const segment = override?.buyPath
    ?? override?.path
    ?? buildZooplaLocationSegment(station, baseSearchLocation, override)

  const baseUrl = new URL(`https://www.zoopla.co.uk/for-sale/map/property/${segment}/`)
  const params = baseUrl.searchParams
  params.set('beds_min', ZOOPLA_BUY_SEARCH_LIMITS.minBedrooms)
  params.set('price_max', ZOOPLA_BUY_SEARCH_LIMITS.maxPrice)
  params.set('q', override?.postcode ?? `${areaSearchLocation}, London`)
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