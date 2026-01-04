/**
 * Universities Filter Page
 * 
 * Displays London universities on an interactive map with proximity-based
 * transit line filtering.
 * 
 * Feature: 002-university-transit-filter
 */

import UniversityExperience from '@/app/components/UniversityExperience/UniversityExperience'
import { loadStaticTransitData } from '@/app/lib/data/load-static-data'
import { FAQ } from '@/app/components/FAQ'
import type { UniversitiesDataset } from '@/app/types/university'
import type { Metadata } from 'next'
import { UniversitySEOContent } from '@/app/components/SEOContent/UniversitySEOContent'

export const metadata: Metadata = {
  title: 'Where to Live as a London Student | University Tube Map & Areas to Live 2025',
  description:
    'Use our London university tube map to find the best areas to live as a student. See which neighbourhoods and tube stations are within a short walk or tube ride from UCL, Imperial, LSE, King\'s, QMUL and more.',
  keywords:
    'where to live in london as students, best areas to live near london universities, ucl student areas, imperial college student accommodation areas, lse where to live, kings college london student housing, london university commute, student neighbourhoods london, london universities tube map',
  openGraph: {
    title: 'Where to Live Near London Universities | Student Tube & Area Finder',
    description:
      'Interactive London universities map for students choosing where to live. Explore tube stations and neighbourhoods within walking or tube time of your campus.',
    type: 'website',
  },
}

// Load universities data at build time
async function loadUniversitiesData(): Promise<UniversitiesDataset> {
  const fs = await import('fs/promises')
  const path = await import('path')
  
  const filePath = path.join(process.cwd(), 'public/data/universities.json')
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const data = JSON.parse(fileContent) as UniversitiesDataset
  
  return data
}

export default async function UniversitiesPage() {
  const transitDataset = loadStaticTransitData()
  const universitiesDataset = await loadUniversitiesData()

  return (
    <main>
      {/* SSR skeleton to ensure content for crawlers / curl */}
      <noscript>
        <p>Interactive map requires JavaScript. Enable it to view the network.</p>
      </noscript>
      <UniversityExperience 
        transitDataset={transitDataset}
        universitiesDataset={universitiesDataset}
      />
      <UniversitySEOContent />
      <FAQ />
    </main>
  )
}
