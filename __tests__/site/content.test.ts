import fs from 'fs'
import path from 'path'
import {
  SITE,
  MEMBERSHIP_RATES,
  HOURLY_RATES,
  ZONES,
  HERO_SLIDES,
  GALLERY_PHOTOS,
  FAQ_GROUPS,
  SPONSOR_TIERS,
  MENU_SECTIONS,
} from '@/lib/site/content'

const publicFile = (src: string) => path.join(process.cwd(), 'public', src)

describe('site content', () => {
  it('identifies the company as a public benefit corporation', () => {
    expect(SITE.legalName).toBe('Citizen Space, PBC')
    expect(SITE.publicBenefit).toMatch(/Santa Cruz founder economy/)
  })

  it('keeps every founding rate at no more than about half the typical Santa Cruz price', () => {
    for (const rate of [...MEMBERSHIP_RATES, ...HOURLY_RATES]) {
      expect(rate.founding / rate.typical).toBeLessThanOrEqual(0.55)
    }
  })

  it('uses the Founding 50 deck prices', () => {
    const byName = Object.fromEntries(MEMBERSHIP_RATES.map(r => [r.name, r.founding]))
    expect(byName['Day pass']).toBe(12)
    expect(byName['10-day flex']).toBe(74)
    expect(byName['Monthly flex desk']).toBe(124)
    expect(byName['Virtual address with 2 day passes']).toBe(39)
  })

  it('has four sponsor tiers with one multi-room sponsor', () => {
    expect(SPONSOR_TIERS.map(t => t.price)).toEqual([1000, 2500, 5000, 10000])
  })

  it('adds up to 24 work seats across the zones', () => {
    const seats = ZONES.filter(z => z.workSeats).reduce((s, z) => s + (z.workSeats ?? 0), 0)
    expect(seats).toBe(24)
  })

  it('only references images that exist in /public', () => {
    const srcs = [
      ...HERO_SLIDES.map(s => s.src),
      ...GALLERY_PHOTOS.map(p => p.src),
      ...ZONES.flatMap(z => [z.photo, z.plan].filter(Boolean) as string[]),
    ]
    for (const src of srcs) {
      expect(fs.existsSync(publicFile(src))).toBe(true)
    }
  })

  it('leaves no [PLACEHOLDER] text anywhere in the content', () => {
    const blob = JSON.stringify({ SITE, ZONES, FAQ_GROUPS, MENU_SECTIONS, GALLERY_PHOTOS })
    expect(blob).not.toMatch(/\[[A-Z][A-Z ,?:]+\]/)
  })

  it('answers LLM-style discovery questions with the brand and address up front', () => {
    const find = FAQ_GROUPS.find(g => g.id === 'find')!
    expect(find.items.length).toBeGreaterThanOrEqual(15)
    for (const qa of find.items) {
      expect(qa.answer.slice(0, 160)).toMatch(/Citizen Space|Builder Night|Yes\./)
    }
  })

  it('gives every FAQ question a unique wording', () => {
    const qs = FAQ_GROUPS.flatMap(g => g.items.map(i => i.question))
    expect(new Set(qs).size).toBe(qs.length)
  })

  it('prices every menu item', () => {
    for (const section of MENU_SECTIONS) {
      for (const item of section.items) {
        expect(item.price).toBeGreaterThan(0)
      }
    }
  })
})
