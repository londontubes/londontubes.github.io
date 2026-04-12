/**
 * Universities Filter Page
 * 
 * Displays London universities on an interactive map with proximity-based
 * transit line filtering.
 * 
 * Feature: 002-university-transit-filter
 */

import { FAQ } from '@/app/components/FAQ'
import RevenueLaunchpad from '@/app/components/revenue/RevenueLaunchpad'
import type { Metadata } from 'next'
import { UniversitySEOContent } from '@/app/components/SEOContent/UniversitySEOContent'
import UniversityExperienceLoader from '@/app/components/UniversityExperience/UniversityExperienceLoader'

export const metadata: Metadata = {
  title: 'London Student Areas Map | University Commute Finder 2026',
  description:
    'Use the London student areas map to compare neighbourhoods and tube stations by walking and tube commute time to UCL, Imperial, LSE, King\'s, QMUL, SOAS, City and Westminster.',
  keywords:
    'london student areas map, london university commute map, where to live near ucl, where to live near imperial, lse student areas, kings college london commute, qmul student neighbourhoods, london universities tube map',
  alternates: {
    canonical: '/universities/',
  },
  openGraph: {
    title: 'London Student Areas Map | University Commute Finder',
    description:
      'Interactive London universities map for students comparing neighbourhoods by realistic walking and tube commute time to campus.',
    type: 'website',
    url: 'https://londontubes.co.uk/universities/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'London Student Areas Map | University Commute Finder',
    description:
      'Compare London student neighbourhoods by walking and tube commute time to major universities.',
    images: ['https://londontubes.co.uk/opengraph-image'],
  },
}

const supportedUniversities = [
  'UCL',
  'Imperial College London',
  'London School of Economics',
  'King\'s College London',
  'Queen Mary University of London',
  'City, University of London',
  'SOAS University of London',
  'University of Westminster',
]

const universitiesPageStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'London Student Areas Map',
  url: 'https://londontubes.co.uk/universities/',
  description:
    'Interactive London university commute map for comparing student neighbourhoods by walk and tube time.',
  about: supportedUniversities.map((name) => ({
    '@type': 'CollegeOrUniversity',
    name,
  })),
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: supportedUniversities.map((name, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
    })),
  },
}

export default function UniversitiesPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(universitiesPageStructuredData) }}
      />
      {/* SSR skeleton to ensure content for crawlers / curl */}
      <noscript>
        <p>Interactive map requires JavaScript. Enable it to view the network.</p>
      </noscript>
      <UniversityExperienceLoader />
      <RevenueLaunchpad
        title="Move from university commute research into real accommodation options"
        description="The pages below combine campus-specific commute advice with student-room and rental search shortcuts, so you can compare areas without starting your property search from zero."
        placementPrefix="universities-launchpad"
      />
      <UniversitySEOContent />
      <FAQ />
    </main>
  )
}
