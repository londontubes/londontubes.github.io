'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { getUniversityLogoMeta } from '@/app/config/universityLogos'
import type { UniversitiesDataset } from '@/app/types/university'
import styles from './UniversitySelector.module.css'

export interface UniversitySelectorProps {
  universities: UniversitiesDataset
  selectedUniversityId: string | null
  onUniversitySelect: (universityId: string) => void
  inline?: boolean
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
  inline = false,
}: UniversitySelectorProps) {
  // Sort universities alphabetically by name
  const sortedUniversities = useMemo(() => {
    return [...universities.features].sort((a, b) => 
      a.properties.displayName.localeCompare(b.properties.displayName)
    )
  }, [universities])

  return (
    <div className={inline ? `${styles.inlineContainer}` : styles.container}>
      {!inline && <h2 className={styles.heading}>Universities</h2>}
      <div className={inline ? styles.inlineRow : styles.grid}>
        {sortedUniversities.map(feature => {
          const university = feature.properties
          const isSelected = selectedUniversityId === university.universityId
          const logoMeta = getUniversityLogoMeta(university.universityId)
          const logoSrc = logoMeta ? `/images/universities/${logoMeta.filename}` : `/images/universities/${university.universityId.toLowerCase()}.svg`
          const brandStyle: React.CSSProperties = logoMeta ? { backgroundColor: '#fff', boxShadow: `0 0 0 1px rgba(0,0,0,0.1)` } : {}
          
          return (
            <button
              key={university.universityId}
              onClick={() => onUniversitySelect(university.universityId)}
              className={`${styles.universityIconButton} ${isSelected ? styles.selected : ''}`}
              aria-pressed={isSelected}
              aria-label={`${university.displayName}${university.isMultiCampus ? ` – ${university.campuses.length} campuses` : ''}`}
              title={`${university.displayName}${university.isMultiCampus ? ' (Multiple campuses)' : ''}`}
            >
              <Image
                src={logoSrc}
                alt=""
                loading="lazy"
                className={styles.logoOnly}
                width={56}
                height={56}
                aria-hidden="true"
                style={brandStyle}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default UniversitySelector
