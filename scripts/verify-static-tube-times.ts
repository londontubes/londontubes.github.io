import fs from 'fs'
import path from 'path'

interface StationRecord {
  stationId: string
  displayName: string
}

interface StaticJourney {
  fromStationId: string
  toStationId: string
  minutes: number
}

interface StaticGraphEdge {
  fromStationId: string
  toStationId: string
  lineCode: string
  runMinutes: number
}

interface StaticTubeTimesFile {
  journeys: StaticJourney[]
  graphEdges: StaticGraphEdge[]
}

interface BenchmarkRoute {
  fromName: string
  toName: string
  expectedMinutes: number
  toleranceMinutes?: number
}

interface PathStep {
  stationId: string
  lineCode: string
  runMinutes: number
}

interface ComputedPath {
  totalMinutes: number
  steps: PathStep[]
}

const STATIONS_PATH = path.join(process.cwd(), 'public/data/stations.json')
const TIMES_PATH = path.join(process.cwd(), 'public/data/static-tube-times.json')

const BENCHMARK_ROUTES: BenchmarkRoute[] = [
  { fromName: 'Farringdon', toName: 'Liverpool Street', expectedMinutes: 3.1, toleranceMinutes: 0.2 },
  { fromName: 'Paddington', toName: 'Bond Street', expectedMinutes: 3.8, toleranceMinutes: 0.2 },
  { fromName: "King's Cross & St Pancras International", toName: 'Euston', expectedMinutes: 1, toleranceMinutes: 0.2 },
]

function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function buildJourneyLookup(journeys: StaticJourney[]): Map<string, StaticJourney> {
  const lookup = new Map<string, StaticJourney>()
  for (const journey of journeys) {
    lookup.set(`${journey.fromStationId}->${journey.toStationId}`, journey)
  }
  return lookup
}

function buildGraph(edges: StaticGraphEdge[]): Map<string, StaticGraphEdge[]> {
  const graph = new Map<string, StaticGraphEdge[]>()
  for (const edge of edges) {
    const bucket = graph.get(edge.fromStationId)
    if (bucket) {
      bucket.push(edge)
    } else {
      graph.set(edge.fromStationId, [edge])
    }
  }
  return graph
}

function findStationId(stations: StationRecord[], displayName: string): string {
  const station = stations.find(candidate => candidate.displayName === displayName)
  if (!station) {
    throw new Error(`Station not found: ${displayName}`)
  }
  return station.stationId
}

function computeShortestPath(
  originId: string,
  destinationId: string,
  graph: Map<string, StaticGraphEdge[]>
): ComputedPath | null {
  if (originId === destinationId) {
    return { totalMinutes: 0, steps: [] }
  }

  const distances = new Map<string, number>([[originId, 0]])
  const previous = new Map<string, { stationId: string; edge: StaticGraphEdge }>()
  const queue: Array<{ stationId: string; minutes: number }> = [{ stationId: originId, minutes: 0 }]
  const visited = new Set<string>()

  while (queue.length > 0) {
    let bestIndex = 0
    for (let index = 1; index < queue.length; index++) {
      if (queue[index].minutes < queue[bestIndex].minutes) {
        bestIndex = index
      }
    }

    const current = queue.splice(bestIndex, 1)[0]
    if (visited.has(current.stationId)) continue
    if (current.stationId === destinationId) break
    visited.add(current.stationId)

    for (const edge of graph.get(current.stationId) || []) {
      const candidate = current.minutes + edge.runMinutes
      const previousBest = distances.get(edge.toStationId)
      if (previousBest === undefined || candidate < previousBest) {
        distances.set(edge.toStationId, candidate)
        previous.set(edge.toStationId, { stationId: current.stationId, edge })
        queue.push({ stationId: edge.toStationId, minutes: candidate })
      }
    }
  }

  const totalMinutes = distances.get(destinationId)
  if (totalMinutes === undefined) {
    return null
  }

  const steps: PathStep[] = []
  let cursor = destinationId
  while (cursor !== originId) {
    const prev = previous.get(cursor)
    if (!prev) {
      return null
    }
    steps.push({
      stationId: cursor,
      lineCode: prev.edge.lineCode,
      runMinutes: prev.edge.runMinutes,
    })
    cursor = prev.stationId
  }

  steps.reverse()
  return {
    totalMinutes: Math.round(totalMinutes * 10) / 10,
    steps,
  }
}

function formatPath(path: ComputedPath, stationNames: Map<string, string>, originId: string): string {
  const segments = [stationNames.get(originId) || originId]
  for (const step of path.steps) {
    const name = stationNames.get(step.stationId) || step.stationId
    segments.push(`${name} [${step.lineCode} ${step.runMinutes}m]`)
  }
  return segments.join(' -> ')
}

function withinTolerance(actual: number, expected: number, tolerance: number): boolean {
  return Math.abs(actual - expected) <= tolerance
}

function main() {
  const stationData = loadJson<{ stations: StationRecord[] }>(STATIONS_PATH)
  const tubeTimes = loadJson<StaticTubeTimesFile>(TIMES_PATH)
  const stations = stationData.stations
  const stationNames = new Map(stations.map(station => [station.stationId, station.displayName]))
  const journeyLookup = buildJourneyLookup(tubeTimes.journeys)
  const graph = buildGraph(tubeTimes.graphEdges || [])

  let failed = false

  for (const route of BENCHMARK_ROUTES) {
    const tolerance = route.toleranceMinutes ?? 0.2
    const originId = findStationId(stations, route.fromName)
    const destinationId = findStationId(stations, route.toName)
    const journey = journeyLookup.get(`${originId}->${destinationId}`)
    const recomputed = computeShortestPath(originId, destinationId, graph)

    if (!journey) {
      failed = true
      console.error(`FAIL ${route.fromName} -> ${route.toName}: no stored journey found`)
      continue
    }

    if (!recomputed) {
      failed = true
      console.error(`FAIL ${route.fromName} -> ${route.toName}: could not recompute path from graph edges`)
      continue
    }

    const storedMatchesExpected = withinTolerance(journey.minutes, route.expectedMinutes, tolerance)
    const recomputedMatchesStored = withinTolerance(recomputed.totalMinutes, journey.minutes, 0.1)
    const status = storedMatchesExpected && recomputedMatchesStored ? 'PASS' : 'FAIL'

    if (status === 'FAIL') {
      failed = true
    }

    const pathLabel = formatPath(recomputed, stationNames, originId)
    const expectedLabel = route.expectedMinutes.toFixed(1)
    const storedLabel = journey.minutes.toFixed(1)
    const recomputedLabel = recomputed.totalMinutes.toFixed(1)
    const toleranceLabel = tolerance.toFixed(1)

    const output = [
      `${status} ${route.fromName} -> ${route.toName}`,
      `expected=${expectedLabel}m +/- ${toleranceLabel}`,
      `stored=${storedLabel}m`,
      `recomputed=${recomputedLabel}m`,
      `path=${pathLabel}`,
    ].join(' | ')

    if (status === 'PASS') {
      console.log(output)
    } else {
      console.error(output)
    }
  }

  if (failed) {
    process.exitCode = 1
    return
  }

  console.log(`Verified ${BENCHMARK_ROUTES.length} benchmark routes successfully.`)
}

main()