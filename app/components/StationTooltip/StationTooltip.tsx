'use client'

import { useEffect, useRef } from 'react'
import type { Station } from '@/app/types/transit'

interface StationTooltipProps {
  station: Station | null
  lineLabels: Record<string, string>
  onClose: () => void
}

export default function StationTooltip({ station, lineLabels, onClose }: StationTooltipProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (station) {
      closeButtonRef.current?.focus()
    }
  }, [station])

  if (!station) {
    return null
  }

  const lineNames = station.lineCodes.map(code => lineLabels[code] ?? code).join(', ')

  return (
    <aside className="station-tooltip" role="dialog" aria-label={`${station.displayName} details`}>
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
        <p className="station-tooltip__summary">{station.tooltipSummary}</p>
        <dl className="station-tooltip__meta">
          <div>
            <dt>Lines</dt>
            <dd>{lineNames}</dd>
          </div>
          <div>
            <dt>Accessibility</dt>
            <dd>{station.accessibilityNotes ?? 'Information not provided'}</dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}
