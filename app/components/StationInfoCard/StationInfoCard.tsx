'use client'

import { useEffect, useState, useRef } from 'react'
import type { Station } from '@/app/types/transit'
import styles from './StationInfoCard.module.css'

export interface StationInfoCardProps {
  station: Station | null
  lineLabels: Record<string, string>
  mapInstance: google.maps.Map | null
  onClose: () => void
}

/**
 * StationInfoCard Component
 * 
 * Displays station information directly on the map next to the selected station.
 * Positioned dynamically based on station coordinates.
 */
export function StationInfoCard({
  station,
  lineLabels,
  mapInstance,
  onClose,
}: StationInfoCardProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

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

      const point = projection.fromLatLngToPoint(stationLatLng)
      if (!point) return

      const scale = Math.pow(2, mapInstance.getZoom() || 10)
      const worldCoordinate = new google.maps.Point(
        point.x * scale,
        point.y * scale
      )

      const mapDiv = mapInstance.getDiv()
      const mapBounds = mapDiv.getBoundingClientRect()
      const mapTopLeft = projection.fromLatLngToPoint(
        mapInstance.getBounds()?.getNorthEast() || new google.maps.LatLng(0, 0)
      )

      if (!mapTopLeft) return

      const topLeftWorldCoordinate = new google.maps.Point(
        mapTopLeft.x * scale,
        mapTopLeft.y * scale
      )

      const pixelX = worldCoordinate.x - topLeftWorldCoordinate.x
      const pixelY = worldCoordinate.y - topLeftWorldCoordinate.y

      // Offset card to the right and slightly down from station marker
      const offsetX = 30
      const offsetY = -20

      setPosition({
        x: pixelX + offsetX,
        y: pixelY + offsetY,
      })
    }

    updatePosition()

    const boundsListener = mapInstance.addListener('bounds_changed', updatePosition)
    const zoomListener = mapInstance.addListener('zoom_changed', updatePosition)

    return () => {
      boundsListener.remove()
      zoomListener.remove()
    }
  }, [station, mapInstance])

  if (!station || !position) {
    return null
  }

  const lineNames = station.lineCodes.map(code => lineLabels[code] || code)

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      role="dialog"
      aria-label={`Station information for ${station.displayName}`}
    >
      <div className={styles.header}>
        <h3 className={styles.stationName}>{station.displayName}</h3>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close station information"
          type="button"
        >
          ×
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <span className={styles.label}>Lines:</span>
          <ul className={styles.lineList}>
            {lineNames.map((name, idx) => (
              <li key={idx} className={styles.lineItem}>
                {name}
              </li>
            ))}
          </ul>
        </div>
        {station.isInterchange && (
          <div className={styles.badge}>
            <span className={styles.badgeText}>Interchange Station</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StationInfoCard
