import Link from 'next/link'
import type { Metadata } from 'next'

import styles from './BlogPage.module.css'
import { blogQuestions } from './content'

export const metadata: Metadata = {
  title: 'London Tube Blog – Your London FAQs Answered',
  description:
    'Discover clear, practical answers to common questions about London: where to visit, what to do, how the weather feels and more – all in an easy FAQ style.',
}

export default function BlogPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>London FAQ blog</p>
        <h1 className={styles.title}>Answers to the questions people actually ask about London</h1>
        <p className={styles.lead}>
          A simple, no‑nonsense guide to London. Start with these quick answers,
          then dive into a full page for each question when you need more detail.
        </p>
      </header>

      <section className={styles.grid} aria-label="London frequently asked questions">
        {blogQuestions.map((q) => (
          <article key={q.slug} className={styles.card}>
            <Link href={`/blog/${q.slug}`} className={styles.cardLink}>
              <h2 className={styles.cardQuestion}>{q.question}</h2>
              <p className={styles.cardExcerpt}>{q.shortAnswer}</p>
              <span className={styles.cardMeta}>
                <span>Read full answer</span>
                <span>→</span>
              </span>
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
