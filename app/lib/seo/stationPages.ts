/**
 * Data for the static /stations/ and /lines/ pages. Everything here is
 * derived from the site's own datasets (TfL network data, station zones,
 * the rush-hour journey graph, sampled property prices, universities), so
 * each page carries facts specific to that station or line.
 */
import type { Station, TransitLine } from '@/app/types/transit'
import type { UniversitiesDataset } from '@/app/types/university'
import { loadStaticTransitData } from '@/app/lib/data/load-static-data'
import { calculateDistance, WALK_OVERHEAD_MINUTES, WALK_ROUTE_FACTOR, WALK_SPEED_MPH } from '@/app/lib/map/proximity'
import { buildStationGraph, shortestPathsFrom, type StationGraph } from '@/app/lib/map/stationGraph'
import zonesJson from '@/public/data/station-zones.json'
import pricesJson from '@/public/data/station-property-prices.json'
import universitiesJson from '@/public/data/universities.json'
import lineRoutesJson from '@/public/data/line-routes.json'

export const SITE_URL = 'https://londontubes.co.uk'

const MODE_LABELS: Record<TransitLine['mode'], string> = {
  'tube': 'London Underground',
  'dlr': 'Docklands Light Railway',
  'elizabeth-line': 'Elizabeth line',
  'overground': 'London Overground',
  'tram': 'London Trams',
  'national-rail': 'National Rail',
}

// Hubs used for "journey time to central London" tables.
const JOURNEY_HUBS = [
  'HUBBAN',
  '940GZZLUOXC',
  'HUBKGX',
  'HUBWAT',
  'HUBLST',
  'HUBLBG',
  'HUBVIC',
  'HUBCAW',
] as const

// Sampled before their Rightmove ids were corrected (they pointed at West
// Acton, Barrhead, Warren Street, Walthamstow Queens Road and the Underground
// station), so the stored figures describe the wrong place.
const PRICE_SAMPLE_EXCLUDED = new Set(['HUBWAT', 'HUBBAN', 'HUBVIC', '940GZZLUUXB', '910GBTHNLGR'])

// The price sample uses the site's own Rightmove searches (see
// RIGHTMOVE_RENT_SEARCH_CONFIG / RIGHTMOVE_BUY_SEARCH_CONFIG), so describe
// exactly what was counted.
export const PRICE_SAMPLE_RENT_SCOPE = 'homes up to £2,000 pcm with up to 2 bedrooms'
export const PRICE_SAMPLE_SALE_SCOPE = 'freehold houses with 3+ bedrooms, a garden and parking, up to £700,000'

export interface StationPrice {
  medianRentPcm: number | null
  medianSalePrice: number | null
  rentListingCount: number
  saleListingCount: number
}

export interface NearbyStation {
  station: Station
  slug: string
  distanceMiles: number
  walkMinutes: number
}

export interface HubJourney {
  hub: Station
  hubSlug: string
  minutes: number
  changes: number
}

export interface NearbyUniversity {
  name: string
  campus: string
  distanceMiles: number
}

export interface StationPageData {
  station: Station
  slug: string
  name: string
  lines: TransitLine[]
  modes: string[]
  zone: string | null
  nearby: NearbyStation[]
  journeys: HubJourney[]
  price: StationPrice | null
  priceSampledAt: string | null
  universities: NearbyUniversity[]
}

export function cleanStationName(displayName: string): string {
  return displayName
    .replace(/\s+(Underground|Rail|DLR|Overground)\s+Station$/i, '')
    .replace(/\s+Tram Stop$/i, '')
    .replace(/\s+Station$/i, '')
    .replace(/\s+\(London\)$/i, '')
    .replace(/^King's Cross & St Pancras International$/, "King's Cross St Pancras")
    .trim()
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’.]/g, '')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function walkMinutes(distanceMiles: number): number {
  return Math.round(((distanceMiles * WALK_ROUTE_FACTOR) / WALK_SPEED_MPH) * 60 + WALK_OVERHEAD_MINUTES)
}

let cache: {
  stations: Station[]
  lines: TransitLine[]
  slugById: Map<string, string>
  idBySlug: Map<string, string>
  graph: StationGraph
} | null = null

