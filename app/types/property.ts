export interface StationPropertySummary {
  stationId: string
  stationName: string
  medianRentPcm: number | null
  medianSalePrice: number | null
  rentListingCount: number
  saleListingCount: number
  source: 'rightmove'
}

export interface StationPropertyDataset {
  generatedAt: string
  radiusMiles: number
  source: {
    provider: 'Rightmove'
    listingSample: 'current-map-results'
  }
  stations: StationPropertySummary[]
}