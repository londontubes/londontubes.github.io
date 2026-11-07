import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { buildRightmoveStationUrls, buildZooplaStationUrl, buildZooplaStationBuyUrl } from '@/app/lib/map/propertySearch'
import {
  SITE_URL,
  cleanStationName,
  formatPounds,
  formatZone,
  getAllStationSlugs,
  getStationPageData,
  PRICE_SAMPLE_RENT_SCOPE,
  PRICE_SAMPLE_SALE_SCOPE,
  readableTextColor,
  type StationPageData,
} from '@/app/lib/seo/stationPages'
import styles from '../Stations.module.css'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllStationSlugs().map((slug) => ({ slug }))
}

function isTramOnly(data: StationPageData) {
  return data.lines.length === 1 && data.lines[0].lineCode === 'tram'
}

function stationNoun(data: StationPageData) {
  return isTramOnly(data) ? 'tram stop' : 'station'
}

function listLines(data: StationPageData) {
  const names = data.lines.map((l) => (l.mode === 'tube' ? `${l.displayName} line` : l.displayName))
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

function summary(data: StationPageData) {
  const zone = data.zone ? ` in ${formatZone(data.zone)}` : ''
  if (isTramOnly(data)) {
    return `${data.name} is a stop on the London Trams network in south London. Trams charge a flat fare, the same as London buses, so there are no fare zones.`
  }
  const lineCount = data.lines.length
  const served = lineCount === 1
    ? `served by the ${listLines(data)}`
    : `an interchange served by ${lineCount} lines: the ${listLines(data)}`
  return `${data.name} is a ${data.modes.join(' and ')} ${stationNoun(data)}${zone}, ${served}.`
}

function buildFaq(data: StationPageData) {
  const faq: { q: string; a: string }[] = [
    { q: `Which lines serve ${data.name}?`, a: `${data.name} is served by the ${listLines(data)}.` },
  ]
  if (data.zone) {
    faq.push({ q: `What zone is ${data.name} in?`, a: `${data.name} is in ${formatZone(data.zone)} of the TfL fare zones.` })
  }
  const bank = data.journeys.find((j) => j.hub.stationId === 'HUBBAN')
  const oxford = data.journeys.find((j) => j.hub.stationId === '940GZZLUOXC')
  for (const j of [bank, oxford]) {
    if (!j) continue
    faq.push({
      q: `How long does it take from ${data.name} to ${cleanStationName(j.hub.displayName)}?`,
      a: `About ${j.minutes} minutes on the train${j.changes ? ` with ${j.changes} change${j.changes > 1 ? 's' : ''}` : ' with no changes'}, based on typical rush-hour run times. Allow extra time for waiting and walking between platforms.`,
    })
  }
  if (data.nearby[0]) {
    faq.push({
      q: `What is the nearest station to ${data.name}?`,
      a: `${cleanStationName(data.nearby[0].station.displayName)} is about ${data.nearby[0].distanceMiles} miles away, roughly a ${data.nearby[0].walkMinutes}-minute walk.`,
    })
  }
  if (data.price?.medianRentPcm) {
    faq.push({
      q: `How much is rent near ${data.name}?`,
      a: `In our latest sample of ${data.price.rentListingCount} Rightmove listings within half a mile of ${data.name} (${PRICE_SAMPLE_RENT_SCOPE}), the median asking rent was ${formatPounds(data.price.medianRentPcm)} per month.`,
    })
  }
  return faq
}

export function generateMetadata({ params }: PageProps): Metadata {
  const data = getStationPageData(params.slug)
  if (!data) return { title: 'Station not found' }

  const noun = stationNoun(data)
  const title = data.zone
    ? `${data.name} ${noun}: lines, zone, map & journey times`
    : `${data.name} ${noun}: lines, map & journey times`
  const description = `${summary(data)} Journey times, nearby stations${data.price ? ', local rents' : ''} and an interactive map.`

  return {
    title,
    description,
    alternates: { canonical: `/stations/${data.slug}/` },
    openGraph: { title, description, type: 'website', url: `${SITE_URL}/stations/${data.slug}/` },
    twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/opengraph-image`] },
  }
}

export default function StationPage({ params }: PageProps) {
  const data = getStationPageData(params.slug)
  if (!data) notFound()

  const url = `${SITE_URL}/stations/${data.slug}/`
  const [lng, lat] = data.station.position.coordinates
  const faq = buildFaq(data)
  const rightmove = buildRightmoveStationUrls(data.station)[0]?.url ?? null
  const zooplaRent = buildZooplaStationUrl(data.station)
  const zooplaBuy = buildZooplaStationBuyUrl(data.station)
  const schemaType = data.lines.every((l) => l.mode === 'tube') ? 'SubwayStation' : 'TrainStation'

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': schemaType,
      '@id': `${url}#station`,
      name: `${data.name} ${stationNoun(data)}`,
      url,
      description: summary(data),
      geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng },
      address: { '@type': 'PostalAddress', addressLocality: 'London', addressCountry: 'GB' },
      containedInPlace: { '@type': 'City', name: 'London' },
      publicAccess: true,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'London Tube Map', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Stations', item: `${SITE_URL}/stations/` },
        { '@type': 'ListItem', position: 3, name: data.name, item: url },
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
          <Link href="/">London Tube Map</Link> › <Link href="/stations/">Stations</Link> › {data.name}
        </nav>

        <h1 className={styles.title}>{data.name} {stationNoun(data)}</h1>
        <p className={styles.lead}>{summary(data)}</p>

        <ul className={styles.chips} aria-label="Lines">
          {data.lines.map((line) => (
            <li key={line.lineCode}>
              <Link
                href={`/lines/${line.lineCode}/`}
                className={styles.chip}
                style={{ backgroundColor: line.brandColor, color: readableTextColor(line.brandColor, line.textColor) }}
              >
                {line.displayName}
              </Link>
            </li>
          ))}
        </ul>

        <section className={styles.section}>
          <h2>Station facts</h2>
          <dl className={styles.facts}>
            <div><dt>Lines</dt><dd>{data.lines.length}</dd></div>
            <div>
              <dt>Fare zone</dt>
              <dd>{data.zone ? formatZone(data.zone) : isTramOnly(data) ? 'None (flat tram fare)' : 'Outside TfL zones'}</dd>
            </div>
            <div><dt>Network</dt><dd>{data.modes.join(', ')}</dd></div>
            <div><dt>Location</dt><dd>{lat.toFixed(4)}, {lng.toFixed(4)}</dd></div>
          </dl>
        </section>

        {data.journeys.length > 0 && (
          <section className={styles.section}>
            <h2>Journey times from {data.name}</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th scope="col">To</th><th scope="col">Time on train</th><th scope="col">Changes</th></tr>
                </thead>
                <tbody>
                  {data.journeys.map((j) => (
                    <tr key={j.hub.stationId}>
                      <td><Link href={`/stations/${j.hubSlug}/`}>{cleanStationName(j.hub.displayName)}</Link></td>
                      <td>{j.minutes} min</td>
                      <td>{j.changes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.note}>
              Estimated in-train time from typical weekday rush-hour Tube and Elizabeth line run times. Waiting and
              walking between platforms are not included.
            </p>
          </section>
        )}

        {data.nearby.length > 0 && (
          <section className={styles.section}>
            <h2>Stations near {data.name}</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th scope="col">Station</th><th scope="col">Distance</th><th scope="col">Walk</th></tr>
                </thead>
                <tbody>
                  {data.nearby.map((n) => (
                    <tr key={n.station.stationId}>
                      <td><Link href={`/stations/${n.slug}/`}>{cleanStationName(n.station.displayName)}</Link></td>
                      <td>{n.distanceMiles} mi</td>
                      <td>~{n.walkMinutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2>Renting or buying near {data.name}</h2>
          {data.price?.medianRentPcm || data.price?.medianSalePrice ? (
            <>
              {data.price.medianRentPcm ? (
                <p>
                  Median asking rent within half a mile: <strong>{formatPounds(data.price.medianRentPcm)} pcm</strong>{' '}
                  ({data.price.rentListingCount} listings; {PRICE_SAMPLE_RENT_SCOPE}).
                </p>
              ) : null}
              {data.price.medianSalePrice ? (
                <p>
                  Median asking price within half a mile: <strong>{formatPounds(data.price.medianSalePrice)}</strong>{' '}
                  ({data.price.saleListingCount} listings; {PRICE_SAMPLE_SALE_SCOPE}).
                </p>
              ) : null}
            </>
          ) : (
            <p>Search current homes to rent or buy within half a mile of the {stationNoun(data)}.</p>
          )}
          <div className={styles.actions}>
            {rightmove && <a className={styles.button} href={rightmove} rel="noopener" target="_blank">Rightmove rentals</a>}
            {zooplaRent && <a className={styles.buttonGhost} href={zooplaRent} rel="noopener" target="_blank">Zoopla rentals</a>}
            {zooplaBuy && <a className={styles.buttonGhost} href={zooplaBuy} rel="noopener" target="_blank">Zoopla homes for sale</a>}
          </div>
          {data.priceSampledAt && (
            <p className={styles.note}>
              Prices sampled from Rightmove listings on {new Date(data.priceSampledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </p>
          )}
        </section>

        {data.universities.length > 0 && (
          <section className={styles.section}>
            <h2>Universities near {data.name}</h2>
            <ul className={styles.list}>
              {data.universities.map((u) => (
                <li key={`${u.name}-${u.campus}`}>{u.name} ({u.campus}): {u.distanceMiles} mi</li>
              ))}
            </ul>
            <p><Link href="/universities/">Compare commutes to London universities</Link></p>
          </section>
        )}

        <section className={styles.section}>
          <h2>{data.name}: common questions</h2>
          <dl className={styles.faq}>
            {faq.map(({ q, a }) => (
              <div key={q}><dt>{q}</dt><dd>{a}</dd></div>
            ))}
          </dl>
        </section>

        <section className={styles.section}>
          <h2>See {data.name} on the map</h2>
          <p>Explore every Underground, Elizabeth line, DLR, Overground and Tram route on the free interactive London transport map.</p>
          <div className={styles.actions}>
            <Link className={styles.button} href="/">Open the interactive map</Link>
            <Link className={styles.buttonGhost} href="/stations/">All London stations</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
