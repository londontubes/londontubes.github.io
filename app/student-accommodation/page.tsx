import Link from 'next/link'
import type { Metadata } from 'next'

import RevenueSurface from '@/app/components/revenue/RevenueSurface'
import {
  revenueLandingPages,
  featuredRevenueLandingPages,
} from '@/app/data/revenuePages'
import { getAmberAffiliateUrl, withRevenueAttribution } from '@/app/lib/revenue'

import styles from './RevenueLanding.module.css'

export const metadata: Metadata = {
  title: 'London Student Accommodation Finder | Commute-Friendly Areas',
  description:
    'Browse London student accommodation guides by university and commute pattern, then jump into student-room and property-search flows from the same page.',
  alternates: {
    canonical: '/student-accommodation/',
  },
  openGraph: {
    title: 'London Student Accommodation Finder',
    description:
      'Static guides to the best London student accommodation areas, tied to the London Tube Map and university commute filters.',
    type: 'website',
    url: 'https://londontubes.co.uk/student-accommodation/',
  },
}

const hubStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'London Student Accommodation Finder',
  url: 'https://londontubes.co.uk/student-accommodation/',
  description:
    'Collection of student accommodation and commute-friendly area guides for London universities and renter intent.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: revenueLandingPages.map((page, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: page.title,
      url: `https://londontubes.co.uk/student-accommodation/${page.slug}/`,
    })),
  },
}

export default function StudentAccommodationHubPage() {
  const amberUrl = getAmberAffiliateUrl('UCL')
  const attributedAmberUrl = amberUrl
    ? withRevenueAttribution(amberUrl, {
        partner: 'amber',
        placement: 'student-hub-amber',
        intentSegment: 'student-housing',
      })
    : null

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubStructuredData) }}
      />

      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <p className={styles.kicker}>Student accommodation</p>
            <h1 className={styles.title}>Find London student areas that actually work on a daily commute</h1>
            <p className={styles.lead}>
              This hub turns the London Tube Map into a housing shortlist. Start with your university or commute pattern,
              open the right landing page, and move straight into verified student rooms or rental listings when an area looks viable.
            </p>
            <div className={styles.heroActions}>
              <Link href="/universities/" className={styles.primaryButton}>
                Open the universities commute map
              </Link>
              <Link href="/blog/where-to-live-london-student/" className={styles.secondaryButton}>
                Read the student area guide
              </Link>
            </div>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.metaCard}>
              <h2>What this section does differently</h2>
              <div className={styles.metaList}>
                <p>Targets housing intent instead of broad travel queries.</p>
                <p>Keeps area advice tied to real tube corridors and university journeys.</p>
                <p>Surfaces monetized actions before you need a map marker click.</p>
              </div>
            </div>
            <RevenueSurface
              title="Browse verified student rooms first"
              description="If you need a fast housing starting point, use the student-room inventory before narrowing down private flat searches."
              partner="amber"
              placement="student-hub-amber"
              intentSegment="student-housing"
              href={attributedAmberUrl}
              ctaLabel="Browse rooms on Amber"
              eyebrow="High-intent CTA"
            />
          </div>
        </section>

        <section className={styles.sectionCard} style={{ marginTop: '1rem' }}>
          <p className={styles.muted}>Featured pages</p>
          <div className={styles.hubGrid}>
            {featuredRevenueLandingPages.map((page) => (
              <Link key={page.slug} href={`/student-accommodation/${page.slug}/`} className={styles.hubCard}>
                <h2>{page.title}</h2>
                <p>{page.description}</p>
                <span className={styles.hubCardMeta}>Open guide →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.sectionCard} style={{ marginTop: '1rem' }}>
          <p className={styles.muted}>All commute-aware guides</p>
          <div className={styles.hubGrid}>
            {revenueLandingPages.map((page) => (
              <Link key={page.slug} href={`/student-accommodation/${page.slug}/`} className={styles.hubCard}>
                <h2>{page.title}</h2>
                <p>{page.heroSummary}</p>
                <span className={styles.hubCardMeta}>View page →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}