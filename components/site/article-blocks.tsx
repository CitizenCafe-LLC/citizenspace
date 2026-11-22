import Link from 'next/link'
import type { ArticleBlock } from '@/lib/strapi/articles'
import { Photo } from './ui'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/** Headings found in rich-text blocks, for the "On this page" menu. */
export function articleHeadings(blocks: ArticleBlock[]) {
  return blocks
    .filter(
      (b): b is Extract<ArticleBlock, { __component: 'shared.rich-text' }> =>
        b.__component === 'shared.rich-text'
    )
    .flatMap(b =>
      b.body
        .split('\n')
        .filter(l => l.startsWith('## '))
        .map(l => l.slice(3).trim())
    )
    .map(text => ({ text, id: slugify(text) }))
}

/** Minimal Markdown for Strapi rich text: "## " headings and blank-line paragraphs. */
function RichText({ body }: { body: string }) {
  return (
    <div className="flex flex-col gap-5">
      {body.split(/\n{2,}/).map((chunk, i) =>
        chunk.startsWith('## ') ? (
          <h2
            key={i}
            id={slugify(chunk.slice(3))}
            className="m-0 scroll-mt-28 font-display text-[30px] font-semibold leading-tight"
          >
            {chunk.slice(3)}
          </h2>
        ) : (
          <p key={i} className="m-0">
            {chunk}
          </p>
        )
      )}
    </div>
  )
}

/** Renders a Strapi article's dynamic zone, switching on __component. */
export function ArticleBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.__component) {
          case 'shared.rich-text':
            return <RichText key={i} body={b.body} />
          case 'shared.media':
            return (
              <figure key={i} className="m-0 flex flex-col gap-2.5">
                <Photo src={b.file.src} alt={b.file.alt} />
                {b.caption && (
                  <figcaption className="text-[15px] text-brand-muted">{b.caption}</figcaption>
                )}
              </figure>
            )
          case 'shared.media-compare':
            return (
              <figure key={i} className="m-0 flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-[1_1_280px]">
                    <Photo src={b.before.src} alt={b.before.alt} />
                  </div>
                  <div className="min-w-0 flex-[1.3_1_320px]">
                    <Photo src={b.after.src} alt={b.after.alt} ratio="16 / 9" />
                  </div>
                </div>
                {b.caption && (
                  <figcaption className="text-[15px] text-brand-muted">{b.caption}</figcaption>
                )}
              </figure>
            )
          case 'shared.quote':
            return (
              <blockquote
                key={i}
                className="m-0 flex flex-col gap-2.5 border-l-[6px] border-brand-brick py-2 pl-7"
              >
                <p className="m-0 font-display text-[30px] font-semibold leading-tight">{b.body}</p>
                {b.author && <footer className="text-[15px] text-brand-muted">{b.author}</footer>}
              </blockquote>
            )
          case 'shared.key-facts':
            return (
              <aside key={i} className="flex flex-col gap-3 rounded-3xl bg-brand-bone p-7">
                {b.title && (
                  <h2 className="m-0 font-display text-[30px] font-semibold leading-tight">
                    {b.title}
                  </h2>
                )}
                <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 text-base">
                  {b.items.map(f => (
                    <div key={f.label}>
                      <dt className="text-brand-muted">{f.label}</dt>
                      <dd className="m-0 font-display text-[28px] font-semibold">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            )
          case 'shared.cta':
            return (
              <div
                key={i}
                className="flex flex-col gap-3.5 rounded-3xl bg-brand-forest p-8 text-brand-bone"
              >
                <h2 className="m-0 font-display text-[30px] font-semibold leading-tight text-brand-bone">
                  {b.heading}
                </h2>
                {b.body && <p className="m-0 text-[17px] text-brand-mist">{b.body}</p>}
                <Link
                  href={b.buttonUrl}
                  className="inline-flex min-h-[48px] items-center self-start rounded-xl bg-brand-brick px-6 font-bold text-brand-bone no-underline"
                >
                  {b.buttonLabel}
                </Link>
              </div>
            )
          default:
            return null
        }
      })}
    </>
  )
}
