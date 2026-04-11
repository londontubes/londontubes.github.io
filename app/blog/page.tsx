import type { Metadata } from 'next'
import BlogPageClient from './BlogPageClient'

export const metadata: Metadata = {
  title: 'London Blog & Tube Area Guides',
  description:
    'Read practical London travel, tube, neighbourhood and student-area guides tied back to the London Tube Map and station network.',
  alternates: {
    canonical: '/blog/',
  },
  openGraph: {
    title: 'London Blog & Tube Area Guides',
    description:
      'Practical guides to London neighbourhoods, travel, attractions and student commute areas, published with map-first context.',
    type: 'website',
    url: 'https://londontubes.co.uk/blog/',
  },
}

export default function BlogPage() {
  return <BlogPageClient />
}
