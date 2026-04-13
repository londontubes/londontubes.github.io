import type { Metadata } from 'next'

import AdHealthClient from './AdHealthClient'
import styles from './AdHealthPage.module.css'

export const metadata: Metadata = {
  title: 'Ad Health Check',
  description: 'Internal AdSense diagnostics page for London Tube Map.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-image-preview': 'none',
      'max-snippet': 0,
    },
  },
}

export default function AdHealthPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Internal Revenue Ops</p>
          <h1>Ad health check</h1>
          <p>
            Use this page to confirm that AdSense is injected globally, consent is not silently blocking ad storage, and slot shells are rendering with visible height.
          </p>
          <div className={styles.meta}>
            <span className={styles.pill}>Noindex route</span>
            <span className={styles.pill}>Client-side DOM diagnostics</span>
            <span className={styles.pill}>Live preview slot</span>
          </div>
        </section>

        <AdHealthClient />
      </div>
    </main>
  )
}