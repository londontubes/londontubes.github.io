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

// Networks in the order people look for them. Multi-line networks get a
// toggle that selects or clears the whole network at once.
const NETWORKS: { mode: TransitLine['mode']; label: string }[] = [
  { mode: 'tube', label: 'Underground' },
  { mode: 'elizabeth-line', label: 'Elizabeth line' },
  { mode: 'dlr', label: 'DLR' },
  { mode: 'overground', label: 'Overground' },
  { mode: 'tram', label: 'Trams' },
]

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

  const groups = useMemo(
    () =>
      NETWORKS.map((network) => ({
        ...network,
        lines: lines.filter((line) => line.mode === network.mode),
      })).filter((group) => group.lines.length > 0),
    [lines]
  )

  const handleToggle = useCallback(
    (code: string) => {
      const next = new Set(activeSet)
      const line = lines.find(l => l.lineCode === code)
      if (next.has(code)) {
        next.delete(code)
        if (onAnnounce && line) onAnnounce(`Removed ${line.displayName}; ${next.size || 'all'} lines now visible`)
      } else {
        next.add(code)
        if (onAnnounce && line) onAnnounce(`Added ${line.displayName}; ${next.size} active line${next.size === 1 ? '' : 's'}`)
      }
      onChange(Array.from(next))
    },
    [activeSet, onChange, onAnnounce, lines]
  )

  const handleGroupToggle = useCallback(
    (label: string, codes: string[]) => {
      const next = new Set(activeSet)
      const allSelected = codes.every((code) => next.has(code))
      codes.forEach((code) => (allSelected ? next.delete(code) : next.add(code)))
      onChange(Array.from(next))
      onAnnounce?.(
        allSelected
          ? `Removed all ${label} lines; ${next.size || 'all'} lines now visible`
          : `Added all ${label} lines; ${next.size} active lines`
      )
    },
    [activeSet, onChange, onAnnounce]
  )

  const handleResetAll = useCallback(() => {
    onChange([])
    onAnnounce?.('Showing all lines')
  }, [onChange, onAnnounce])

  const renderLine = (line: TransitLine) => {
    const selected = activeSet.has(line.lineCode)
    return (
      <li key={line.lineCode} className="line-filter__item" data-selected={selected || undefined}>
        <button
          type="button"
          onClick={() => handleToggle(line.lineCode)}
          aria-pressed={selected}
          className="line-filter__button"
          data-line-code={line.lineCode}
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
  }

  return (
    <nav aria-label="Line filter" className="line-filter line-filter--horizontal line-filter--grouped" data-mode="multi">
      <ul className="line-filter__list" role="list">
        <li className="line-filter__item" data-selected={isAll || undefined}>
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
        {groups.map((group) => {
          const codes = group.lines.map((l) => l.lineCode)
          const groupSelected = codes.every((code) => activeSet.has(code))
          const groupId = `line-group-${group.mode}`
          return (
            <li key={group.mode} className="line-filter__group" data-network={group.mode}>
              {group.lines.length > 1 ? (
                <button
                  type="button"
                  id={groupId}
                  className="line-filter__group-toggle"
                  aria-pressed={groupSelected}
                  onClick={() => handleGroupToggle(group.label, codes)}
                  title={groupSelected ? `Clear all ${group.label} lines` : `Show all ${group.label} lines`}
                >
                  {group.label}
                  <span className="line-filter__group-count" aria-hidden="true">{group.lines.length}</span>
                </button>
              ) : (
                <span id={groupId} className="visually-hidden">{group.label}</span>
              )}
              <ul className="line-filter__group-lines" role="list" aria-labelledby={groupId}>
                {group.lines.map(renderLine)}
              </ul>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
