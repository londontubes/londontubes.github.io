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
import type { UniversitiesDataset } from '@/app/types/university'

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
    </main>
  )
}
