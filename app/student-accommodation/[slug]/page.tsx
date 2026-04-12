import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import RevenueSurface from '@/app/components/revenue/RevenueSurface'
import {
  getRevenueLandingPage,
  revenueLandingPages,
} from '@/app/data/revenuePages'
import { loadStaticTransitData } from '@/app/lib/data/load-static-data'
import { buildRightmoveStationUrl, buildZooplaStationUrl } from '@/app/lib/map/propertySearch'
import { getAmberAffiliateUrl, withRevenueAttribution } from '@/app/lib/revenue'

import styles from '../RevenueLanding.module.css'

interface PageProps {
  params: { slug: string }
}

function normalizeStationName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function findStationByName(name: string) {
  const dataset = loadStaticTransitData()
  const normalizedSearch = normalizeStationName(name)

  return dataset.stations.find((station) => {
    const normalizedStationName = normalizeStationName(station.displayName)
    return (
      normalizedStationName === normalizedSearch ||
      normalizedStationName.includes(normalizedSearch) ||
      normalizedSearch.includes(normalizedStationName)
    )
  })
}

export function generateStaticParams() {
  return revenueLandingPages.map((page) => ({ slug: page.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getRevenueLandingPage(params.slug)

  if (!page) {
    return { title: 'Student accommodation' }
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/student-accommodation/${page.slug}/`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'article',
      url: `https://londontubes.co.uk/student-accommodation/${page.slug}/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: ['https://londontubes.co.uk/opengraph-image'],
    },
  }
}

export default function StudentAccommodationLandingPage({ params }: PageProps) {
  const page = getRevenueLandingPage(params.slug)

  if (!page) {
    notFound()
  }

  const station = findStationByName(page.searchStationName)
  const zooplaUrl = station
    ? buildZooplaStationUrl(station)
    : buildZooplaStationUrl(undefined, page.searchStationName)
  const rightmoveUrl = station ? buildRightmoveStationUrl(station) : null
  const amberUrl = page.universityId ? getAmberAffiliateUrl(page.universityId) : null
  const attributedAmberUrl = amberUrl
    ? withRevenueAttribution(amberUrl, {
        partner: 'amber',
        placement: `${page.slug}-amber`,
        intentSegment: page.intentSegment,
      })
    : null

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: `https://londontubes.co.uk/student-accommodation/${page.slug}/`,
    about: page.areaHighlights.map((item) => ({
      '@type': 'Place',
      name: item.areaName,
      description: item.summary,
    })),
  }

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <p className={styles.kicker}>{page.heroKicker}</p>
            <h1 className={styles.title}>{page.title}</h1>
            <p className={styles.lead}>{page.heroSummary}</p>
            <div className={styles.heroActions}>
              <Link href={page.mapHref} className={styles.primaryButton}>
                Open the relevant map view
              </Link>
              <Link href="/student-accommodation/" className={styles.ghostButton}>
                Browse all guides
              </Link>
            </div>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.metaCard}>
              <h2>Best starting station</h2>
              <div className={styles.metaList}>
                <p>{page.searchStationName}</p>
                <p>This station is used as the quickest jump into relevant rental listings and map discovery for this page.</p>
              </div>
            </div>
            <div className={styles.metaCard}>
              <h2>Intent segment</h2>
              <div className={styles.metaList}>
                <p>{page.intentSegment === 'student-housing' ? 'Student housing' : 'Commuter rentals'}</p>
                <p>Every monetized surface on this page carries intent, partner, and placement analytics for later optimisation.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={styles.contentStack}>
            <article className={styles.areaCard}>
              <p className={styles.muted}>Shortlisted areas</p>
              <div className={styles.areaList}>
                {page.areaHighlights.map((item) => (
                  <div key={item.areaName}>
                    <h2>{item.areaName}</h2>
                    <p>{item.summary}</p>
                  </div>
                ))}
              </div>
            </article>

            {page.sections.map((section) => (
              <section key={section.title} className={styles.sectionCard}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}

            <section className={styles.linkCard}>
              <p className={styles.muted}>Related internal links</p>
              <div className={styles.relatedGrid}>
                {page.relatedLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={styles.relatedLink}>
                    <div className={styles.linkCard}>
                      <h2>{link.label}</h2>
                      <p>{link.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.surfaceStack}>
            {attributedAmberUrl ? (
              <RevenueSurface
                title="Compare verified student rooms"
                description="Use a student-specific inventory first when you need speed, furnished options, or simpler booking flow."
                partner="amber"
                placement={`${page.slug}-amber`}
                intentSegment={page.intentSegment}
                href={attributedAmberUrl}
                ctaLabel="Browse student rooms"
                eyebrow="Affiliate CTA"
              />
            ) : null}
            {zooplaUrl ? (
              <RevenueSurface
                title="Open Zoopla near this station"
                description="Jump straight into smaller London rentals around the key station on this page."
                partner="zoopla"
                placement={`${page.slug}-zoopla`}
                intentSegment={page.intentSegment}
                href={zooplaUrl}
                ctaLabel="Search Zoopla rentals"
                eyebrow="Property portal"
              />
            ) : null}
            {rightmoveUrl ? (
              <RevenueSurface
                title="Open Rightmove near this station"
                description="Compare mapped rental inventory on Rightmove without rebuilding the search manually."
                partner="rightmove"
                placement={`${page.slug}-rightmove`}
                intentSegment={page.intentSegment}
                href={rightmoveUrl}
                ctaLabel="Search Rightmove rentals"
                eyebrow="Property portal"
              />
            ) : null}
            <RevenueSurface
              title="Sponsored rental-ad slot"
              description="Ads stay secondary to the housing journey, but this surface monetizes visitors who are still researching areas."
              partner="adsense"
              placement={`${page.slug}-adsense`}
              intentSegment={page.intentSegment}
              kind="ad"
              eyebrow="Display ads"
            />
          </aside>
        </section>
      </div>
    </main>
  )
}