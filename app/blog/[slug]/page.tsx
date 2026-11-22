import type { Metadata } from 'next'
import { ShareButton } from '@/components/site/share-button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Photo } from '@/components/site/ui'
import { ArticleBlocks, articleHeadings } from '@/components/site/article-blocks'
import { getArticleBySlug, getArticles, formatDate } from '@/lib/strapi/articles'
import { blogPostingJsonLd, jsonLdScript } from '@/lib/site/jsonld'

export const revalidate = 300

export async function generateStaticParams() {
  const { articles } = await getArticles({ pageSize: 100 })
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const a = await getArticleBySlug(params.slug)
  if (!a) {
    return {}
  }
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: {
      type: 'article',
      title: a.title,
      description: a.excerpt,
      publishedTime: a.publishedAt,
      images: [a.cover.src],
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)
  if (!article) {
    notFound()
  }
  const headings = articleHeadings(article.blocks)
  const { articles } = await getArticles({ category: article.category.slug, pageSize: 4 })
  const related = articles.filter(a => a.slug !== article.slug).slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(blogPostingJsonLd(article))}
      />
      <article className="bg-brand-paper">
        <header className="mx-auto flex max-w-[880px] flex-col gap-4 px-4 pb-6 pt-6 sm:px-8 md:pb-8 md:pt-14">
          <nav aria-label="Breadcrumb" className="text-sm text-brand-muted">
            <Link href="/blog" className="text-brand-brick">
              Blog
            </Link>{' '}
            <span aria-hidden>/</span>{' '}
            <Link href={`/blog?category=${article.category.slug}`} className="text-brand-brick">
              {article.category.name}
            </Link>
          </nav>
          <p
            className="m-0 text-[13px] font-bold uppercase tracking-[2.5px]"
            style={{ color: article.category.color }}
          >
            {article.category.name}
          </p>
          <h1 className="m-0 font-display text-[34px] font-semibold leading-[1.06] tracking-[-0.5px] sm:text-[40px] md:text-[64px]">
            {article.title}
          </h1>
          <p className="m-0 text-[19px] leading-snug text-brand-muted md:text-[22px]">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-3 border-y border-brand-hairline py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.author.avatar} alt="" className="h-12 w-12 rounded-full" />
            <div>
              <p className="m-0 font-bold">{article.author.name}</p>
              <p className="m-0 text-sm text-brand-muted">
                {article.author.role && `${article.author.role} · `}
                {formatDate(article.publishedAt)} · {article.readingTime} min read
              </p>
            </div>
            <ShareButton title={article.title} text={article.excerpt} />
          </div>
        </header>

        <figure className="mx-auto my-0 flex max-w-[1200px] flex-col gap-2.5 pb-8 sm:px-8 md:pb-12">
          <Photo
            src={article.cover.src}
            alt={article.cover.alt}
            ratio="16 / 9"
            priority
            className="rounded-none sm:rounded-3xl"
          />
        </figure>

        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-14 px-4 pb-12 sm:px-8 md:pb-20">
          {headings.length > 0 && (
            <aside
              aria-label="On this page"
              className="hidden min-w-0 flex-[1_1_220px] flex-col gap-1.5 lg:sticky lg:top-28 lg:flex"
            >
              <p className="m-0 mb-1.5 text-[13px] font-bold uppercase tracking-[2.5px] text-brand-muted">
                On this page
              </p>
              {headings.map(h => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className="flex min-h-[36px] items-center border-l-4 border-brand-hairline pl-3 text-brand-ink no-underline hover:border-brand-brick"
                >
                  {h.text}
                </a>
              ))}
            </aside>
          )}
          <div className="flex min-w-0 max-w-[720px] flex-[999_1_600px] flex-col gap-6 text-[18px] leading-relaxed md:gap-7 md:text-[19px]">
            <ArticleBlocks blocks={article.blocks} />
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex min-h-[36px] items-center rounded-full bg-brand-bone px-3.5 text-[15px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-start gap-4 border-t-[6px] border-brand-forest pt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.author.avatar} alt="" className="h-16 w-16 shrink-0 rounded-full" />
              <div>
                <p className="m-0 text-[17px] font-bold">{article.author.name}</p>
                <p className="m-0 text-base leading-normal text-brand-muted">
                  {article.author.bio ??
                    'Founder of Citizen Space. Took over the original Citizen Space in San Francisco in 2010, one of the world’s first coworking spaces, and hosts the Santa Cruz builder meetup.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related" className="bg-brand-bone">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-12 sm:px-8 md:gap-8 md:py-20">
            <h2 id="related" className="m-0 font-display text-[30px] font-semibold">
              More in {article.category.name}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-7">
              {related.map(r => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="flex flex-col gap-3 text-brand-ink no-underline"
                >
                  <Photo src={r.cover.src} alt={r.cover.alt} ratio="3 / 2" />
                  <div className="border-t-[6px] pt-3" style={{ borderTopColor: r.category.color }}>
                    <h3 className="m-0 text-[22px] font-bold">{r.title}</h3>
                    <p className="m-0 mt-1.5 text-sm text-brand-muted">
                      {formatDate(r.publishedAt)} · {r.readingTime} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
