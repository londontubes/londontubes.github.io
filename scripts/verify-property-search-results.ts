import type { Station } from '@/app/types/transit'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  buildRightmoveStationBuyUrls,
  buildRightmoveStationUrls,
  buildZooplaStationBuyUrl,
  buildZooplaStationUrl,
} from '@/app/lib/map/propertySearch'
import stationsData from '@/public/data/stations.json'

type SearchMode = 'rent' | 'buy'

interface RightmoveSweepResult {
  radius: string | null
  links: Array<{
    label: string
    url: string
    propertyCount: number
    title: string | null
  }>
}

interface StationSweepResult {
  stationId: string
  displayName: string
  rent: RightmoveSweepResult
  buy: RightmoveSweepResult
  currentRentFailures: Array<{ label: string; url: string; propertyCount: number; title: string | null }>
  currentBuyFailures: Array<{ label: string; url: string; propertyCount: number; title: string | null }>
  zooplaRentUrl: string | null
  zooplaBuyUrl: string | null
}

const RENT_RADIUS_STEPS = ['0.5', '1', '3', '5', '10'] as const
const BUY_RADIUS_STEPS = ['1', '3', '5', '10'] as const
const REQUEST_HEADERS = {
  'user-agent': 'Mozilla/5.0',
} as const

function getStations(): Station[] {
  return (Array.isArray(stationsData) ? stationsData : stationsData.stations) as Station[]
}

function applyRightmoveRadius(url: string, radius: string): string {
  const parsed = new URL(url)
  parsed.searchParams.set('radius', radius)
  return parsed.toString()
}

function collectRightmoveLinks(station: Station, mode: SearchMode) {
  return mode === 'rent' ? buildRightmoveStationUrls(station) : buildRightmoveStationBuyUrls(station)
}

async function fetchRightmovePropertyCount(url: string) {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Rightmove request failed: ${response.status} ${url}`)
  }

  const html = await response.text()
  const titleMatch = html.match(/<title>(.*?)<\/title>/i)
  const propertyIds = new Set(html.match(/\/properties\/\d+/g) ?? [])

  return {
    propertyCount: propertyIds.size,
    title: titleMatch?.[1] ?? null,
  }
}

async function findWorkingRightmoveRadius(station: Station, mode: SearchMode): Promise<RightmoveSweepResult> {
  const baseLinks = collectRightmoveLinks(station, mode)
  const radiusSteps = mode === 'rent' ? RENT_RADIUS_STEPS : BUY_RADIUS_STEPS

  for (const radius of radiusSteps) {
    const results = await Promise.all(
      baseLinks.map(async (link) => {
        const url = applyRightmoveRadius(link.url, radius)
        const response = await fetchRightmovePropertyCount(url)
        return {
          label: link.label,
          url,
          propertyCount: response.propertyCount,
          title: response.title,
        }
      })
    )

    if (results.every((result) => result.propertyCount > 0)) {
      return {
        radius,
        links: results,
      }
    }
  }

  const fallbackResults = await Promise.all(
    baseLinks.map(async (link) => {
      const response = await fetchRightmovePropertyCount(link.url)
      return {
        label: link.label,
        url: link.url,
        propertyCount: response.propertyCount,
        title: response.title,
      }
    })
  )

  return {
    radius: null,
    links: fallbackResults,
  }
}

async function findCurrentRightmoveFailures(station: Station, mode: SearchMode) {
  const links = collectRightmoveLinks(station, mode)
  const results = await Promise.all(
    links.map(async (link) => {
      const response = await fetchRightmovePropertyCount(link.url)
      return {
        label: link.label,
        url: link.url,
        propertyCount: response.propertyCount,
        title: response.title,
      }
    })
  )

  return results.filter((result) => result.propertyCount === 0)
}

async function verifyStation(station: Station): Promise<StationSweepResult> {
  return {
    stationId: station.stationId,
    displayName: station.displayName,
    rent: await findWorkingRightmoveRadius(station, 'rent'),
    buy: await findWorkingRightmoveRadius(station, 'buy'),
    currentRentFailures: await findCurrentRightmoveFailures(station, 'rent'),
    currentBuyFailures: await findCurrentRightmoveFailures(station, 'buy'),
    zooplaRentUrl: buildZooplaStationUrl(station),
    zooplaBuyUrl: buildZooplaStationBuyUrl(station),
  }
}

async function main() {
  const stations = getStations()
  const results: StationSweepResult[] = []
  const batchSize = 6
  const startedAt = Date.now()

  for (let index = 0; index < stations.length; index += batchSize) {
    const batch = stations.slice(index, index + batchSize)
    const batchResults = await Promise.all(batch.map((station) => verifyStation(station)))
    results.push(...batchResults)
    const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000)
    console.error(`Verified ${results.length}/${stations.length} stations in ${elapsedSeconds}s`)
  }

  const rentOverrides = results
    .filter((result) => result.rent.radius !== null && result.rent.radius !== RENT_RADIUS_STEPS[0])
    .map((result) => ({
      stationId: result.stationId,
      displayName: result.displayName,
      radius: result.rent.radius,
      linkSummaries: result.rent.links.map((link) => ({
        label: link.label,
        propertyCount: link.propertyCount,
        title: link.title,
      })),
    }))

  const buyOverrides = results
    .filter((result) => result.buy.radius !== null && result.buy.radius !== BUY_RADIUS_STEPS[0])
    .map((result) => ({
      stationId: result.stationId,
      displayName: result.displayName,
      radius: result.buy.radius,
      linkSummaries: result.buy.links.map((link) => ({
        label: link.label,
        propertyCount: link.propertyCount,
        title: link.title,
      })),
    }))

  const unresolved = results
    .filter((result) => result.rent.radius === null || result.buy.radius === null)
    .map((result) => ({
      stationId: result.stationId,
      displayName: result.displayName,
      rent: result.rent,
      buy: result.buy,
    }))

  const currentRightmoveFailures = {
    rent: results.flatMap((result) =>
      result.currentRentFailures.map((failure) => ({
        stationId: result.stationId,
        displayName: result.displayName,
        ...failure,
      }))
    ),
    buy: results.flatMap((result) =>
      result.currentBuyFailures.map((failure) => ({
        stationId: result.stationId,
        displayName: result.displayName,
        ...failure,
      }))
    ),
  }

  const report = {
    stationCount: stations.length,
    rentOverrides,
    buyOverrides,
    unresolved,
    currentRightmoveFailures,
    zooplaValidation: 'Live Zoopla result validation is blocked by Cloudflare security challenges in automated requests; Rightmove-derived radii should be mirrored to Zoopla links.',
  }

  await mkdir(path.join(process.cwd(), '.copilot-tmp'), { recursive: true })
  await writeFile(
    path.join(process.cwd(), '.copilot-tmp/property-search-report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  )

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})