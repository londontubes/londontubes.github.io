'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  /** Show inline +/- buttons and bubble tooltip */
  enhancedUI?: boolean
  /** Display unit label (e.g. 'mi' or 'km') */
  unit?: 'mi' | 'km'
  /** Toggle handler for switching between units */
  onToggleUnit?: () => void
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
  max = 10.0,
  step = 0.05,
  disabled = false,
  enhancedUI = true,
  unit = 'mi',
  onToggleUnit,
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
  const unitReadable = unit === 'mi' ? 'miles' : 'kilometres'
  const unitDisplay = unit === 'mi' ? 'miles' : 'km'
  const alternateReadable = unit === 'mi' ? 'kilometres' : 'miles'
  const alternateDisplay = unit === 'mi' ? 'km' : 'miles'
  const ariaValueText = `${displayValue} ${unitReadable}`
  const formattedStep = step >= 1 ? step.toFixed(0) : step.toFixed(2)
  const decimals = step < 1 ? 2 : 0
  const minDisplay = Number(min.toFixed(decimals)).toString()
  const maxDisplay = Number(max.toFixed(decimals)).toString()

  // Derived fill percentage for styling
  const fillPercent = ((localValue - min) / (max - min)) * 100

  // Increment / Decrement with clamp
  const applyValue = useCallback((next: number) => {
    const clamped = Math.min(max, Math.max(min, parseFloat(next.toFixed(2))))
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
      <div className={styles.labelRow}>
        <label htmlFor="radius-slider" className={styles.label}>
          Distance Radius <span className={styles.unitLabel}>(in </span>
          {onToggleUnit ? (
            <>
              {unit === 'mi' ? (
                <>
                  <span className={styles.unitLabel}>miles/</span>
                  <button
                    type="button"
                    className={styles.unitToggleInline}
                    onClick={onToggleUnit}
                    aria-label="Switch to kilometers"
                  >
                    km
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.unitToggleInline}
                    onClick={onToggleUnit}
                    aria-label="Switch to miles"
                  >
                    miles
                  </button>
                  <span className={styles.unitLabel}>/km</span>
                </>
              )}
            </>
          ) : (
            <span className={styles.unitLabel}>{unit === 'mi' ? 'miles' : 'km'}</span>
          )}
          <span className={styles.unitLabel}>)</span>
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
            aria-label={`Distance radius in ${unitReadable}`}
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
              {displayValue} {unit}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RadiusSlider
