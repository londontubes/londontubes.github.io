'use client'

import dynamic from 'next/dynamic'
import type { MapCanvasProps } from './LeafletMapCanvas'

// Legacy Google Maps implementation file `MapCanvas.tsx` has been removed.
// This wrapper now exclusively serves the Leaflet implementation.

// Dynamically import the Leaflet map component with SSR disabled
const LeafletMapCanvas = dynamic(() => import('./LeafletMapCanvas'), {
  ssr: false,
  loading: () => (
    <section className="map-shell" aria-busy="true" aria-label="Loading map">
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-1, #111113)',
        color: 'var(--text-3, #71717a)',
        fontSize: '0.9rem',
      }}>
        Loading map&hellip;
      </div>
    </section>
  ),
})

export default function MapCanvasWrapper(props: MapCanvasProps) {
  return <LeafletMapCanvas {...props} />
}
