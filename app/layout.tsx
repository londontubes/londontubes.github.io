import type { Metadata, Viewport } from 'next'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import { NavigationTabs } from './components/NavigationTabs'
import { Suspense } from 'react'
import Analytics from './components/Analytics/Analytics'
import PageViewTracker from './components/Analytics/PageViewTracker'
import ConsentBanner from './components/Analytics/ConsentBanner'
import { faqItems } from './data/faqData'

export const metadata: Metadata = {
  title: 'Interactive London Tube Map - Line Filters & University Journey Planner',
  description:
    'Interactive London Tube map with line filters, university journey planning, and TfL Underground, DLR & Overground coverage. Explore 270+ stations, find nearby universities, and plan routes with real-time London transport insights.',
  keywords:
    'london tube map, london underground planner, tfl tube lines map, london university commute, interactive tube map, london transport planner, dlr map, london subway map',
  openGraph: {
    title: 'Interactive London Tube Map - Plan Your TfL Journey',
    description:
      'London Underground, DLR, and Overground map with dynamic line filters, university station finder, and real-time journey planning tools.',
    type: 'website',
    siteName: 'London Tube Map',
    locale: 'en_GB',
    url: 'https://londontubes.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive London Tube Map - Line Filters & Universities',
    description:
      'Filter TfL tube lines, see nearby universities, and plan journeys across 270+ London stations with our free interactive map.',
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

const webAppStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'London Tube Map',
  url: 'https://londontubes.co.uk',
  description:
    'Interactive London Underground and DLR network map with line filtering, university commute planning, and station insights.',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Any',
  isAccessibleForFree: true,
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
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'technical support',
      url: 'https://github.com/londontubes/londontubes.github.io/issues',
      availableLanguage: ['en'],
    },
  ],
  keywords:
    'london tube map, london underground planner, tfl tube lines map, london university commute, interactive tube map, london transport planner, dlr map, london subway map',
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
}

const breadcrumbStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://londontubes.co.uk',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Universities Filter',
      item: 'https://londontubes.co.uk/universities',
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
