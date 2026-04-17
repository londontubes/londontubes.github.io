import type { Metadata } from 'next'
import BusExperienceLoader from '@/app/components/BusExperience/BusExperienceLoader'
import AdUnit from '@/app/components/ads/AdUnit'
import { FAQ } from '@/app/components/FAQ'

export const metadata: Metadata = {
  title: 'London Bus Map 2026 | Interactive Bus Route Filter',
  description:
    'Explore London bus routes on an interactive map, filter visible routes, and inspect stop context with a static bus dataset built from TfL data.',
  keywords:
    'london bus map, london bus routes map, london bus filter, tfl bus routes, interactive london bus map',
  alternates: {
    canonical: '/bus/',
  },
  openGraph: {
    title: 'London Bus Map 2026 | Interactive Bus Route Filter',
    description:
      'Interactive London bus map with route filtering and zoom-aware stop detail.',
    type: 'website',
    url: 'https://londontubes.co.uk/bus/',
  },
}

const busPageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'London Bus Map 2026',
  url: 'https://londontubes.co.uk/bus/',
  description: 'Interactive London bus map with route filtering and zoom-aware stop detail built from static TfL-derived data.',
}

export default function BusPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(busPageStructuredData) }}
      />
      <noscript>
        <p>Interactive map requires JavaScript. Enable it to view London bus routes.</p>
      </noscript>
      <BusExperienceLoader />
      <section style={{ padding: '0 0 0.5rem' }}>
        <AdUnit style={{ minHeight: '120px' }} />
      </section>
      <FAQ />
    </main>
  )
}