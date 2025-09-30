/**
 * Unit tests for validation utilities
 */

import {
  validateFutureDate,
  validateTimeRange,
  timeToMinutes,
  calculateDuration,
  safeValidateParams,
  workspaceFiltersSchema,
  paginationSchema,
  availabilityQuerySchema,
  uuidSchema,
} from '@/lib/api/validation';

describe('Validation Utilities', () => {
  describe('validateFutureDate', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateString = futureDate.toISOString().split('T')[0];

      expect(validateFutureDate(dateString)).toBe(true);
    });

    it('should return true for today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(validateFutureDate(today)).toBe(true);
    });

    it('should return false for past dates', () => {
      expect(validateFutureDate('2020-01-01')).toBe(false);
    });
  });

  describe('validateTimeRange', () => {
    it('should return true when end time is after start time', () => {
      expect(validateTimeRange('09:00', '17:00')).toBe(true);
    });

    it('should return false when end time is before start time', () => {
      expect(validateTimeRange('17:00', '09:00')).toBe(false);
    });

    it('should return false when times are equal', () => {
      expect(validateTimeRange('09:00', '09:00')).toBe(false);
    });
  });

  describe('timeToMinutes', () => {
    it('should convert time string to minutes', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('01:00')).toBe(60);
      expect(timeToMinutes('09:30')).toBe(570);
      expect(timeToMinutes('23:59')).toBe(1439);
    });
  });

  describe('calculateDuration', () => {
    it('should calculate duration in hours', () => {
      expect(calculateDuration('09:00', '17:00')).toBe(8);
      expect(calculateDuration('09:00', '09:30')).toBe(0.5);
      expect(calculateDuration('14:15', '16:45')).toBe(2.5);
    });
  });

  describe('safeValidateParams', () => {
    describe('workspaceFiltersSchema', () => {
      it('should validate valid filters', () => {
        const result = safeValidateParams(workspaceFiltersSchema, {
          type: 'hot-desk',
          min_capacity: '2',
          max_capacity: '10',
          available: 'true',
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe('hot-desk');
          expect(result.data.min_capacity).toBe(2);
          expect(result.data.max_capacity).toBe(10);
          expect(result.data.available).toBe(true);
        }
      });

      it('should parse comma-separated amenities', () => {
        const result = safeValidateParams(workspaceFiltersSchema, {
          amenities: 'WiFi,Power,Monitor',
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.amenities).toEqual(['WiFi', 'Power', 'Monitor']);
        }
      });

      it('should reject invalid workspace type', () => {
        const result = safeValidateParams(workspaceFiltersSchema, {
          type: 'invalid-type',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('type');
        }
      });

      it('should reject negative capacity', () => {
        const result = safeValidateParams(workspaceFiltersSchema, {
          min_capacity: '-1',
        });

        expect(result.success).toBe(false);
      });
    });

    describe('paginationSchema', () => {
      it('should use default values', () => {
        const result = safeValidateParams(paginationSchema, {});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(1);
          expect(result.data.limit).toBe(20);
          expect(result.data.sortBy).toBe('created_at');
          expect(result.data.sortOrder).toBe('desc');
        }
      });

      it('should validate custom pagination', () => {
        const result = safeValidateParams(paginationSchema, {
          page: '2',
          limit: '50',
          sortBy: 'name',
          sortOrder: 'asc',
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(2);
          expect(result.data.limit).toBe(50);
          expect(result.data.sortBy).toBe('name');
          expect(result.data.sortOrder).toBe('asc');
        }
      });

      it('should reject negative page number', () => {
        const result = safeValidateParams(paginationSchema, {
          page: '-1',
        });

        expect(result.success).toBe(false);
      });

      it('should reject limit over 100', () => {
        const result = safeValidateParams(paginationSchema, {
          limit: '150',
        });

        expect(result.success).toBe(false);
      });

      it('should reject invalid sort order', () => {
        const result = safeValidateParams(paginationSchema, {
          sortOrder: 'invalid',
        });

        expect(result.success).toBe(false);
      });
    });

    describe('availabilityQuerySchema', () => {
      it('should validate valid availability query', () => {
        const result = safeValidateParams(availabilityQuerySchema, {
          date: '2025-10-01',
          start_time: '09:00',
          end_time: '17:00',
          resource_category: 'desk',
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.date).toBe('2025-10-01');
          expect(result.data.start_time).toBe('09:00');
          expect(result.data.end_time).toBe('17:00');
          expect(result.data.resource_category).toBe('desk');
        }
      });

      it('should require date parameter', () => {
        const result = safeValidateParams(availabilityQuerySchema, {});

        expect(result.success).toBe(false);
      });

      it('should reject invalid date format', () => {
        const result = safeValidateParams(availabilityQuerySchema, {
          date: '10/01/2025',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('YYYY-MM-DD');
        }
      });

      it('should reject invalid time format', () => {
        const result = safeValidateParams(availabilityQuerySchema, {
          date: '2025-10-01',
          start_time: '9am',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('HH:MM');
        }
      });
    });

    describe('uuidSchema', () => {
      it('should validate valid UUID', () => {
        const result = safeValidateParams(
          uuidSchema,
          '123e4567-e89b-12d3-a456-426614174000'
        );

        expect(result.success).toBe(true);
      });

      it('should reject invalid UUID', () => {
        const result = safeValidateParams(uuidSchema, 'invalid-uuid');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Invalid');
        }
      });
    });
  });
});