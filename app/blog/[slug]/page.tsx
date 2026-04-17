import Link from 'next/link'
import type { Metadata } from 'next'

import AdUnit from '@/app/components/ads/AdUnit'
import RevenueSurface from '@/app/components/revenue/RevenueSurface'
import { getHeathrowExpressAffiliateUrl, getAmberAffiliateUrl, withRevenueAttribution } from '@/app/lib/revenue'
import styles from '../BlogArticle.module.css'
import { blogQuestions, getBlogQuestion } from '../content'

const studentHousingLandingByUniversityId: Record<string, string> = {
  UCL: 'ucl-student-accommodation',
  IMPERIAL: 'imperial-student-accommodation',
  LSE: 'lse-student-accommodation',
  KINGS: 'kings-college-student-accommodation',
  QMUL: 'qmul-student-accommodation',
  CITY: 'city-university-student-accommodation',
  SOAS: 'soas-student-accommodation',
  WESTMINSTER: 'westminster-student-accommodation',
}

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return blogQuestions.map((q) => ({ slug: q.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const entry = getBlogQuestion(params.slug)

  if (!entry) {
    return {
      title: 'London Tube Blog',
    }
  }

  return {
    title: `${entry.question} – London Tube Blog`,
    description: entry.shortAnswer,
    alternates: {
      canonical: `/blog/${params.slug}/`,
    },
    openGraph: {
      title: entry.question,
      description: entry.shortAnswer,
      type: 'article',
      url: `https://londontubes.co.uk/blog/${params.slug}/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.question,
      description: entry.shortAnswer,
      images: ['https://londontubes.co.uk/opengraph-image'],
    },
  }
}

export default function BlogArticlePage({ params }: PageProps) {
  const entry = getBlogQuestion(params.slug)

  if (!entry) {
    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <p className={styles.breadcrumb}>
            <Link href="/blog/">Blog</Link> / Not found
          </p>
          <h1 className={styles.title}>We could not find that article.</h1>
          <p className={styles.lead}>
            The link might be out of date. Go back to the main blog
            page to browse the latest questions and answers.
          </p>
        </div>
      </main>
    )
  }

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.question,
    description: entry.shortAnswer,
    author: {
      '@type': 'Organization',
      name: 'London Tube Map',
    },
    publisher: {
      '@type': 'Organization',
      name: 'London Tube Map',
      logo: {
        '@type': 'ImageObject',
        url: 'https://londontubes.co.uk/opengraph-image',
      },
    },
    mainEntityOfPage: `https://londontubes.co.uk/blog/${params.slug}/`,
    inLanguage: 'en-GB',
    dateModified: '2026-04-11',
  }

  const introParagraphs = entry.body.slice(0, 2)
  const remainingParagraphs = entry.body.slice(2)
  const studentLandingSlug = entry.universityId
    ? studentHousingLandingByUniversityId[entry.universityId]
    : null
  const amberUrl = entry.universityId ? getAmberAffiliateUrl(entry.universityId) : null
  const attributedAmberUrl = amberUrl
    ? withRevenueAttribution(amberUrl, {
        partner: 'amber',
        placement: `blog-${entry.slug}-amber`,
        intentSegment: 'student-housing',
      })
    : null
  const heathrowUrl = getHeathrowExpressAffiliateUrl()
  const attributedHeathrowUrl = heathrowUrl
    ? withRevenueAttribution(heathrowUrl, {
        partner: 'heathrow-express',
        placement: `blog-${entry.slug}-heathrow`,
        intentSegment: 'airport-transfer',
      })
    : null

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <header className={styles.header}>
        <p className={styles.breadcrumb}>
          <Link href="/blog/">Blog</Link> / <span>{entry.question}</span>
        </p>
        <h1 className={styles.title}>{entry.question}</h1>
        <p className={styles.lead}>{entry.shortAnswer}</p>
      </header>

      <section className={styles.body} aria-label="Detailed answer">
        {introParagraphs.map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </section>

      {entry.ctaSlot === 'student-housing' ? (
        <section className={styles.articleCta} aria-label="Student housing shortcuts">
          {attributedAmberUrl ? (
            <RevenueSurface
              title="Browse verified student rooms"
              description="Move from the guide straight into student-room inventory for this university journey."
              partner="amber"
              placement={`blog-${entry.slug}-amber`}
              intentSegment="student-housing"
              href={attributedAmberUrl}
              ctaLabel="Browse rooms on Amber"
              compact
              eyebrow="Student housing"
            />
          ) : null}
          <div style={{ marginTop: '1rem' }}>
            <h4>Keep the search commute-led</h4>
            <p>
              Use the student accommodation hub to compare university-specific pages and jump into
              map-driven rental searches with a tighter shortlist.
            </p>
            <p>
              <Link href={studentLandingSlug ? `/student-accommodation/${studentLandingSlug}/` : '/student-accommodation/'}>
                Open the accommodation guide →
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      {entry.ctaSlot === 'heathrow-express' && attributedHeathrowUrl ? (
        <section className={styles.articleCta} aria-label="Airport transfer shortcut">
          <RevenueSurface
            title="Book a faster Heathrow transfer"
            description="Visitors landing from search often want the quickest airport-to-central-London option before planning the rest of the trip."
            partner="heathrow-express"
            placement={`blog-${entry.slug}-heathrow`}
            intentSegment="airport-transfer"
            href={attributedHeathrowUrl}
            ctaLabel="Check Heathrow Express tickets"
            compact
            eyebrow="Airport transfer"
          />
        </section>
      ) : null}

      {remainingParagraphs.length > 0 ? (
        <section className={styles.body} aria-label="Detailed answer continuation">
          {remainingParagraphs.map((paragraph, index) => (
            <p key={`${entry.slug}-${index + introParagraphs.length}`} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </section>
      ) : null}

      <section style={{ maxWidth: '760px', marginTop: '2.5rem' }}>
        <AdUnit layout="in-article" />
      </section>
    </main>
  )
}
