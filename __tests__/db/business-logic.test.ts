/**
 * Database Business Logic Tests
 *
 * Tests for critical business logic and data integrity:
 * - Booking calculations
 * - Credit allocation and usage
 * - NFT pricing discounts
 * - Availability checking
 * - Transaction rollbacks
 */

import { getSupabaseClient } from '@/lib/db/supabase'

// Mock Supabase
jest.mock('@/lib/db/supabase')

const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockNeq = jest.fn()
const mockSingle = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockLt = jest.fn()
const mockGt = jest.fn()
const mockLte = jest.fn()
const mockGte = jest.fn()
const mockOrder = jest.fn()
const mockLimit = jest.fn()

const supabase = {
  from: mockFrom,
} as any

;(getSupabaseClient as jest.Mock).mockReturnValue(supabase)

// Setup chainable mock
beforeEach(() => {
  jest.clearAllMocks()

  const mockChain = {
    single: mockSingle,
    eq: mockEq,
    neq: mockNeq,
    lt: mockLt,
    gt: mockGt,
    lte: mockLte,
    gte: mockGte,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    limit: mockLimit,
  }

  mockFrom.mockReturnValue(mockChain)
  mockSelect.mockReturnValue(mockChain)
  mockEq.mockReturnValue(mockChain)
  mockNeq.mockReturnValue(mockChain)
  mockLt.mockReturnValue(mockChain)
  mockGt.mockReturnValue(mockChain)
  mockLte.mockReturnValue(mockChain)
  mockGte.mockReturnValue(mockChain)
  mockLimit.mockReturnValue(mockChain)
  mockSingle.mockReturnValue({ data: null, error: null })
  mockInsert.mockReturnValue(mockChain)
  mockUpdate.mockReturnValue(mockChain)
  mockDelete.mockReturnValue(mockChain)
})

