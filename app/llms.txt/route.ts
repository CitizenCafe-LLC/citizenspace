import { NextResponse } from 'next/server'
import { llmsTxt } from '@/lib/site/markdown'

export function GET() {
  return new NextResponse(llmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
