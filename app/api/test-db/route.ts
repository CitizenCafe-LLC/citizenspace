import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      return NextResponse.json(
        {
          error: 'DATABASE_URL not set',
          env: Object.keys(process.env).filter(k => k.includes('DATABASE')),
        },
        { status: 500 }
      )
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      connectionTimeoutMillis: 5000,
    })

    const result = await pool.query('SELECT COUNT(*) as count FROM workspaces')
    await pool.end()

    return NextResponse.json({
      success: true,
      databaseUrl: databaseUrl.replace(/:[^:]*@/, ':***@'), // Hide password
      count: result.rows[0].count,
      message: 'Database connection successful',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        databaseUrl: process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@'),
      },
      { status: 500 }
    )
  }
}
