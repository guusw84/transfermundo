import type { MetadataRoute } from 'next'
import { getAirports } from '@/lib/airports'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const airports = getAirports()

  const airportUrls: MetadataRoute.Sitemap = airports.map((a) => ({
    url: `${SITE_URL}/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...airportUrls,
  ]
}
