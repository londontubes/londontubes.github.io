import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

export interface StationLike {
  displayName: string
  lineCodes: string[]
  accessibilityNotes?: string
  isInterchange?: boolean
}

export interface KeyboardHandlers {
  onEnter?: () => void
  onSpace?: () => void
  onEscape?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
}

export function handleKeyboardActivation(event: ReactKeyboardEvent, handlers: KeyboardHandlers): void {
  switch (event.key) {
    case 'Enter':
      handlers.onEnter?.()
      event.preventDefault()
      break
    case ' ':
      handlers.onSpace?.()
      event.preventDefault()
      break
    case 'Escape':
      handlers.onEscape?.()
      event.preventDefault()
      break
    case 'ArrowLeft':
      handlers.onArrowLeft?.()
      event.preventDefault()
      break
    case 'ArrowRight':
      handlers.onArrowRight?.()
      event.preventDefault()
      break
    case 'ArrowUp':
      handlers.onArrowUp?.()
      event.preventDefault()
      break
    case 'ArrowDown':
      handlers.onArrowDown?.()
      event.preventDefault()
      break
    default:
      break
  }
}

export function focusFirstInteractive(root: HTMLElement | null): void {
  if (!root) return
  const focusable = root.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  focusable?.focus()
}

export function stationMarkerAriaLabel(station: StationLike): string {
  const interchange = station.isInterchange ? 'Interchange station.' : ''
  const accessibility = station.accessibilityNotes ?? ''
  const lines = station.lineCodes.length
    ? `Serves ${station.lineCodes.join(', ')} lines.`
    : ''
  return [station.displayName, interchange, lines, accessibility].filter(Boolean).join(' ')
}

export function describeActiveLines(lineCodes: string[], allLabels: Record<string, string>): string {
  if (!lineCodes.length) {
    return 'All lines visible'
  }
  const labels = lineCodes.map(code => allLabels[code] ?? code)
  return `Active lines: ${labels.join(', ')}`
}
