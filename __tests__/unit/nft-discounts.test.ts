/**
 * NFT Discount Calculator Tests
 *
 * Comprehensive tests for discount calculations on workspace bookings
 * and cafe orders for NFT holders.
 */

import {
  calculateWorkspacePrice,
  calculateCafePrice,
  formatPricingDisplay,
  getDiscountRate,
  applyNftDiscount,
  calculateBulkPrice,
  validateDiscountedPrice,
  createPricingBreakdown,
  PricingCalculation,
} from '@/lib/pricing/nft-discounts';
import { NFT_HOLDER_DISCOUNTS } from '@/lib/web3/contract';

describe('NFT Discount Calculator', () => {
  describe('calculateWorkspacePrice', () => {
    it('should return full price for non-NFT holders', () => {
      const basePrice = 100;
      const result = calculateWorkspacePrice(basePrice, false);

      expect(result).toEqual({
        originalPrice: 100,
        discount: 0,
        discountAmount: 0,
        finalPrice: 100,
        isNftHolder: false,
      });
    });

    it('should apply 50% discount for NFT holders', () => {
      const basePrice = 100;
      const result = calculateWorkspacePrice(basePrice, true);

      expect(result).toEqual({
        originalPrice: 100,
        discount: 0.5,
        discountAmount: 50,
        finalPrice: 50,
        isNftHolder: true,
      });
    });

    it('should handle decimal prices correctly', () => {
      const basePrice = 99.99;
      const result = calculateWorkspacePrice(basePrice, true);

      expect(result.finalPrice).toBeCloseTo(49.995, 3);
      expect(result.discountAmount).toBeCloseTo(49.995, 3);
    });

    it('should handle zero price', () => {
      const result = calculateWorkspacePrice(0, true);

      expect(result.finalPrice).toBe(0);
      expect(result.discountAmount).toBe(0);
    });

    it('should handle large prices', () => {
      const basePrice = 10000;
      const result = calculateWorkspacePrice(basePrice, true);

      expect(result.finalPrice).toBe(5000);
      expect(result.discountAmount).toBe(5000);
    });

    it('should use correct discount rate constant', () => {
      const basePrice = 200;
      const result = calculateWorkspacePrice(basePrice, true);

      expect(result.discount).toBe(NFT_HOLDER_DISCOUNTS.WORKSPACE);
      expect(result.finalPrice).toBe(basePrice * (1 - NFT_HOLDER_DISCOUNTS.WORKSPACE));
    });
  });

  describe('calculateCafePrice', () => {
    it('should return full price for non-NFT holders', () => {
      const basePrice = 50;
      const result = calculateCafePrice(basePrice, false);

      expect(result).toEqual({
        originalPrice: 50,
        discount: 0,
        discountAmount: 0,
        finalPrice: 50,
        isNftHolder: false,
      });
    });

    it('should apply 10% discount for NFT holders', () => {
      const basePrice = 50;
      const result = calculateCafePrice(basePrice, true);

      expect(result).toEqual({
        originalPrice: 50,
        discount: 0.1,
        discountAmount: 5,
        finalPrice: 45,
        isNftHolder: true,
      });
    });

    it('should handle decimal prices correctly', () => {
      const basePrice = 15.50;
      const result = calculateCafePrice(basePrice, true);

      expect(result.finalPrice).toBeCloseTo(13.95, 2);
      expect(result.discountAmount).toBeCloseTo(1.55, 2);
    });

    it('should handle zero price', () => {
      const result = calculateCafePrice(0, true);

      expect(result.finalPrice).toBe(0);
      expect(result.discountAmount).toBe(0);
    });

    it('should use correct discount rate constant', () => {
      const basePrice = 100;
      const result = calculateCafePrice(basePrice, true);

      expect(result.discount).toBe(NFT_HOLDER_DISCOUNTS.CAFE);
      expect(result.finalPrice).toBe(basePrice * (1 - NFT_HOLDER_DISCOUNTS.CAFE));
    });
  });

  describe('formatPricingDisplay', () => {
    it('should format non-NFT holder price simply', () => {
      const calculation: PricingCalculation = {
        originalPrice: 100,
        discount: 0,
        discountAmount: 0,
        finalPrice: 100,
        isNftHolder: false,
      };

      const formatted = formatPricingDisplay(calculation);
      expect(formatted).toBe('$100.00');
    });

    it('should format NFT holder price with discount info', () => {
      const calculation: PricingCalculation = {
        originalPrice: 100,
        discount: 0.5,
        discountAmount: 50,
        finalPrice: 50,
        isNftHolder: true,
      };

      const formatted = formatPricingDisplay(calculation);
      expect(formatted).toBe('$50.00 (50% NFT holder discount)');
    });

    it('should handle custom currency symbols', () => {
      const calculation: PricingCalculation = {
        originalPrice: 100,
        discount: 0,
        discountAmount: 0,
        finalPrice: 100,
        isNftHolder: false,
      };

      const formatted = formatPricingDisplay(calculation, '€');
      expect(formatted).toBe('€100.00');
    });

    it('should format decimal prices correctly', () => {
      const calculation: PricingCalculation = {
        originalPrice: 99.99,
        discount: 0,
        discountAmount: 0,
        finalPrice: 99.99,
        isNftHolder: false,
      };

      const formatted = formatPricingDisplay(calculation);
      expect(formatted).toBe('$99.99');
    });

    it('should round discount percentage to integer', () => {
      const calculation: PricingCalculation = {
        originalPrice: 100,
        discount: 0.1,
        discountAmount: 10,
        finalPrice: 90,
        isNftHolder: true,
      };

      const formatted = formatPricingDisplay(calculation);
      expect(formatted).toContain('10% NFT holder discount');
    });
  });

  describe('getDiscountRate', () => {
    it('should return workspace discount rate', () => {
      const rate = getDiscountRate('workspace');
      expect(rate).toBe(NFT_HOLDER_DISCOUNTS.WORKSPACE);
      expect(rate).toBe(0.5);
    });

    it('should return cafe discount rate', () => {
      const rate = getDiscountRate('cafe');
      expect(rate).toBe(NFT_HOLDER_DISCOUNTS.CAFE);
      expect(rate).toBe(0.1);
    });
  });

  describe('applyNftDiscount', () => {
    it('should apply workspace discount for NFT holders', () => {
      const price = applyNftDiscount(100, 'workspace', true);
      expect(price).toBe(50);
    });

    it('should apply cafe discount for NFT holders', () => {
      const price = applyNftDiscount(100, 'cafe', true);
      expect(price).toBe(90);
    });

    it('should not apply discount for non-NFT holders', () => {
      const workspacePrice = applyNftDiscount(100, 'workspace', false);
      const cafePrice = applyNftDiscount(100, 'cafe', false);

      expect(workspacePrice).toBe(100);
      expect(cafePrice).toBe(100);
    });

    it('should handle decimal prices', () => {
      const price = applyNftDiscount(99.99, 'workspace', true);
      expect(price).toBeCloseTo(49.995, 3);
    });

    it('should handle zero price', () => {
      const price = applyNftDiscount(0, 'workspace', true);
      expect(price).toBe(0);
    });
  });

  describe('calculateBulkPrice', () => {
    it('should calculate total with workspace discount', () => {
      const items = [
        { price: 50 },
        { price: 30 },
        { price: 20 },
      ];

      const result = calculateBulkPrice(items, 'workspace', true);

      expect(result.originalPrice).toBe(100);
      expect(result.finalPrice).toBe(50);
      expect(result.discountAmount).toBe(50);
    });

    it('should calculate total with cafe discount', () => {
      const items = [
        { price: 10 },
        { price: 15 },
        { price: 25 },
      ];

      const result = calculateBulkPrice(items, 'cafe', true);

      expect(result.originalPrice).toBe(50);
      expect(result.finalPrice).toBe(45);
      expect(result.discountAmount).toBe(5);
    });

    it('should handle items with quantities', () => {
      const items = [
        { price: 10, quantity: 3 },
        { price: 20, quantity: 2 },
      ];

      const result = calculateBulkPrice(items, 'workspace', true);

      expect(result.originalPrice).toBe(70); // (10*3) + (20*2)
      expect(result.finalPrice).toBe(35);
    });

    it('should handle no discount for non-NFT holders', () => {
      const items = [{ price: 100 }];

      const result = calculateBulkPrice(items, 'workspace', false);

      expect(result.finalPrice).toBe(100);
      expect(result.discountAmount).toBe(0);
    });

    it('should handle empty items array', () => {
      const result = calculateBulkPrice([], 'workspace', true);

      expect(result.originalPrice).toBe(0);
      expect(result.finalPrice).toBe(0);
    });

    it('should handle mixed quantities', () => {
      const items = [
        { price: 5, quantity: 2 },
        { price: 10 }, // quantity defaults to 1
        { price: 15, quantity: 3 },
      ];

      const result = calculateBulkPrice(items, 'cafe', true);

      const expectedTotal = (5 * 2) + 10 + (15 * 3); // 65
      expect(result.originalPrice).toBe(expectedTotal);
      expect(result.finalPrice).toBeCloseTo(58.5, 2); // 10% off
    });
  });

  describe('validateDiscountedPrice', () => {
    it('should validate correct workspace price', () => {
      const isValid = validateDiscountedPrice(50, 100, 'workspace', true);
      expect(isValid).toBe(true);
    });

    it('should validate correct cafe price', () => {
      const isValid = validateDiscountedPrice(90, 100, 'cafe', true);
      expect(isValid).toBe(true);
    });

    it('should validate non-discounted price', () => {
      const isValid = validateDiscountedPrice(100, 100, 'workspace', false);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect price', () => {
      const isValid = validateDiscountedPrice(60, 100, 'workspace', true);
      expect(isValid).toBe(false);
    });

    it('should handle tolerance correctly', () => {
      // 50.005 is within default tolerance (0.01) of 50
      const isValid = validateDiscountedPrice(50.005, 100, 'workspace', true, 0.01);
      expect(isValid).toBe(true);

      // 50.02 is outside default tolerance
      const isInvalid = validateDiscountedPrice(50.02, 100, 'workspace', true, 0.01);
      expect(isInvalid).toBe(false);
    });

    it('should handle custom tolerance', () => {
      const isValid = validateDiscountedPrice(50.5, 100, 'workspace', true, 1.0);
      expect(isValid).toBe(true);
    });

    it('should validate zero price', () => {
      const isValid = validateDiscountedPrice(0, 0, 'workspace', true);
      expect(isValid).toBe(true);
    });

    it('should reject negative price manipulation', () => {
      const isValid = validateDiscountedPrice(40, 100, 'workspace', true);
      expect(isValid).toBe(false);
    });

    it('should reject inflated price manipulation', () => {
      const isValid = validateDiscountedPrice(60, 100, 'workspace', true);
      expect(isValid).toBe(false);
    });
  });

  describe('createPricingBreakdown', () => {
    it('should create workspace pricing breakdown', () => {
      const breakdown = createPricingBreakdown(100, 'workspace', true);

      expect(breakdown).toEqual({
        base_price: 100,
        discount_rate: 0.5,
        discount_amount: 50,
        final_price: 50,
        nft_holder: true,
        category: 'workspace',
        savings: 50,
      });
    });

    it('should create cafe pricing breakdown', () => {
      const breakdown = createPricingBreakdown(50, 'cafe', true);

      expect(breakdown).toEqual({
        base_price: 50,
        discount_rate: 0.1,
        discount_amount: 5,
        final_price: 45,
        nft_holder: true,
        category: 'cafe',
        savings: 5,
      });
    });

    it('should create breakdown for non-NFT holder', () => {
      const breakdown = createPricingBreakdown(100, 'workspace', false);

      expect(breakdown).toEqual({
        base_price: 100,
        discount_rate: 0,
        discount_amount: 0,
        final_price: 100,
        nft_holder: false,
        category: 'workspace',
        savings: 0,
      });
    });

    it('should handle decimal prices', () => {
      const breakdown = createPricingBreakdown(99.99, 'cafe', true);

      expect(breakdown.base_price).toBe(99.99);
      expect(breakdown.final_price).toBeCloseTo(89.991, 3);
      expect(breakdown.savings).toBeCloseTo(9.999, 3);
    });
  });

  describe('Integration Scenarios', () => {
    it('should correctly calculate multi-day workspace booking', () => {
      const dailyRate = 50;
      const days = 5;
      const totalPrice = dailyRate * days;

      const result = calculateWorkspacePrice(totalPrice, true);

      expect(result.originalPrice).toBe(250);
      expect(result.finalPrice).toBe(125);
      expect(result.discountAmount).toBe(125);
    });

    it('should correctly calculate cafe order with multiple items', () => {
      const items = [
        { price: 5.50, quantity: 2 }, // Coffee x2
        { price: 12.00, quantity: 1 }, // Sandwich
        { price: 3.50, quantity: 3 }, // Pastry x3
      ];

      const result = calculateBulkPrice(items, 'cafe', true);

      const expectedTotal = (5.50 * 2) + 12.00 + (3.50 * 3); // 33.50
      expect(result.originalPrice).toBeCloseTo(33.50, 2);
      expect(result.finalPrice).toBeCloseTo(30.15, 2); // 10% discount
      expect(result.discountAmount).toBeCloseTo(3.35, 2);
    });

    it('should validate pricing calculations match between functions', () => {
      const basePrice = 100;

      const workspaceCalc = calculateWorkspacePrice(basePrice, true);
      const workspaceApplied = applyNftDiscount(basePrice, 'workspace', true);
      const workspaceBreakdown = createPricingBreakdown(basePrice, 'workspace', true);

      expect(workspaceCalc.finalPrice).toBe(workspaceApplied);
      expect(workspaceBreakdown.final_price).toBe(workspaceApplied);
      expect(validateDiscountedPrice(workspaceApplied, basePrice, 'workspace', true)).toBe(true);
    });

    it('should handle realistic pricing scenario', () => {
      // Scenario: User books a meeting room for 3 hours at $25/hour
      const hourlyRate = 25;
      const hours = 3;
      const totalPrice = hourlyRate * hours;

      const nftHolderPrice = calculateWorkspacePrice(totalPrice, true);
      const regularPrice = calculateWorkspacePrice(totalPrice, false);

      expect(regularPrice.finalPrice).toBe(75);
      expect(nftHolderPrice.finalPrice).toBe(37.5);
      expect(nftHolderPrice.discountAmount).toBe(37.5);

      // Validate formatted display
      const formatted = formatPricingDisplay(nftHolderPrice);
      expect(formatted).toBe('$37.50 (50% NFT holder discount)');
    });
  });

  describe('Discount Rate Constants', () => {
    it('should have correct workspace discount rate', () => {
      expect(NFT_HOLDER_DISCOUNTS.WORKSPACE).toBe(0.5);
    });

    it('should have correct cafe discount rate', () => {
      expect(NFT_HOLDER_DISCOUNTS.CAFE).toBe(0.1);
    });

    it('should maintain discount rates between functions', () => {
      const workspaceRate = getDiscountRate('workspace');
      const cafeRate = getDiscountRate('cafe');

      expect(workspaceRate).toBe(NFT_HOLDER_DISCOUNTS.WORKSPACE);
      expect(cafeRate).toBe(NFT_HOLDER_DISCOUNTS.CAFE);
    });
  });
});