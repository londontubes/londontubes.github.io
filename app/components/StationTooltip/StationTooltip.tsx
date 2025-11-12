'use client'

// Simplified Leaflet-only StationTooltip (Google Maps logic removed)
import type { Station } from '@/app/types/transit'

interface StationTooltipProps {
  station: Station | null
  lineLabels: Record<string, string>
  onClose: () => void
}

export default function StationTooltip({ station, lineLabels, onClose }: StationTooltipProps) {
  if (!station) return null
  const lineNames = station.lineCodes.map(code => lineLabels[code] ?? code).join(', ')
  return (
    <aside
      className="station-tooltip"
      role="dialog"
      aria-label={`${station.displayName} details`}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '1.5rem',
        transform: 'translateX(-50%)',
        zIndex: 3000,
      }}
    >
      <div className="station-tooltip__content">
        <header className="station-tooltip__header">
          <h2>{station.displayName}</h2>
          <button
            type="button"
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
