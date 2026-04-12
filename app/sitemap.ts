import { MetadataRoute } from 'next'
import { blogQuestions } from '@/app/blog/content'
import { revenueLandingPages } from '@/app/data/revenuePages'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://londontubes.co.uk'
  const lastModified = new Date('2026-04-11T00:00:00.000Z')
  
  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/universities/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bus/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/student-accommodation/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.84,
    },
    {
      url: `${baseUrl}/contact-us/`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...blogQuestions.map((entry) => ({
      url: `${baseUrl}/blog/${entry.slug}/`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...revenueLandingPages.map((page) => ({
      url: `${baseUrl}/student-accommodation/${page.slug}/`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.76,
    })),
  ]
}
