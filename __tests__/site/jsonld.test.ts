import { faqPageJsonLd, localBusinessJsonLd, blogPostingJsonLd } from '@/lib/site/jsonld'
import { FAQ_GROUPS } from '@/lib/site/content'
import { SAMPLE_ARTICLES } from '@/lib/strapi/articles'

describe('structured data', () => {
  it('emits every FAQ as a schema.org Question with an accepted answer', () => {
    const ld = faqPageJsonLd(FAQ_GROUPS)
    const total = FAQ_GROUPS.reduce((n, g) => n + g.items.length, 0)
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity).toHaveLength(total)
    expect(ld.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      acceptedAnswer: { '@type': 'Answer' },
    })
  })

  it('describes the space as a coworking LocalBusiness at 819 Pacific Ave', () => {
    const ld = localBusinessJsonLd()
    expect(ld['@type']).toEqual(['LocalBusiness', 'CoworkingSpace'])
    expect(ld.legalName).toBe('Citizen Space, PBC')
    expect(ld.address.streetAddress).toBe('819 Pacific Ave')
    expect(ld.address.postalCode).toBe('95060')
    expect(ld.makesOffer.length).toBeGreaterThan(3)
  })

  it('builds a BlogPosting from a Strapi article', () => {
    const article = SAMPLE_ARTICLES[0]
    const ld = blogPostingJsonLd(article, 'https://example.com')
    expect(ld['@type']).toBe('BlogPosting')
    expect(ld.headline).toBe(article.title)
    expect(ld.url).toBe(`https://example.com/blog/${article.slug}`)
    expect(ld.author.name).toBe(article.author.name)
  })
})
