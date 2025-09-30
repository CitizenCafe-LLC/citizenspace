/**
 * Blog Data Migration Script
 * Migrates blog posts from /app/blog/page.tsx to the database
 *
 * Usage:
 *   npx tsx scripts/migrate-blog-data.ts
 *
 * Prerequisites:
 *   - Database migrations must be run first
 *   - DATABASE_URL must be set in environment variables
 */

import { executeQuery } from '../lib/db/postgres'

// Blog posts data extracted from /app/blog/page.tsx
const blogPosts = [
  {
    title: 'The Evolution of Coworking: From Necessity to Community',
    slug: 'evolution-of-coworking',
    excerpt:
      'How coworking spaces have transformed from simple desk rentals to thriving communities that foster innovation and connection.',
    content: `
# The Evolution of Coworking: From Necessity to Community

The coworking movement has undergone a remarkable transformation over the past decade. What began as a simple solution to the problem of expensive office space has evolved into a vibrant ecosystem of innovation, collaboration, and community building.

## From Desk Rentals to Communities

In the early days, coworking spaces were primarily about providing affordable desk space for freelancers and remote workers. The value proposition was simple: split the cost of rent, utilities, and amenities among multiple tenants. But something unexpected happened along the way.

## The Power of Serendipity

When you put talented, passionate people in the same space, magic happens. Casual conversations over coffee turn into business partnerships. A question asked in passing leads to a breakthrough solution. This serendipitous collision of ideas became one of the most valuable aspects of coworking.

## Building More Than Workspaces

Today's coworking spaces like CitizenSpace are designed intentionally to foster these connections. From community events and workshops to shared lunch tables and collaborative projects, every element is crafted to bring people together.

## The Future of Work

As remote work becomes more prevalent, coworking spaces are evolving to meet new needs. They're no longer just for freelancers and startups—they're where distributed teams gather, where corporate employees escape the commute, and where anyone seeking connection and community can find their tribe.

The future of coworking isn't about desks—it's about people, purpose, and the power of working together.
    `,
    image:
      'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
    author_name: 'Karsten Wade',
    author_avatar: '/team/karsten.jpg',
    author_bio: 'Founder & CEO of Citizen Space',
    tags: ['Coworking', 'Community', 'Business'],
    published_at: new Date('2025-01-10'),
    reading_time: 8,
  },
  {
    title: 'Coffee Culture and Productivity: The Perfect Blend',
    slug: 'coffee-culture-productivity',
    excerpt:
      'Exploring the relationship between coffee culture and creative productivity in modern workspaces.',
    content: `
# Coffee Culture and Productivity: The Perfect Blend

There's a reason why so many great ideas have been born in coffee shops. The combination of caffeine, ambient noise, and casual atmosphere creates the perfect conditions for creativity and productivity.

## The Science of Coffee and Creativity

Research has shown that moderate caffeine consumption can enhance focus, improve memory, and boost creative thinking. But it's not just about the chemical boost—the ritual of brewing and enjoying coffee provides natural breaks that help prevent burnout.

## Creating a Coffee Culture

At CitizenSpace, we've made coffee culture central to our community. Our cafe isn't just a amenity—it's a gathering place where ideas percolate along with the espresso. We source locally roasted beans, train our baristas in both craft and conversation, and create an environment where a coffee break can lead to your next big breakthrough.

## Beyond the Brew

But coffee culture is about more than just the beverage. It's about slowing down in a fast-paced world, connecting with others, and creating space for serendipitous conversations that spark innovation.

## The Perfect Environment

The ideal workspace combines the energy of a bustling cafe with the focus of a private office. That's the balance we strive for at CitizenSpace—a place where you can enjoy your perfectly crafted latte while tackling your most challenging work.
    `,
    image:
      'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    author_name: 'Maria Rodriguez',
    author_avatar: '/team/maria.jpg',
    author_bio: 'Head of Community at Citizen Space',
    tags: ['Coffee', 'Productivity', 'Culture'],
    published_at: new Date('2025-01-08'),
    reading_time: 6,
  },
  {
    title: 'Building Remote Team Culture in Hybrid Workspaces',
    slug: 'remote-team-culture',
    excerpt:
      'Strategies for maintaining strong team connections when your workforce spans home offices and coworking spaces.',
    content: `
# Building Remote Team Culture in Hybrid Workspaces

The shift to remote and hybrid work has transformed how teams collaborate, but it's also created new challenges in maintaining strong company culture. Here's how forward-thinking companies are using coworking spaces to bridge the gap.

## The Hybrid Challenge

When some team members work from home, others from a corporate office, and still others from coworking spaces, maintaining a cohesive culture becomes complex. Each environment offers different advantages and challenges.

## Coworking as the Great Equalizer

Coworking spaces offer a unique solution: they provide the structure and amenities of a traditional office with the flexibility and autonomy of remote work. When team members gather at a space like CitizenSpace, they're on neutral ground—not at anyone's home office, not at company HQ, but in a space designed for collaboration.

## Intentional Gathering

The key is being intentional about when and why teams come together. Use coworking days for brainstorming sessions, team building, and collaborative projects. Save deep focus work for home office days. This hybrid approach plays to the strengths of each environment.

## Building Connection

Regular team gatherings at coworking spaces, combined with virtual check-ins and asynchronous communication, can create a culture that's actually stronger than traditional office setups. The key is consistency and intentionality.

## The Future is Flexible

As we move forward, successful companies will be those that embrace flexibility while maintaining strong connections. Coworking spaces are a vital tool in building this new kind of workplace culture.
    `,
    image:
      'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    author_name: 'James Kim',
    author_avatar: '/team/james.jpg',
    author_bio: 'Community Manager',
    tags: ['Remote Work', 'Team Building', 'Hybrid'],
    published_at: new Date('2025-01-05'),
    reading_time: 10,
  },
  {
    title: "San Francisco's Entrepreneurial Renaissance",
    slug: 'sf-entrepreneurial-renaissance',
    excerpt:
      'How the post-pandemic landscape has created new opportunities for startups and independent workers in SF.',
    content: `
# San Francisco's Entrepreneurial Renaissance

San Francisco has always been a hub for innovation, but the post-pandemic landscape has sparked a new entrepreneurial renaissance. Here's what's driving this exciting transformation.

## A New Chapter

The pandemic fundamentally changed how we think about work, location, and community. While some predicted the death of cities, San Francisco has instead evolved into something more vibrant and diverse than before.

## Lower Barriers to Entry

With more flexible work arrangements and a thriving coworking scene, starting a business in San Francisco is more accessible than ever. You don't need venture capital to rent a fancy office—you can start with a coworking membership and scale up as you grow.

## Community-Driven Innovation

The new SF entrepreneurial ecosystem is less about competing for resources and more about collaborative innovation. Coworking spaces have become the new startup incubators, where founders share advice, resources, and connections.

## Diverse Perspectives

The flexibility of remote work has brought diverse talent back to the city. People who couldn't afford to live here before are now building businesses while enjoying the culture and community SF offers.

## The Road Ahead

San Francisco's entrepreneurial future is bright. As more people discover the benefits of flexible work and community-driven collaboration, we'll see even more innovation and opportunity emerge from this incredible city.
    `,
    image:
      'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=800',
    author_name: 'Karsten Wade',
    author_avatar: '/team/karsten.jpg',
    author_bio: 'Founder & CEO of Citizen Space',
    tags: ['San Francisco', 'Entrepreneurship', 'Startups'],
    published_at: new Date('2025-01-02'),
    reading_time: 7,
  },
]

