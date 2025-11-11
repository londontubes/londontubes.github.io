'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './TimeSlider.module.css'

export interface TimeSliderProps {
  /**
   * Current time value in minutes
   */
  value: number
  /**
   * Callback when slider value changes (debounced by 200ms)
   */
  onChange: (newTime: number) => void
  /**
   * Minimum time in minutes
   */
  min?: number
  /**
   * Maximum time in minutes
   */
  max?: number
  /**
   * Step size in minutes
   */
  step?: number
  /**
   * Disable the slider (e.g., when no university selected)
   */
  disabled?: boolean
  enhancedUI?: boolean
}

/**
 * TimeSlider Component
 * 
 * HTML5 range input for adjusting travel time duration.
 * Includes debounced onChange (200ms) to avoid excessive recalculations.
 * Full keyboard and screen reader support.
 */
export function TimeSlider({
  value,
  onChange,
  min = 5,
  max = 60,
  step = 1,
  disabled = false,
  enhancedUI = true,
}: TimeSliderProps) {
  // Local state for immediate UI updates (before debounce)
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Handle slider change with debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
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
  const ariaValueText = `${displayValue} minutes`
  const fillPercent = ((localValue - min) / (max - min)) * 100
  const decimals = step < 1 ? 2 : 0
  const minDisplay = Number(min.toFixed(decimals)).toString()
  const maxDisplay = Number(max.toFixed(decimals)).toString()

  const applyValue = useCallback((next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    setLocalValue(clamped)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => onChange(clamped), 10)
  }, [max, min, onChange])

  const handleIncrement = () => applyValue(localValue + step)
  const handleDecrement = () => applyValue(localValue - step)

  // Calculate bubble position accounting for 20px margin on each side
  const bubbleXStyle = { left: `calc(20px + ${fillPercent}% * (100% - 40px) / 100%)` } as React.CSSProperties
  const showBubble = enhancedUI && !disabled

  return (
    <div className={styles.container}>
      <label htmlFor="time-slider" className={styles.label}>
        Travel Time
      </label>
      <div className={styles.sliderRow}>
        <div className={styles.sliderWrapper}>
          <input
            id="time-slider"
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleChange}
            disabled={disabled}
            className={styles.slider}
            aria-label="Travel time in minutes"
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

export default TimeSlider
