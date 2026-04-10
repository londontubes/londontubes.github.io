import { shortestPathsFrom, type StationGraph } from '@/app/lib/map/stationGraph'

describe('stationGraph shortestPathsFrom', () => {
  it('preserves direct timetable runtime between stations', () => {
    const graph: StationGraph = {
      HUBZFD: [{ to: 'HUBLST', lineCode: 'elizabeth', distanceMeters: 0, runMinutes: 3.1 }],
      HUBLST: [{ to: 'HUBZFD', lineCode: 'elizabeth', distanceMeters: 0, runMinutes: 3.1 }],
    }

    const result = shortestPathsFrom('HUBZFD', graph, 10)
    expect(result).toContainEqual({
      stationId: 'HUBLST',
      minutes: 3.1,
      via: ['HUBZFD', 'HUBLST'],
      lines: ['elizabeth'],
    })
  })

  it('sums segment runtimes without adding generic transfer overhead', () => {
    const graph: StationGraph = {
      A: [
        { to: 'B', lineCode: 'circle', distanceMeters: 0, runMinutes: 2 },
      ],
      B: [
        { to: 'A', lineCode: 'circle', distanceMeters: 0, runMinutes: 2 },
        { to: 'C', lineCode: 'central', distanceMeters: 0, runMinutes: 4 },
      ],
      C: [
        { to: 'B', lineCode: 'central', distanceMeters: 0, runMinutes: 4 },
      ],
    }

    const result = shortestPathsFrom('A', graph, 10)
    expect(result).toContainEqual({
      stationId: 'C',
      minutes: 6,
      via: ['A', 'B', 'C'],
      lines: ['circle', 'central'],
    })
  })
})