import { loadStaticBusData } from '@/app/lib/data/load-static-data'

describe('loadStaticBusData', () => {
  it('returns the generated bus dataset shape', () => {
    const dataset = loadStaticBusData()

    expect(dataset).toEqual(
      expect.objectContaining({
        routes: expect.any(Array),
        stops: expect.any(Array),
        generatedAt: expect.any(String),
        source: expect.objectContaining({
          provider: 'Transport for London',
          dataset: expect.any(String),
        }),
      })
    )
  })
})