/**
 * Main migration function
 */
async function migrateBlogPosts() {
  console.log('==========================================')
  console.log('Blog Data Migration Starting')
  console.log('==========================================')

  try {
    let successCount = 0
    let errorCount = 0

    for (const post of blogPosts) {
      try {
        console.log(`\nMigrating: ${post.title}`)

        // Check if post already exists
        const checkQuery = 'SELECT id FROM blog_posts WHERE slug = $1'
        const { data: existing } = await executeQuery(checkQuery, [post.slug])

        if (existing && existing.length > 0) {
          console.log(`  ⚠️  Post already exists, skipping...`)
          continue
        }

        // Insert blog post
        const insertQuery = `
          INSERT INTO blog_posts (
            title,
            slug,
            excerpt,
            content,
            image,
            author_name,
            author_avatar,
            author_bio,
            tags,
            published_at,
            reading_time,
            published,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          RETURNING id
        `

        const params = [
          post.title,
          post.slug,
          post.excerpt,
          post.content.trim(),
          post.image,
          post.author_name,
          post.author_avatar,
          post.author_bio,
          JSON.stringify(post.tags),
          post.published_at.toISOString(),
          post.reading_time,
          true, // published
        ]

        const { data, error } = await executeQuery(insertQuery, params)

        if (error) {
          console.error(`  ❌ Error: ${error}`)
          errorCount++
        } else {
          console.log(`  ✅ Migrated successfully (ID: ${data?.[0]?.id})`)
          successCount++
        }
      } catch (error) {
        console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        errorCount++
      }
    }

    console.log('\n==========================================')
    console.log('Migration Complete')
    console.log('==========================================')
    console.log(`✅ Successfully migrated: ${successCount} posts`)
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} posts`)
    }

    // Update category counts
    console.log('\nUpdating category counts...')
    const updateQuery = 'SELECT update_blog_category_counts()'
    await executeQuery(updateQuery)
    console.log('✅ Category counts updated')

    console.log('==========================================\n')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateBlogPosts()
  .then(() => {
    console.log('Migration script completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })