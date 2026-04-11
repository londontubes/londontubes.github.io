'use client'

import { useMemo } from 'react'
import type { BusRoute } from '@/app/types/transit'

interface BusRouteFilterProps {
  routes: BusRoute[]
  selectedRouteId: string | null
  onChange: (routeId: string | null) => void
  disabled?: boolean
  hideLabel?: boolean
  hideHint?: boolean
}

export default function BusRouteFilter({
  routes,
  selectedRouteId,
  onChange,
  disabled = false,
  hideLabel = false,
  hideHint = false,
}: BusRouteFilterProps) {
  const sortedRoutes = useMemo(() => {
    const collator = new Intl.Collator('en-GB', { numeric: true, sensitivity: 'base' })
    return [...routes].sort((left, right) => collator.compare(left.routeCode, right.routeCode))
  }, [routes])

  return (
    <nav aria-label="Bus route filter" className="bus-route-filter">
      <label className={`bus-route-filter__label ${hideLabel ? 'visually-hidden' : ''}`} htmlFor="bus-route-select">
        Bus route
      </label>
      <div className="bus-route-filter__control">
        <select
          id="bus-route-select"
          className="bus-route-filter__select"
          value={selectedRouteId ?? ''}
          onChange={(event) => onChange(event.target.value || null)}
          disabled={disabled}
        >
          <option value="">All routes</option>
          {sortedRoutes.map((route) => (
            <option key={route.routeId} value={route.routeId}>
              {route.routeCode} - {route.originName} to {route.destinationName}
            </option>
          ))}
        </select>
      </div>
      {hideHint ? null : (
        <p className="bus-route-filter__hint">
          {disabled ? 'Click this panel to activate route filtering.' : 'Pick one route to overlay it clearly across London.'}
        </p>
      )}
    </nav>
  )
}