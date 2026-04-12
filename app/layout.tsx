import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import 'leaflet/dist/leaflet.css'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
import { NavigationTabs } from './components/NavigationTabs'
import { Suspense } from 'react'
import Analytics from './components/Analytics/Analytics'
import PageViewTracker from './components/Analytics/PageViewTracker'
import ConsentBanner from './components/Analytics/ConsentBanner'
import { faqItems } from './data/faqData'

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL('https://londontubes.co.uk'),
  applicationName: 'London Tube Map',
  icons: {
    icon: '/icon',
    apple: '/icon',
  },
  referrer: 'origin-when-cross-origin',
  title: {
    default: 'London Tube Map 2026 – Interactive Underground, Elizabeth Line & DLR',
    template: '%s | London Tube Map',
  },
  description:
    'Free interactive London Tube map 2026 with all Underground lines, Elizabeth line, DLR and 330+ stations. Explore London transport, compare student commute areas, and check station-to-station travel times.',
  keywords:
    'london tube map 2026, london underground map, interactive tube map, elizabeth line map, london railway map, dlr map, london university commute map, london station travel times, london transport map, tfl map',
  authors: [{ name: 'London Tube Map', url: 'https://londontubes.co.uk' }],
  creator: 'London Tube Map',
  publisher: 'London Tube Map',
  category: 'travel',
  openGraph: {
    title: 'London Tube Map 2026 – Interactive Underground, Elizabeth Line & DLR',
    description:
      'Interactive London Tube map with Underground, Elizabeth line and DLR routes, station travel times, and student commute tools for London universities.',
    type: 'website',
    siteName: 'London Tube Map',
    locale: 'en_GB',
    url: 'https://londontubes.co.uk/',
    images: [
      {
        url: 'https://londontubes.co.uk/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'London Tube Map with Underground, Elizabeth line and DLR coverage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'London Tube Map 2026 – Interactive Underground, Elizabeth Line & DLR',
    description:
      'Interactive London Tube map with station travel times, university commute tools, and all Underground, Elizabeth line and DLR routes.',
    images: ['https://londontubes.co.uk/opengraph-image'],
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
    canonical: 'https://londontubes.co.uk/',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#09090b',
  colorScheme: 'dark',
}

const webAppStructuredData = {
  '@context': 'https://schema.org',
  '@type': ['WebApplication', 'Map'],
  name: 'London Tube Map',
  alternateName: ['London Underground Map', 'TfL Tube Map', 'London Metro Map', 'Mapa Metro Londres', 'London Subway Map'],
  url: 'https://londontubes.co.uk',
  description:
    'Free interactive London Tube map 2026 showing all 11 Underground lines, Elizabeth line, DLR & 330+ stations. Filter by line, plan journeys, and find university connections.',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Any',
  isAccessibleForFree: true,
  image: {
    '@type': 'ImageObject',
    url: 'https://londontubes.co.uk/opengraph-image',
    width: 1200,
    height: 630,
    description: 'Interactive London Tube Map showing Underground, Elizabeth line and DLR lines',
  },
  about: {
    '@type': 'Place',
    name: 'London Underground',
    alternateName: 'The Tube',
    description: 'The London Underground (the Tube) is a rapid transit system serving Greater London since 1863, with 11 tube lines, the Elizabeth line, DLR, and 330+ stations.',
    geo: {
      '@type': 'GeoShape',
      addressCountry: 'GB',
    },
  },
  featureList: [
    'Interactive line filtering for all 11 Underground lines and Elizabeth line',
    'Elizabeth line (Crossrail) with 41 stations from Reading to Shenfield',
    'DLR Docklands Light Railway network',
    'University proximity finder',
    '330+ station information',
    'Mobile optimised',
    'Free to use',
  ],
  sameAs: [
    'https://github.com/londontubes/londontubes.github.io',
    'https://londontubes.co.uk',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
  },
  creator: {
    '@type': 'Organization',
    name: 'London Tube Map',
    url: 'https://londontubes.co.uk',
  },
  inLanguage: 'en-GB',
  dateModified: '2026-04-10',
}

const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'London Tube Map',
  url: 'https://londontubes.co.uk/',
  description:
    'Interactive London Tube map with Underground, Elizabeth line, DLR, station travel times and London university commute planning.',
  inLanguage: 'en-GB',
}

const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'London Tube Map',
  url: 'https://londontubes.co.uk/',
  logo: 'https://londontubes.co.uk/opengraph-image',
  description:
    'Publisher of an interactive London Tube map focused on Underground, Elizabeth line, DLR and London student commute discovery.',
}

const breadcrumbStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://londontubes.co.uk/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Universities Filter',
      item: 'https://londontubes.co.uk/universities/',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Blog',
      item: 'https://londontubes.co.uk/blog/',
    },
  ],
}

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {GOOGLE_SITE_VERIFICATION ? (
          <meta
            name="google-site-verification"
            content={GOOGLE_SITE_VERIFICATION}
          />
        ) : null}

        <meta name="google-adsense-account" content="ca-pub-2691145261785175" />
        <link rel="dns-prefetch" href="https://a.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://b.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://c.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://region1.google-analytics.com" />
        <link rel="preconnect" href="https://a.tile.openstreetmap.org" crossOrigin="" />
        <link rel="preconnect" href="https://b.tile.openstreetmap.org" crossOrigin="" />
        <link rel="preconnect" href="https://c.tile.openstreetmap.org" crossOrigin="" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="preconnect" href="https://region1.google-analytics.com" crossOrigin="" />
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM summary" />
        <link rel="alternate" type="text/markdown" href="/llms-full.txt" title="LLM full summary" />
        {/* Structured Data for SEO — non-blocking JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webAppStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
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
        <Analytics />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <ConsentBanner />
      </body>
    </html>
  )
}
