import AdUnit from '@/app/components/ads/AdUnit'
import styles from './SEOContent.module.css'

export function PropertySEOContent() {
  return (
    <section className={styles.seoSection}>
      <div className={styles.container}>
        <article className={styles.content}>
          <h2>London Property Map by Tube Station</h2>

          <p>
            This property page is designed for people comparing <strong>where to live in London by station</strong>,
            not just browsing a map. It combines London Underground, Elizabeth line, and DLR stations with sampled
            <strong> rental prices</strong> and <strong>sale prices</strong> taken from listings within roughly
            <strong> 0.5 miles</strong> of each station so you can shortlist areas faster.
          </p>

          <p>
            That makes it useful for two common searches: people trying to work out <strong>which London areas are
            cheaper on the Tube</strong>, and people who already know their commute target but need to compare station
            clusters before opening Rightmove or Zoopla. Instead of treating transport and housing as separate tasks,
            the page keeps them in the same workflow.
          </p>

          <AdUnit layout="in-article" />

          <h3>What the property filter helps you answer</h3>

          <ul className={styles.features}>
            <li>
              <strong>Which tube stations have lower rents:</strong> Compare sampled median monthly rent near stations
              across Underground, Elizabeth line, and DLR corridors.
            </li>
            <li>
              <strong>Which areas look cheaper to buy:</strong> Use sampled sale-price summaries to spot stations that
              may offer better value than nearby central alternatives.
            </li>
            <li>
              <strong>Where commute and budget overlap:</strong> Move from station pricing into property-search portals
              once a shortlist looks realistic.
            </li>
            <li>
              <strong>How to narrow London quickly:</strong> Start with stations, not boroughs, when your real decision
              is daily travel plus housing cost.
            </li>
          </ul>

          <h3>How to use the property page properly</h3>

          <div className={styles.routes}>
            <div className={styles.routeCard}>
              <h4>1. Start with a line corridor</h4>
              <p>
                If you already know the part of London you need, begin with the stations on that corridor. This works
                especially well for Elizabeth line, Jubilee, Northern, and Piccadilly line trade-offs where prices can
                shift noticeably within a few stops.
              </p>
            </div>

            <div className={styles.routeCard}>
              <h4>2. Compare station clusters</h4>
              <p>
                Look for groups of nearby stations with similar travel benefits but different rent or sale samples. That
                is often where the best value appears, especially when one stop sits just outside the obvious search zone.
              </p>
            </div>

            <div className={styles.routeCard}>
              <h4>3. Open live listings only after the shortlist</h4>
              <p>
                The station cards link into property portals so you can move into real inventory after the map has already
                filtered the city down to places that fit your travel pattern.
              </p>
            </div>
          </div>

          <h3>Useful London housing questions this page supports</h3>

          <p>
            People usually land here with questions like <strong>cheap places to live on the Elizabeth line</strong>,
            <strong> best tube stations for renters</strong>, <strong>areas near central London with lower rent</strong>,
            or <strong>where to buy near a tube station without paying Zone 1 prices</strong>. The point of the page is
            not to replace a property portal. It is to make the first decision, which is which part of London deserves
            your attention, much faster and less guessy.
          </p>

          <div className={styles.cta}>
            <h3>Comparing student areas rather than general renting?</h3>
            <p>
              Use the universities commute filter if your housing search depends on getting to UCL, Imperial, LSE,
              King&apos;s, QMUL, SOAS, City, or Westminster on a practical daily route.
            </p>
            <p>
              <a href="/universities/">Open the universities commute map →</a>
            </p>
          </div>

          <div className={styles.cta}>
            <h3>Need commute-led housing guides with station shortcuts?</h3>
            <p>
              The student accommodation hub turns the map into page-by-page area guides with internal links and direct
              rental-search shortcuts for high-intent housing research.
            </p>
            <p>
              <a href="/student-accommodation/">Browse the accommodation hub →</a>
            </p>
          </div>

          <AdUnit layout="in-article" style={{ marginTop: '2rem' }} />
        </article>

        <aside className={styles.keywords}>
          <p className={styles.keywordText}>
            <small>
              <strong>Related searches:</strong> london property map by tube station, london rent by station,
              london house prices near tube stations, cheapest tube stations to rent, elizabeth line property prices,
              london commuter property search, rightmove tube station search, zoopla tube station search,
              where to live in london by commute and rent, london station rent comparison, london station sale price map
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

export default PropertySEOContent