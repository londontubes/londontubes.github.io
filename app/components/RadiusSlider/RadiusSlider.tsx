'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './RadiusSlider.module.css'

// Repurposed: RadiusSlider now represents WALK TIME (minutes) not distance.
// We keep the component name to avoid broader refactors.
export interface RadiusSliderProps {
  /** Current walk time value in minutes */
  value: number
  /** Callback when slider value changes (debounced by 200ms) */
  onChange: (newMinutes: number) => void
  /** Minimum walk time in minutes */
  min?: number
  /** Maximum walk time in minutes */
  max?: number
  /** Step size in minutes */
  step?: number
  /** Disable the slider (e.g., when no university selected) */
  disabled?: boolean
  enhancedUI?: boolean
}

/**
 * RadiusSlider Component
 * 
 * HTML5 range input for adjusting proximity radius.
 * Includes debounced onChange (200ms) to avoid excessive recalculations.
 * Full keyboard and screen reader support.
 */
export function RadiusSlider({
  value,
  onChange,
  min = 5,
  max = 60,
  step = 1,
  disabled = false,
  enhancedUI = true,
}: RadiusSliderProps) {
  // Local state for immediate UI updates (before debounce)
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Handle slider change with debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    setLocalValue(newValue)

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce the onChange callback by 200ms
    timeoutRef.current = setTimeout(() => {
      onChange(newValue)
    }, 200)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Format value for display
  const displayValue = localValue
  const ariaValueText = `${displayValue} minutes walk time`

  // Derived fill percentage for styling
  const fillPercent = ((localValue - min) / (max - min)) * 100

  // (Increment/decrement handlers removed; slider only changes via drag)
  // Calculate bubble position accounting for 20px margin on each side
  const bubbleXStyle = { left: `calc(20px + ${fillPercent}% * (100% - 40px) / 100%)` } as React.CSSProperties
  const showBubble = enhancedUI && !disabled

  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <label htmlFor="radius-slider" className={styles.label}>
          Walk Time <span className={styles.unitLabel}>(minutes)</span>
        </label>
      </div>
      <div className={styles.sliderRow}>
        <div className={styles.sliderWrapper}>
          <input
            id="radius-slider"
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleChange}
            disabled={disabled}
            className={styles.slider}
            aria-label="Walk time in minutes"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={localValue}
            aria-valuetext={ariaValueText}
            style={{ ['--fill-percent']: `${fillPercent}%` } as React.CSSProperties}
          />
          {showBubble && (
            <div
              className={`${styles.valueBubble} ${styles.bubbleVisible}`}
              style={bubbleXStyle}
              aria-hidden="true"
            >
              {displayValue} min
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RadiusSlider
