'use client'

import { useEffect } from 'react'

/**
 * Registers document.modelContext with one real, working tool: submitting
 * the contact form via the same POST /api/contact route the form itself
 * uses (verified working in production — see docs/REDESIGN_HANDOFF.md and
 * app/docs/page.tsx). No speculative tools for flows that don't exist yet
 * (booking, payments) are declared here.
 */
export function WebMCPRegistration() {
  useEffect(() => {
    const tool = {
      name: 'contact_citizen_space',
      description:
        'Send a message to Citizen Space (questions, tour requests, partnership or press inquiries).',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name' },
          email: { type: 'string', description: 'Email address' },
          topic: {
            type: 'string',
            enum: ['Founding 50', 'Book a tour', 'Studio or conference room', 'Host an event', 'Sponsorship', 'Something else'],
          },
          message: { type: 'string', description: 'The message body' },
        },
        required: ['name', 'email', 'topic', 'message'],
      },
      handler: async (input: Record<string, unknown>) => {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error ?? `Request failed with status ${res.status}`)
        }
        return { success: true }
      },
    }

    const context = { tools: [tool] }
    ;(document as unknown as { modelContext?: typeof context }).modelContext = context
    ;(window as unknown as { modelContext?: typeof context }).modelContext = context

    return () => {
      delete (document as unknown as { modelContext?: unknown }).modelContext
      delete (window as unknown as { modelContext?: unknown }).modelContext
    }
  }, [])

  return null
}
