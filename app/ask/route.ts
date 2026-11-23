import { NextRequest, NextResponse } from 'next/server'
import { FAQ_GROUPS, FACTS } from '@/lib/site/content'

/**
 * Minimal NLWeb-style conversational-search endpoint (nlweb.ai spec).
 * Searches the site's own FAQ and fact list — the same content every page
 * reads from — rather than a separate index that could drift from it.
 */
function search(query: string) {
  const q = query.toLowerCase()

  const factHits = FACTS.filter(
    ([label, value]) => label.toLowerCase().includes(q) || value.toLowerCase().includes(q)
  ).map(([label, value]) => ({ type: 'fact' as const, label, value }))

  const faqHits = FAQ_GROUPS.flatMap(group =>
    group.items
      .filter(
        item => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
      )
      .map(item => ({ type: 'faq' as const, group: group.title, question: item.question, answer: item.answer }))
  )

  return { facts: factHits, faq: faqHits }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? request.nextUrl.searchParams.get('query')

  if (!query || !query.trim()) {
    return NextResponse.json(
      { error: 'Missing required query parameter: q (or query)' },
      { status: 400 }
    )
  }

  const results = search(query)
  const total = results.facts.length + results.faq.length

  return NextResponse.json({
    query,
    results,
    total,
    source: 'https://citizenspace.ainative.studio',
  })
}
