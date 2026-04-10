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

const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ??
  process.env.NEXT_PUBLIC_GA_ID ??
  'G-9Q194F9FKG'

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL('https://londontubes.co.uk'),
  title: {
    default: 'London Tube Map 2026 – Interactive Underground, Elizabeth Line & DLR',
    template: '%s | London Tube Map',
  },
  description:
    'Free interactive London Tube map 2026 — all 11 Underground lines, Elizabeth line, DLR & 330+ stations. Filter by line, find stations near universities, plan your journey.',
  keywords:
    'london tube map 2026, london underground map 2026, interactive tube map, tfl map, london metro map, london subway map, elizabeth line map, crossrail map, dlr map, london underground stations, tube lines map, mapa metro londres, london transport map',
  authors: [{ name: 'London Tube Map', url: 'https://londontubes.co.uk' }],
  creator: 'London Tube Map',
  publisher: 'London Tube Map',
  openGraph: {
    title: 'London Tube Map 2026 – Interactive Underground, Elizabeth Line & DLR',
    description:
      'Free interactive London Tube map 2026 with all 11 Underground lines, Elizabeth line, DLR & 330+ stations. Filter by line, find university connections, plan your journey.',
    type: 'website',
    siteName: 'London Tube Map',
    locale: 'en_GB',
    url: 'https://londontubes.co.uk/',
    images: [
      {
        url: 'https://londontubes.co.uk/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Interactive London Tube Map showing all Underground and DLR lines',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'London Tube Map 2026 – Interactive Underground, Elizabeth Line & DLR',
    description:
      'Free interactive London Tube map 2026 with all 11 Underground lines, Elizabeth line, DLR & 330+ stations.',
    images: ['https://londontubes.co.uk/og-image.png'],
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
  themeColor: '#000000',
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
    url: 'https://londontubes.co.uk/og-image.png',
    width: 1200,
    height: 630,
    description: 'Interactive London Tube Map showing Underground and DLR lines',
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
            __html: JSON.stringify(webAppStructuredData),
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

        {GA4_MEASUREMENT_ID ? (
          <>
            {/* Google tag (gtag.js) */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_MEASUREMENT_ID}');`,
              }}
            />
          </>
        ) : null}
      </head>
      <body>
        {/* Basic SSR shell to avoid empty HTML responses */}
        <div id="app-shell">
          <NavigationTabs />
          {children}
        </div>
        <div id="live-region" aria-live="polite" aria-atomic="true" className="visually-hidden" />
        {/* Google Ads already present above; inject Analytics + trackers */}
        <Analytics />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <ConsentBanner />
      </body>
    </html>
  )
}
