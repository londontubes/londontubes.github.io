import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'London Tube Map | Interactive Line Filter',
  description: 'Explore London Underground and DLR lines with interactive map filtering. Currently displaying Northern line stations.',
  openGraph: {
    title: 'London Tube Map | Interactive Line Filter',
    description: 'Explore the London Underground and DLR network with interactive filtering. View individual lines and plan your journey.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Basic SSR shell to avoid empty HTML responses */}
        <div id="app-shell">
          {children}
        </div>
      </body>
    </html>
  )
}
