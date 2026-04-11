import Link from 'next/link'
import type { Metadata } from 'next'

import styles from '../BlogArticle.module.css'
import { blogQuestions, getBlogQuestion } from '../content'

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

  return (
    <main className={styles.page}>
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
    </main>
  )
}
