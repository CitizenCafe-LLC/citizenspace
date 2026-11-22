import { SITE, MEMBERSHIP_RATES, HOURLY_RATES, type FaqGroup } from './content'
import type { Article } from '@/lib/strapi/articles'

export function faqPageJsonLd(groups: FaqGroup[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap(g =>
      g.items.map(qa => ({
        '@type': 'Question',
        name: qa.question,
        acceptedAnswer: { '@type': 'Answer', text: qa.answer },
      }))
    ),
  }
}

export function localBusinessJsonLd() {
  const offers = [...MEMBERSHIP_RATES, ...HOURLY_RATES].map(r => ({
    '@type': 'Offer',
    name: r.name,
    price: r.founding,
    priceCurrency: 'USD',
    description: `Founding rate${r.unit ? ` ${r.unit.trim()}` : ''}. Typical Santa Cruz price $${r.typical}.`,
  }))
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'CoworkingSpace'],
    name: SITE.name,
    legalName: SITE.legalName,
    slogan: SITE.tagline,
    description: SITE.description,
    url: SITE.url,
    logo: `${SITE.url}/brand/logos/logo-primary.png`,
    image: `${SITE.url}/brand/photos/02-main-shared-room.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    floorSize: { '@type': 'QuantitativeValue', value: SITE.squareFeet, unitCode: 'FTK' },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Internet', value: SITE.internet },
      { '@type': 'LocationFeatureSpecification', name: 'Conference room', value: 'Seats 8' },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Content studio',
        value: 'Podcast and video, 4 seats',
      },
    ],
    makesOffer: offers,
  }
}

export function blogPostingJsonLd(article: Article, baseUrl: string = SITE.url) {
  const abs = (src: string) => (src.startsWith('http') ? src : `${baseUrl}${src}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    image: abs(article.cover.src),
    url: `${baseUrl}/blog/${article.slug}`,
    author: { '@type': 'Person', name: article.author.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.legalName,
      logo: abs('/brand/logos/logo-primary.png'),
    },
    keywords: article.tags.join(', '),
  }
}

/** Server-safe <script type="application/ld+json"> payload. */
export const jsonLdScript = (data: unknown) => ({
  __html: JSON.stringify(data).replace(/</g, '\\u003c'),
})
