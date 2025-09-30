import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { getCreditTransactions } from '@/lib/db/repositories/booking.repository'
import { apiResponse, apiError } from '@/lib/api/response'

/**
 * GET /api/memberships/credits/transactions
 * Get user's credit transaction history
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return apiError('Unauthorized', 401)
    }

    const userId = authResult.user.userId

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const creditType = searchParams.get('type') as 'meeting-room' | 'printing' | 'guest-pass' | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get transaction history
    const result = await getCreditTransactions(userId, creditType || undefined, limit, offset)

    if (result.error) {
      return apiError('Failed to fetch transaction history', 500, result.error)
    }

    const transactions = result.data || []

    // Group transactions by type for summary
    const summary = transactions.reduce(
      (acc, txn) => {
        const type = txn.credit_type
        if (!acc[type]) {
          acc[type] = {
            total_allocated: 0,
            total_deducted: 0,
            total_refunded: 0,
            net_balance: 0,
          }
        }

        if (txn.transaction_type === 'allocation') {
          acc[type].total_allocated += txn.amount
        } else if (txn.transaction_type === 'deduction') {
          acc[type].total_deducted += txn.amount
        } else if (txn.transaction_type === 'refund') {
          acc[type].total_refunded += txn.amount
        }

        acc[type].net_balance = acc[type].total_allocated - acc[type].total_deducted + acc[type].total_refunded

        return acc
      },
      {} as Record<string, any>
    )

    return apiResponse({
      user_id: userId,
      transactions,
      summary,
      pagination: {
        limit,
        offset,
        total: transactions.length,
        has_more: transactions.length === limit,
      },
    })
  } catch (error) {
    console.error('Error fetching credit transactions:', error)
    return apiError('Internal server error', 500)
  }
}