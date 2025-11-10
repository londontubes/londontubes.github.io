'use client'

import { useMemo } from 'react'
import type { UniversitiesDataset } from '@/app/types/university'
import styles from './UniversitySelector.module.css'

export interface UniversitySelectorProps {
  universities: UniversitiesDataset
  selectedUniversityId: string | null
  onUniversitySelect: (universityId: string) => void
}

/**
 * UniversitySelector Component
 * 
 * Displays a list of universities with their names.
 * Users can click to select/deselect a university for proximity filtering.
 */
export function UniversitySelector({
  universities,
  selectedUniversityId,
  onUniversitySelect,
}: UniversitySelectorProps) {
  // Sort universities alphabetically by name
  const sortedUniversities = useMemo(() => {
    return [...universities.features].sort((a, b) => 
      a.properties.displayName.localeCompare(b.properties.displayName)
    )
  }, [universities])

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Universities</h2>
      <div className={styles.grid}>
        {sortedUniversities.map(feature => {
          const university = feature.properties
          const isSelected = selectedUniversityId === university.universityId
          
          return (
            <button
              key={university.universityId}
              onClick={() => onUniversitySelect(university.universityId)}
              className={`${styles.universityButton} ${isSelected ? styles.selected : ''}`}
              aria-pressed={isSelected}
              title={`${university.displayName}${university.isMultiCampus ? ' (Multiple campuses)' : ''}`}
            >
              <span className={styles.universityName}>
                {university.displayName}
              </span>
              {university.isMultiCampus && (
                <span className={styles.badge} aria-label="Multiple campuses">
                  {university.campuses.length} campuses
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default UniversitySelector
