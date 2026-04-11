import bakerloo from '@/public/data/google-maps-bakerloo-rush-hour.json'
import central from '@/public/data/google-maps-central-rush-hour.json'
import circle from '@/public/data/google-maps-circle-rush-hour.json'
import district from '@/public/data/google-maps-district-rush-hour.json'
import elizabeth from '@/public/data/google-maps-elizabeth-rush-hour.json'
import hammersmithCity from '@/public/data/google-maps-hammersmith-city-rush-hour.json'
import jubilee from '@/public/data/google-maps-jubilee-rush-hour.json'
import metropolitan from '@/public/data/google-maps-metropolitan-rush-hour.json'
import northern from '@/public/data/google-maps-northern-rush-hour.json'
import piccadilly from '@/public/data/google-maps-piccadilly-rush-hour.json'
import victoria from '@/public/data/google-maps-victoria-rush-hour.json'
import waterlooCity from '@/public/data/google-maps-waterloo-city-rush-hour.json'
import { historicalElizabethEdges } from '@/app/lib/map/historicalElizabethEdges'

export interface StaticTubeJourney {
  fromStationId: string
  toStationId: string
  minutes: number
  source?: string
}

export interface StaticTubeGraphEdge {
  fromStationId: string
  toStationId: string
  lineCode: string
  runMinutes: number
  source?: string
}

interface GoogleRushHourObservedJourney {
  durationMinutes?: number
}

interface GoogleRushHourJourney {
  fromStationId: string
  toStationId: string
  graphRunMinutes?: number
  observedJourney?: GoogleRushHourObservedJourney | null
}

interface GoogleRushHourFile {
  metadata: {
    lineCode: string
    generatedAt?: string
  }
  journeys: GoogleRushHourJourney[]
}

interface InternalGraphEdge extends StaticTubeGraphEdge {
  sourceKind: 'observed' | 'fallback' | 'historical'
}

const datasets = [
  bakerloo,
  central,
  circle,
  district,
  elizabeth,
  hammersmithCity,
  jubilee,
  metropolitan,
  northern,
  piccadilly,
  victoria,
  waterlooCity,
] as GoogleRushHourFile[]

const graphLookup = new Map<string, InternalGraphEdge[]>()
let observedEdgeCount = 0
let fallbackEdgeCount = 0
let historicalEdgeCount = 0

function addGraphEdge(edge: InternalGraphEdge) {
  const bucket = graphLookup.get(edge.fromStationId)
  if (bucket) {
    bucket.push(edge)
  } else {
    graphLookup.set(edge.fromStationId, [edge])
  }
}

for (const dataset of datasets) {
  const lineCode = dataset.metadata.lineCode
  if (lineCode === 'elizabeth') {
    continue
  }
  for (const journey of dataset.journeys || []) {
    const observedMinutes = journey.observedJourney?.durationMinutes
    const sourceKind = typeof observedMinutes === 'number' ? 'observed' : 'fallback'
    const runMinutes = typeof observedMinutes === 'number' ? observedMinutes : journey.graphRunMinutes

    if (typeof runMinutes !== 'number' || !Number.isFinite(runMinutes)) {
      continue
    }

    if (sourceKind === 'observed') {
      observedEdgeCount += 1
    } else {
      fallbackEdgeCount += 1
    }

    const edge: InternalGraphEdge = {
      fromStationId: journey.fromStationId,
      toStationId: journey.toStationId,
      lineCode,
      runMinutes,
      source: sourceKind === 'observed'
        ? `google-maps-${lineCode}-rush-hour`
        : `google-maps-${lineCode}-graph-fallback`,
      sourceKind,
    }

    addGraphEdge(edge)
  }
}

for (const [fromStationId, toStationId, runMinutes] of historicalElizabethEdges) {
  historicalEdgeCount += 1
  addGraphEdge({
    fromStationId,
    toStationId,
    lineCode: 'elizabeth',
    runMinutes,
    source: 'historical-tfl-timetables-elizabeth',
    sourceKind: 'historical',
  })
}

const journeyLookup = new Map<string, StaticTubeJourney | null>()

