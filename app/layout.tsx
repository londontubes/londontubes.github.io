import type { Metadata, Viewport } from 'next'
import './globals.css'
import { NavigationTabs } from './components/NavigationTabs'

export const metadata: Metadata = {
  title: 'London Tube Map 2025 | Interactive Underground & DLR Network Map with Line Filter',
  description: 'Free interactive London Tube map showing all Underground, DLR & Overground lines. Find nearest stations, filter by line, view university locations. Real-time London metro map with 270+ stations across 11 lines. Plan your journey on the London subway network.',
  keywords: 'london tube map, london underground map, tfl map, london metro map, london subway map, tube stations, nearest tube station, london underground lines, dlr map, london transport map, interactive tube map, university tube stations',
  openGraph: {
    title: 'London Tube Map 2025 | Interactive Underground & DLR Line Filter',
    description: 'Interactive London Underground map with 270+ stations. Filter by tube line, find nearest stations to universities, explore the complete TfL network. Free London metro map.',
    type: 'website',
    siteName: 'London Tube Map',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'London Tube Map 2025 | Interactive Underground Network',
    description: 'Filter London Underground & DLR lines, find nearest tube stations, explore university transit options. 270+ stations, 11 lines.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://londontubes.co.uk',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-2691145261785175" />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2691145261785175"
          crossOrigin="anonymous"
        />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'London Tube Map',
              url: 'https://londontubes.co.uk',
              description: 'Interactive London Underground and DLR network map with line filtering and university transit finder',
              applicationCategory: 'NavigationApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'GBP',
              },
              creator: {
                '@type': 'Organization',
                name: 'London Tube Map',
              },
              keywords: 'london tube map, london underground, tfl map, metro map, subway map, tube stations, dlr map',
              inLanguage: 'en-GB',
              audience: {
                '@type': 'Audience',
                geographicArea: {
                  '@type': 'City',
                  name: 'London',
                  containedInPlace: {
                    '@type': 'Country',
                    name: 'United Kingdom',
                  },
                },
              },
            }),
          }}
        />
      </head>
      <body>
        {/* Basic SSR shell to avoid empty HTML responses */}
        <div id="app-shell">
          <NavigationTabs />
          {children}
        </div>
        <div id="live-region" aria-live="polite" aria-atomic="true" className="visually-hidden" />
      </body>
    </html>
  )
}
