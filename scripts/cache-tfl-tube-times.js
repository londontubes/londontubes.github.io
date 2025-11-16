#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/*
  Bulk cache of TfL tube travel times between consecutive stations on each line.
  Usage: TFL_APP_ID=xxx TFL_APP_KEY=yyy node scripts/cache-tfl-tube-times.js
*/

const fs = require('fs')
const path = require('path')

const APP_ID = process.env.TFL_APP_ID || process.env.NEXT_PUBLIC_TFL_APP_ID || process.env.NEXT_TFL_APP_ID
const APP_KEY = process.env.TFL_APP_KEY || process.env.NEXT_PUBLIC_TFL_APP_KEY || process.env.NEXT_TFL_APP_KEY
const MODES = 'tube'
const OUTPUT_PATH = path.join(__dirname, '../public/data/tfl-tube-times.json')
const RATE_LIMIT_DELAY_MS = parseInt(process.env.TFL_REQUEST_DELAY_MS || '1200', 10)

if (!APP_ID || !APP_KEY) {
  console.error('Missing TfL credentials. Set TFL_APP_ID and TFL_APP_KEY env vars.')
  process.exit(1)
}

const stationsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/stations.json'), 'utf8'))
const linesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/lines.json'), 'utf8'))
const stations = stationsData.stations
const lines = linesData.lines

const stationMap = new Map(stations.map(s => [s.stationId, s]))

async function fetchJourneyDuration(fromId, toId) {
  const params = new URLSearchParams({ app_id: APP_ID, app_key: APP_KEY, mode: MODES })
  const url = `https://api.tfl.gov.uk/Journey/JourneyResults/${encodeURIComponent(fromId)}/to/${encodeURIComponent(toId)}?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`TfL responded ${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  if (!data.journeys || !data.journeys.length) {
    throw new Error('TfL returned no journeys')
  }
  const journey = data.journeys[0]
  const legs = (journey.legs || []).map(leg => ({
    mode: leg.mode?.name || leg.mode?.id || 'unknown',
    duration: leg.duration,
    lineName: leg.routeOptions?.[0]?.name,
  }))
  return { durationMinutes: journey.duration, legs }
}

function loadExistingCache() {
  if (!fs.existsSync(OUTPUT_PATH)) return { generatedAt: null, segments: {} }
  try {
    const raw = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'))
    return {
      generatedAt: raw.generatedAt || null,
      segments: raw.segments || {},
    }
  } catch (err) {
    console.warn('Unable to parse existing cache, starting fresh.', err)
    return { generatedAt: null, segments: {} }
  }
}

async function writeOutput(segments) {
  const payload = {
    generatedAt: new Date().toISOString(),
    segments,
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf8')
}

function buildSegmentKey(lineCode, fromId, toId) {
  return `${lineCode}:${fromId}->${toId}`
}

async function delay(ms) {
  if (ms <= 0) return
  await new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const existing = loadExistingCache()
  const segments = { ...existing.segments }
  let completed = 0
  let total = 0

  lines.forEach(line => {
    const ids = line.stationIds
    for (let i = 0; i < ids.length - 1; i++) {
      const fromId = ids[i]
      const toId = ids[i + 1]
      const fromStation = stationMap.get(fromId)
      const toStation = stationMap.get(toId)
      if (!fromStation || !toStation) continue
      total++
    }
  })

  console.log(`Requesting TfL durations for ${total} station-to-station segments across ${lines.length} lines.`)

  for (const line of lines) {
    const ids = line.stationIds
    for (let i = 0; i < ids.length - 1; i++) {
      const fromId = ids[i]
      const toId = ids[i + 1]
      const fromStation = stationMap.get(fromId)
      const toStation = stationMap.get(toId)
      if (!fromStation || !toStation) {
        console.warn(`Skipping missing station data for ${fromId} -> ${toId}`)
        continue
      }
      const key = buildSegmentKey(line.lineCode, fromId, toId)
      if (segments[key]) {
        completed++
        continue
      }
      try {
        const result = await fetchJourneyDuration(fromId, toId)
        segments[key] = {
          lineCode: line.lineCode,
          fromStationId: fromId,
          toStationId: toId,
          fromName: fromStation.displayName,
          toName: toStation.displayName,
          durationMinutes: result.durationMinutes,
          legs: result.legs,
        }
        completed++
        console.log(`[${completed}/${total}] ${fromStation.displayName} -> ${toStation.displayName}: ${result.durationMinutes} mins`)
      } catch (error) {
        segments[key] = {
          lineCode: line.lineCode,
          fromStationId: fromId,
          toStationId: toId,
          fromName: fromStation.displayName,
          toName: toStation.displayName,
          durationMinutes: null,
          error: error.message,
        }
        completed++
        console.warn(`[${completed}/${total}] Failed ${fromStation.displayName} -> ${toStation.displayName}: ${error.message}`)
      }
      await delay(RATE_LIMIT_DELAY_MS)
    }
  }

  await writeOutput(segments)
  console.log(`Wrote TfL travel times to ${OUTPUT_PATH}`)
}

main().catch(err => {
  console.error('Fatal error while caching TfL tube times', err)
  process.exit(1)
})
