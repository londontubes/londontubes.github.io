import Link from 'next/link'
import type { Metadata } from 'next'

import styles from '../BlogArticle.module.css'
import { blogQuestions, getBlogQuestion } from '../content'

const BASE_URL = 'https://londontubes.co.uk'

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
      title: `${entry.question} – London Tube Blog`,
      description: entry.shortAnswer,
      type: 'article',
      url: `${BASE_URL}/blog/${params.slug}/`,
      siteName: 'London Tube Map',
      locale: 'en_GB',
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

  const articleUrl = `${BASE_URL}/blog/${entry.slug}/`

  const amberUrl = process.env.NEXT_PUBLIC_AMBER_UCL_AFFILIATE_URL
  const heathrowUrl = process.env.NEXT_PUBLIC_GYG_HEATHROW_EXPRESS_AFFILIATE_URL

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.question,
    description: entry.shortAnswer,
    url: articleUrl,
    publisher: {
      '@type': 'Organization',
      name: 'London Tube Map',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  }

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog/` },
      { '@type': 'ListItem', position: 3, name: entry.question, item: articleUrl },
    ],
  }

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <header className={styles.header}>
        <p className={styles.breadcrumb}>
          <Link href="/blog/">Blog</Link> / <span>{entry.question}</span>
        </p>
        <h1 className={styles.title}>{entry.question}</h1>
        <p className={styles.lead}>{entry.shortAnswer}</p>
      </header>

      <section className={styles.body} aria-label="Detailed answer">
        {entry.body.map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </section>

      {entry.ctaSlot === 'student-housing' && amberUrl && (
        <aside className={styles.articleCta}>
          <h4>Find a Student Room Near Your Campus</h4>
          <p>
            Compare verified student flats, studios, and en-suite rooms near London universities
            on Amber. Filter by university, budget, and move-in date — no agency fees.
          </p>
          <a href={amberUrl} target="_blank" rel="noopener noreferrer nofollow sponsored">
            Browse student rooms on Amber →
          </a>
        </aside>
      )}

      {entry.ctaSlot === 'heathrow-express' && heathrowUrl && (
        <aside className={styles.articleCta}>
          <h4>Getting to London from Heathrow?</h4>
          <p>
            Skip the 60-minute Piccadilly line. Book the Heathrow Express for a guaranteed seat
            and 15-minute journey into Paddington.
          </p>
          <a href={heathrowUrl} target="_blank" rel="noopener noreferrer nofollow sponsored">
            Book Heathrow Express tickets →
          </a>
        </aside>
      )}
    </main>
  )
}
