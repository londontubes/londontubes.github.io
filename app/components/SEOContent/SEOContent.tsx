'use client'

import styles from './SEOContent.module.css'

export function SEOContent() {
  return (
    <section className={styles.seoSection}>
      <div className={styles.container}>
        <article className={styles.content}>
          <h2>Interactive London Tube Map 2025 - Your Complete Underground Network Guide</h2>
          
          <p>
            Welcome to the most comprehensive <strong>London Tube Map</strong> online. Our interactive 
            map displays all 11 <strong>London Underground lines</strong>, the <strong>DLR network</strong>, 
            and over 270 stations across Greater London. Whether you're planning your daily commute, 
            exploring tourist destinations, or finding the nearest tube station to London universities, 
            our map provides the easiest way to navigate the capital's transport network.
          </p>

          <h3>Why Use Our London Underground Map?</h3>
          
          <ul className={styles.features}>
            <li>
              <strong>Interactive Line Filtering:</strong> Click any of the 11 tube lines 
              (Bakerloo, Central, Circle, District, Hammersmith & City, Jubilee, Metropolitan, 
              Northern, Piccadilly, Victoria, Waterloo & City) to view only that route
            </li>
            <li>
              <strong>University Transit Finder:</strong> Discover which tube stations serve major 
              London universities including UCL, Imperial College, LSE, King's College, QMUL, 
              City University, SOAS, and Westminster
            </li>
            <li>
              <strong>Station Information:</strong> Click any of the 270+ stations to see which 
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
            The <strong>London Underground</strong>, commonly known as the Tube, is the world's 
            oldest metro system, serving Greater London since 1863. Today it operates 11 lines 
            covering 402 kilometers (250 miles) with 270 stations across 9 fare zones. Combined 
            with the automated DLR system, London's rapid transit network carries over 5 million 
            passengers daily.
          </p>

          <h3>Key Transport Hubs & Popular Routes</h3>
          
          <div className={styles.routes}>
            <div className={styles.routeCard}>
              <h4>🛫 Airport Connections</h4>
              <p>
                <strong>Heathrow Airport:</strong> Piccadilly line direct to Zone 1 (45-60 minutes)<br />
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

          <h3>Start Exploring the London Underground</h3>
          
          <p>
            Use the interactive map above to plan your journey across London. Filter by specific 
            tube lines, find connections between stations, or use our University Filter page to 
            discover which campuses are nearest to Underground and DLR stations. Whether you're 
            a tourist, student, or daily commuter, our London tube map makes navigating the 
            capital simple and stress-free.
          </p>

          <div className={styles.cta}>
            <p>
              <strong>Looking for university transit options?</strong>{' '}
              <a href="/universities">View our Universities Tube Map →</a>
            </p>
          </div>
        </article>

        <aside className={styles.keywords}>
          <p className={styles.keywordText}>
            <small>
              <strong>Related searches:</strong> london tube map, london underground map, 
              tfl map, london metro map, london subway map, tube stations, underground lines, 
              dlr map, night tube, tube zones, nearest tube station, london transport map, 
              interactive tube map, london underground stations, piccadilly line, central line, 
              northern line, victoria line, jubilee line, district line, circle line, 
              bakerloo line, metropolitan line, hammersmith city line, waterloo city line, 
              heathrow tube, university tube stations
            </small>
          </p>
        </aside>
      </div>
    </section>
  )
}

export default SEOContent
