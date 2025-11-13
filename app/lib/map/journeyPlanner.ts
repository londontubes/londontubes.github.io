// Stub integration for TfL Journey Planner API.
// Provides optional real journey duration fallback for multi-leg routes.
// Requires env variables: NEXT_PUBLIC_TFL_APP_ID, NEXT_PUBLIC_TFL_APP_KEY (public for client fetch) OR server-side proxy.

export interface JourneyLegSummary {
  durationMinutes: number
  legs: Array<{ mode: string; duration: number; lineName?: string }>
}

export async function fetchJourneyDuration(
  from: string, // NaPTAN id or coordinates "lat,lon"
  to: string,
  options: { appId?: string; appKey?: string; modes?: string } = {}
): Promise<JourneyLegSummary | null> {
  try {
    const appId = options.appId || process.env.NEXT_PUBLIC_TFL_APP_ID
    const appKey = options.appKey || process.env.NEXT_PUBLIC_TFL_APP_KEY
    const params = new URLSearchParams()
    if (appId) params.append('app_id', appId)
    if (appKey) params.append('app_key', appKey)
    if (options.modes) params.append('mode', options.modes)
    const url = `https://api.tfl.gov.uk/Journey/JourneyResults/${encodeURIComponent(from)}/to/${encodeURIComponent(to)}?${params.toString()}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.journeys?.length) return null
    const j = data.journeys[0]
    const legs = (j.legs || []).map((l: any) => ({ mode: l.mode?.name || l.mode?.id || 'unknown', duration: l.duration, lineName: l.routeOptions?.[0]?.name }))
    return { durationMinutes: j.duration, legs }
  } catch (e) {
    console.warn('Journey Planner fetch failed', e)
    return null
  }
}
