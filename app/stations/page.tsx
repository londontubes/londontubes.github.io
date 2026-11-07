import Link from 'next/link'
import type { Metadata } from 'next'

import { SITE_URL, getAllLines, getAllStationsSorted, getModeLabel } from '@/app/lib/seo/stationPages'
import styles from './Stations.module.css'

const title = 'All London stations A–Z: Tube, Elizabeth line, DLR, Overground & Tram'
const description =
  'Every London Underground, Elizabeth line, DLR, London Overground and London Trams station from A to Z, with lines, fare zones, journey times and nearby stations.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/stations/' },
  openGraph: { title, description, type: 'website', url: `${SITE_URL}/stations/` },
}

export default function StationsIndexPage() {
  const stations = getAllStationsSorted()
  const lines = getAllLines()
  const byLetter = new Map<string, typeof stations>()
  for (const entry of stations) {
    const letter = /[a-z]/i.test(entry.name[0]) ? entry.name[0].toUpperCase() : '#'
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), entry])
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${SITE_URL}/stations/`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: stations.length,
      itemListElement: stations.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: entry.name,
        url: `${SITE_URL}/stations/${entry.slug}/`,
      })),
    },
  }

  const modeCounts = [...new Set(lines.map((l) => l.mode))].map((mode) => ({
    mode,
    lines: lines.filter((l) => l.mode === mode).length,
  }))

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">London Tube Map</Link> › Stations
        </nav>
        <h1 className={styles.title}>London stations A–Z</h1>
        <p className={styles.lead}>
          {stations.length} stations and stops across {lines.length} lines:{' '}
          {modeCounts.map((m, i) => `${i ? ', ' : ''}${getModeLabel(m.mode)}`).join('')}. Each page lists the lines,
          fare zone, nearby stations and typical journey times into central London.
        </p>
        <p><Link href="/lines/" className={styles.buttonGhost}>Browse by line</Link></p>

        {[...byLetter.entries()].map(([letter, entries]) => (
          <section key={letter} className={styles.section} aria-labelledby={`letter-${letter}`}>
            <h2 id={`letter-${letter}`}>{letter}</h2>
            <ul className={`${styles.list} ${styles.columns}`}>
              {entries.map((entry) => (
                <li key={entry.slug}><Link href={`/stations/${entry.slug}/`}>{entry.name}</Link></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
