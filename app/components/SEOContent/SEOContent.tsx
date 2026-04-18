'use client'

import type { MouseEvent } from 'react'
import styles from './SEOContent.module.css'
import AdUnit from '@/app/components/ads/AdUnit'
import { trackAmazonClick, trackAmberClick, trackGygClick, trackHeathrowExpressCtaClick } from '@/app/lib/analytics'
import { buildAmazonSearchUrl, getGygExperienceUrl, withRevenueAttribution } from '@/app/lib/revenue'
import type { GygExperienceKey, RevenueIntentSegment } from '@/app/lib/revenue'

interface GygCtaConfig {
  key: GygExperienceKey
  label: string
  description: string
  intentSegment: RevenueIntentSegment
  placement: string
  envVarName: string
}

const AIRPORT_TRANSFER_CTAS: GygCtaConfig[] = [
  {
    key: 'stansted-express',
    label: 'Stansted Express',
    description: 'London Liverpool Street in 45 minutes',
    intentSegment: 'airport-transfer',
    placement: 'seo-content-stansted',
    envVarName: 'NEXT_PUBLIC_GYG_STANSTED_EXPRESS_AFFILIATE_URL',
  },
  {
    key: 'gatwick-transfer',
    label: 'Gatwick Airport bus transfer',
    description: 'Direct coach to central London, budget-friendly',
    intentSegment: 'airport-transfer',
    placement: 'seo-content-gatwick',
    envVarName: 'NEXT_PUBLIC_GYG_GATWICK_TRANSFER_AFFILIATE_URL',
  },
]

const LONDON_EXPERIENCE_CTAS: GygCtaConfig[] = [
  {
    key: 'london-pass',
    label: 'The London Pass',
    description: 'Entry to 100+ attractions including the London Eye',
    intentSegment: 'tourist-experiences',
    placement: 'seo-content-london-pass',
    envVarName: 'NEXT_PUBLIC_GYG_LONDON_PASS_AFFILIATE_URL',
  },
  {
    key: 'tower-of-london',
    label: 'Tower of London & Crown Jewels',
    description: 'Skip-the-line entry to one of London\u2019s most iconic sights',
    intentSegment: 'tourist-experiences',
    placement: 'seo-content-tower-of-london',
    envVarName: 'NEXT_PUBLIC_GYG_TOWER_OF_LONDON_AFFILIATE_URL',
  },
  {
    key: 'thames-cruise',
    label: 'Westminster \u2192 Greenwich Thames cruise',
    description: 'See the city from the river on the way to Greenwich',
    intentSegment: 'tourist-experiences',
    placement: 'seo-content-thames-cruise',
    envVarName: 'NEXT_PUBLIC_GYG_THAMES_CRUISE_AFFILIATE_URL',
  },
  {
    key: 'harry-potter-tour',
    label: 'Harry Potter guided London tour',
    description: 'Half-day tour of filming locations across the city',
    intentSegment: 'tourist-experiences',
    placement: 'seo-content-harry-potter',
    envVarName: 'NEXT_PUBLIC_GYG_HARRY_POTTER_TOUR_AFFILIATE_URL',
  },
  {
    key: 'frameless',
    label: 'Frameless immersive art',
    description: 'Digital art gallery at Marble Arch',
    intentSegment: 'tourist-experiences',
    placement: 'seo-content-frameless',
    envVarName: 'NEXT_PUBLIC_GYG_FRAMELESS_AFFILIATE_URL',
  },
]

interface AmazonEssential {
  label: string
  query: string
  description: string
}

const AMAZON_ESSENTIALS: AmazonEssential[] = [
  {
    label: 'UK travel adapter',
    query: 'uk travel adapter type g',
    description: 'Safe mains adapters for anyone landing from a non-UK plug',
  },
  {
    label: 'RFID-blocking contactless wallet',
    query: 'rfid blocking contactless wallet slim',
    description: 'Protects contactless cards used as Tube/bus fares',
  },
  {
    label: 'Foldable London Tube map',
    query: 'london tube map poster a3',
    description: 'Printed map to pair with the interactive one',
  },
  {
    label: 'Packable rain jacket',
    query: 'packable rain jacket men women lightweight',
    description: 'Because this is London',
  },
]

