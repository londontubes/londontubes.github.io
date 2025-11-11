'use client'

import { useEffect, useRef, useState } from 'react'
import type { Station } from '@/app/types/transit'

interface StationTooltipProps {
  station: Station | null
  lineLabels: Record<string, string>
  onClose: () => void
  mapInstance?: google.maps.Map | null
}

export default function StationTooltip({ station, lineLabels, onClose, mapInstance }: StationTooltipProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (station) {
      console.log('StationTooltip: Station selected:', station.displayName)
      closeButtonRef.current?.focus()
    }
  }, [station])

  useEffect(() => {
    if (!station || !mapInstance) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      const projection = mapInstance.getProjection()
      if (!projection) return

      const stationLatLng = new google.maps.LatLng(
        station.position.coordinates[1],
        station.position.coordinates[0]
      )

      const bounds = mapInstance.getBounds()
      if (!bounds) return

      const point = projection.fromLatLngToPoint(stationLatLng)
      if (!point) return

      const scale = Math.pow(2, mapInstance.getZoom() || 10)
      const worldCoordinate = new google.maps.Point(
        point.x * scale,
        point.y * scale
      )

      const mapDiv = mapInstance.getDiv()
      const mapBounds = mapDiv.getBoundingClientRect()
      const mapTopLeft = projection.fromLatLngToPoint(bounds.getNorthEast())

      if (!mapTopLeft) return

      const topLeftWorldCoordinate = new google.maps.Point(
        mapTopLeft.x * scale,
        mapTopLeft.y * scale
      )

      const pixelX = worldCoordinate.x - topLeftWorldCoordinate.x
      const pixelY = worldCoordinate.y - topLeftWorldCoordinate.y

      // Offset tooltip to the right and slightly up from station marker
      const offsetX = 20
      const offsetY = -10

      setPosition({
        x: pixelX + offsetX,
        y: pixelY + offsetY,
      })
      console.log('StationTooltip: Position calculated:', { x: pixelX + offsetX, y: pixelY + offsetY })
    }

    updatePosition()

    const boundsListener = mapInstance.addListener('bounds_changed', updatePosition)
    const zoomListener = mapInstance.addListener('zoom_changed', updatePosition)

    return () => {
      boundsListener.remove()
      zoomListener.remove()
    }
  }, [station, mapInstance])

  if (!station) {
    return null
  }

  console.log('StationTooltip: Rendering for station:', station.displayName, 'Position:', position, 'Has map:', !!mapInstance)

  const lineNames = station.lineCodes.map(code => lineLabels[code] ?? code).join(', ')

  // If no map instance or position, render in default position (fallback)
  const style = position && mapInstance ? {
    position: 'absolute' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'none',
    zIndex: 3000,
  } : {
    // Fallback: show at bottom center if position not calculated
    position: 'absolute' as const,
    left: '50%',
    bottom: '1.5rem',
    transform: 'translateX(-50%)',
    zIndex: 3000,
  }

  console.log('StationTooltip: Applying style:', style)

  return (
    <aside 
      className="station-tooltip" 
      role="dialog" 
      aria-label={`${station.displayName} details`}
      style={style}
    >
      <div className="station-tooltip__content">
        <header className="station-tooltip__header">
          <h2>{station.displayName}</h2>
          <button
            type="button"
            ref={closeButtonRef}
            className="station-tooltip__close"
            onClick={onClose}
            aria-label="Close station details"
          >
            Close
          </button>
        </header>
        <dl className="station-tooltip__meta">
          <div>
            <dt>Lines</dt>
            <dd>{lineNames}</dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}
