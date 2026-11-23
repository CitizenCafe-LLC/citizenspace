import { Eyebrow, Section, H1, H2, Lead } from '@/components/site/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'Public API endpoints for citizenspace.ainative.studio.',
}

const endpoints = [
  {
    method: 'GET',
    path: '/api/health',
    summary: 'Health check',
    response: `{
  "status": "ok",
  "timestamp": "2026-11-23T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}`,
  },
  {
    method: 'POST',
    path: '/api/contact',
    summary: 'Submit the contact form',
    body: `{
  "name": "string, required",
  "email": "string, required",
  "topic": "general | booking | partnership | press",
  "message": "string, required"
}`,
    response: `{ "success": true }`,
  },
]

export default function DocsPage() {
  return (
    <div className="py-12">
      <Section className="pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>API</Eyebrow>
          <H1>Public API documentation</H1>
          <Lead className="mx-auto">
            Every endpoint below is live and working in production. Machine-readable version at{' '}
            <a href="/.well-known/api-catalog" className="underline">
              /.well-known/api-catalog
            </a>
            .
          </Lead>
        </div>
      </Section>

      <Section className="py-10">
        <div className="mx-auto max-w-3xl space-y-10">
          {endpoints.map(ep => (
            <div key={ep.path} className="border-t-[6px] border-brand-forest pt-5">
              <h2 className="m-0 font-display text-xl font-semibold">
                <span className="mr-2 inline-block rounded bg-brand-forest px-2 py-0.5 text-sm font-bold text-brand-bone">
                  {ep.method}
                </span>
                <code>{ep.path}</code>
              </h2>
              <p className="mb-4 mt-2 text-brand-muted">{ep.summary}</p>
              {ep.body && (
                <>
                  <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-brand-muted">
                    Request body
                  </h3>
                  <pre className="mb-4 overflow-x-auto rounded-xl bg-brand-ink p-4 text-sm text-brand-bone">
                    {ep.body}
                  </pre>
                </>
              )}
              <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-brand-muted">
                Response
              </h3>
              <pre className="overflow-x-auto rounded-xl bg-brand-ink p-4 text-sm text-brand-bone">
                {ep.response}
              </pre>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-10">
        <div className="mx-auto max-w-3xl">
          <H2 className="mb-4">For AI agents</H2>
          <p className="text-brand-muted">
            See{' '}
            <a href="/llms.txt" className="underline">
              /llms.txt
            </a>{' '}
            and{' '}
            <a href="/SKILL.md" className="underline">
              /SKILL.md
            </a>{' '}
            for a structured summary of this site's content and capabilities. A machine-readable
            OpenAPI spec for the endpoints above is at{' '}
            <a href="/openapi.json" className="underline">
              /openapi.json
            </a>
            .
          </p>
        </div>
      </Section>

      <Section className="py-10">
        <div className="mx-auto max-w-3xl">
          <H2 className="mb-4">Open source</H2>
          <p className="text-brand-muted">
            This site's source is public and forkable at{' '}
            <a
              href="https://github.com/CitizenCafe-LLC/citizenspace"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/CitizenCafe-LLC/citizenspace
            </a>
            . Anyone can clone it, deploy their own copy, and open a pull request — no account or
            membership required to contribute code.
          </p>
        </div>
      </Section>
    </div>
  )
}
