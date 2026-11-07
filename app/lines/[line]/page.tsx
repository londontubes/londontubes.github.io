import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { SITE_URL, getAllLines, getLinePageData, getModeLabel, readableTextColor, type LinePageData } from '@/app/lib/seo/stationPages'
import styles from '../../stations/Stations.module.css'

interface PageProps {
  params: { line: string }
}

export function generateStaticParams() {
  return getAllLines().map((line) => ({ line: line.lineCode }))
}

function lineName(data: LinePageData) {
  return data.line.mode === 'tube' ? `${data.line.displayName} line` : data.line.displayName
}

function summary(data: LinePageData) {
  if (data.line.mode === 'tram') {
    return `London Trams runs ${data.stations.length} stops across south London, centred on Croydon, on ${data.routes.length} routes: ${data.routes.map((r) => r.name).join('; ')}. Trams charge a flat fare, the same as buses, so there are no fare zones.`
  }
  const zones = data.zones.length
    ? ` It runs through ${data.zones.length === 1 ? `Zone ${data.zones[0]}` : `Zones ${data.zones[0]}–${data.zones[data.zones.length - 1]}`}`
    : ''
  const routes = data.routes.length
    ? `${zones ? ', with' : ' It has'} ${data.routes.length === 1 ? `one route: ${data.routes[0].name}` : `${data.routes.length} routes`}.`
    : zones ? '.' : ''
  return `The ${lineName(data)} is part of ${getModeLabel(data.line.mode)} with ${data.stations.length} stations, ${data.interchangeCount} of them interchanges with other lines.${zones}${routes}`
}

export function generateMetadata({ params }: PageProps): Metadata {
  const data = getLinePageData(params.line)
  if (!data) return { title: 'Line not found' }
  const title = `${lineName(data)} map & stations: all ${data.stations.length} stops in order`
  const description = `${summary(data)} See every station, fare zone and interchange on the interactive map.`
  return {
    title,
    description,
    alternates: { canonical: `/lines/${data.line.lineCode}/` },
    openGraph: { title, description, type: 'website', url: `${SITE_URL}/lines/${data.line.lineCode}/` },
  }
}

export default function LinePage({ params }: PageProps) {
  const data = getLinePageData(params.line)
  if (!data) notFound()

  const url = `${SITE_URL}/lines/${data.line.lineCode}/`
  const name = lineName(data)
  const faq = [
    { q: `How many stations are on the ${name}?`, a: `The ${name} has ${data.stations.length} stations.` },
    ...(data.routes.length
      ? [{ q: `Where does the ${name} go?`, a: `The ${name} runs ${data.routes.map((r) => r.name).join('; ')}.` }]
      : []),
    ...(data.zones.length && data.line.mode !== 'tram'
      ? [{ q: `Which fare zones does the ${name} serve?`, a: `The ${name} serves ${data.zones.length === 1 ? `Zone ${data.zones[0]}` : `Zones ${data.zones.join(', ')}`}.` }]
      : []),
    {
      q: `Where can I change from the ${name}?`,
      a: `${data.interchangeCount} stations on the ${name} connect with other lines, including ${data.stations
        .filter((s) => s.otherLines.length > 0)
        .sort((a, b) => b.otherLines.length - a.otherLines.length)
        .slice(0, 5)
        .map((s) => s.name)
        .join(', ')}.`,
    },
  ]

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${name} stations`,
      url,
      numberOfItems: data.stations.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: data.stations.map((s, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: s.name,
        url: `${SITE_URL}/stations/${s.slug}/`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'London Tube Map', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Lines', item: `${SITE_URL}/lines/` },
        { '@type': 'ListItem', position: 3, name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ]

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">London Tube Map</Link> › <Link href="/lines/">Lines</Link> › {name}
        </nav>
        <p style={{ margin: '0 0 0.5rem' }}>
          <span className={styles.chip} style={{ backgroundColor: data.line.brandColor, color: readableTextColor(data.line.brandColor, data.line.textColor) }}>
            {getModeLabel(data.line.mode)}
          </span>
        </p>
        <h1 className={styles.title}>{name} stations</h1>
        <p className={styles.lead}>{summary(data)}</p>

        {data.routes.length > 1 && (
          <section className={styles.section}>
            <h2>Routes</h2>
            <ul className={styles.list}>
              {data.routes.map((r) => <li key={r.name}>{r.name}</li>)}
            </ul>
          </section>
        )}

        <section className={styles.section}>
          <h2>All {data.stations.length} stations on the {name}</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th scope="col">#</th><th scope="col">Station</th><th scope="col">Zone</th><th scope="col">Change for</th></tr>
              </thead>
              <tbody>
                {data.stations.map((s, i) => (
                  <tr key={s.station.stationId}>
                    <td>{i + 1}</td>
                    <td><Link href={`/stations/${s.slug}/`}>{s.name}</Link></td>
                    <td>{s.zone ?? '–'}</td>
                    <td>
                      {s.otherLines.map((l, j) => (
                        <span key={l.lineCode}>
                          {j ? ', ' : ''}
                          <Link href={`/lines/${l.lineCode}/`}>{l.displayName}</Link>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>Stations are listed in route order, longest route first and then branches. Zones from TfL.</p>
        </section>

        <section className={styles.section}>
          <h2>{name}: common questions</h2>
          <dl className={styles.faq}>
            {faq.map(({ q, a }) => <div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}
          </dl>
        </section>

        <section className={styles.section}>
          <h2>See the {name} on the map</h2>
          <p>Filter the interactive map to the {name} to see its route alongside every other London line.</p>
          <div className={styles.actions}>
            <Link className={styles.button} href="/">Open the interactive map</Link>
            <Link className={styles.buttonGhost} href="/lines/">All London lines</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
