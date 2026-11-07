import Link from 'next/link'
import type { Metadata } from 'next'

import { SITE_URL, getAllLines, getLinePageData, getModeLabel, readableTextColor } from '@/app/lib/seo/stationPages'
import type { TransitLine } from '@/app/types/transit'
import styles from '../stations/Stations.module.css'

const title = 'London lines: Tube, Elizabeth line, DLR, Overground & Tram'
const description =
  'Every London Underground line, the Elizabeth line, DLR, the six London Overground lines and London Trams, with station lists in order, fare zones and interchanges.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/lines/' },
  openGraph: { title, description, type: 'website', url: `${SITE_URL}/lines/` },
}

const MODE_ORDER: TransitLine['mode'][] = ['tube', 'elizabeth-line', 'dlr', 'overground', 'tram']

export default function LinesIndexPage() {
  const lines = getAllLines()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${SITE_URL}/lines/`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: lines.length,
      itemListElement: lines.map((line, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: line.displayName,
        url: `${SITE_URL}/lines/${line.lineCode}/`,
      })),
    },
  }

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">London Tube Map</Link> › Lines
        </nav>
        <h1 className={styles.title}>London lines</h1>
        <p className={styles.lead}>
          {lines.length} lines across the London Underground, Elizabeth line, DLR, London Overground and London Trams. Pick a
          line to see every station in order, its fare zones and where to change.
        </p>
        <p><Link href="/stations/" className={styles.buttonGhost}>Browse stations A–Z</Link></p>

        {MODE_ORDER.map((mode) => {
          const modeLines = lines.filter((l) => l.mode === mode)
          if (!modeLines.length) return null
          return (
            <section key={mode} className={styles.section}>
              <h2>{getModeLabel(mode)}</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr><th scope="col">Line</th><th scope="col">Stations</th><th scope="col">Routes</th></tr>
                  </thead>
                  <tbody>
                    {modeLines.map((line) => {
                      const data = getLinePageData(line.lineCode)
                      return (
                        <tr key={line.lineCode}>
                          <td>
                            <Link href={`/lines/${line.lineCode}/`} className={styles.chip} style={{ backgroundColor: line.brandColor, color: readableTextColor(line.brandColor, line.textColor) }}>
                              {line.displayName}
                            </Link>
                          </td>
                          <td>{data?.stations.length ?? 0}</td>
                          <td>{data?.routes.map((r) => r.name).slice(0, 2).join('; ')}{(data?.routes.length ?? 0) > 2 ? ' …' : ''}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
