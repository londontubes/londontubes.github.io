"use client"

import { useCallback, useMemo } from 'react'
import type { TransitLine } from '@/app/types/transit'

export interface LineFilterProps {
  lines: TransitLine[]
  activeLineCodes: string[]
  onChange: (codes: string[]) => void
  stationCounts: Record<string, number>
  onAnnounce?: (message: string) => void
}

// Multi-select toggle: user can enable/disable individual lines; none selected => all visible
export default function LineFilter({
  lines,
  activeLineCodes,
  onChange,
  stationCounts,
  onAnnounce,
}: LineFilterProps) {
  const activeSet = useMemo(() => new Set(activeLineCodes), [activeLineCodes])
  const isAll = activeLineCodes.length === 0

  const handleToggle = useCallback(
    (code: string) => {
      const next = new Set(activeSet)
      if (next.has(code)) {
        next.delete(code)
        console.info('filter:event', { type: 'deselect', line: code })
        if (onAnnounce) {
          const line = lines.find(l => l.lineCode === code)
          if (line) onAnnounce(`Removed ${line.displayName}; ${next.size || 'all'} lines now visible`)
        }
      } else {
        next.add(code)
        console.info('filter:event', { type: 'select', line: code })
        if (onAnnounce) {
          const line = lines.find(l => l.lineCode === code)
          if (line) onAnnounce(`Added ${line.displayName}; ${next.size} active line${next.size === 1 ? '' : 's'}`)
        }
      }
      onChange(Array.from(next))
    },
    [activeSet, onChange, onAnnounce, lines]
  )

  const handleResetAll = useCallback(() => {
    onChange([])
    console.info('filter:event', { type: 'reset_all' })
    onAnnounce?.('Showing all lines')
  }, [onChange, onAnnounce])

  const legend = useMemo(() => {
    const items = [] as JSX.Element[]
    // All Lines control first
    items.push(
      <li key="__all" className="line-filter__item" data-selected={isAll || undefined}>
        <button
          type="button"
          onClick={handleResetAll}
          aria-pressed={isAll}
          className="line-filter__button line-filter__button--all"
          style={{
            backgroundColor: '#222',
            color: '#fff',
            opacity: 1,
            outline: isAll ? '2px solid #000' : 'none',
          }}
        >
          All Lines
        </button>
      </li>
    )
    lines.forEach(line => {
      const selected = activeSet.has(line.lineCode)
      items.push(
        <li key={line.lineCode} className="line-filter__item" data-selected={selected || undefined}>
          <button
            type="button"
            onClick={() => handleToggle(line.lineCode)}
            aria-pressed={selected}
            className="line-filter__button"
            style={{
              backgroundColor: line.brandColor,
              color: line.textColor,
              opacity: selected || isAll ? 1 : 0.4,
              outline: selected ? '2px solid #000' : 'none',
            }}
          >
            <span className="line-filter__name">{line.displayName}</span>
            <span className="line-filter__count" aria-hidden="true">
              {stationCounts[line.lineCode]}
            </span>
          </button>
        </li>
      )
    })
    return items
  }, [lines, activeSet, handleToggle, stationCounts, isAll, handleResetAll])

  return (
    <nav aria-label="Line filter" className="line-filter line-filter--horizontal" data-mode="multi">
      <ul className="line-filter__list" role="list">{legend}</ul>
    </nav>
  )
}
