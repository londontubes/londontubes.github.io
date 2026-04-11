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
        const retryAfterHeader = response.headers.get('retry-after')
        const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : Number.NaN
        const retryAfterMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : undefined

        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as Error & {
          retryAfterMs?: number
        }

        if (response.status === 429) {
          error.retryAfterMs = retryAfterMs ?? 5000 * (i + 1)
        }

        throw error
      }
      return response
    } catch (error) {
      if (i === retries - 1) throw error

      const retryAfterMs = typeof error === 'object' && error !== null && 'retryAfterMs' in error
        ? Number((error as { retryAfterMs?: number }).retryAfterMs ?? 0)
        : 0

      const waitMs = retryAfterMs > 0 ? retryAfterMs : 1000 * (i + 1)
      await new Promise(resolve => setTimeout(resolve, waitMs))
    }
  }
  throw new Error('All retries failed')
}

async function fetchTfLLines(modes: string[]): Promise<TfLLine[]> {
  console.log(`Fetching TfL line data for modes: ${modes.join(', ')}...`)
  const modesUrl = `${TFL_API_BASE}/Line/Mode/${modes.join(',')}`
  
  const response = await fetchWithRetry(modesUrl)
  const lines = await response.json() as TfLLine[]
  
  console.log(`Found ${lines.length} lines`)
  return lines
}

async function fetchLineRouteSequence(lineId: string, retries = 5): Promise<TfLRouteSequence> {
  console.log(`Fetching route sequence for ${lineId}...`)
  const url = `${TFL_API_BASE}/Line/${lineId}/Route/Sequence/all`
  
  const response = await fetchWithRetry(url, retries)
  const data: TfLRouteSequence = await response.json()
  
  return data
}

async function main() {
  try {
    await ensureCacheDir()

    const railModes = ['tube', 'dlr', 'elizabeth-line']
    const busModes = ['bus']

    const lines = await fetchTfLLines(railModes)
    const busLines = await fetchTfLLines(busModes)
    
    // Cache raw line data
    await fs.writeFile(
      path.join(CACHE_DIR, 'lines.raw.json'),
      JSON.stringify(lines, null, 2)
    )

    await fs.writeFile(
      path.join(CACHE_DIR, 'bus-lines.raw.json'),
      JSON.stringify(busLines, null, 2)
    )
    
    // Fetch route sequences for each line
    const routeData: Record<string, TfLRouteSequence> = {}
    const busRouteData: Record<string, TfLRouteSequence> = {}
    
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

    for (const line of busLines) {
      try {
        const sequence = await fetchLineRouteSequence(line.id)
        busRouteData[line.id] = sequence

        await new Promise(resolve => setTimeout(resolve, 400))
      } catch (error) {
        console.error(`Failed to fetch bus route for ${line.id}:`, error)
      }
    }
    
    // Cache route data
    await fs.writeFile(
      path.join(CACHE_DIR, 'routes.raw.json'),
      JSON.stringify(routeData, null, 2)
    )

    await fs.writeFile(
      path.join(CACHE_DIR, 'bus-routes.raw.json'),
      JSON.stringify(busRouteData, null, 2)
    )
    
    console.log('✅ TfL data cached successfully')
    console.log(`   Lines: ${lines.length}`)
    console.log(`   Routes: ${Object.keys(routeData).length}`)
    console.log(`   Bus routes: ${busLines.length}`)
    console.log(`   Bus route sequences: ${Object.keys(busRouteData).length}`)
    
  } catch (error) {
    console.error('❌ Failed to fetch TfL data:', error)
    process.exit(1)
  }
}

main()
