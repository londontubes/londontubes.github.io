import fs from 'fs/promises'
import path from 'path'
import { RIGHTMOVE_STATION_TEMPLATE, type RightmoveStationTemplateEntry } from '../docs/rightmove-station-template'

type MatchStatus = 'matched' | 'unmatched' | 'ambiguous'

interface RightmoveTypeaheadMatch {
  id?: string
  type?: string
  displayName?: string
}

interface RightmoveTypeaheadResponse {
  matches?: RightmoveTypeaheadMatch[]
}

interface StationRecord {
  stationId: string
  displayName: string
}

const rootDir = process.cwd()
const stationsPath = path.join(rootDir, 'public', 'data', 'stations.json')
const outputPath = path.join(rootDir, 'docs', 'rightmove-station-template.ts')
const TYPEAHEAD_URL = 'https://los.rightmove.co.uk/typeahead'

function parseArgs() {
  const args = process.argv.slice(2)
  const getValue = (flag: string) => {
    const index = args.indexOf(flag)
    return index >= 0 ? args[index + 1] : undefined
  }

  return {
    limit: Number.parseInt(getValue('--limit') ?? '', 10) || null,
    stationId: getValue('--station-id') ?? null,
    force: args.includes('--force'),
  }
}

function escapeString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

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

function normalizeLocationIdentifier(value: string | undefined): string {
  if (!value) return ''
  return value.replace(/^STATION\^/i, '').trim()
}

function getStatus(entry: RightmoveStationTemplateEntry): MatchStatus {
  if (entry.matchStatus) return entry.matchStatus
  return entry.locationIdentifier ? 'matched' : 'unmatched'
}

function toDisplayLocationIdentifier(searchLocation: string): string {
  const base = searchLocation.replace(/\s+/g, '-')
  return base.endsWith('-Station') ? base : `${base}-Station`
}

async function loadStations(): Promise<StationRecord[]> {
  const raw = await fs.readFile(stationsPath, 'utf8')
  const parsed = JSON.parse(raw) as { stations?: StationRecord[] } | StationRecord[]
  const stations = Array.isArray(parsed) ? parsed : parsed.stations

  if (!Array.isArray(stations)) {
    throw new Error('Unexpected stations.json shape: expected an array or { stations: [...] }')
  }

  return stations
}

async function fetchRightmoveMatches(searchLocation: string): Promise<RightmoveTypeaheadMatch[]> {
  const attemptedQueries: string[] = []

  for (const candidate of buildCandidateQueries(searchLocation)) {
    attemptedQueries.push(candidate)

    const url = new URL(TYPEAHEAD_URL)
    url.searchParams.set('query', candidate)
    url.searchParams.set('limit', '10')
    url.searchParams.set('exclude', 'STREET')

    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 400) {
        continue
      }
      throw new Error(`Rightmove typeahead failed for ${searchLocation}: ${response.status} ${response.statusText}`)
    }

    const parsed = await response.json() as RightmoveTypeaheadResponse
    const matches = (parsed.matches ?? []).filter(match => match.type === 'STATION' && typeof match.id === 'string')

    if (matches.length > 0) {
      return matches
    }
  }

  throw new Error(`Rightmove typeahead failed for ${searchLocation}: no station matches for ${attemptedQueries.join(' | ')}`)
}

function pickBestMatch(searchLocation: string, matches: RightmoveTypeaheadMatch[]): {
  locationIdentifier: string
  displayName: string
  matchStatus: MatchStatus
} {
  if (matches.length === 0) {
    return { locationIdentifier: '', displayName: '', matchStatus: 'unmatched' }
  }

  const normalizedSearch = normalizeName(searchLocation)
  const normalizedStationSearch = normalizeStationName(searchLocation)
  const exactMatches = matches.filter(match => normalizeName(match.displayName ?? '') === normalizedSearch)
  const exactStationMatches = matches.filter(match => normalizeStationName(match.displayName ?? '') === normalizedStationSearch)

  if (exactMatches.length === 1) {
    return {
      locationIdentifier: normalizeLocationIdentifier(exactMatches[0].id),
      displayName: exactMatches[0].displayName ?? searchLocation,
      matchStatus: 'matched',
    }
  }

  if (exactStationMatches.length === 1) {
    return {
      locationIdentifier: normalizeLocationIdentifier(exactStationMatches[0].id),
      displayName: exactStationMatches[0].displayName ?? searchLocation,
      matchStatus: 'matched',
    }
  }

  if (matches.length === 1) {
    return {
      locationIdentifier: normalizeLocationIdentifier(matches[0].id),
      displayName: matches[0].displayName ?? searchLocation,
      matchStatus: 'matched',
    }
  }

  return { locationIdentifier: '', displayName: '', matchStatus: 'ambiguous' }
}

