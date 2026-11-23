import { NextResponse } from 'next/server'
import { llmsTxt } from '@/lib/site/markdown'

/** Same content as /llms.txt — agents.txt is an older, still-checked convention for the same thing. */
export function GET() {
  return new NextResponse(llmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
