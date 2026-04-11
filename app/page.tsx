import MapExperience from '@/app/components/MapExperience/MapExperience'
import { loadStaticTransitData } from '@/app/lib/data/load-static-data'
import { SEOContent } from '@/app/components/SEOContent'
import { FAQ } from '@/app/components/FAQ'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'London Tube Map 2026 | Interactive Underground, Elizabeth Line & DLR',
  description:
    'Explore an interactive London Tube map with Underground, Elizabeth line and DLR routes, station travel times, and university commute tools across 330+ stations.',
  keywords:
    'london tube map, london underground map, interactive tube map london, elizabeth line map, dlr map london, london station travel times, london transport map',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'London Tube Map 2026 | Interactive Underground, Elizabeth Line & DLR',
    description:
      'Interactive London Tube map with all Underground lines, Elizabeth line, DLR, station travel times and London university commute tools.',
    type: 'website',
    url: 'https://londontubes.co.uk/',
  },
}

const homePageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'London Tube Map 2026',
  url: 'https://londontubes.co.uk/',
  description:
    'Interactive London Tube map with Underground, Elizabeth line, DLR, station travel times and London university commute planning.',
  primaryImageOfPage: 'https://londontubes.co.uk/opengraph-image',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://londontubes.co.uk/',
      },
    ],
  },
  mainEntity: {
    '@type': 'Dataset',
    name: 'London Tube Map station and line dataset',
    description:
      'A public interactive map dataset covering London Underground, Elizabeth line and DLR stations used to power route and commute discovery on London Tube Map.',
    creator: {
      '@type': 'Organization',
      name: 'London Tube Map',
    },
  },
}

// Dynamic import of MapExperience with SSR disabled can cause blank HTML if nothing is rendered.
// Instead we keep MapExperience SSR-capable and provide a static skeleton to ensure non-empty HTML.

export default function HomePage() {
  const dataset = loadStaticTransitData()

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageStructuredData) }}
      />
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
