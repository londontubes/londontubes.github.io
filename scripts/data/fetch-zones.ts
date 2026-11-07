/**
 * Builds public/data/station-zones.json: the TfL fare zone for every station
 * in public/data/stations.json, from TfL's Line/{id}/StopPoints data.
 *
 *   npx tsx scripts/data/fetch-zones.ts
 */
import fs from 'fs/promises'
import path from 'path'

const TFL_API_BASE = 'https://api.tfl.gov.uk'
const DATA_DIR = path.join(process.cwd(), 'public', 'data')

interface StopPoint {
  naptanId: string
  hubNaptanCode?: string
  commonName: string
  additionalProperties?: { key: string; value: string }[]
}

async function fetchJson<T>(url: string, retries = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url)
    if (response.ok) return (await response.json()) as T
    if (attempt >= retries) throw new Error(`HTTP ${response.status} for ${url}`)
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
  }
}

// TfL writes boundary stations as "2+3" or "2/3"; normalise to "2/3".
function normaliseZone(value: string): string | null {
  const zones = value.split(/[+/]/).map((z) => z.trim()).filter((z) => /^\d+$/.test(z))
  if (zones.length === 0) return null
  return [...new Set(zones)].sort((a, b) => Number(a) - Number(b)).join('/')
}

async function main() {
  const lines = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'lines.json'), 'utf-8')) as {
    lines: { lineCode: string }[]
  }
  const stations = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'stations.json'), 'utf-8')) as {
    stations: { stationId: string; displayName: string }[]
  }

  const zoneById = new Map<string, string>()
  for (const { lineCode } of lines.lines) {
    const stopPoints = await fetchJson<StopPoint[]>(`${TFL_API_BASE}/Line/${lineCode}/StopPoints`)
    for (const stopPoint of stopPoints) {
      const raw = stopPoint.additionalProperties?.find((p) => p.key === 'Zone')?.value
      const zone = raw ? normaliseZone(raw) : null
      if (!zone) continue
      for (const id of [stopPoint.naptanId, stopPoint.hubNaptanCode]) {
        if (id && !zoneById.has(id)) zoneById.set(id, zone)
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  const zones: Record<string, string> = {}
  const missing: string[] = []
  for (const station of stations.stations) {
    const zone = zoneById.get(station.stationId)
    if (zone) zones[station.stationId] = zone
    else missing.push(station.displayName)
  }

  await fs.writeFile(
    path.join(DATA_DIR, 'station-zones.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), source: 'TfL Unified API Line/{id}/StopPoints', zones }, null, 2)
  )
  console.log(`✅ Zones for ${Object.keys(zones).length}/${stations.stations.length} stations`)
  if (missing.length) console.log(`   No zone from TfL: ${missing.join(', ')}`)
}

main().catch((error) => {
  console.error('❌ Failed to build station zones:', error)
  process.exit(1)
})
