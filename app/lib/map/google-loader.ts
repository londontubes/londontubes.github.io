import { Loader } from '@googlemaps/js-api-loader'
import type { Library } from '@googlemaps/js-api-loader'

let loader: Loader | null = null
let mapsPromise: Promise<typeof google> | null = null

export interface GoogleMapsOptions {
  libraries?: Library[]
}

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY
  if (!key) {
    throw new Error('Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in the environment.')
  }
  return key
}

export function initGoogleMapsLoader(options: GoogleMapsOptions = {}): void {
  if (loader) {
    return
  }

  loader = new Loader({
    apiKey: getApiKey(),
    version: 'weekly',
    libraries: options.libraries ?? ['geometry'], // Default to 'geometry' if no libraries are provided
    id: 'google-maps-script',
  })
}

export async function loadGoogleMaps(options: GoogleMapsOptions = {}): Promise<typeof google> {
  if (typeof window === 'undefined') {
    throw new Error('Google Maps can only be loaded in a browser environment.')
  }

  if (!loader) {
    initGoogleMapsLoader(options)
  }

  if (!mapsPromise) {
    mapsPromise = loader!.load()
  }

  return mapsPromise
}

export function resetGoogleMapsLoader(): void {
  loader = null
  mapsPromise = null
}
