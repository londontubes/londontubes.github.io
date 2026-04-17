import type { Metadata } from 'next'
import BlogPageClient from './BlogPageClient'
import { blogQuestions } from './content'

export const metadata: Metadata = {
  title: 'London Blog & Tube Area Guides',
  description:
    'Read practical London travel, tube, neighbourhood and student-area guides tied back to the London Tube Map and station network.',
  keywords:
    'london travel guide, london tube area guides, where to live in london student, london neighbourhood guide, london commute blog',
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
  twitter: {
    card: 'summary_large_image',
    title: 'London Blog & Tube Area Guides',
    description:
      'Map-first London travel, neighbourhood, and student-area guides tied to stations and commute patterns.',
    images: ['https://londontubes.co.uk/opengraph-image'],
  },
}

const blogIndexStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'London Blog & Tube Area Guides',
  url: 'https://londontubes.co.uk/blog/',
  description:
    'Collection of London travel, neighbourhood, student commute, and tube-area guides published by London Tube Map.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: blogQuestions.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.question,
      url: `https://londontubes.co.uk/blog/${entry.slug}/`,
    })),
  },
}

export default function BlogPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogIndexStructuredData) }}
      />
      <BlogPageClient />
    </main>
  )
}
