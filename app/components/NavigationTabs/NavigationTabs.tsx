/**
 * NavigationTabs Component
 * 
 * Provides horizontal tab navigation between the main map experiences and content pages.
 * Uses Next.js Link for client-side routing.
 * 
 * Feature: 002-university-transit-filter
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './NavigationTabs.module.css'

export interface NavigationTabsProps {
  /** Optional CSS class for custom styling */
  className?: string
}

export function NavigationTabs({ className }: NavigationTabsProps) {
  const pathname = usePathname()

  const isLinesActive = pathname === '/'
  const isBusActive = pathname?.startsWith('/bus') ?? false
  const isUniversitiesActive = pathname?.startsWith('/universities') ?? false
  const isBlogActive = pathname?.startsWith('/blog') ?? false
  const isFeedbackActive = pathname?.startsWith('/contact-us') ?? false

  return (
    <nav className={`${styles.navigationTabs} ${className || ''}`} aria-label="Main navigation">
      <ul className={styles.tabList}>
        <li className={styles.tabItem}>
          <Link
            href="/"
            className={`${styles.tab} ${isLinesActive ? styles.active : ''}`}
            aria-current={isLinesActive ? 'page' : undefined}
          >
            Tube Filter
          </Link>
        </li>
        <li className={styles.tabItem}>
          <Link
            href="/universities/"
            className={`${styles.tab} ${isUniversitiesActive ? styles.active : ''}`}
            aria-current={isUniversitiesActive ? 'page' : undefined}
          >
            Universities Filter
          </Link>
        </li>
        <li className={styles.tabItem}>
          <Link
            href="/bus/"
            className={`${styles.tab} ${isBusActive ? styles.active : ''}`}
            aria-current={isBusActive ? 'page' : undefined}
          >
            Bus Filter
          </Link>
        </li>
        <li className={styles.blogItem}>
          <Link
            href="/blog/"
            className={`${styles.tab} ${isBlogActive ? styles.active : ''}`}
            aria-current={isBlogActive ? 'page' : undefined}
          >
            Blog
          </Link>
        </li>
        <li className={styles.feedbackItem}>
          <Link
            href="/contact-us/"
            className={`${styles.feedbackButton} ${isFeedbackActive ? styles.feedbackButtonActive : ''}`}
          >
            Feedback
          </Link>
        </li>
      </ul>
    </nav>
  )
}
