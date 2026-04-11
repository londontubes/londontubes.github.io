export interface RightmoveStationMapping {
  stationId: string
  searchLocation: string
  locationIdentifier?: string
  displayName?: string
  displayLocationIdentifier?: string
  matchStatus: 'matched' | 'unmatched' | 'ambiguous'
  lastVerifiedAt?: string
}

export interface RightmoveSearchConfig {
  propertyTypes: 'flat'
  minBedrooms: number
  maxBedrooms: number
  maxPrice: number
  radius: number
  includeLetAgreed: boolean
}

export interface StationPropertyCtaState {
  stationId: string
  zooplaUrl: string | null
  rightmoveUrl: string | null
  showZoopla: boolean
  showRightmove: boolean
}