import { MetadataRoute } from 'next'
import { blogQuestions } from './blog/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://londontubes.co.uk'

  const blogArticles: MetadataRoute.Sitemap = blogQuestions.map((q) => ({
    url: `${baseUrl}/blog/${q.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date('2026-03-28'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/universities/`,
      lastModified: new Date('2026-03-28'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...blogArticles,
    {
      url: `${baseUrl}/contact-us/`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
