"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './BlogPage.module.css'
import { blogQuestions } from './content'

const AUTO_ADVANCE_MS = 8000

export function BlogPageClient() {
  const [activeIndex, setActiveIndex] = useState(0)

  const total = blogQuestions.length

  const goTo = (index: number) => {
    if (!total) return
    const next = ((index % total) + total) % total
    setActiveIndex(next)
  }

  const handleNext = () => goTo(activeIndex + 1)
  const handlePrev = () => goTo(activeIndex - 1)

  useEffect(() => {
    if (!total) return
    const id = setInterval(() => {
      setActiveIndex((prev) => ((prev + 1) % total))
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(id)
  }, [total])

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <p className={styles.kicker}>London FAQ blog</p>
          <h1 className={styles.title}>Answers to the questions people actually ask about London</h1>
          <p className={styles.lead}>
            A simple, no‑nonsense guide to London. Start with these quick answers,
            then dive into a full page for each question when you need more detail.
          </p>
        </header>

        <section className={styles.sliderSection} aria-label="Featured London questions slideshow">
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>Featured questions</h2>
          </div>

          <div className={styles.sliderShell}>
          <button
            type="button"
            className={styles.sliderArrow}
            onClick={handlePrev}
            aria-label="Show previous question"
          >
            ‹
          </button>

          <div className={styles.sliderViewport}>
            <div
              className={styles.sliderTrack}
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {blogQuestions.map((q) => (
                <article key={q.slug} className={styles.sliderCard}>
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
            </div>
          </div>

          <button
            type="button"
            className={styles.sliderArrow}
            onClick={handleNext}
            aria-label="Show next question"
          >
            ›
          </button>
        </div>

        <div className={styles.sliderDots} aria-hidden="true">
          {blogQuestions.map((q, index) => (
            <button
              key={q.slug}
              type="button"
              className={index === activeIndex ? styles.sliderDotActive : styles.sliderDot}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        </section>

        <section className={styles.allQuestionsSection} aria-label="All London frequently asked questions">
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>All questions</h2>
            <p className={styles.sectionSubtitle}>Browse every London FAQ in one place.</p>
          </div>

          <div className={styles.grid}>
            {blogQuestions.map((q) => (
              <article key={q.slug} className={styles.card}>
                <Link href={`/blog/${q.slug}`} className={styles.cardLink}>
                  <h3 className={styles.cardQuestion}>{q.question}</h3>
                  <p className={styles.cardExcerpt}>{q.shortAnswer}</p>
                  <span className={styles.cardMeta}>
                    <span>Read full answer</span>
                    <span>→</span>
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default BlogPageClient
