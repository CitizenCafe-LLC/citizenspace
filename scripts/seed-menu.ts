#!/usr/bin/env ts-node
/**
 * Seed Menu Data Script
 *
 * This script migrates menu data from lib/data.ts to the database.
 * It's idempotent - can be run multiple times safely.
 *
 * Usage:
 *   npx ts-node scripts/seed-menu.ts
 *
 * Or add to package.json:
 *   "db:seed-menu": "ts-node scripts/seed-menu.ts"
 */

import { getPool } from '../lib/db/connection'

// Menu data from lib/data.ts
const menuData = [
  {
    id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    title: 'House Blend',
    description: 'Our signature medium roast with chocolate and caramel notes',
    price: 3.5,
    category: 'coffee',
    dietary_tags: [],
    orderable: true,
    featured: false,
  },
  {
    id: 'b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e',
    title: 'Single-Origin Pour Over',
    description: 'Rotating selection of premium beans, ask your barista',
    price: 4.5,
    category: 'coffee',
    dietary_tags: [],
    orderable: true,
    featured: true,
  },
  {
    id: 'c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f',
    title: 'Cappuccino',
    description: 'Classic espresso with steamed milk and foam',
    price: 4.0,
    category: 'coffee',
    dietary_tags: [],
    orderable: true,
    featured: false,
  },
  {
    id: 'd4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a',
    title: 'Latte',
    description: 'Smooth espresso with steamed milk',
    price: 4.25,
    category: 'coffee',
    dietary_tags: [],
    orderable: true,
    featured: false,
  },
  {
    id: 'e5f6a7b8-c9d0-4e5f-8a7b-9c0d1e2f3a4b',
    title: 'Espresso',
    description: 'Bold and rich double shot',
    price: 3.0,
    category: 'coffee',
    dietary_tags: [],
    orderable: true,
    featured: false,
  },
  {
    id: 'f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c',
    title: 'Green Tea',
    description: 'Organic Japanese sencha',
    price: 3.0,
    category: 'tea',
    dietary_tags: [],
    orderable: true,
    featured: false,
  },
  {
    id: 'a7b8c9d0-e1f2-4a5b-8c7d-9e0f1a2b3c4d',
    title: 'Chai Latte',
    description: 'Spiced black tea with steamed milk',
    price: 4.5,
    category: 'tea',
    dietary_tags: [],
    orderable: true,
    featured: false,
  },
  {
    id: 'b8c9d0e1-f2a3-4b5c-8d7e-9f0a1b2c3d4e',
    title: 'Almond Croissant',
    description: 'Buttery pastry with almond cream from Arsicault Bakery',
    price: 3.75,
    category: 'pastries',
    dietary_tags: ['vegetarian'],
    orderable: true,
    featured: true,
  },
  {
    id: 'c9d0e1f2-a3b4-4c5d-8e7f-9a0b1c2d3e4f',
    title: 'Chocolate Croissant',
    description: 'Flaky pastry filled with dark chocolate',
    price: 3.5,
    category: 'pastries',
    dietary_tags: ['vegetarian'],
    orderable: true,
    featured: false,
  },
  {
    id: 'd0e1f2a3-b4c5-4d5e-8f7a-9b0c1d2e3f4a',
    title: 'Blueberry Muffin',
    description: 'Fresh baked with organic blueberries',
    price: 3.25,
    category: 'pastries',
    dietary_tags: ['vegetarian'],
    orderable: true,
    featured: false,
  },
  {
    id: 'e1f2a3b4-c5d6-4e5f-8a7b-9c0d1e2f3a4b',
    title: 'Avocado Toast',
    description: 'Sourdough with smashed avocado, radish, everything seasoning',
    price: 12.0,
    category: 'meals',
    dietary_tags: ['vegetarian', 'vegan option'],
    orderable: true,
    featured: false,
  },
  {
    id: 'f2a3b4c5-d6e7-4f5a-8b7c-9d0e1f2a3b4c',
    title: 'Turkey Club Sandwich',
    description: 'Roasted turkey, bacon, lettuce, tomato on sourdough',
    price: 14.0,
    category: 'meals',
    dietary_tags: [],
    orderable: true,
    featured: false,
  },
  {
    id: 'a3b4c5d6-e7f8-4a5b-8c7d-9e0f1a2b3c4d',
    title: 'Caprese Salad',
    description: 'Fresh mozzarella, tomatoes, basil, balsamic glaze',
    price: 11.0,
    category: 'meals',
    dietary_tags: ['vegetarian', 'gluten-free'],
    orderable: true,
    featured: false,
  },
]

async function seedMenu() {
  const pool = getPool()
  let inserted = 0
  let updated = 0
  let skipped = 0

  try {
    console.log('🌱 Starting menu data seeding...\n')

    for (const item of menuData) {
      try {
        // Check if item exists
        const checkResult = await pool.query('SELECT id FROM menu_items WHERE id = $1', [
          item.id,
        ])

        if (checkResult.rows.length > 0) {
          // Update existing item
          await pool.query(
            `UPDATE menu_items
             SET title = $2, description = $3, price = $4, category = $5,
                 dietary_tags = $6, orderable = $7, featured = $8, updated_at = NOW()
             WHERE id = $1`,
            [
              item.id,
              item.title,
              item.description,
              item.price,
              item.category,
              item.dietary_tags,
              item.orderable,
              item.featured,
            ]
          )
          updated++
          console.log(`✅ Updated: ${item.title}`)
        } else {
          // Insert new item
          await pool.query(
            `INSERT INTO menu_items (id, title, description, price, category, dietary_tags, orderable, featured)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              item.id,
              item.title,
              item.description,
              item.price,
              item.category,
              item.dietary_tags,
              item.orderable,
              item.featured,
            ]
          )
          inserted++
          console.log(`✨ Inserted: ${item.title}`)
        }
      } catch (error) {
        console.error(`❌ Error processing ${item.title}:`, error)
        skipped++
      }
    }

    console.log('\n✅ Menu seeding completed!')
    console.log(`   📊 Stats:`)
    console.log(`      - Inserted: ${inserted}`)
    console.log(`      - Updated: ${updated}`)
    console.log(`      - Skipped: ${skipped}`)
    console.log(`      - Total processed: ${menuData.length}`)
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the seed function
if (require.main === module) {
  seedMenu()
    .then(() => {
      console.log('\n🎉 Seeding script completed successfully!')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 Seeding script failed:', error)
      process.exit(1)
    })
}

export { seedMenu }