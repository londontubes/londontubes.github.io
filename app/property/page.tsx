import type { Metadata } from 'next'
import PropertyExperienceLoader from '@/app/components/PropertyExperience/PropertyExperienceLoader'
import RevenueLaunchpad from '@/app/components/revenue/RevenueLaunchpad'
import { PropertySEOContent } from '@/app/components/SEOContent'

export const metadata: Metadata = {
  title: 'London Property Map by Tube Station | Rent and Sale Comparison',
  description:
    'Compare sampled rent and sale prices within 0.5 miles of London Tube, Elizabeth line, and DLR stations, then jump into station-based property searches.',
  keywords:
    'london property map, london rent by tube station, london house prices by station, elizabeth line property prices, london station rent comparison, london commuter property search',
  alternates: {
    canonical: '/property/',
  },
  openGraph: {
    title: 'London Property Map by Tube Station | Rent and Sale Comparison',
    description:
      'Use the London property filter to compare sampled rent and sale prices near Tube, Elizabeth line, and DLR stations.',
    type: 'website',
    url: 'https://londontubes.co.uk/property/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'London Property Map by Tube Station',
    description:
      'Compare London rent and sale samples near Tube, Elizabeth line, and DLR stations.',
    images: ['https://londontubes.co.uk/opengraph-image'],
  },
}

const propertyPageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'London Property Map by Tube Station',
  url: 'https://londontubes.co.uk/property/',
  description:
    'Collection page for comparing sampled rental and sale prices near London Tube, Elizabeth line, and DLR stations.',
  mainEntity: {
    '@type': 'Dataset',
    name: 'London station property price summaries',
    description:
      'Sampled rent and sale price summaries within roughly 0.5 miles of London transport stations, used for station-by-station housing comparison.',
    url: 'https://londontubes.co.uk/property/',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: 'London Tube Map',
      url: 'https://londontubes.co.uk/',
    },
    keywords: [
      'London property by station',
      'rent near tube stations',
      'sale prices near London stations',
      'commute-led housing search',
    ],
  },
}

export default function PropertyPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyPageStructuredData) }}
      />
      <noscript>
        <p>Interactive property comparison requires JavaScript. Enable it to explore station-level housing summaries.</p>
      </noscript>
      <PropertyExperienceLoader />
      <RevenueLaunchpad
        title="Compare commute and housing cost together"
        description="These pages combine tube journey times with student rental guides — useful when both commute distance and monthly cost need to fit the same decision."
        placementPrefix="property-launchpad"
      />
      <PropertySEOContent />
    </main>
  )
}