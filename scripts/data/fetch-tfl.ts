import fs from 'fs/promises'
import path from 'path'

const TFL_API_BASE = 'https://api.tfl.gov.uk'
const CACHE_DIR = path.join(process.cwd(), 'scripts', 'cache')

interface TfLLine {
  id: string
  name: string
  modeName: string
}

type TfLRouteSequence = unknown

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true })
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('All retries failed')
}

async function fetchTfLLines(): Promise<TfLLine[]> {
  console.log('Fetching TfL line data...')
  const modesUrl = `${TFL_API_BASE}/Line/Mode/tube,dlr`
  
  const response = await fetchWithRetry(modesUrl)
  const lines = await response.json() as TfLLine[]
  
  console.log(`Found ${lines.length} lines`)
  return lines
}

async function fetchLineRouteSequence(lineId: string): Promise<TfLRouteSequence> {
  console.log(`Fetching route sequence for ${lineId}...`)
  const url = `${TFL_API_BASE}/Line/${lineId}/Route/Sequence/all`
  
  const response = await fetchWithRetry(url)
  const data: TfLRouteSequence = await response.json()
  
  return data
}

async function main() {
  try {
    await ensureCacheDir()
    
    // Fetch all tube and DLR lines
    const lines = await fetchTfLLines()
    
    // Cache raw line data
    await fs.writeFile(
      path.join(CACHE_DIR, 'lines.raw.json'),
      JSON.stringify(lines, null, 2)
    )
    
    // Fetch route sequences for each line
  const routeData: Record<string, TfLRouteSequence> = {}
    
    for (const line of lines) {
      try {
        const sequence = await fetchLineRouteSequence(line.id)
        routeData[line.id] = sequence
        
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Failed to fetch route for ${line.id}:`, error)
      }
    }
    
    // Cache route data
    await fs.writeFile(
      path.join(CACHE_DIR, 'routes.raw.json'),
      JSON.stringify(routeData, null, 2)
    )
    
    console.log('✅ TfL data cached successfully')
    console.log(`   Lines: ${lines.length}`)
    console.log(`   Routes: ${Object.keys(routeData).length}`)
    
  } catch (error) {
    console.error('❌ Failed to fetch TfL data:', error)
    process.exit(1)
  }
}

main()
