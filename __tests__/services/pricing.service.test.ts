import {
  calculateHourlyDeskPricing,
  calculateMeetingRoomPricing,
  calculateFinalCharge,
  calculateDurationHours,
  calculateActualDuration,
  validateBookingDuration,
  calculateDayPassPricing,
  PROCESSING_FEE,
  HOT_DESK_BASE_RATE,
  NFT_DISCOUNT_RATE,
} from '@/lib/services/pricing.service';
import { Workspace } from '@/lib/db/types';

describe('Pricing Service', () => {
  describe('calculateHourlyDeskPricing', () => {
    it('should calculate standard pricing for non-member', () => {
      const pricing = calculateHourlyDeskPricing(3, {
        nft_holder: false,
        membership_plan_id: null,
      });

      expect(pricing.basePrice).toBe(HOT_DESK_BASE_RATE);
      expect(pricing.subtotal).toBe(7.5); // 2.50 * 3
      expect(pricing.discountAmount).toBe(0);
      expect(pricing.nftDiscountApplied).toBe(false);
      expect(pricing.processingFee).toBe(PROCESSING_FEE);
      expect(pricing.totalPrice).toBe(9.5); // 7.50 + 2.00
      expect(pricing.paymentMethod).toBe('card');
    });

    it('should apply 50% NFT holder discount', () => {
      const pricing = calculateHourlyDeskPricing(3, {
        nft_holder: true,
        membership_plan_id: null,
      });

      expect(pricing.subtotal).toBe(3.75); // 7.50 * 0.5
      expect(pricing.discountAmount).toBe(3.75); // 50% off
      expect(pricing.nftDiscountApplied).toBe(true);
      expect(pricing.totalPrice).toBe(5.75); // 3.75 + 2.00
    });

    it('should be free for members with hot desk included', () => {
      const pricing = calculateHourlyDeskPricing(3, {
        nft_holder: false,
        membership_plan_id: 'plan-123',
        membership_plan: {
          includes_hot_desk: true,
          membership_status: 'active',
        },
      });

      expect(pricing.subtotal).toBe(0);
      expect(pricing.totalPrice).toBe(0);
      expect(pricing.processingFee).toBe(0);
      expect(pricing.paymentMethod).toBe('membership');
    });

    it('should charge if membership does not include hot desk', () => {
      const pricing = calculateHourlyDeskPricing(3, {
        nft_holder: false,
        membership_plan_id: 'plan-123',
        membership_plan: {
          includes_hot_desk: false,
          membership_status: 'active',
        },
      });

      expect(pricing.subtotal).toBe(7.5);
      expect(pricing.totalPrice).toBe(9.5);
      expect(pricing.paymentMethod).toBe('card');
    });

    it('should charge if membership is not active', () => {
      const pricing = calculateHourlyDeskPricing(3, {
        nft_holder: false,
        membership_plan_id: 'plan-123',
        membership_plan: {
          includes_hot_desk: true,
          membership_status: 'paused',
        },
      });

      expect(pricing.subtotal).toBe(7.5);
      expect(pricing.totalPrice).toBe(9.5);
      expect(pricing.paymentMethod).toBe('card');
    });
  });

  describe('calculateMeetingRoomPricing', () => {
    const mockWorkspace: Workspace = {
      id: 'workspace-1',
      name: 'Focus Room',
      type: 'focus-room',
      resource_category: 'meeting-room',
      description: 'Test room',
      capacity: 4,
      base_price_hourly: 25,
      requires_credits: true,
      min_duration: 1,
      max_duration: 8,
      amenities: [],
      images: [],
      available: true,
      floor_location: '2nd Floor',
      created_at: '2025-09-29T00:00:00Z',
    };

    it('should be free if user has enough credits', () => {
      const pricing = calculateMeetingRoomPricing(mockWorkspace, 2, 8, false);

      expect(pricing.creditsUsed).toBe(2);
      expect(pricing.creditsOverageHours).toBe(0);
      expect(pricing.overageCharge).toBe(0);
      expect(pricing.totalPrice).toBe(0);
      expect(pricing.paymentMethod).toBe('credits');
    });

    it('should charge for overage hours without NFT discount', () => {
      const pricing = calculateMeetingRoomPricing(mockWorkspace, 4, 2, false);

      expect(pricing.creditsUsed).toBe(2);
      expect(pricing.creditsOverageHours).toBe(2);
      expect(pricing.overageCharge).toBe(50); // 2 hours * $25
      expect(pricing.processingFee).toBe(PROCESSING_FEE);
      expect(pricing.totalPrice).toBe(52); // 50 + 2
      expect(pricing.paymentMethod).toBe('card');
    });

    it('should apply NFT discount to overage hours', () => {
      const pricing = calculateMeetingRoomPricing(mockWorkspace, 4, 2, true);

      expect(pricing.creditsUsed).toBe(2);
      expect(pricing.creditsOverageHours).toBe(2);
      expect(pricing.overageCharge).toBe(25); // 2 * $25 * 0.5
      expect(pricing.discountAmount).toBe(25); // 50% off
      expect(pricing.nftDiscountApplied).toBe(true);
      expect(pricing.totalPrice).toBe(27); // 25 + 2
    });

    it('should charge full price if no credits available', () => {
      const pricing = calculateMeetingRoomPricing(mockWorkspace, 3, 0, false);

      expect(pricing.creditsUsed).toBe(0);
      expect(pricing.creditsOverageHours).toBe(3);
      expect(pricing.overageCharge).toBe(75); // 3 * $25
      expect(pricing.totalPrice).toBe(77);
      expect(pricing.paymentMethod).toBe('card');
    });
  });

  describe('calculateFinalCharge', () => {
    it('should issue refund for early checkout', () => {
      const result = calculateFinalCharge(3, 2, 7.5, 2, false);

      expect(result.finalCharge).toBe(7); // 2 hours * 2.50 + 2.00
      expect(result.refundAmount).toBe(2.5); // 9.5 - 7
      expect(result.overageCharge).toBe(0);
      expect(result.description).toContain('Refund issued');
    });

    it('should charge overage for late checkout', () => {
      const result = calculateFinalCharge(3, 4, 7.5, 2, false);

      expect(result.finalCharge).toBe(12); // 9.5 + 2.5 (1 hour overage)
      expect(result.refundAmount).toBe(0);
      expect(result.overageCharge).toBe(2.5); // 1 hour * 2.50
      expect(result.description).toContain('overage');
    });

    it('should apply no changes for exact usage', () => {
      const result = calculateFinalCharge(3, 3, 7.5, 2, false);

      expect(result.finalCharge).toBe(9.5);
      expect(result.refundAmount).toBe(0);
      expect(result.overageCharge).toBe(0);
      expect(result.description).toContain('exactly');
    });

    it('should apply NFT discount to overage charges', () => {
      const result = calculateFinalCharge(3, 4, 3.75, 2, true);

      const overageRate = HOT_DESK_BASE_RATE * (1 - NFT_DISCOUNT_RATE);
      expect(result.overageCharge).toBe(overageRate); // 1 hour * 1.25
      expect(result.finalCharge).toBe(5.75 + overageRate);
    });

    it('should handle large overage', () => {
      const result = calculateFinalCharge(2, 5, 5, 2, false);

      expect(result.overageCharge).toBe(7.5); // 3 hours * 2.50
      expect(result.finalCharge).toBe(14.5); // 7 + 7.5
    });
  });

  describe('calculateDurationHours', () => {
    it('should calculate duration correctly', () => {
      expect(calculateDurationHours('09:00', '12:00')).toBe(3);
      expect(calculateDurationHours('09:30', '11:45')).toBe(2.25);
      expect(calculateDurationHours('13:00', '17:30')).toBe(4.5);
    });

    it('should handle crossing midnight', () => {
      expect(calculateDurationHours('23:00', '02:00')).toBe(3);
      expect(calculateDurationHours('22:30', '01:15')).toBe(2.75);
    });
  });

  describe('calculateActualDuration', () => {
    it('should calculate actual duration from timestamps', () => {
      const checkIn = '2025-09-29T09:00:00Z';
      const checkOut = '2025-09-29T12:00:00Z';

      expect(calculateActualDuration(checkIn, checkOut)).toBe(3);
    });

    it('should handle fractional hours', () => {
      const checkIn = '2025-09-29T09:00:00Z';
      const checkOut = '2025-09-29T11:45:00Z';

      expect(calculateActualDuration(checkIn, checkOut)).toBe(2.75);
    });

    it('should round to 2 decimal places', () => {
      const checkIn = '2025-09-29T09:00:00Z';
      const checkOut = '2025-09-29T10:20:00Z';

      const result = calculateActualDuration(checkIn, checkOut);
      expect(result).toBeCloseTo(1.33, 2);
    });
  });

  describe('validateBookingDuration', () => {
    const mockWorkspace: Workspace = {
      id: 'workspace-1',
      name: 'Test Workspace',
      type: 'hot-desk',
      resource_category: 'desk',
      description: 'Test',
      capacity: 1,
      base_price_hourly: 2.5,
      requires_credits: false,
      min_duration: 1,
      max_duration: 8,
      amenities: [],
      images: [],
      available: true,
      floor_location: '1st Floor',
      created_at: '2025-09-29T00:00:00Z',
    };

    it('should accept valid duration', () => {
      const result = validateBookingDuration(mockWorkspace, 4);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject duration below minimum', () => {
      const result = validateBookingDuration(mockWorkspace, 0.5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum booking duration');
    });

    it('should reject duration above maximum', () => {
      const result = validateBookingDuration(mockWorkspace, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum booking duration');
    });

    it('should accept edge case durations', () => {
      expect(validateBookingDuration(mockWorkspace, 1).valid).toBe(true);
      expect(validateBookingDuration(mockWorkspace, 8).valid).toBe(true);
    });
  });

  describe('calculateDayPassPricing', () => {
    it('should calculate standard day pass pricing', () => {
      const pricing = calculateDayPassPricing(false);

      expect(pricing.basePrice).toBe(25);
      expect(pricing.subtotal).toBe(25);
      expect(pricing.discountAmount).toBe(0);
      expect(pricing.nftDiscountApplied).toBe(false);
      expect(pricing.totalPrice).toBe(27); // 25 + 2
    });

    it('should apply NFT discount to day pass', () => {
      const pricing = calculateDayPassPricing(true);

      expect(pricing.subtotal).toBe(12.5); // 25 * 0.5
      expect(pricing.discountAmount).toBe(12.5);
      expect(pricing.nftDiscountApplied).toBe(true);
      expect(pricing.totalPrice).toBe(14.5); // 12.5 + 2
    });
  });

  describe('PRD Scenario Tests', () => {
    describe('Scenario 1: Hourly Hot Desk Rental (Pay-as-you-go)', () => {
      it('should calculate correct pricing for 3-hour booking without NFT', () => {
        const pricing = calculateHourlyDeskPricing(3, {
          nft_holder: false,
          membership_plan_id: null,
        });

        expect(pricing.subtotal).toBe(7.5);
        expect(pricing.processingFee).toBe(2.0);
        expect(pricing.totalPrice).toBe(9.5);
      });

      it('should calculate correct pricing for 3-hour booking with NFT', () => {
        const pricing = calculateHourlyDeskPricing(3, {
          nft_holder: true,
          membership_plan_id: null,
        });

        expect(pricing.subtotal).toBe(3.75);
        expect(pricing.discountAmount).toBe(3.75);
        expect(pricing.totalPrice).toBe(5.75);
      });
    });

    describe('Scenario 2: Meeting Room with Membership Credits', () => {
      const boardroom: Workspace = {
        id: 'boardroom-1',
        name: 'Boardroom',
        type: 'boardroom',
        resource_category: 'meeting-room',
        description: 'Large meeting room',
        capacity: 8,
        base_price_hourly: 60,
        requires_credits: true,
        min_duration: 1,
        max_duration: 8,
        amenities: [],
        images: [],
        available: true,
        floor_location: '3rd Floor',
        created_at: '2025-09-29T00:00:00Z',
      };

      it('should use credits for 2-hour booking with 8 hours available', () => {
        const pricing = calculateMeetingRoomPricing(boardroom, 2, 8, false);

        expect(pricing.creditsUsed).toBe(2);
        expect(pricing.totalPrice).toBe(0);
      });
    });

    describe('Scenario 3: Meeting Room - Credits Exceeded (Overage)', () => {
      const boardroom: Workspace = {
        id: 'boardroom-1',
        name: 'Boardroom',
        type: 'boardroom',
        resource_category: 'meeting-room',
        description: 'Large meeting room',
        capacity: 8,
        base_price_hourly: 60,
        requires_credits: true,
        min_duration: 1,
        max_duration: 8,
        amenities: [],
        images: [],
        available: true,
        floor_location: '3rd Floor',
        created_at: '2025-09-29T00:00:00Z',
      };

      it('should calculate overage for 4-hour booking with 2 hours credit', () => {
        const pricing = calculateMeetingRoomPricing(boardroom, 4, 2, false);

        expect(pricing.creditsUsed).toBe(2);
        expect(pricing.creditsOverageHours).toBe(2);
        expect(pricing.overageCharge).toBe(120); // 2 * 60
        expect(pricing.totalPrice).toBe(122); // 120 + 2
      });

      it('should apply NFT discount to overage', () => {
        const pricing = calculateMeetingRoomPricing(boardroom, 4, 2, true);

        expect(pricing.creditsUsed).toBe(2);
        expect(pricing.overageCharge).toBe(60); // 2 * 60 * 0.5
        expect(pricing.totalPrice).toBe(62);
      });
    });

    describe('Scenario 4: Day Pass User', () => {
      it('should calculate day pass pricing', () => {
        const pricing = calculateDayPassPricing(false);
        expect(pricing.totalPrice).toBe(27);
      });

      it('should apply NFT discount to day pass', () => {
        const pricing = calculateDayPassPricing(true);
        expect(pricing.totalPrice).toBe(14.5);
      });
    });

    describe('Scenario 5: Monthly Member with Hot Desk Included', () => {
      it('should be free for member with hot desk access', () => {
        const pricing = calculateHourlyDeskPricing(5, {
          nft_holder: false,
          membership_plan_id: 'plan-123',
          membership_plan: {
            includes_hot_desk: true,
            membership_status: 'active',
          },
        });

        expect(pricing.totalPrice).toBe(0);
        expect(pricing.paymentMethod).toBe('membership');
      });
    });
  });
});