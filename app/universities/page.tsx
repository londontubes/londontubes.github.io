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

export const metadata: Metadata = {
  title: 'London Universities Tube Map | Nearest Underground Stations to Universities 2025',
  description: 'Find the nearest tube stations to major London universities including UCL, Imperial College, LSE, King\'s College, and QMUL. Interactive map showing university locations with DLR and Underground connections within 0.5 miles.',
  keywords: 'london universities tube map, nearest tube station to university, ucl tube station, imperial college underground, lse metro station, kings college tube, student travel london, university transport',
  openGraph: {
    title: 'London Universities Tube Map | Find Nearest Underground Stations',
    description: 'Interactive map of London universities with nearest tube and DLR stations. UCL, Imperial, LSE, King\'s College, QMUL and more. Filter by distance.',
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
  let transitDataset
  let universitiesDataset

  try {
    transitDataset = loadStaticTransitData()
    universitiesDataset = await loadUniversitiesData()
  } catch (error) {
    console.error('Failed to load universities data:', error)
    return (
      <div className="error-container" style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Unable to Load Universities Data</h1>
        <p>
          There was an error loading the universities dataset. 
          Please check that the data files exist and are properly formatted.
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Expected file: <code>public/data/universities.json</code>
        </p>
      </div>
    )
  }

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
      <FAQ />
    </main>
  )
}
