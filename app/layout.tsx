import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'London Tube & DLR Network Map | Interactive Line Filter',
  description: 'Explore the complete London Underground and DLR network. Toggle individual lines, inspect stations, and view multi-line connectivity on an accessible interactive map.',
  openGraph: {
    title: 'London Tube & DLR Network Map | Interactive Line Filter',
    description: 'Interactive map of the full London Underground and DLR network with dynamic line filtering.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'London Tube & DLR Interactive Map',
    description: 'Filter London Underground & DLR lines, inspect stations, view branches.',
  },
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
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1802611351208013"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/* Basic SSR shell to avoid empty HTML responses */}
        <div id="app-shell">
          {children}
        </div>
        <div id="live-region" aria-live="polite" aria-atomic="true" className="visually-hidden" />
      </body>
    </html>
  )
}