function getBase() {
  if (cache) return cache
  const { stations, lines } = loadStaticTransitData()

  // Stable, unique slugs: tram stops and same-named stations get a suffix.
  const slugById = new Map<string, string>()
  const idBySlug = new Map<string, string>()
  const sorted = [...stations].sort((a, b) => a.stationId.localeCompare(b.stationId))
  // Interchange hubs, then Underground stations, keep the plain name
  // ("bank", "bethnal-green"); same-named stations get a qualifier.
  const priority = (id: string) => (id.startsWith('HUB') ? 0 : id.startsWith('940GZZLU') ? 1 : 2)
  sorted.sort((a, b) => priority(a.stationId) - priority(b.stationId))
  for (const station of sorted) {
    const base = slugify(cleanStationName(station.displayName))
    let slug = base
    if (idBySlug.has(slug)) {
      // Name the station's TfL network if it has one, so slugs stay stable
      // when National Rail operators are added ("bethnal-green-overground").
      const modes = station.lineCodes.map((code) => lines.find((l) => l.lineCode === code)?.mode)
      const tflMode = modes.find((mode) => mode && mode !== 'national-rail')
      const qualifier = station.lineCodes.length === 1 && station.lineCodes[0] === 'tram'
        ? 'tram-stop'
        : (tflMode ?? modes[0] ?? 'station')
      slug = `${base}-${qualifier}`
      let n = 2
      while (idBySlug.has(slug)) slug = `${base}-${qualifier}-${n++}`
    }
    slugById.set(station.stationId, slug)
    idBySlug.set(slug, station.stationId)
  }

  cache = { stations, lines, slugById, idBySlug, graph: buildStationGraph(lines, stations) }
  return cache
}

export function getAllStationSlugs(): string[] {
  return [...getBase().idBySlug.keys()]
}

export function getStationSlug(stationId: string): string | undefined {
  return getBase().slugById.get(stationId)
}

