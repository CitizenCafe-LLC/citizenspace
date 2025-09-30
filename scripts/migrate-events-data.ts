/**
 * Data Migration Script: Events
 * Migrates events data from lib/data.ts to PostgreSQL database
 * Run with: npx tsx scripts/migrate-events-data.ts
 */

import { upcomingEvents } from '../lib/data'
import { createEvent } from '../lib/db/repositories/events.repository'

async function migrateEventsData() {
  console.log('Starting events data migration...\n')

  let successCount = 0
  let errorCount = 0

  for (const event of upcomingEvents) {
    console.log(`Migrating event: ${event.title}`)

    try {
      const result = await createEvent({
        title: event.title,
        slug: event.slug,
        description: event.description,
        start_time: event.startTime.toISOString(),
        end_time: event.endTime.toISOString(),
        location: event.location,
        host: event.host,
        external_rsvp_url: event.externalRSVPUrl,
        image: event.image,
        tags: event.tags,
        capacity: event.capacity,
        price: event.price || 0,
      })

      if (result.error) {
        console.error(`  ❌ Error: ${result.error}`)
        errorCount++
      } else {
        console.log(`  ✓ Success: Created event with ID ${result.data?.id}`)
        successCount++
      }
    } catch (error) {
      console.error(`  ❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
      errorCount++
    }

    console.log('')
  }

  console.log('Migration complete!')
  console.log(`  Success: ${successCount}`)
  console.log(`  Errors: ${errorCount}`)
  console.log(`  Total: ${upcomingEvents.length}`)

  process.exit(errorCount > 0 ? 1 : 0)
}

// Run migration
migrateEventsData().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})