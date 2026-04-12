import { RIGHTMOVE_STATION_TEMPLATE } from '../docs/rightmove-station-template'

interface RightmoveTypeaheadMatch {
  id?: string
  type?: string
  displayName?: string
}

interface RightmoveTypeaheadResponse {
  matches?: RightmoveTypeaheadMatch[]
}

const TYPEAHEAD_URL = 'https://los.rightmove.co.uk/typeahead'

function normalizeName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeStationName(value: string): string {
  return normalizeName(value)
    .replace(/\b(rail|dlr|underground|metro)\b/g, ' ')
    .replace(/\bstation\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildCandidateQueries(searchLocation: string): string[] {
  const candidates = new Set<string>()
  const asciiSafe = searchLocation
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[']/g, '')
    .replace(/&/g, 'and')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const withoutParens = asciiSafe.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()
  const stationless = asciiSafe.replace(/\s+(rail|dlr|underground)\s+station$/i, ' Station').replace(/\s+station$/i, '').trim()
  const simplified = withoutParens.replace(/\s+(rail|dlr|underground)\s+station$/i, '').replace(/\s+station$/i, '').trim()

  for (const candidate of [searchLocation, asciiSafe, withoutParens, stationless, simplified]) {
    if (candidate) {
      candidates.add(candidate)
    }
  }

  return Array.from(candidates)
}

async function fetchStationMatches(searchLocation: string) {
  for (const candidate of buildCandidateQueries(searchLocation)) {
    const url = new URL(TYPEAHEAD_URL)
    url.searchParams.set('query', candidate)
    url.searchParams.set('limit', '10')
    url.searchParams.set('exclude', 'STREET')

    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      if (response.status === 400) {
        continue
      }

      throw new Error(`Typeahead request failed for ${searchLocation}: ${response.status}`)
    }

    const parsed = await response.json() as RightmoveTypeaheadResponse
    const matches = (parsed.matches ?? []).filter((match) => match.type === 'STATION' && typeof match.id === 'string')

    if (matches.length > 0) {
      return matches
    }
  }

  return []
}

async function main() {
  const entriesToVerify = RIGHTMOVE_STATION_TEMPLATE.filter(
    (entry) => entry.matchStatus === 'matched' && Boolean(entry.locationIdentifier)
  )
  const mismatches: Array<{ stationId: string; searchLocation: string; expected: string; actual: string; actualDisplayName: string }> = []

  const verifyEntry = async (entry: (typeof entriesToVerify)[number]) => {
    const matches = await fetchStationMatches(entry.searchLocation)
    const expectedNormalized = normalizeStationName(entry.searchLocation)

    if (matches.length === 0) {
      return {
        stationId: entry.stationId,
        searchLocation: entry.searchLocation,
        expected: entry.locationIdentifier,
        actual: 'NO_STATION_MATCHES_RETURNED',
        actualDisplayName: '',
      }
    }

    const exactMatch = matches.find((match) => normalizeStationName(match.displayName ?? '') === expectedNormalized)

    if (!exactMatch) {
      return {
        stationId: entry.stationId,
        searchLocation: entry.searchLocation,
        expected: entry.locationIdentifier,
        actual: 'NO_EXACT_STATION_MATCH',
        actualDisplayName: '',
      }
    }

    if (exactMatch.id !== entry.locationIdentifier) {
      return {
        stationId: entry.stationId,
        searchLocation: entry.searchLocation,
        expected: entry.locationIdentifier,
        actual: exactMatch.id ?? '',
        actualDisplayName: exactMatch.displayName ?? '',
      }
    }

    return null
  }

  const batchSize = 8
  for (let index = 0; index < entriesToVerify.length; index += batchSize) {
    const batch = entriesToVerify.slice(index, index + batchSize)
    const results = await Promise.all(batch.map((entry) => verifyEntry(entry)))
    mismatches.push(...results.filter((result): result is NonNullable<typeof result> => result !== null))
  }

  if (mismatches.length === 0) {
    console.log('All matched Rightmove station mappings are consistent with live station typeahead results.')
    return
  }

  console.error(JSON.stringify(mismatches, null, 2))
  process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})