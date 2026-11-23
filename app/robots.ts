import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site/content'

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, '')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
