/**
 * Renders the site's core content as Markdown from the same data source every
 * page reads from (lib/site/content.ts), so an agent fetching this never sees
 * facts that disagree with the live HTML pages.
 *
 * Used by: the ?mode=agent view, Accept: text/markdown content negotiation,
 * and the /ask endpoint.
 */
import { FACTS, FAQ_GROUPS, MEMBERSHIP_RATES, HOURLY_RATES, SITE, ZONES } from './content'

export function siteMarkdown(): string {
  const lines: string[] = []

  lines.push(`# ${SITE.name}`, '')
  lines.push(
    `Community-run coworking at 819 Pacific Ave, Santa Cruz. Founding sales open ${SITE.foundingSalesOpen}; doors open ${SITE.doorsOpen}.`,
    ''
  )

  lines.push('## Key facts', '')
  for (const [label, value] of FACTS) {
    lines.push(`- **${label}:** ${value}`)
  }
  lines.push('')

  lines.push('## Rooms', '')
  for (const zone of ZONES) {
    lines.push(`- **${zone.name}** (${zone.meta}): ${zone.summary}`)
  }
  lines.push('')

  lines.push('## Membership rates (founding vs. typical)', '')
  for (const rate of MEMBERSHIP_RATES) {
    lines.push(`- ${rate.name}: $${rate.founding}${rate.unit} founding, $${rate.typical}${rate.unit} typical`)
  }
  lines.push('')

  lines.push('## Hourly rates (founding vs. typical)', '')
  for (const rate of HOURLY_RATES) {
    lines.push(`- ${rate.name}: $${rate.founding}${rate.unit} founding, $${rate.typical}${rate.unit} typical`)
  }
  lines.push('')

  lines.push('## FAQ', '')
  for (const group of FAQ_GROUPS) {
    lines.push(`### ${group.title}`, '')
    for (const item of group.items) {
      lines.push(`**${item.question}**`, '', item.answer, '')
    }
  }

  return lines.join('\n')
}
