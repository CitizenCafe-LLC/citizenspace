import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site/content'
import { getArticles } from '@/lib/strapi/articles'

const STATIC_ROUTES = [
  '',
  '/cafe',
  '/workspaces',
  '/membership',
  '/events',
  '/gallery',
  '/blog',
  '/location',
  '/contact',
  '/about',
  '/faq',
  '/legal/terms',
  '/legal/privacy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, '')

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(path => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  const { articles } = await getArticles({ pageSize: 100 })
  const blogEntries: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: a.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticEntries, ...blogEntries]
}
