import { NextResponse } from 'next/server'

const BODY = `/* TEAM */
Founder: Toby Morning

/* SITE */
Last update: 2026/11
Standards: HTML5, CSS3
Components: Next.js 13, React, Tailwind CSS
Software: Visual Studio Code
`

export function GET() {
  return new NextResponse(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
