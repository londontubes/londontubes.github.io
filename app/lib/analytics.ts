const GA_ID = process.env.NEXT_PUBLIC_GA_ID

function enabled() {
  return typeof window !== 'undefined' && !!GA_ID && typeof (window as any).gtag === 'function'
}

export function trackPageView(url: string) {
  if (!enabled()) return
  ;(window as any).gtag('config', GA_ID, {
    page_path: url,
  })
}

interface AnalyticsEvent {
  action: string
  category?: string
  label?: string
  value?: number
}

export function trackEvent({ action, category, label, value }: AnalyticsEvent) {
  if (!enabled()) return
  ;(window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
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
  ;(window as any).gtag('consent', 'update', options)
}