export function getAllStationsSorted(): { station: Station; slug: string; name: string }[] {
  const { stations, lines, slugById } = getBase()
  const entries = stations.map((station) => ({
    station,
    slug: slugById.get(station.stationId)!,
    name: cleanStationName(station.displayName),
  }))
  // Disambiguate same-named stations (e.g. Bethnal Green Underground vs Overground).
  const counts = new Map<string, number>()
  entries.forEach((e) => counts.set(e.name, (counts.get(e.name) ?? 0) + 1))
  return entries
    .map((e) => {
      if ((counts.get(e.name) ?? 0) < 2) return e
      const mode = lines.find((l) => l.lineCode === e.station.lineCodes[0])?.mode
      return { ...e, name: `${e.name} (${mode ? MODE_LABELS[mode] : 'station'})` }
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en-GB'))
}

export function getAllLines(): TransitLine[] {
  return getBase().lines
}

export function getLineBySlug(slug: string): TransitLine | undefined {
  return getBase().lines.find((line) => line.lineCode === slug)
}

export function getModeLabel(mode: TransitLine['mode']): string {
  return MODE_LABELS[mode]
}

export function getStationPageData(slug: string): StationPageData | null {
  const { stations, lines, slugById, idBySlug, graph } = getBase()
  const stationId = idBySlug.get(slug)
  const station = stationId ? stations.find((s) => s.stationId === stationId) : undefined
  if (!station) return null

  const stationLines = station.lineCodes
    .map((code) => lines.find((l) => l.lineCode === code))
    .filter((l): l is TransitLine => Boolean(l))
  const modes = [...new Set(stationLines.map((l) => MODE_LABELS[l.mode]))]

  const zone = (zonesJson.zones as Record<string, string>)[station.stationId] ?? null

  const nearby: NearbyStation[] = stations
    .filter((s) => s.stationId !== station.stationId)
    .map((s) => ({ s, d: calculateDistance(station.position.coordinates, s.position.coordinates) }))
    .filter(({ d }) => d <= 1.25)
    .sort((a, b) => a.d - b.d)
    .slice(0, 6)
    .map(({ s, d }) => ({
      station: s,
      slug: slugById.get(s.stationId)!,
      distanceMiles: Math.round(d * 100) / 100,
      walkMinutes: walkMinutes(d),
    }))

  const journeys: HubJourney[] = []
  if (graph[station.stationId]) {
    const paths = shortestPathsFrom(station.stationId, graph, 120)
    for (const hubId of JOURNEY_HUBS) {
      if (hubId === station.stationId) continue
      const path = paths.find((p) => p.stationId === hubId)
      const hub = stations.find((s) => s.stationId === hubId)
      if (!path || !hub) continue
      journeys.push({
        hub,
        hubSlug: slugById.get(hubId)!,
        minutes: Math.max(1, Math.round(path.minutes)),
        changes: Math.max(0, new Set(path.lines).size - 1),
      })
    }
  }

  const priceEntry = PRICE_SAMPLE_EXCLUDED.has(station.stationId)
    ? undefined
    : (pricesJson.stations as Array<{ stationId: string } & StationPrice>).find((p) => p.stationId === station.stationId)
  const price = priceEntry && (priceEntry.medianRentPcm || priceEntry.medianSalePrice)
    ? {
        medianRentPcm: priceEntry.medianRentPcm,
        medianSalePrice: priceEntry.medianSalePrice,
        rentListingCount: priceEntry.rentListingCount,
        saleListingCount: priceEntry.saleListingCount,
      }
    : null

  const universities: NearbyUniversity[] = []
  for (const feature of (universitiesJson as unknown as UniversitiesDataset).features) {
    for (const campus of feature.properties.campuses) {
      const d = calculateDistance(station.position.coordinates, campus.coordinates)
      if (d <= 1) {
        universities.push({ name: feature.properties.displayName, campus: campus.name, distanceMiles: Math.round(d * 10) / 10 })
      }
    }
  }
  universities.sort((a, b) => a.distanceMiles - b.distanceMiles)

  return {
    station,
    slug,
    name: cleanStationName(station.displayName),
    lines: stationLines,
    modes,
    zone,
    nearby,
    journeys,
    price,
    priceSampledAt: price ? pricesJson.generatedAt : null,
    universities,
  }
}

export interface LinePageData {
  line: TransitLine
  routes: { name: string }[]
  stations: { station: Station; slug: string; name: string; zone: string | null; otherLines: TransitLine[] }[]
  interchangeCount: number
  zones: string[]
}

export function getLinePageData(lineCode: string): LinePageData | null {
  const { stations, lines, slugById } = getBase()
  const line = lines.find((l) => l.lineCode === lineCode)
  if (!line) return null

  const routes = (lineRoutesJson.lines as Record<string, { name: string; stationIds: string[] }[]>)[lineCode] ?? []
  // Each station once, in route order (longest route first, then branches).
  const orderedIds: string[] = []
  for (const route of routes) {
    for (const id of route.stationIds) if (!orderedIds.includes(id)) orderedIds.push(id)
  }
  for (const id of line.stationIds) if (!orderedIds.includes(id)) orderedIds.push(id)

  const zoneMap = zonesJson.zones as Record<string, string>
  const lineStations = orderedIds
    .map((id) => stations.find((s) => s.stationId === id))
    .filter((s): s is Station => Boolean(s))
    .map((station) => ({
      station,
      slug: slugById.get(station.stationId)!,
      name: cleanStationName(station.displayName),
      zone: zoneMap[station.stationId] ?? null,
      otherLines: station.lineCodes
        .filter((code) => code !== lineCode)
        .map((code) => lines.find((l) => l.lineCode === code))
        .filter((l): l is TransitLine => Boolean(l)),
    }))

  const zones = [...new Set(lineStations.flatMap((s) => (s.zone ? s.zone.split('/') : [])))]
    .sort((a, b) => Number(a) - Number(b))

  // One-way loops (the Croydon tram loop) give "A ↔ B" and "B ↔ A" as separate
  // routes; show each pair once.
  const routeNames: string[] = []
  for (const r of routes) {
    const [from, to] = r.name.split(' ↔ ')
    if (!routeNames.includes(r.name) && !routeNames.includes(`${to} ↔ ${from}`)) routeNames.push(r.name)
  }

  return {
    line,
    routes: routeNames.map((name) => ({ name })),
    stations: lineStations,
    interchangeCount: lineStations.filter((s) => s.otherLines.length > 0).length,
    zones,
  }
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Text colour for a line badge: the TfL text colour when it meets WCAG AA
 * (4.5:1) on the brand colour, otherwise black or white, whichever reads
 * better. DLR and Victoria line blues are too light for white small text.
 */
export function readableTextColor(background: string, preferred: string): string {
  const contrast = (a: string, b: string) => {
    const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
    return (l1 + 0.05) / (l2 + 0.05)
  }
  if (contrast(background, preferred) >= 4.5) return preferred
  return contrast(background, '#000000') >= contrast(background, '#FFFFFF') ? '#000000' : '#FFFFFF'
}

export function formatZone(zone: string): string {
  return zone.includes('/') ? `Zones ${zone.replace('/', ' and ')}` : `Zone ${zone}`
}

export function formatPounds(value: number): string {
  return `£${value.toLocaleString('en-GB')}`
}
