export interface RevenueLandingPage {
  slug: string
  pageType: 'home' | 'blog' | 'university' | 'landing'
  intentSegment: 'housing' | 'student-accommodation' | 'commute' | 'travel-upgrade'
  title: string
  metaDescription: string
  canonicalPath: string
  primaryKeywords: string[]
  relatedUniversityIds?: string[]
  relatedStationIds?: string[]
  monetizationSurfaceIds: string[]
  publishState: 'draft' | 'published' | 'noindex'
}

export interface MonetizationSurface {
  surfaceId: string
  surfaceType: 'ad' | 'affiliate-cta'
  partner: 'adsense' | 'zoopla' | 'rightmove' | 'amber' | 'gyg'
  placement: string
  pageTypes: Array<'home' | 'blog' | 'university' | 'landing'>
  intentSegments: Array<'housing' | 'student-accommodation' | 'commute' | 'travel-upgrade'>
  visibilityRule: string
  trackingLabel: string
  utmCampaign?: string
  adSlot?: string
}

export interface RevenueMeasurementEvent {
  eventName: string
  pagePath: string
  intentSegment: 'housing' | 'student-accommodation' | 'commute' | 'travel-upgrade'
  surfaceId: string
  partner: 'adsense' | 'zoopla' | 'rightmove' | 'amber' | 'gyg'
  placement: string
  ctaType: 'impression' | 'click' | 'lead'
  estimatedValue?: number
  consentState: 'granted' | 'denied' | 'unknown'
}