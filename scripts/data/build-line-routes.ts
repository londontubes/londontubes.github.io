/**
 * Builds public/data/line-routes.json: each line's routes as ordered lists of
 * site station ids (e.g. Victoria: Brixton → … → Walthamstow Central), from
 * the TfL route-sequence cache written by fetch-tfl.ts.
 *
 *   npx tsx scripts/data/fetch-tfl.ts --rail-only && npx tsx scripts/data/build-line-routes.ts
 */
import fs from 'fs/promises'
import path from 'path'

const CACHE_FILE = path.join(process.cwd(), 'scripts', 'cache', 'routes.raw.json')
const DATA_DIR = path.join(process.cwd(), 'public', 'data')

interface RawRoute {
  orderedLineRoutes?: { name: string; naptanIds: string[] }[]
  stopPointSequences?: { stopPoint: { id: string; topMostParentId?: string; parentId?: string }[] }[]
}

function isContiguousSubsequence(small: string[], big: string[]): boolean {
  if (small.length > big.length) return false
  const joined = `|${big.join('|')}|`
  return joined.includes(`|${small.join('|')}|`)
}

function cleanRouteName(name: string): string {
  return name.replace(/&harr;/g, '↔').replace(/\s+/g, ' ').trim()
}

async function main() {
  const routes = JSON.parse(await fs.readFile(CACHE_FILE, 'utf-8')) as Record<string, RawRoute>
  const stations = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'stations.json'), 'utf-8')) as {
    stations: { stationId: string }[]
  }
  const siteIds = new Set(stations.stations.map((s) => s.stationId))
  // Duplicate station ids merged by transform.ts (e.g. 9100NRBITON2 → 910GNRBITON).
  let aliases: Record<string, string> = {}
  try {
    aliases = JSON.parse(await fs.readFile(path.join(process.cwd(), 'scripts', 'cache', 'station-aliases.json'), 'utf-8'))
  } catch {
    // No alias file: nothing was merged.
  }

  const output: Record<string, { name: string; stationIds: string[] }[]> = {}

  for (const [lineCode, route] of Object.entries(routes)) {
    // Map platform-level ids to the station id the site uses (often a HUB id).
    const toSite = new Map<string, string>()
    for (const seq of route.stopPointSequences ?? []) {
      for (const sp of seq.stopPoint) {
        const candidate = [sp.id, sp.topMostParentId, sp.parentId].find((id) => id && siteIds.has(id))
        if (candidate) toSite.set(sp.id, candidate)
      }
    }

    const candidates = (route.orderedLineRoutes ?? [])
      .map((r) => ({
        name: cleanRouteName(r.name),
        stationIds: r.naptanIds
          .map((id) => aliases[id] ?? id)
          .map((id) => (siteIds.has(id) ? id : toSite.get(id)))
          .filter((id): id is string => Boolean(id))
          .filter((id, i, arr) => arr[i - 1] !== id),
      }))
      .filter((r) => r.stationIds.length >= 2)
      .sort((a, b) => b.stationIds.length - a.stationIds.length)

    // Keep each distinct route once: drop reversed copies and short workings
    // that are just a section of a longer route.
    const kept: { name: string; stationIds: string[] }[] = []
    for (const candidate of candidates) {
      const reversed = [...candidate.stationIds].reverse()
      const covered = kept.some(
        (k) => isContiguousSubsequence(candidate.stationIds, k.stationIds) || isContiguousSubsequence(reversed, k.stationIds)
      )
      if (!covered) kept.push(candidate)
    }
    output[lineCode] = kept
  }

  await fs.writeFile(
    path.join(DATA_DIR, 'line-routes.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), source: 'TfL Unified API Line/{id}/Route/Sequence/all', lines: output }, null, 2)
  )
  const summary = Object.entries(output).map(([code, r]) => `${code}:${r.length}`).join(' ')
  console.log(`✅ Line routes written (${summary})`)
}

main().catch((error) => {
  console.error('❌ Failed to build line routes:', error)
  process.exit(1)
})