function serializeEntry(entry: RightmoveStationTemplateEntry): string {
  const properties = [
    `stationId: '${escapeString(entry.stationId)}'`,
    `searchLocation: '${escapeString(entry.searchLocation)}'`,
    `locationIdentifier: '${escapeString(entry.locationIdentifier)}'`,
    `displayLocationIdentifier: '${escapeString(entry.displayLocationIdentifier)}'`,
  ]

  if (entry.displayName) {
    properties.push(`displayName: '${escapeString(entry.displayName)}'`)
  }

  if (entry.matchStatus) {
    properties.push(`matchStatus: '${entry.matchStatus}'`)
  }

  if (entry.lastVerifiedAt) {
    properties.push(`lastVerifiedAt: '${entry.lastVerifiedAt}'`)
  }

  return `  { ${properties.join(', ')} },`
}

async function writeTemplate(entries: RightmoveStationTemplateEntry[]) {
  const lines = [
    '// Auto-generated by scripts/generate-rightmove-station-template.js and scripts/enrich-rightmove-station-template.ts',
    '// Do not edit this file by hand; instead, re-run the script or copy entries you need.',
    '',
    'export interface RightmoveStationTemplateEntry {',
    '  stationId: string',
    '  searchLocation: string',
    '  locationIdentifier: string',
    '  displayLocationIdentifier: string',
    '  displayName?: string',
    "  matchStatus?: 'matched' | 'unmatched' | 'ambiguous'",
    '  lastVerifiedAt?: string',
    '}',
    '',
    'export const RIGHTMOVE_STATION_TEMPLATE: RightmoveStationTemplateEntry[] = [',
    ...entries.map(serializeEntry),
    ']',
    '',
  ]

  await fs.writeFile(outputPath, lines.join('\n'), 'utf8')
}

async function main() {
  const args = parseArgs()
  const stations = await loadStations()
  const existingByStationId = new Map(RIGHTMOVE_STATION_TEMPLATE.map(entry => [entry.stationId, entry]))
  const now = new Date().toISOString()

  const selectedStations = stations.filter(station => {
    if (args.stationId && station.stationId !== args.stationId) return false
    return true
  })

  const limitedStations = args.limit ? selectedStations.slice(0, args.limit) : selectedStations
  const nextEntries: RightmoveStationTemplateEntry[] = []
  let matched = 0
  let ambiguous = 0
  let unmatched = 0

  for (const station of stations) {
    const existingEntry = existingByStationId.get(station.stationId)
    const fallbackSearchLocation = station.displayName.replace(/ Underground Station$/i, ' Station').trim()
    let nextEntry: RightmoveStationTemplateEntry = existingEntry
      ? { ...existingEntry }
      : {
          stationId: station.stationId,
          searchLocation: fallbackSearchLocation,
          locationIdentifier: '',
          displayLocationIdentifier: toDisplayLocationIdentifier(fallbackSearchLocation),
          matchStatus: 'unmatched',
        }

    const included = limitedStations.some(candidate => candidate.stationId === station.stationId)
    const hasExistingMatch = Boolean(normalizeLocationIdentifier(nextEntry.locationIdentifier))

    if (included && (args.force || !hasExistingMatch)) {
      try {
        const matches = await fetchRightmoveMatches(nextEntry.searchLocation)
        const bestMatch = pickBestMatch(nextEntry.searchLocation, matches)

        nextEntry = {
          ...nextEntry,
          locationIdentifier: bestMatch.locationIdentifier,
          displayName: bestMatch.displayName || nextEntry.displayName,
          matchStatus: bestMatch.matchStatus,
          lastVerifiedAt: now,
        }
      } catch (error) {
        nextEntry = {
          ...nextEntry,
          matchStatus: 'ambiguous',
          lastVerifiedAt: now,
        }
        console.error(String(error))
      }

      await new Promise(resolve => setTimeout(resolve, 150))
    } else if (!nextEntry.matchStatus) {
      nextEntry.matchStatus = hasExistingMatch ? 'matched' : 'unmatched'
    }

    const status = getStatus(nextEntry)
    if (status === 'matched') matched += 1
    if (status === 'ambiguous') ambiguous += 1
    if (status === 'unmatched') unmatched += 1

    nextEntries.push(nextEntry)
  }

  await writeTemplate(nextEntries)

  console.log(`Rightmove mapping updated: ${matched} matched, ${ambiguous} ambiguous, ${unmatched} unmatched`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})