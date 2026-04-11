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

  it('returns the manual Google reference for Ealing Broadway to Tottenham Court Road', () => {
    expect(getStaticTubeJourney('HUBEAL', 'HUBTCR')).toEqual({
      fromStationId: 'HUBEAL',
      toStationId: 'HUBTCR',
      minutes: 17,
      source: 'manual-google-maps-reference',
    })
  })
})
