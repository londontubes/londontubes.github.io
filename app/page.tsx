import MapExperience from '@/app/components/MapExperience/MapExperience'
import { loadStaticTransitData } from '@/app/lib/data/load-static-data'
import { SEOContent } from '@/app/components/SEOContent'
import { FAQ } from '@/app/components/FAQ'
import dynamic from 'next/dynamic'

// Dynamic import of MapExperience with SSR disabled can cause blank HTML if nothing is rendered.
// Instead we keep MapExperience SSR-capable and provide a static skeleton to ensure non-empty HTML.

export default function HomePage() {
  const dataset = loadStaticTransitData()

  return (
    <main>
      {/* SSR skeleton to ensure content for crawlers / curl */}
      <noscript>
        <p>Interactive map requires JavaScript. Enable it to view the network.</p>
      </noscript>
      <MapExperience dataset={dataset} />
      <SEOContent />
      <FAQ />
    </main>
  )
}
