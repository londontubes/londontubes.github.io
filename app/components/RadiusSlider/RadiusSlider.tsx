'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './RadiusSlider.module.css'

export interface RadiusSliderProps {
  /**
   * Current radius value in miles
   */
  value: number
  /**
   * Callback when slider value changes (debounced by 200ms)
   */
  onChange: (newRadius: number) => void
  /**
   * Minimum radius in miles
   */
  min?: number
  /**
   * Maximum radius in miles
   */
  max?: number
  /**
   * Step size in miles
   */
  step?: number
  /**
   * Disable the slider (e.g., when no university selected)
   */
  disabled?: boolean
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
  min = 0.25,
  max = 1.0,
  step = 0.05,
  disabled = false,
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
  const displayValue = localValue.toFixed(2)
  const ariaValueText = `${displayValue} miles`

  return (
    <div className={styles.container}>
      <label htmlFor="radius-slider" className={styles.label}>
        Distance Radius
      </label>
      <div className={styles.sliderRow}>
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
          aria-label="Distance radius in miles"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue}
          aria-valuetext={ariaValueText}
        />
        <span className={styles.valueDisplay} aria-live="polite">
          {displayValue} mi
        </span>
      </div>
      {disabled && (
        <span className={styles.hint}>
          Select a university to adjust radius
        </span>
      )}
    </div>
  )
}

export default RadiusSlider
