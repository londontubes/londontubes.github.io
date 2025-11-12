'use client'

// Leaflet-only simplified StationInfoCard.
// Previous Google Maps projection logic removed.
import type { Station } from '@/app/types/transit'
import styles from './StationInfoCard.module.css'

export interface StationInfoCardProps {
  station: Station | null
  lineLabels: Record<string, string>
  onClose: () => void
}

export function StationInfoCard({ station, lineLabels, onClose }: StationInfoCardProps) {
  if (!station) return null
  const lineNames = station.lineCodes.map(code => lineLabels[code] || code)
  return (
    <div
      className={styles.card}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '1.5rem',
        transform: 'translateX(-50%)',
        zIndex: 3000,
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
              <li key={idx} className={styles.lineItem}>{name}</li>
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