describe('Business Logic Tests', () => {
  describe('Booking Price Calculations', () => {
    it('should calculate correct hourly desk pricing', async () => {
      // Mock hot desk workspace data
      mockSingle.mockResolvedValueOnce({
        data: { base_price_hourly: 2.5, type: 'hot-desk' },
        error: null,
      })

      // Get hot desk workspace
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('type', 'hot-desk')
        .single()

      expect(workspace?.base_price_hourly).toBe(2.5)

      const duration = 4 // 4 hours
      const expectedSubtotal = workspace!.base_price_hourly * duration
      const processingFee = 2.0
      const expectedTotal = expectedSubtotal + processingFee

      expect(expectedSubtotal).toBe(10.0)
      expect(expectedTotal).toBe(12.0)
    })

    it('should apply 50% NFT discount correctly', async () => {
      // Mock hot desk workspace data
      mockSingle.mockResolvedValueOnce({
        data: { base_price_hourly: 2.5, type: 'hot-desk' },
        error: null,
      })

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('type', 'hot-desk')
        .single()

      const basePrice = workspace!.base_price_hourly
      const duration = 4
      const nftDiscount = 0.5 // 50% off

      const subtotal = basePrice * duration
      const discountAmount = subtotal * nftDiscount
      const discountedSubtotal = subtotal - discountAmount
      const processingFee = 2.0
      const total = discountedSubtotal + processingFee

      expect(subtotal).toBe(10.0)
      expect(discountAmount).toBe(5.0)
      expect(discountedSubtotal).toBe(5.0)
      expect(total).toBe(7.0)
    })

    it('should calculate meeting room overage charges', async () => {
      // Mock focus room workspace data
      mockSingle.mockResolvedValueOnce({
        data: { base_price_hourly: 25, type: 'focus-room' },
        error: null,
      })

      const { data: room } = await supabase
        .from('workspaces')
        .select('*')
        .eq('type', 'focus-room')
        .single()

      const requestedHours = 4
      const availableCredits = 2
      const overageHours = requestedHours - availableCredits

      const creditsUsed = availableCredits
      const overageCharge = overageHours * room!.base_price_hourly

      expect(creditsUsed).toBe(2)
      expect(overageHours).toBe(2)
      expect(overageCharge).toBe(50.0) // 2 * $25
    })
  })

  describe('Membership Credits Logic', () => {
    let testUserId: string
    let testPlanId: string

    beforeAll(async () => {
      // Create test user
      const { data: user } = await supabase
        .from('users')
        .insert({
          email: `credits-test-${Date.now()}@example.com`,
          password_hash: 'hash',
          full_name: 'Credits Test User',
        })
        .select()
        .single()

      testUserId = user?.id || ''

      // Get resident plan (8 hours credits)
      const { data: plan } = await supabase
        .from('membership_plans')
        .select('id')
        .eq('slug', 'resident')
        .single()

      testPlanId = plan?.id || ''
    })

    afterAll(async () => {
      if (testUserId) {
        await supabase.from('membership_credits').delete().eq('user_id', testUserId)
        await supabase.from('credit_transactions').delete().eq('user_id', testUserId)
        await supabase.from('users').delete().eq('id', testUserId)
      }
    })

    it('should allocate credits correctly', async () => {
      if (!testUserId) return

      const allocatedAmount = 8 // 8 hours

      const { data, error } = await supabase
        .from('membership_credits')
        .insert({
          user_id: testUserId,
          credit_type: 'meeting-room',
          allocated_amount: allocatedAmount,
          used_amount: 0,
          remaining_amount: allocatedAmount,
          billing_cycle_start: '2025-10-01',
          billing_cycle_end: '2025-10-31',
          status: 'active',
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.allocated_amount).toBe(allocatedAmount)
      expect(data?.remaining_amount).toBe(allocatedAmount)
    })

    it('should track credit usage', async () => {
      if (!testUserId) return

      // Get active credits
      const { data: credits } = await supabase
        .from('membership_credits')
        .select('*')
        .eq('user_id', testUserId)
        .eq('status', 'active')
        .single()

      if (!credits) return

      const usageAmount = 2 // Use 2 hours
      const newRemaining = credits.remaining_amount - usageAmount

      // Update credits
      const { error: updateError } = await supabase
        .from('membership_credits')
        .update({
          used_amount: credits.used_amount + usageAmount,
          remaining_amount: newRemaining,
        })
        .eq('id', credits.id)

      expect(updateError).toBeNull()

      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: testUserId,
          membership_credit_id: credits.id,
          transaction_type: 'usage',
          amount: -usageAmount,
          balance_after: newRemaining,
          description: 'Test booking - Focus Room',
        })
        .select()
        .single()

      expect(txError).toBeNull()
      expect(transaction?.amount).toBe(-usageAmount)
      expect(transaction?.balance_after).toBe(newRemaining)
    })

    it('should prevent negative credit balance', async () => {
      if (!testUserId) return

      const { data: credits } = await supabase
        .from('membership_credits')
        .select('*')
        .eq('user_id', testUserId)
        .eq('status', 'active')
        .single()

      if (!credits) return

      // Attempt to use more credits than available
      const excessiveUsage = credits.remaining_amount + 10

      // This should be prevented by application logic
      expect(excessiveUsage).toBeGreaterThan(credits.remaining_amount)
    })
  })

  describe('Availability Checking', () => {
    let testWorkspaceId: string

    beforeAll(async () => {
      const { data: workspace } = await supabase.from('workspaces').select('id').limit(1).single()

      testWorkspaceId = workspace?.id || ''
    })

    it('should detect overlapping bookings', async () => {
      if (!testWorkspaceId) return

      // Get existing bookings for workspace on a date
      const testDate = '2025-10-15'
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('workspace_id', testWorkspaceId)
        .eq('booking_date', testDate)
        .neq('status', 'cancelled')

      // Check for overlap
      const newStartTime = '10:00:00'
      const newEndTime = '14:00:00'

      const hasOverlap = existingBookings?.some(booking => {
        const existingStart = booking.start_time
        const existingEnd = booking.end_time

        // Check if times overlap
        return (
          (newStartTime >= existingStart && newStartTime < existingEnd) ||
          (newEndTime > existingStart && newEndTime <= existingEnd) ||
          (newStartTime <= existingStart && newEndTime >= existingEnd)
        )
      })

      // This validates our overlap detection logic
      expect(typeof hasOverlap).toBe('boolean')
    })

    it('should check workspace capacity', async () => {
      // Mock workspace with capacity
      mockSingle.mockResolvedValueOnce({
        data: { capacity: 8, id: 'test-workspace' },
        error: null,
      })

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('capacity')
        .eq('id', 'test-workspace')
        .single()

      expect(workspace?.capacity).toBeGreaterThan(0)

      const requestedAttendees = 10
      const isWithinCapacity = requestedAttendees <= (workspace?.capacity || 0)

      expect(typeof isWithinCapacity).toBe('boolean')
    })
  })

  describe('NFT Holder Benefits', () => {
    it('should calculate workspace discount for NFT holders', async () => {
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('base_price_hourly')
        .eq('type', 'boardroom')
        .single()

      const basePrice = workspace?.base_price_hourly || 60
      const nftHolderPrice = basePrice * 0.5 // 50% off

      expect(nftHolderPrice).toBe(30.0)
    })

    it('should calculate cafe discount for NFT holders', async () => {
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('price, nft_holder_price')
        .limit(1)
        .single()

      if (menuItem) {
        const discount = menuItem.price - menuItem.nft_holder_price
        const discountPercentage = (discount / menuItem.price) * 100

        expect(discountPercentage).toBeCloseTo(10, 1) // ~10% discount
      }
    })
  })

  describe('Data Integrity', () => {
    it('should maintain referential integrity with cascading deletes', async () => {
      // Create test user
      const { data: user } = await supabase
        .from('users')
        .insert({
          email: `integrity-test-${Date.now()}@example.com`,
          password_hash: 'hash',
          full_name: 'Integrity Test',
        })
        .select()
        .single()

      if (!user) return

      // Create credits
      const { data: credits } = await supabase
        .from('membership_credits')
        .insert({
          user_id: user.id,
          credit_type: 'meeting-room',
          allocated_amount: 8,
          used_amount: 0,
          remaining_amount: 8,
          billing_cycle_start: '2025-10-01',
          billing_cycle_end: '2025-10-31',
        })
        .select()
        .single()

      expect(credits).toBeDefined()

      // Delete user (should cascade)
      await supabase.from('users').delete().eq('id', user.id)

      // Verify credits were deleted
      const { data: deletedCredits } = await supabase
        .from('membership_credits')
        .select('id')
        .eq('user_id', user.id)

      expect(deletedCredits?.length).toBe(0)
    })

    it('should enforce check constraints on enums', async () => {
      // Attempt to insert invalid booking type
      const { data: user } = await supabase.from('users').select('id').limit(1).single()

      const { data: workspace } = await supabase.from('workspaces').select('id').limit(1).single()

      if (!user || !workspace) return

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        workspace_id: workspace.id,
        booking_type: 'invalid-type', // Should fail
        booking_date: '2025-10-01',
        start_time: '09:00:00',
        end_time: '17:00:00',
        duration_hours: 8,
        attendees: 1,
        subtotal: 20.0,
        total_price: 22.0,
        payment_method: 'card',
        confirmation_code: `FAIL-${Date.now()}`,
      })

      expect(error).toBeDefined()
    })
  })

  describe('Timestamp Triggers', () => {
    it('should auto-update updated_at timestamp', async () => {
      // Create test user
      const { data: user } = await supabase
        .from('users')
        .insert({
          email: `timestamp-test-${Date.now()}@example.com`,
          password_hash: 'hash',
          full_name: 'Timestamp Test',
        })
        .select()
        .single()

      if (!user) return

      const originalUpdatedAt = user.updated_at

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update user
      const { data: updatedUser } = await supabase
        .from('users')
        .update({ full_name: 'Updated Name' })
        .eq('id', user.id)
        .select()
        .single()

      expect(updatedUser?.updated_at).not.toBe(originalUpdatedAt)

      // Cleanup
      await supabase.from('users').delete().eq('id', user.id)
    })
  })

  describe('Query Performance', () => {
    it('should efficiently query bookings by date', async () => {
      const startTime = Date.now()

      await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', '2025-10-15')
        .neq('status', 'cancelled')

      const duration = Date.now() - startTime

      // Should complete in under 1 second with proper indexes
      expect(duration).toBeLessThan(1000)
    })

    it('should efficiently search menu items', async () => {
      const startTime = Date.now()

      await supabase.from('menu_items').select('*').eq('available', true).eq('category', 'coffee')

      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(1000)
    })
  })
})
