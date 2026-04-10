import MapExperience from '@/app/components/MapExperience/MapExperience'
import { loadStaticTransitData } from '@/app/lib/data/load-static-data'
import { SEOContent } from '@/app/components/SEOContent'
import { FAQ } from '@/app/components/FAQ'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://londontubes.co.uk/',
  },
}

export default function HomePage() {
  const dataset = loadStaticTransitData()

  return (
    <main>
      {/* H1 is the primary on-page SEO signal — visible to crawlers and screen readers */}
      <h1 className="sr-only">
        London Tube Map 2026 – Free Interactive Underground, Elizabeth Line &amp; DLR Map
      </h1>
      <noscript>
        <p>Interactive London Tube map requires JavaScript. Enable it to explore 270+ Underground and DLR stations.</p>
      </noscript>
      <MapExperience dataset={dataset} />
      <SEOContent />
      <FAQ />
    </main>
  )
}
