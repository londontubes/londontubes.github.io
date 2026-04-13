export interface StationPropertySummary {
  stationId: string
  stationName: string
  averageRentPcm: number | null
  averageSalePrice: number | null
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