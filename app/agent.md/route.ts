import { NextResponse } from 'next/server'
import { llmsTxt } from '@/lib/site/markdown'

/** Same content as /llms.txt, served as Markdown for crawlers that check this filename specifically. */
export function GET() {
  return new NextResponse(llmsTxt(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
