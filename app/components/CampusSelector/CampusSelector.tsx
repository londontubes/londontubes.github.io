/**
 * CampusSelector Component
 * 
 * Modal dialog for selecting a specific campus from multi-campus universities.
 * Uses radio buttons for selection with "Apply" and "Cancel" actions.
 * 
 * Feature: 002-university-transit-filter
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import type { Campus } from '@/app/types/university'
import styles from './CampusSelector.module.css'

export interface CampusSelectorProps {
  /** University display name (for modal title) */
  universityName: string
  /** Array of campus options to choose from */
  campuses: Campus[]
  /** Currently selected campus ID */
  selectedCampusId: string | null
  /** Callback when user confirms selection */
  onSelect: (campusId: string) => void
  /** Callback when user cancels modal */
  onCancel: () => void
  /** Whether modal is visible */
  isOpen: boolean
}

export function CampusSelector({
  universityName,
  campuses,
  selectedCampusId,
  onSelect,
  onCancel,
  isOpen,
}: CampusSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(selectedCampusId)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedId(selectedCampusId)
      // Focus first button when modal opens
      setTimeout(() => firstButtonRef.current?.focus(), 50)
    }
  }, [isOpen, selectedCampusId])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const modal = modalRef.current
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, input, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  if (!isOpen) return null

  const handleApply = () => {
    if (selectedId) {
      onSelect(selectedId)
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="campus-selector-title"
      >
        <h2 id="campus-selector-title" className={styles.title}>
          Select Campus for {universityName}
        </h2>

        <div className={styles.campusList} role="radiogroup" aria-label="Campus options">
          {campuses.map((campus) => (
            <label key={campus.campusId} className={styles.campusOption}>
              <input
                type="radio"
                name="campus"
                value={campus.campusId}
                checked={selectedId === campus.campusId}
                onChange={(e) => setSelectedId(e.target.value)}
                className={styles.radio}
              />
              <span className={styles.campusInfo}>
                <span className={styles.campusName}>{campus.name}</span>
                <span className={styles.nearestStation}>
                  Nearest: {campus.nearestStation.name} ({campus.nearestStation.distance} mi)
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            ref={firstButtonRef}
            onClick={handleApply}
            disabled={!selectedId}
            className={`${styles.button} ${styles.primaryButton}`}
            aria-label="Apply campus selection"
          >
            Apply
          </button>
          <button
            onClick={onCancel}
            className={`${styles.button} ${styles.secondaryButton}`}
            aria-label="Cancel campus selection"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