const manualJourneyOverrides = new Map<string, StaticTubeJourney>([
  [
    'HUBTCR->HUBEAL',
    {
      fromStationId: 'HUBTCR',
      toStationId: 'HUBEAL',
      minutes: 17,
      source: 'manual-google-maps-reference',
    },
  ],
  [
    'HUBTCR->910GACTONML',
    {
      fromStationId: 'HUBTCR',
      toStationId: '910GACTONML',
      minutes: 13,
      source: 'manual-google-maps-reference',
    },
  ],
  [
    'HUBEAL->HUBTCR',
    {
      fromStationId: 'HUBEAL',
      toStationId: 'HUBTCR',
      minutes: 17,
      source: 'manual-google-maps-reference',
    },
  ],
  [
    '910GACTONML->HUBTCR',
    {
      fromStationId: '910GACTONML',
      toStationId: 'HUBTCR',
      minutes: 13,
      source: 'manual-google-maps-reference',
    },
  ],
])

function buildKey(from: string, to: string) {
  return `${from}->${to}`
}

function roundMinutes(value: number) {
  return Math.round(value * 10) / 10
}

function computeJourney(from: string, to: string): StaticTubeJourney | null {
  if (from === to) {
    return {
      fromStationId: from,
      toStationId: to,
      minutes: 0,
      source: 'google-maps-rush-hour',
    }
  }

  const distances = new Map<string, number>([[from, 0]])
  const previous = new Map<string, { stationId: string; edge: InternalGraphEdge }>()
  const queue: Array<{ stationId: string; minutes: number }> = [{ stationId: from, minutes: 0 }]
  const visited = new Set<string>()

  while (queue.length > 0) {
    let bestIndex = 0
    for (let index = 1; index < queue.length; index += 1) {
      if (queue[index].minutes < queue[bestIndex].minutes) {
        bestIndex = index
      }
    }

    const current = queue.splice(bestIndex, 1)[0]
    if (visited.has(current.stationId)) {
      continue
    }
    if (current.stationId === to) {
      break
    }

    visited.add(current.stationId)

    for (const edge of graphLookup.get(current.stationId) || []) {
      const candidate = current.minutes + edge.runMinutes
      const previousBest = distances.get(edge.toStationId)
      if (previousBest === undefined || candidate < previousBest) {
        distances.set(edge.toStationId, candidate)
        previous.set(edge.toStationId, { stationId: current.stationId, edge })
        queue.push({ stationId: edge.toStationId, minutes: candidate })
      }
    }
  }

  const totalMinutes = distances.get(to)
  if (totalMinutes === undefined) {
    return null
  }

  let cursor = to
  let usedFallback = false
  while (cursor !== from) {
    const step = previous.get(cursor)
    if (!step) {
      return null
    }
    if (step.edge.sourceKind === 'fallback') {
      usedFallback = true
    }
    cursor = step.stationId
  }

  return {
    fromStationId: from,
    toStationId: to,
    minutes: roundMinutes(totalMinutes),
    source: usedFallback ? 'google-maps-rush-hour + graph fallback' : 'google-maps-rush-hour',
  }
}

export function getStaticTubeJourney(from: string, to: string): StaticTubeJourney | null {
  const key = buildKey(from, to)
  const manualOverride = manualJourneyOverrides.get(key)
  if (manualOverride) {
    return manualOverride
  }
  if (!journeyLookup.has(key)) {
    journeyLookup.set(key, computeJourney(from, to))
  }
  return journeyLookup.get(key) || null
}

export function hasStaticTubeData() {
  return graphLookup.size > 0
}

export function getStaticTubeGraph() {
  return graphLookup
}

export const staticTubeTimesMetadata = {
  generatedAt: datasets
    .map(dataset => dataset.metadata.generatedAt)
    .filter((value): value is string => typeof value === 'string')
    .sort()
    .at(-1) ?? null,
  source: 'google-maps-rush-hour-json + historical-elizabeth-timetables',
  lineFiles: datasets.length,
  observedEdges: observedEdgeCount,
  fallbackEdges: fallbackEdgeCount,
  historicalEdges: historicalEdgeCount,
  boardingWaitMinutes: 0,
  transferWalkMinutes: 0,
  hubWalkMinutes: 0,
}

export const staticTubeGraphPenalties = {
  boardingWaitMinutes: 0,
  transferWalkMinutes: 0,
  hubWalkMinutes: 0,
}
