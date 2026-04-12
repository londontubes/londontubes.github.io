'use client'

import type { MouseEvent } from 'react'
import styles from './SEOContent.module.css'
import { trackAmberClick } from '@/app/lib/analytics'
import { withRevenueAttribution } from '@/app/lib/revenue'

const AMBER_UCL_AFFILIATE_URL = process.env.NEXT_PUBLIC_AMBER_UCL_AFFILIATE_URL

const trackedAmberUrl = AMBER_UCL_AFFILIATE_URL
  ? withRevenueAttribution(AMBER_UCL_AFFILIATE_URL, {
      partner: 'amber',
      placement: 'universities-seo-amber',
      intentSegment: 'student-housing',
    })
  : null

function amberLinkProps(context: string) {
  if (trackedAmberUrl) {
    return {
      href: trackedAmberUrl,
      target: '_blank' as const,
      rel: 'noopener noreferrer nofollow sponsored',
      onClick: () =>
        trackAmberClick(context, {
          placement: 'universities-seo-amber',
          intentSegment: 'student-housing',
          href: trackedAmberUrl,
        }),
    }
  }
  return {
    href: '#',
    'aria-disabled': true as const,
    onClick: (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
  }
}

export function UniversitySEOContent() {
  return (
    <section className={styles.seoSection}>
      <div className={styles.container}>
        <article className={styles.content}>
          <h2>Best Areas to Live Near London Universities (Student Tube Map)</h2>

          <p>
            Choosing <strong>where to live as a student in London</strong> is easier when you
            can see real travel options. This university tube map shows campuses alongside
            nearby Underground and DLR stations so you can compare <strong>student-friendly
            neighbourhoods</strong>, walking distances, and tube journey times before you pick
            an area to live.
          </p>

          <h3>How to Use This University Filter Page</h3>
          <ul className={styles.features}>
            <li>
              <strong>Select your university or campus:</strong> Tap a university logo to focus
              the map on UCL, Imperial College London, LSE, King&apos;s College London, QMUL,
              City, SOAS, Westminster and more.
            </li>
            <li>
              <strong>Adjust walking time:</strong> Use the green walk-time control to see which
              stations are realistically walkable from campus (for example, 10 or 15 minutes on
              foot).
            </li>
            <li>
              <strong>Add tube time:</strong> Increase the purple tube-time slider to reveal
              stations that are a short Underground ride away on the <strong>same tube
              lines</strong> as your nearest green station.
            </li>
            <li>
              <strong>Compare potential areas to live:</strong> Look at clusters of green and
              purple stations to spot neighbourhoods with easy commutes to your lectures.
            </li>
          </ul>

          <h3>Popular Student Neighbourhoods by University</h3>
          <p>
            Below are some classic <strong>London student areas</strong> that many undergraduates
            and postgraduates consider when looking for a room, flatshare or halls. Use the map
            above to zoom in on each area and see exact tube connections.
          </p>

          <div className={styles.routes}>
            <div className={styles.routeCard}>
              <h4>UCL, SOAS &amp; Bloomsbury Universities</h4>
              <p>
                Popular areas to live include Camden, Kentish Town, Tufnell Park and Finsbury
                Park (Northern, Piccadilly and Victoria lines), as well as Bloomsbury and
                Euston itself. Use the map to explore stations like Euston Square, Warren Street
                and King&apos;s Cross St Pancras.
              </p>
            </div>

            <div className={styles.routeCard}>
              <h4>Imperial College London (South Kensington)</h4>
              <p>
                Many students look at Earl&apos;s Court, West Kensington, Fulham and Hammersmith for
                slightly more affordable rent while staying on the District, Piccadilly or
                Circle lines into South Kensington station.
              </p>
            </div>

            <div className={styles.routeCard}>
              <h4>LSE &amp; King&apos;s College London (Central London)</h4>
              <p>
                For LSE and KCL Strand campuses, students often compare Waterloo, London Bridge,
                Elephant &amp; Castle, Bermondsey, Clerkenwell and Mile End. The map helps you see
                fast links via the Northern, Jubilee, Bakerloo, Central and District lines.
              </p>
            </div>
          </div>

          <h3>Tips for Choosing a Student Area in London</h3>
          <ul className={styles.features}>
            <li>
              <strong>Prioritise journey time over distance:</strong> A slightly further zone can
              still be quick if you are near a fast tube line with few changes.
            </li>
            <li>
              <strong>Check last tube and Night Tube routes:</strong> If you plan late library
              sessions or nights out, make sure your line has good late services.
            </li>
            <li>
              <strong>Balance rent and commute:</strong> Areas like Zone 2/3 can offer cheaper
              rent while keeping your commute under 30–40 minutes door-to-door.
            </li>
          </ul>

          <p>
            Use this <strong>London student area finder</strong> as a starting point alongside
            official university accommodation guides and trusted housing platforms. The goal is
            to help you quickly see which tube stations and neighbourhoods make daily life at
            your London university practical and affordable.
          </p>

          <div className={styles.cta}>
            <h4>Prefer page-by-page housing guides?</h4>
            <p>
              Browse our student accommodation landing pages for university-specific commute advice,
              property-search shortcuts, and faster access to high-intent housing tools.
            </p>
            <p>
              <a href="/student-accommodation/">Open the student accommodation hub →</a>
            </p>
          </div>

          <div className={styles.cta}>
            <h4>Find Verified Student Rooms Near Your Campus</h4>
            <p>
              Once you have a shortlist of areas from the map, compare verified student flats,
              studios, and en-suite rooms on Amber. Filter by university, budget, and move-in
              date — and book directly without agency fees.
            </p>
            <p>
              <a {...amberLinkProps('universities-page')}>
                Browse student rooms on Amber →
              </a>
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}

export default UniversitySEOContent
