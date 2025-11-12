import { trackWebVital } from '@/app/lib/analytics'

// Next.js calls this with a metric object containing: id, name, startTime, value, label
export function reportWebVitals(metric: { id: string; name: string; value: number }) {
  try {
    trackWebVital(metric.name, metric.value, metric.id)
  } catch {
    // Silently ignore if analytics not initialized
  }
}
