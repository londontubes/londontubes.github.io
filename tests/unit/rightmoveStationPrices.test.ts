import {
  buildStationPropertySummary,
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

    expect(summary.averageRentPcm).toBeNull()
    expect(summary.averageSalePrice).toBe(687500)
    expect(summary.saleListingCount).toBe(2)
  })

  it('formats compact sale and rent labels for the UI', () => {
    expect(formatCompactPounds(725000)).toContain('£')
    expect(formatRentPcmLabel(2450)).toBe('£2,450 pcm')
    expect(formatRentPcmLabel(null)).toBe('Unavailable')
  })
})