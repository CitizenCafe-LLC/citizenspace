import { NextRequest, NextResponse } from 'next/server'
import { siteMarkdown } from '@/lib/site/markdown'

/**
 * Serves a stripped-down, agent-oriented response for two signals:
 * - ?mode=agent on any page
 * - Accept: text/markdown content negotiation
 *
 * Both return the same Markdown summary (lib/site/markdown.ts), built from
 * the same data every HTML page reads from, so it can never disagree with
 * what a human sees. Skips Next's own asset/data routes and API routes.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  const bypassPaths = new Set([
    '/favicon.ico',
    '/llms.txt',
    '/agents.txt',
    '/agent.md',
    '/humans.txt',
    '/robots.txt',
    '/sitemap.xml',
    '/openapi.json',
    '/SKILL.md',
    '/auth.md',
  ])

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/ask') ||
    pathname.startsWith('/.well-known') ||
    bypassPaths.has(pathname)
  ) {
    return NextResponse.next()
  }

  const wantsAgentMode = searchParams.get('mode') === 'agent'
  const accept = request.headers.get('accept') ?? ''
  const wantsMarkdown = accept.includes('text/markdown') && !accept.includes('text/html')

  if (wantsAgentMode || wantsMarkdown) {
    return new NextResponse(siteMarkdown(), {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        Vary: 'Accept',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
