import type { Metadata } from 'next'
import BlogPageClient from './BlogPageClient'

export const metadata: Metadata = {
  title: 'London Tube Blog – Your London FAQs Answered',
  description:
    'Discover clear, practical answers to common questions about London: where to visit, what to do, how the weather feels and more – all in an easy FAQ style.',
}

export default function BlogPage() {
  return <BlogPageClient />
}
