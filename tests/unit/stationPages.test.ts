import stationsData from '@/public/data/stations.json'
import linesData from '@/public/data/lines.json'
import {
  cleanStationName,
  formatZone,
  getAllStationSlugs,
  getLinePageData,
  getStationPageData,
  getStationSlug,
  slugify,
} from '@/app/lib/seo/stationPages'

describe('station pages', () => {
  const stations = stationsData.stations

  it('gives every station exactly one unique, URL-safe slug', () => {
    const slugs = getAllStationSlugs()
    expect(slugs).toHaveLength(stations.length)
    expect(new Set(slugs).size).toBe(slugs.length)
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/))
  })

  it('keeps plain slugs for interchange hubs and Underground stations', () => {
    expect(getStationSlug('HUBBAN')).toBe('bank')
    expect(getStationSlug('HUBKGX')).toBe('kings-cross-st-pancras')
    expect(getStationSlug('940GZZLUBLG')).toBe('bethnal-green')
    expect(getStationSlug('910GBTHNLGR')).toBe('bethnal-green-overground')
  })

  it('builds page data for every station', () => {
    getAllStationSlugs().forEach((slug) => {
      const data = getStationPageData(slug)
      expect(data).not.toBeNull()
      expect(data!.lines.length).toBeGreaterThan(0)
    })
  })

  it('includes zone, journey times and nearby stations for a central station', () => {
    const bank = getStationPageData('bank')!
    expect(bank.zone).toBe('1')
    expect(bank.lines.map((l) => l.lineCode).sort()).toEqual(['central', 'dlr', 'northern', 'waterloo-city'])
    expect(bank.journeys.find((j) => j.hub.stationId === 'HUBWAT')?.minutes).toBeGreaterThan(0)
    expect(bank.nearby[0].distanceMiles).toBeLessThan(0.5)
  })

  it('does not show price figures sampled before the Rightmove id fixes', () => {
    expect(getStationPageData('bank')!.price).toBeNull()
    expect(getStationPageData('waterloo')!.price).toBeNull()
  })

  it('cleans TfL station names for headings', () => {
    expect(cleanStationName('Baker Street Underground Station')).toBe('Baker Street')
    expect(cleanStationName('Sandilands Tram Stop')).toBe('Sandilands')
    expect(cleanStationName('Dalston Junction Rail Station')).toBe('Dalston Junction')
    expect(slugify("St. John's Wood")).toBe('st-johns-wood')
  })

  it('formats boundary zones', () => {
    expect(formatZone('1')).toBe('Zone 1')
    expect(formatZone('2/3')).toBe('Zones 2 and 3')
  })
})

describe('line pages', () => {
  it('lists every station of every line', () => {
    linesData.lines.forEach((line) => {
      const data = getLinePageData(line.lineCode)
      expect(data).not.toBeNull()
      const ids = new Set(data!.stations.map((s) => s.station.stationId))
      expect(ids.size).toBe(new Set(line.stationIds).size)
    })
  })

  it('orders stations along the route', () => {
    const victoria = getLinePageData('victoria')!
    const names = victoria.stations.map((s) => s.name)
    expect([names[0], names[names.length - 1]].sort()).toEqual(['Brixton', 'Walthamstow Central'])
  })

  it('shows each tram loop route once', () => {
    const tram = getLinePageData('tram')!
    expect(tram.routes.map((r) => r.name)).toHaveLength(3)
  })
})
