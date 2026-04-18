const GA_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ??
  process.env.NEXT_PUBLIC_GA_ID ??
  'G-9Q194F9FKG'

export const REVENUE_EVENT_NAMES = {
  surfaceView: 'revenue_surface_view',
  click: 'revenue_click',
} as const

export const REVENUE_EVENT_PARAMETERS = {
  partner: 'partner',
  placement: 'placement',
  intentSegment: 'intent_segment',
  pagePath: 'page_path',
  destinationUrl: 'destination_url',
} as const

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function enabled(): boolean {
  return typeof window !== 'undefined' && !!GA_ID && typeof window.gtag === 'function'
}

export function trackPageView(url: string) {
  if (!enabled()) return
  window.gtag?.('config', GA_ID as string, { page_path: url })
}

interface AnalyticsEvent {
  action: string
  category?: string
  label?: string
  value?: number
  metadata?: Record<string, string | number | boolean | undefined>
}

export function trackEvent({ action, category, label, value, metadata }: AnalyticsEvent) {
  if (!enabled()) return
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...Object.fromEntries(
      Object.entries(metadata ?? {}).filter(([, metadataValue]) => metadataValue !== undefined)
    ),
  })
}

interface RevenueTrackingOptions {
  partner: string
  placement: string
  intentSegment: string
  label?: string
  href?: string
  pagePath?: string
}

function getCurrentPagePath(pagePath?: string) {
  if (pagePath) return pagePath
  if (typeof window === 'undefined') return undefined
  return window.location.pathname
}

export function trackRevenueSurfaceView({
  partner,
  placement,
  intentSegment,
  label,
  href,
  pagePath,
}: RevenueTrackingOptions) {
  trackEvent({
    action: REVENUE_EVENT_NAMES.surfaceView,
    category: 'Revenue',
    label: label ?? `${partner}:${placement}`,
    metadata: {
      partner,
      placement,
      intent_segment: intentSegment,
      page_path: getCurrentPagePath(pagePath),
      destination_url: href,
    },
  })
}

export function trackRevenueClick({
  partner,
  placement,
  intentSegment,
  label,
  href,
  pagePath,
}: RevenueTrackingOptions) {
  trackEvent({
    action: REVENUE_EVENT_NAMES.click,
    category: 'Revenue',
    label: label ?? `${partner}:${placement}`,
    value: 1,
    metadata: {
      partner,
      placement,
      intent_segment: intentSegment,
      page_path: getCurrentPagePath(pagePath),
      destination_url: href,
    },
  })
}

// Domain specific helpers
export function trackLineFilterChange(activeLineCodes: string[]) {
  trackEvent({
    action: 'line_filter_change',
    category: 'line_filter',
    label: activeLineCodes.length === 0 ? 'all' : activeLineCodes.join(','),
    value: activeLineCodes.length,
  })
}

export function trackUniversitySelect(universityId: string) {
  trackEvent({
    action: 'university_select',
    category: 'university',
    label: universityId,
  })
}

export function trackUniversityDeselect(universityId: string) {
  trackEvent({
    action: 'university_deselect',
    category: 'university',
    label: universityId,
  })
}

export function trackCampusApply(universityId: string, campusId: string) {
  trackEvent({
    action: 'campus_apply',
    category: 'university_campus',
    label: `${universityId}:${campusId}`,
  })
}

export function trackStationSelect(stationId: string) {
  trackEvent({
    action: 'station_select',
    category: 'station',
    label: stationId,
  })
}

// Radius slider change (fires on commit, not every tiny movement ideally)
export function trackRadiusChange(miles: number, universityId?: string) {
  trackEvent({
    action: 'radius_change',
    category: 'filter_radius',
    label: universityId ? `${universityId}:${miles.toFixed(2)}` : miles.toFixed(2),
    value: Math.round(miles * 100), // scaled to avoid float issues
  })
}

// Travel time slider change
export function trackTimeFilterChange(minutes: number, universityId?: string) {
  trackEvent({
    action: 'time_filter_change',
    category: 'filter_time',
    label: universityId ? `${universityId}:${minutes}` : String(minutes),
    value: minutes,
  })
}

// Filter mode toggle
export function trackFilterModeChange(mode: 'radius' | 'time') {
  trackEvent({
    action: 'filter_mode_change',
    category: 'filter_mode',
    label: mode,
  })
}

// Map zoom level
export function trackMapZoom(zoom: number) {
  trackEvent({
    action: 'map_zoom',
    category: 'map',
    label: String(zoom),
    value: zoom,
  })
}

