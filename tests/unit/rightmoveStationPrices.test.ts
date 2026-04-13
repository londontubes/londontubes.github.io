import {
  buildStationPropertySummary,
  calculateMedianPrice,
  extractRightmoveListingSamples,
  formatCompactPounds,
  formatRentPcmLabel,
} from '@/app/lib/property/rightmoveStationPrices'

describe('rightmoveStationPrices helpers', () => {
  it('extracts deduplicated monthly rental samples from Rightmove geoJsonProperties', () => {
    const html = `
      <script>
        window.__DATA__ = {"geoJsonProperties":{"type":"FeatureCollection","features":[
          {"properties":{"id":101,"price":{"amount":980,"frequency":"weekly","displayPrices":[{"displayPrice":"£4,247 pcm"},{"displayPrice":"£980 pw"}]}}},
          {"properties":{"id":101,"price":{"amount":980,"frequency":"weekly","displayPrices":[{"displayPrice":"£4,247 pcm"}]}}},
          {"properties":{"id":102,"price":{"amount":2100,"frequency":"monthly","displayPrices":[{"displayPrice":"£2,100 pcm"}]}}}
        ]}}
      </script>
    `

    expect(extractRightmoveListingSamples(html, 'rent')).toEqual([
      { listingId: '101', normalizedPrice: 4247 },
      { listingId: '102', normalizedPrice: 2100 },
    ])
  })

  it('extracts sale samples and builds a station summary', () => {
    const html = `
      <script>
        window.__DATA__ = {"geoJsonProperties":{"type":"FeatureCollection","features":[
          {"properties":{"id":501,"price":{"amount":650000}}},
          {"properties":{"id":502,"price":{"displayPrices":[{"displayPrice":"£725,000"}]}}}
        ]}}
      </script>
    `

    const saleSamples = extractRightmoveListingSamples(html, 'buy')
    const summary = buildStationPropertySummary('ABC', 'Example Station', [], saleSamples)

    expect(summary.medianRentPcm).toBeNull()
    expect(summary.medianSalePrice).toBe(687500)
    expect(summary.saleListingCount).toBe(2)
  })

  it('calculates the median sale sample price', () => {
    expect(calculateMedianPrice([
      { listingId: 'a', normalizedPrice: 550000 },
      { listingId: 'b', normalizedPrice: 675000 },
      { listingId: 'c', normalizedPrice: 825000 },
    ])).toBe(675000)

    expect(calculateMedianPrice([
      { listingId: 'a', normalizedPrice: 500000 },
      { listingId: 'b', normalizedPrice: 600000 },
      { listingId: 'c', normalizedPrice: 700000 },
      { listingId: 'd', normalizedPrice: 900000 },
    ])).toBe(650000)
  })

  it('calculates the median rental sample price', () => {
    expect(calculateMedianPrice([
      { listingId: 'a', normalizedPrice: 1200 },
      { listingId: 'b', normalizedPrice: 1500 },
      { listingId: 'c', normalizedPrice: 2400 },
    ])).toBe(1500)

    expect(calculateMedianPrice([
      { listingId: 'a', normalizedPrice: 1200 },
      { listingId: 'b', normalizedPrice: 1500 },
      { listingId: 'c', normalizedPrice: 2100 },
      { listingId: 'd', normalizedPrice: 2400 },
    ])).toBe(1800)
  })

  it('formats compact sale and rent labels for the UI', () => {
    expect(formatCompactPounds(725000)).toContain('£')
    expect(formatRentPcmLabel(2450)).toBe('£2,450 pcm')
    expect(formatRentPcmLabel(null)).toBe('Unavailable')
  })
})