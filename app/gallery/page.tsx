import type { Metadata } from 'next'
import { Eyebrow, Section, H1, H2, Lead, ButtonLink, Photo } from '@/components/site/ui'
import { GALLERY_PHOTOS } from '@/lib/site/content'

export const metadata: Metadata = {
  title: 'Gallery: 819 Pacific Ave, as it is today',
  description:
    'Real photos of Citizen Space at 819 Pacific Ave, Santa Cruz, before the build-out: exposed brick, skylights and a gas fireplace.',
  alternates: { canonical: '/gallery' },
}

export default function GalleryPage() {
  return (
    <>
      <Section innerClassName="gap-4 pb-12 md:pb-12">
        <Eyebrow>Gallery</Eyebrow>
        <H1>The space, as it is today.</H1>
        <Lead>
          819 Pacific Ave before the build-out. Exposed brick, skylights and a gas fireplace.
        </Lead>
      </Section>

      <Section aria-label="Photos" innerClassName="pt-0 md:pt-0">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-y-14">
          {GALLERY_PHOTOS.map((p, i) => (
            <figure key={p.src} className="-mx-4 my-0 flex flex-col gap-3 sm:mx-0 sm:gap-3.5">
              <Photo
                src={p.src}
                alt={p.alt}
                priority={i < 2}
                className="rounded-none sm:rounded-3xl"
              />
              <figcaption className="flex flex-col gap-1 px-5 sm:px-0">
                <span className="text-[19px] font-bold leading-tight text-brand-ink sm:text-[22px]">
                  {p.room}
                </span>
                <span className="text-[17px] text-brand-muted">{p.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section
        tone="forest"
        aria-labelledby="g-tour"
        innerClassName="flex-row flex-wrap items-center justify-between gap-6 py-20 md:py-20"
      >
        <div className="flex flex-col gap-2">
          <H2 id="g-tour" onDark>
            See it in person.
          </H2>
          <p className="m-0 text-[17px] text-brand-mist">Founding sales open December 1, 2026.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <ButtonLink href="/contact">Schedule a tour</ButtonLink>
          <ButtonLink href="/location" variant="outlineLight">
            Get directions
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
