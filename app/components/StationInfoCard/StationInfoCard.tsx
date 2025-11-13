'use client'

// Leaflet-only simplified StationInfoCard.
// Previous Google Maps projection logic removed.
import type { Station } from '@/app/types/transit'
import { fetchJourneyDuration } from '@/app/lib/map/journeyPlanner'
import { useEffect, useState } from 'react'
import styles from './StationInfoCard.module.css'

export interface StationInfoCardProps {
  station: Station | null
  lineLabels: Record<string, string>
  onClose: () => void
  purpleReachInfo?: Record<string, { originStationId: string; minutes: number }>
  greenStationIds?: Set<string>
  stations?: Station[]
}

export function StationInfoCard({ station, lineLabels, onClose, purpleReachInfo, stations }: StationInfoCardProps) {
  // Hooks must be called unconditionally; derive identifiers safely.
  const stationId = station?.stationId
  const [liveMinutes, setLiveMinutes] = useState<number | null>(null)

  // Compute derived data without conditional hook paths.
  const lineNames = station ? station.lineCodes.map(code => lineLabels[code] || code) : []
  const purpleInfo = stationId && purpleReachInfo ? purpleReachInfo[stationId] : undefined
  const isPurple = Boolean(purpleInfo)
  const originStation = isPurple && stations ? stations.find(s => s.stationId === purpleInfo!.originStationId) : null
  const originName = originStation?.displayName || (purpleInfo?.originStationId || '')

  // Reset live minutes when station changes
  useEffect(() => {
    setLiveMinutes(null)
  }, [stationId])

  // Fetch TfL journey time once for purple station
  useEffect(() => {
    if (!stationId || !isPurple || !purpleInfo) return
    if (liveMinutes != null) return
    let cancelled = false
    fetchJourneyDuration(purpleInfo.originStationId, stationId, { modes: 'tube' })
      .then(res => {
        if (cancelled) return
        if (res && res.durationMinutes) {
          setLiveMinutes(res.durationMinutes)
        } else {
          setLiveMinutes(-1)
        }
      })
      .catch(() => !cancelled && setLiveMinutes(-1))
    return () => { cancelled = true }
  }, [isPurple, purpleInfo, stationId, liveMinutes])

  let purpleExplanation: string | null = null
  if (isPurple && originName) {
    if (liveMinutes == null) {
      purpleExplanation = `Tube reachable from walk station ${originName}. Fetching TfL journey time…`
    } else if (liveMinutes > 0) {
      purpleExplanation = `Tube reachable from walk station ${originName}. TfL journey time: ${liveMinutes} min.`
    } else if (liveMinutes === -1) {
      purpleExplanation = `Tube reachable from walk station ${originName}. TfL journey time unavailable.`
    }
  }

  if (!station) return null

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
          {purpleExplanation && (
            <p className={styles.explanation}>{purpleExplanation}</p>
          )}
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
