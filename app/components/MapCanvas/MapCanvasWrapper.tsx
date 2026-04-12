'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { MapCanvasProps } from './LeafletMapCanvas'

interface MapCanvasWrapperProps extends MapCanvasProps {
  deferUntilIdle?: boolean
}

// Legacy Google Maps implementation file `MapCanvas.tsx` has been removed.
// This wrapper now exclusively serves the Leaflet implementation.

// Dynamically import the Leaflet map component with SSR disabled
const LeafletMapCanvas = dynamic(() => import('./LeafletMapCanvas'), {
  ssr: false,
  loading: () => <MapLoadingShell label="Loading map" />,
})

function MapLoadingShell({ label }: { label: string }) {
  return (
    <section className="map-shell" aria-busy="true" aria-label={label}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(circle at top, rgba(99, 102, 241, 0.08), transparent 40%), var(--surface-1, #111113)',
          color: 'var(--text-3, #71717a)',
          fontSize: '0.9rem',
        }}
      >
        {label}&hellip;
      </div>
    </section>
  )
}

export default function MapCanvasWrapper({ deferUntilIdle = false, ...props }: MapCanvasWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoadMap, setShouldLoadMap] = useState(!deferUntilIdle)

  useEffect(() => {
    const node = containerRef.current

    if (!deferUntilIdle || !node || shouldLoadMap) {
      return
    }

    let observer: IntersectionObserver | null = null
    let timeoutId: number | null = null
    let idleId: number | null = null

    const loadMap = () => {
      setShouldLoadMap(true)
    }

    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(loadMap, { timeout: 1500 })
        return
      }

      timeoutId = window.setTimeout(loadMap, 250)
    }

    const handleIntent = () => {
      loadMap()
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) {
            return
          }

          observer?.disconnect()
          scheduleLoad()
        },
        { rootMargin: '160px 0px' },
      )
      observer.observe(node)
    } else {
      scheduleLoad()
    }

    node.addEventListener('pointerdown', handleIntent, { once: true, passive: true })
    node.addEventListener('touchstart', handleIntent, { once: true, passive: true })
    node.addEventListener('focusin', handleIntent, { once: true })

    return () => {
      observer?.disconnect()

      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }

      node.removeEventListener('pointerdown', handleIntent)
      node.removeEventListener('touchstart', handleIntent)
      node.removeEventListener('focusin', handleIntent)
    }
  }, [deferUntilIdle, shouldLoadMap])

  return (
    <div ref={containerRef} style={{ display: 'flex', flex: '1 1 0', minHeight: 0 }}>
      {shouldLoadMap ? <LeafletMapCanvas {...props} /> : <MapLoadingShell label="Preparing interactive map" />}
    </div>
  )
}
