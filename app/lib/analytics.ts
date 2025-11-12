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
