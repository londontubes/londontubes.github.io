export interface TransitLine {
  lineCode: string
  displayName: string
  brandColor: string
  textColor: string
  mode: 'tube' | 'dlr'
  strokeWeight: number
  polyline: {
    type: 'LineString' | 'MultiLineString'
    coordinates: [number, number][] | [number, number][][]
  }
  bounds?: [number, number][]
  stationIds: string[]
  interchanges?: Array<{
    stationId: string
    connectingLines: string[]
  }>
  lastUpdated: string
}

export interface Station {
  stationId: string
  displayName: string
  position: {
    type: 'Point'
    coordinates: [number, number]
  }
  lineCodes: string[]
  isInterchange: boolean
  markerIcon: 'default' | 'accessible' | 'terminus'
  tooltipSummary: string
  order: number
  accessibilityNotes?: string
}

export interface TransitMetadata {
  generatedAt: string
  source: {
    provider: string
    apiEndpoints: string[]
  }
  datasetVersion: string
  lineCount: number
  stationCount: number
  lastRefresh: string
}

export interface TransitDataset {
  lines: TransitLine[]
  stations: Station[]
  metadata: TransitMetadata
}

export interface LineSelectionState {
  activeLineCodes: string[]
  isAllSelected: boolean
}
