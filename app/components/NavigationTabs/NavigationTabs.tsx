/**
 * NavigationTabs Component
 * 
 * Provides horizontal tab navigation between "Line Filter" and "Universities Filter" pages.
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
  const isUniversitiesActive = pathname?.startsWith('/universities') ?? false
  const isBlogActive = pathname?.startsWith('/blog') ?? false

  return (
    <nav className={`${styles.navigationTabs} ${className || ''}`} aria-label="Main navigation">
      <ul className={styles.tabList} role="tablist">
        <li role="presentation" className={styles.tabItem}>
          <Link
            href="/"
            className={`${styles.tab} ${isLinesActive ? styles.active : ''}`}
            role="tab"
            aria-selected={isLinesActive}
            aria-current={isLinesActive ? 'page' : undefined}
          >
            Line Filter
          </Link>
        </li>
        <li role="presentation" className={styles.tabItem}>
          <Link
            href="/universities"
            className={`${styles.tab} ${isUniversitiesActive ? styles.active : ''}`}
            role="tab"
            aria-selected={isUniversitiesActive}
            aria-current={isUniversitiesActive ? 'page' : undefined}
          >
            Universities Filter
          </Link>
        </li>
        <li role="presentation" className={styles.blogItem}>
          <Link
            href="/blog"
            className={`${styles.tab} ${isBlogActive ? styles.active : ''}`}
            role="tab"
            aria-selected={isBlogActive}
            aria-current={isBlogActive ? 'page' : undefined}
          >
            Blog
          </Link>
        </li>
      </ul>
    </nav>
  )
}
