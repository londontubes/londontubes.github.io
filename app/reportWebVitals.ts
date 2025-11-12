import type { ReportHandler } from 'web-vitals'
import { trackWebVital } from '@/app/lib/analytics'

export const reportWebVitals: ReportHandler = (metric) => {
  // Names: CLS, FCP, LCP, INP, TTFB (FID deprecated replaced by INP)
  // Round value for consistency
  try {
    trackWebVital(metric.name, metric.value, metric.id)
  } catch (e) {
    // Fail silently if analytics not ready
  }
}

export default reportWebVitals
