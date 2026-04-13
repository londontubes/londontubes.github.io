import fs from 'node:fs/promises'
import path from 'node:path'
import type { Station } from '@/app/types/transit'
import type { StationPropertyDataset } from '@/app/types/property'
import { buildRightmoveStationBuyUrls, buildRightmoveStationUrls } from '@/app/lib/map/propertySearch'
import { buildStationPropertySummary, extractRightmoveListingSamples, type RightmoveListingSample } from '@/app/lib/property/rightmoveStationPrices'

const ROOT = process.cwd()
const STATIONS_PATH = path.join(ROOT, 'public/data/stations.json')
const OUTPUT_PATH = path.join(ROOT, 'public/data/station-property-prices.json')
const REQUEST_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-GB,en;q=0.9',
  'cache-control': 'no-cache',
} as const
const REQUEST_TIMEOUT_MS = 20000
const CONCURRENCY = 5

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Rightmove request failed with ${response.status}`)
  }

  return response.text()
}

async function collectSamplesForMode(station: Station, mode: 'rent' | 'buy'): Promise<RightmoveListingSample[]> {
  const links = mode === 'rent'
    ? buildRightmoveStationUrls(station)
    : buildRightmoveStationBuyUrls(station)

  if (!links.length) {
    return []
  }

  const samples = new Map<string, RightmoveListingSample>()

  for (const link of links) {
    try {
      const html = await fetchHtml(link.url)
      const nextSamples = extractRightmoveListingSamples(html, mode)

      nextSamples.forEach((sample) => {
        samples.set(sample.listingId, sample)
      })
    } catch (error) {
      console.warn(`${station.stationId} ${mode} failed for ${link.label}:`, error)
    }
  }

  return Array.from(samples.values())
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, iteratee: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (true) {
      const currentIndex = nextIndex
      nextIndex += 1

      if (currentIndex >= items.length) {
        return
      }

      results[currentIndex] = await iteratee(items[currentIndex], currentIndex)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

async function main() {
  const stationsJson = JSON.parse(await fs.readFile(STATIONS_PATH, 'utf8')) as { stations?: Station[] }
  const stations = stationsJson.stations ?? []

  const summaries = await mapWithConcurrency(stations, CONCURRENCY, async (station, index) => {
    console.log(`[${index + 1}/${stations.length}] ${station.displayName}`)
    const [rentSamples, saleSamples] = await Promise.all([
      collectSamplesForMode(station, 'rent'),
      collectSamplesForMode(station, 'buy'),
    ])

    return buildStationPropertySummary(station.stationId, station.displayName, rentSamples, saleSamples)
  })

  const dataset: StationPropertyDataset = {
    generatedAt: new Date().toISOString(),
    radiusMiles: 0.5,
    source: {
      provider: 'Rightmove',
      listingSample: 'current-map-results',
    },
    stations: summaries,
  }

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')

  const coveredStations = summaries.filter((summary) => summary.rentListingCount > 0 || summary.saleListingCount > 0).length
  console.log(`Wrote ${coveredStations}/${stations.length} station summaries to ${path.relative(ROOT, OUTPUT_PATH)}`)
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})