// Scroll depth tracking (0-100 thresholds fired once)
export function trackScrollDepth(percent: number) {
  trackEvent({
    action: 'scroll_depth',
    category: 'engagement',
    label: String(percent),
    value: percent,
  })
}

// Consent mode stub (optional use)
export function setAnalyticsConsent(options: { analytics_storage?: 'granted' | 'denied'; ad_storage?: 'granted' | 'denied' }) {
  if (!enabled()) return
  window.gtag?.('consent', 'update', options)
}

// Outbound link click helper (semantic wrapper)
export function trackOutboundClick(url: string) {
  trackEvent({
    action: 'outbound_click',
    category: 'outbound',
    label: url,
  })
}

// Web Vitals helper
export function trackWebVital(metricName: string, value: number, id: string) {
  trackEvent({
    action: metricName.toLowerCase(),
    category: 'web_vitals',
    label: id,
    value: Math.round(value),
  })
}

// Marketing / conversion events
export function trackAffiliateCtaClick(label: string, value = 1) {
  trackEvent({
    action: 'cta_click',
    category: 'Affiliate',
    label,
    value,
  })
}

export function trackHeathrowExpressCtaClick() {
  trackAffiliateCtaClick('Heathrow Express', 1)
  trackRevenueClick({
    partner: 'heathrow-express',
    placement: 'legacy-cta',
    intentSegment: 'airport-transfer',
    label: 'Heathrow Express',
  })
}

// Generic tracker for any GetYourGuide experience beyond Heathrow Express.
// Use this for new GYG CTAs so we can slice reports by specific experience
// while keeping a consistent `partner: 'getyourguide'` attribution.
export function trackGygClick(
  experienceKey: string,
  options: Partial<Omit<RevenueTrackingOptions, 'partner'>> = {}
) {
  trackAffiliateCtaClick(`GYG: ${experienceKey}`, 1)
  trackRevenueClick({
    partner: 'getyourguide',
    placement: options.placement ?? `gyg-${experienceKey}`,
    intentSegment: options.intentSegment ?? 'tourist-experiences',
    label: experienceKey,
    href: options.href,
    pagePath: options.pagePath,
  })
}

export function trackZooplaClick(
  stationName: string,
  options: Partial<Omit<RevenueTrackingOptions, 'partner'>> = {}
) {
  trackAffiliateCtaClick(`Zoopla: ${stationName}`, 1)
  trackRevenueClick({
    partner: 'zoopla',
    placement: options.placement ?? 'station-popup',
    intentSegment: options.intentSegment ?? 'commuter-rentals',
    label: stationName,
    href: options.href,
    pagePath: options.pagePath,
  })
}

export function trackRightmoveClick(
  stationName: string,
  options: Partial<Omit<RevenueTrackingOptions, 'partner'>> = {}
) {
  trackAffiliateCtaClick(`Rightmove: ${stationName}`, 1)
  trackRevenueClick({
    partner: 'rightmove',
    placement: options.placement ?? 'station-popup',
    intentSegment: options.intentSegment ?? 'commuter-rentals',
    label: stationName,
    href: options.href,
    pagePath: options.pagePath,
  })
}

export function trackAmberClick(
  context: string,
  options: Partial<Omit<RevenueTrackingOptions, 'partner'>> = {}
) {
  trackAffiliateCtaClick(`Amber: ${context}`, 1)
  trackRevenueClick({
    partner: 'amber',
    placement: options.placement ?? 'legacy-cta',
    intentSegment: options.intentSegment ?? 'student-housing',
    label: context,
    href: options.href,
    pagePath: options.pagePath,
  })
}

export function trackAmazonClick(
  context: string,
  options: Partial<Omit<RevenueTrackingOptions, 'partner'>> = {}
) {
  trackAffiliateCtaClick(`Amazon: ${context}`, 1)
  trackRevenueClick({
    partner: 'amazon',
    placement: options.placement ?? 'legacy-cta',
    intentSegment: options.intentSegment ?? 'travel-essentials',
    label: context,
    href: options.href,
    pagePath: options.pagePath,
  })
}

export function trackNewsletterSignup() {
  trackEvent({
    action: 'newsletter_signup',
    category: 'Lead',
    value: 1,
  })
}

export function trackProductSale(price: number) {
  trackEvent({
    action: 'product_sale',
    category: 'Digital Product',
    value: price,
  })
}
