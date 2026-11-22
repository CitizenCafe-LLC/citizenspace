import {
  articlesQuery,
  mapStrapiArticle,
  getArticles,
  getArticleBySlug,
  SAMPLE_ARTICLES,
} from '@/lib/strapi/articles'

const strapiArticle = {
  id: 7,
  documentId: 'abc',
  title: 'Seven drafts of one floor plan',
  slug: 'seven-drafts-of-one-floor-plan',
  excerpt: 'How 1,385 sq ft became 24 work seats.',
  readingTime: 6,
  featured: true,
  publishedAt: '2026-12-01T17:00:00.000Z',
  cover: { url: '/uploads/cutaway.jpg', alternativeText: 'Cutaway' },
  category: { name: 'Building 819 Pacific', slug: 'building-819-pacific', color: '#1F3D33' },
  author: { name: 'Toby Morning', role: 'Founder', avatar: { url: '/uploads/toby.png' } },
  tags: [{ name: 'floor plan', slug: 'floor-plan' }],
  blocks: [{ __component: 'shared.rich-text', body: 'Hello' }],
}

describe('Strapi articles client', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    process.env = { ...OLD_ENV }
  })
  afterAll(() => {
    process.env = OLD_ENV
  })

  it('builds a populate, sort and pagination query for the listing', () => {
    const q = decodeURIComponent(articlesQuery({ page: 2, pageSize: 9, category: 'builder-night' }))
    expect(q).toContain('sort[0]=publishedAt:desc')
    expect(q).toContain('pagination[page]=2')
    expect(q).toContain('pagination[pageSize]=9')
    expect(q).toContain('filters[category][slug][$eq]=builder-night')
    expect(q).toContain('populate[cover]=true')
    expect(q).toContain('populate[author][populate][avatar]=true')
  })

  it('maps a Strapi 5 article and makes media URLs absolute', () => {
    const a = mapStrapiArticle(strapiArticle, 'https://cms.example.com')
    expect(a.slug).toBe('seven-drafts-of-one-floor-plan')
    expect(a.cover.src).toBe('https://cms.example.com/uploads/cutaway.jpg')
    expect(a.category.slug).toBe('building-819-pacific')
    expect(a.author.avatar).toBe('https://cms.example.com/uploads/toby.png')
    expect(a.tags).toEqual(['floor plan'])
    expect(a.blocks[0].__component).toBe('shared.rich-text')
  })

  it('falls back to the bundled sample articles when STRAPI_URL is not set', async () => {
    delete process.env.STRAPI_URL
    const { articles } = await getArticles()
    expect(articles.length).toBe(SAMPLE_ARTICLES.length)
    expect(await getArticleBySlug(SAMPLE_ARTICLES[0].slug)).toEqual(SAMPLE_ARTICLES[0])
  })

  it('filters sample articles by category', async () => {
    delete process.env.STRAPI_URL
    const { articles } = await getArticles({ category: 'builder-night' })
    expect(articles.every(a => a.category.slug === 'builder-night')).toBe(true)
  })

  it('adds a case-insensitive title/excerpt search for the mobile search box', () => {
    const q = decodeURIComponent(articlesQuery({ q: 'Cruzio' }))
    expect(q).toContain('filters[$or][0][title][$containsi]=Cruzio')
    expect(q).toContain('filters[$or][1][excerpt][$containsi]=Cruzio')
  })

  it('searches sample articles by title or excerpt', async () => {
    delete process.env.STRAPI_URL
    const { articles } = await getArticles({ q: 'cruzio' })
    expect(articles.map(a => a.slug)).toEqual(['two-cruzio-lines'])
  })

  it('reads from Strapi when configured', async () => {
    process.env.STRAPI_URL = 'https://cms.example.com'
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [strapiArticle],
        meta: { pagination: { page: 1, pageCount: 1, total: 1 } },
      }),
    })
    global.fetch = fetchMock as unknown as typeof fetch
    const { articles, pageCount } = await getArticles()
    expect(fetchMock.mock.calls[0][0]).toMatch(/^https:\/\/cms\.example\.com\/api\/articles\?/)
    expect(articles[0].title).toBe('Seven drafts of one floor plan')
    expect(pageCount).toBe(1)
  })
})
