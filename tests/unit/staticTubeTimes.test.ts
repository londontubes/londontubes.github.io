import { getStaticTubeJourney } from '@/app/lib/map/staticTubeTimes'

describe('staticTubeTimes manual journey overrides', () => {
  it('returns the manual Google reference for Tottenham Court Road to Ealing Broadway', () => {
    expect(getStaticTubeJourney('HUBTCR', 'HUBEAL')).toEqual({
      fromStationId: 'HUBTCR',
      toStationId: 'HUBEAL',
      minutes: 17,
      source: 'manual-google-maps-reference',
    })
  })

  it('returns the manual Google reference for Tottenham Court Road to Acton Main Line', () => {
    expect(getStaticTubeJourney('HUBTCR', '910GACTONML')).toEqual({
      fromStationId: 'HUBTCR',
      toStationId: '910GACTONML',
      minutes: 13,
      source: 'manual-google-maps-reference',
    })
  })

  it('returns the manual Google reference for Ealing Broadway to Tottenham Court Road', () => {
    expect(getStaticTubeJourney('HUBEAL', 'HUBTCR')).toEqual({
      fromStationId: 'HUBEAL',
      toStationId: 'HUBTCR',
      minutes: 17,
      source: 'manual-google-maps-reference',
    })
  })

  it('returns the manual Google reference for Acton Main Line to Tottenham Court Road', () => {
    expect(getStaticTubeJourney('910GACTONML', 'HUBTCR')).toEqual({
      fromStationId: '910GACTONML',
      toStationId: 'HUBTCR',
      minutes: 13,
      source: 'manual-google-maps-reference',
    })
  })
})
