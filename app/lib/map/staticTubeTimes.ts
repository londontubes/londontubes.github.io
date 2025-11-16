import raw from '@/public/data/static-tube-times.json'

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
}

interface StaticTubeTimesMetadata {
  timetableRequests?: number
  timetableEdgesParsed?: number
  fallbackEdges?: number
  graphStations?: number
  graphEdges?: number
  boardingWaitMinutes?: number
  transferWalkMinutes?: number
  hubWalkMinutes?: number
}

interface StaticTubeTimesFile {
  generatedAt: string | null
  source?: string
  journeys: StaticTubeJourney[]
  graphEdges?: StaticTubeGraphEdge[]
  metadata?: StaticTubeTimesMetadata
}

const data = raw as StaticTubeTimesFile

const lookup = new Map<string, StaticTubeJourney>()

for (const journey of data.journeys || []) {
  const key = buildKey(journey.fromStationId, journey.toStationId)
  lookup.set(key, journey)
  const reverseKey = buildKey(journey.toStationId, journey.fromStationId)
  if (!lookup.has(reverseKey)) {
    lookup.set(reverseKey, {
      fromStationId: journey.toStationId,
      toStationId: journey.fromStationId,
      minutes: journey.minutes,
      source: journey.source,
    })
  }
}

const graphLookup = new Map<string, StaticTubeGraphEdge[]>()
for (const edge of data.graphEdges || []) {
  const bucket = graphLookup.get(edge.fromStationId)
  if (bucket) {
    bucket.push(edge)
  } else {
    graphLookup.set(edge.fromStationId, [edge])
  }
}

function buildKey(from: string, to: string) {
  return `${from}->${to}`
}

export function getStaticTubeJourney(from: string, to: string): StaticTubeJourney | null {
  if (from === to) {
    return {
      fromStationId: from,
      toStationId: to,
      minutes: 0,
      source: data.source || 'static-tube-times',
    }
  }
  return lookup.get(buildKey(from, to)) || null
}

export function hasStaticTubeData() {
  return lookup.size > 0
}

export function getStaticTubeGraph() {
  return graphLookup
}

export const staticTubeTimesMetadata = {
  generatedAt: data.generatedAt,
  source: data.source,
  boardingWaitMinutes: data.metadata?.boardingWaitMinutes ?? null,
  transferWalkMinutes: data.metadata?.transferWalkMinutes ?? null,
  hubWalkMinutes: data.metadata?.hubWalkMinutes ?? null,
}

export const staticTubeGraphPenalties = {
  boardingWaitMinutes: data.metadata?.boardingWaitMinutes ?? 0,
  transferWalkMinutes: data.metadata?.transferWalkMinutes ?? 0,
  hubWalkMinutes: data.metadata?.hubWalkMinutes ?? 0,
}