const HEATHROW_EXPRESS_AFFILIATE_URL =
  process.env.NEXT_PUBLIC_GYG_HEATHROW_EXPRESS_AFFILIATE_URL

const AMBER_UCL_AFFILIATE_URL = process.env.NEXT_PUBLIC_AMBER_UCL_AFFILIATE_URL

const trackedHeathrowUrl = HEATHROW_EXPRESS_AFFILIATE_URL
  ? withRevenueAttribution(HEATHROW_EXPRESS_AFFILIATE_URL, {
      partner: 'heathrow-express',
      placement: 'seo-content-heathrow',
      intentSegment: 'airport-transfer',
    })
  : null

const trackedAmberUrl = AMBER_UCL_AFFILIATE_URL
  ? withRevenueAttribution(AMBER_UCL_AFFILIATE_URL, {
      partner: 'amber',
      placement: 'seo-content-amber',
      intentSegment: 'student-housing',
    })
  : null

export function SEOContent() {
  function affiliateLinkProps(
    url: string | null,
    labelForDev: string,
    onAffiliateClick?: () => void
  ) {
    if (url) {
      return {
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer nofollow sponsored',
        onClick: onAffiliateClick,
      }
    }

    return {
      href: '#',
      'aria-disabled': true as const,
      onClick: (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[SEOContent] Missing affiliate URL for: ${labelForDev}`)
        }
      },
    }
  }

  return (
    <section className={styles.seoSection}>
      <div className={styles.container}>
        <article className={styles.content}>
          <h2>London Tube Map 2026 – Free Interactive Underground, Elizabeth Line &amp; DLR Guide</h2>

          <p>
            Welcome to the most comprehensive <strong>interactive London Tube map</strong> online. Our
            map displays all 11 <strong>London Underground lines</strong>, the <strong>Elizabeth line</strong> (Crossrail),
            the <strong>DLR network</strong>, and over 330 stations across Greater London. Whether you&apos;re
            planning your daily commute, exploring tourist destinations, or finding the nearest tube station
            to London universities, our map provides the easiest way to navigate the capital&apos;s transport network.
          </p>

          <p>
            Our <strong>London Underground map 2026</strong> reflects the complete TfL network including
            the <strong>Elizabeth line</strong> running from Reading and Heathrow in the west through
            central London to Shenfield and Abbey Wood in the east. Unlike a static PDF, our interactive
            version lets you filter any line or station to get instant information — making it the most
            useful <strong>London tube map</strong> for daily commuters, tourists, and students alike.
          </p>

          <AdUnit layout="in-article" />

          <div className={styles.cta}>
            <h3>Need rent-focused guides instead of general map browsing?</h3>
            <p>
              Jump into our student accommodation hub for commute-led pages that connect universities,
              rental areas, and property-search shortcuts in one place.
            </p>
            <p>
              <a href="/student-accommodation/">Browse the student accommodation hub →</a>
            </p>
          </div>

          <h3>Why Use Our London Underground Map?</h3>
          
          <ul className={styles.features}>
            <li>
              <strong>Interactive Line Filtering:</strong> Filter any of the 11 tube lines
              (Bakerloo, Central, Circle, District, Hammersmith &amp; City, Jubilee, Metropolitan,
              Northern, Piccadilly, Victoria, Waterloo &amp; City) plus the Elizabeth line to view only that route
            </li>
            <li>
              <strong>University Transit Finder:</strong> Discover which tube stations serve major 
              London universities including UCL, Imperial College, LSE, King&apos;s College, QMUL, 
              City University, SOAS, and Westminster
            </li>
            <li>
              <strong>Station Information:</strong> Click any of the 330+ stations to see which
              lines serve that location and plan connections
            </li>
            <li>
              <strong>DLR Integration:</strong> View the complete Docklands Light Railway network 
              connecting East London, Canary Wharf, and London City Airport
            </li>
            <li>
              <strong>Mobile Optimized:</strong> Access the full London metro map on any device - 
              desktop, tablet, or smartphone
            </li>
            <li>
              <strong>Always Free:</strong> No registration, no payment required. 100% free London 
              tube map for everyone
            </li>
          </ul>

          <h3>About the London Underground Network</h3>
          
          <p>
            The <strong>London Underground</strong>, commonly known as the Tube, is the world&apos;s
            oldest metro system, serving Greater London since 1863. Today it operates 11 tube lines
            covering 402 kilometres (250 miles) with 272 stations across 9 fare zones. The <strong>Elizabeth
            line</strong> (Crossrail) adds another 41 stations spanning 118 km from Reading to Shenfield.
            Combined with the automated DLR system, London&apos;s rapid transit network carries over
            5 million passengers daily.
          </p>

          <h3>Key Transport Hubs & Popular Routes</h3>
          
          <div className={styles.routes}>
            <div className={styles.routeCard}>
              <h4>🛫 Airport Connections</h4>
              <p>
                <strong>Heathrow Airport:</strong> Elizabeth line or Piccadilly line direct to Zone 1 (30-60 minutes)<br />
                <strong>City Airport:</strong> DLR from Bank or Tower Gateway (20-25 minutes)
              </p>
            </div>

            <div className={styles.routeCard}>
              <h4>🎓 University Transit</h4>
              <p>
                <strong>UCL:</strong> Euston Square (Circle, H&C, Metropolitan)<br />
                <strong>Imperial College:</strong> South Kensington (Circle, District, Piccadilly)<br />
                <strong>LSE:</strong> Holborn (Central, Piccadilly) or Temple (Circle, District)
              </p>
            </div>

            <div className={styles.routeCard}>
              <h4>🎭 Tourist Destinations</h4>
              <p>
                <strong>British Museum:</strong> Holborn or Tottenham Court Road<br />
                <strong>Tower of London:</strong> Tower Hill (Circle, District)<br />
                <strong>West End Theatres:</strong> Leicester Square or Piccadilly Circus
              </p>
            </div>
          </div>

          <div className={styles.cta}>
            <h3>Heathrow to Central London in 15 Minutes</h3>
            <p>
              Skip the 60-minute Piccadilly line slog. Book the Heathrow Express or Elizabeth line in advance for guaranteed seats and luggage space.
            </p>
            <p>
              <a
                {...affiliateLinkProps(
                  trackedHeathrowUrl,
                  'NEXT_PUBLIC_GYG_HEATHROW_EXPRESS_AFFILIATE_URL',
                  () => trackHeathrowExpressCtaClick(),
                )}
              >
                Book Heathrow Express Tickets →
              </a>
            </p>
          </div>

          <div className={styles.cta}>
            <h3>Find a Room Near UCL in 48 Hours</h3>
            <p>
              Compare verified student flats and studio apartments within a 15-minute commute using Amberstudent. Filter by budget, ensuite, and move-in dates.
            </p>
            <p>
              <a
                {...affiliateLinkProps(
                  trackedAmberUrl,
                  'NEXT_PUBLIC_AMBER_UCL_AFFILIATE_URL',
                  () =>
                    trackAmberClick('home-seo-content', {
                      placement: 'seo-content-amber',
                      intentSegment: 'student-housing',
                      href: trackedAmberUrl ?? undefined,
                    }),
                )}
              >
                Browse UCL Rooms on Amber →
              </a>
            </p>
          </div>

          <div className={styles.cta}>
            <h3>Other Airport Transfers</h3>
            <p>
              Not flying into Heathrow? These alternative airport transfers skip the stress of unfamiliar public transit after a long flight.
            </p>
            <ul>
              {AIRPORT_TRANSFER_CTAS.map((cta) => {
                const rawUrl = getGygExperienceUrl(cta.key)
                const url = rawUrl
                  ? withRevenueAttribution(rawUrl, {
                      partner: 'getyourguide',
                      placement: cta.placement,
                      intentSegment: cta.intentSegment,
                    })
                  : null
                return (
                  <li key={cta.key}>
                    <a
                      {...affiliateLinkProps(
                        url,
                        cta.envVarName,
                        () =>
                          trackGygClick(cta.key, {
                            placement: cta.placement,
                            intentSegment: cta.intentSegment,
                            href: url ?? undefined,
                          }),
                      )}
                    >
                      {cta.label} &rarr;
                    </a>
                    <span> {cta.description}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className={styles.cta}>
            <h3>Popular London Experiences</h3>
            <p>
              The highest-value London experiences by visitor reviews &mdash; skip-the-line passes for icons, Thames cruises for the classic skyline view, and a few distinctive tours.
            </p>
            <ul>
              {LONDON_EXPERIENCE_CTAS.map((cta) => {
                const rawUrl = getGygExperienceUrl(cta.key)
                const url = rawUrl
                  ? withRevenueAttribution(rawUrl, {
                      partner: 'getyourguide',
                      placement: cta.placement,
                      intentSegment: cta.intentSegment,
                    })
                  : null
                return (
                  <li key={cta.key}>
                    <a
                      {...affiliateLinkProps(
                        url,
                        cta.envVarName,
                        () =>
                          trackGygClick(cta.key, {
                            placement: cta.placement,
                            intentSegment: cta.intentSegment,
                            href: url ?? undefined,
                          }),
                      )}
                    >
                      {cta.label} &rarr;
                    </a>
                    <span> {cta.description}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className={styles.cta}>
            <h3>London Travel Essentials on Amazon</h3>
            <p>
              A short list of what most visitors and new arrivals end up buying in their first week — contactless-safe wallets, UK plug adapters, a printed Tube map, and a packable raincoat.
            </p>
            <ul>
              {AMAZON_ESSENTIALS.map((item) => {
                const url = buildAmazonSearchUrl(item.query)
                return (
                  <li key={item.label}>
                    <a
                      {...affiliateLinkProps(
                        url,
                        'NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG',
                        () =>
                          trackAmazonClick(item.label, {
                            placement: 'seo-content-amazon',
                            intentSegment: 'travel-essentials',
                            href: url ?? undefined,
                          }),
                      )}
                    >
                      {item.label} →
                    </a>
                    <span> {item.description}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <h3>London Tube Zones Explained</h3>
          
          <p>
            The TfL network operates across <strong>9 fare zones</strong>. Zone 1 covers central 
            London attractions (Westminster, Covent Garden, Liverpool Street), while zones 2-6 
            extend to suburbs like Wimbledon, Stratford, and Heathrow Airport. Zones 7-9 reach 
            the outermost areas of Greater London. Fares are calculated based on the zones traveled, 
            with Oyster card and contactless payment offering the best value.
          </p>

          <h3>Night Tube Services</h3>
          
          <p>
            <strong>Night Tube</strong> services run on Friday and Saturday nights on five lines: 
            Central, Jubilee, Northern, Piccadilly, and Victoria. These 24-hour services connect 
            central London with suburbs throughout the night, perfect for weekend entertainment 
            and shift workers. Use our line filter to view these specific routes.
          </p>

          <h3>London Tube Map PDF &amp; Official Resources</h3>

          <p>
            Prefer a printable version? The official <strong>TfL tube map PDF</strong> is available from
            Transport for London. Our interactive map complements the paper version with real-time filtering,
            journey planning, and university station data that a static map cannot provide. Bookmark this
            page as your go-to <strong>London Underground map</strong> for fast, mobile-friendly access at
            any time.
          </p>

          <h3>Start Exploring the London Underground</h3>
          
          <p>
            Use the interactive map above to plan your journey across London. Filter by specific 
            tube lines, find connections between stations, or use our University Filter page to 
            discover which campuses are nearest to Underground and DLR stations. Whether you&apos;re 
            a tourist, student, or daily commuter, our London tube map makes navigating the 
            capital simple and stress-free.
          </p>

          <div className={styles.cta}>
            <p>
              <strong>Looking for university transit options?</strong>{' '}
              <a href="/universities/">View our Universities Tube Map →</a>
            </p>
          </div>

          <AdUnit layout="in-article" style={{ marginTop: '2rem' }} />
        </article>

        <aside className={styles.keywords}>
          <p className={styles.keywordText}>
            <small>
              <strong>Related searches:</strong> london tube map 2026, london underground map 2026,
              interactive tube map, tfl map, london metro map, london subway map, elizabeth line map,
              crossrail map, dlr map, tube stations, underground lines, night tube, tube zones,
              nearest tube station, london transport map, london underground stations, 2026 tube map,
              map of london underground 2026, london interactive tube map, mapa metro de londres,
              mapa metro londres, elizabeth line stations, piccadilly line, central line,
              northern line, victoria line, jubilee line, district line, circle line,
              bakerloo line, metropolitan line, hammersmith city line, waterloo city line,
              heathrow tube, university tube stations
            </small>
          </p>
          <div className={styles.sidebarAd}>
            <AdUnit style={{ minHeight: '250px' }} />
          </div>
        </aside>
      </div>
    </section>
  )
}

export default SEOContent
