'use client'

import dynamic from 'next/dynamic'
import type { MapCanvasProps } from './LeafletMapCanvas'

// Legacy Google Maps implementation file `MapCanvas.tsx` has been removed.
// This wrapper now exclusively serves the Leaflet implementation.

// Dynamically import the Leaflet map component with SSR disabled
const LeafletMapCanvas = dynamic(() => import('./LeafletMapCanvas'), {
  ssr: false,
  loading: () => (
    <section className="map-shell">
      <div style={{ 
        position: 'absolute',
        inset: 0,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5',
        color: '#333333',
        fontSize: '1.5rem',
        zIndex: 9999,
      }}>
        <p>Loading map component...</p>
      </div>
    </section>
  ),
})

export default function MapCanvasWrapper(props: MapCanvasProps) {
  return <LeafletMapCanvas {...props} />
}
