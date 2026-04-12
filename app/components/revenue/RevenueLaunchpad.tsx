import Link from 'next/link'

import { featuredRevenueLandingPages } from '@/app/data/revenuePages'
import { getAmberAffiliateUrl, withRevenueAttribution } from '@/app/lib/revenue'

import RevenueSurface from './RevenueSurface'
import styles from './RevenueLaunchpad.module.css'

interface RevenueLaunchpadProps {
  title: string
  description: string
  placementPrefix: string
}

export function RevenueLaunchpad({
  title,
  description,
  placementPrefix,
}: RevenueLaunchpadProps) {
  const amberUrl = getAmberAffiliateUrl('UCL')
  const attributedAmberUrl = amberUrl
    ? withRevenueAttribution(amberUrl, {
        partner: 'amber',
        placement: `${placementPrefix}-amber`,
        intentSegment: 'student-housing',
      })
    : null

  return (
    <section className={styles.section} aria-label="Student accommodation launchpad">
      <div className={styles.shell}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </header>

        <div className={styles.content}>
          <div className={styles.cards}>
            {featuredRevenueLandingPages.map((page) => (
              <Link
                key={page.slug}
                href={`/student-accommodation/${page.slug}/`}
                className={styles.card}
              >
                <h3 className={styles.cardTitle}>{page.title}</h3>
                <p className={styles.cardDescription}>{page.description}</p>
                <span className={styles.cardMeta}>Open guide →</span>
              </Link>
            ))}
          </div>

          <div className={styles.surfaces}>
            <RevenueSurface
              title="Browse verified student rooms"
              description="Use the highest-intent housing flow on the site: compare student rooms first, then move into area-specific rental searches."
              partner="amber"
              placement={`${placementPrefix}-amber`}
              intentSegment="student-housing"
              href={attributedAmberUrl}
              ctaLabel="Browse rooms on Amber"
              eyebrow="Student housing"
            />
            <RevenueSurface
              title="Sponsored listings area"
              description="Display ads stay secondary to search intent, but this placement makes monetization visible before any map-marker interaction."
              partner="adsense"
              placement={`${placementPrefix}-adsense`}
              intentSegment="student-housing"
              kind="ad"
              eyebrow="Display ads"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default RevenueLaunchpad