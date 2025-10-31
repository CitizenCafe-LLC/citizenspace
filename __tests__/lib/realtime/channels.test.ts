/**
 * Tests for Pusher Channel Management
 */

import {
  getUserChannel,
  getPublicChannels,
  isPrivateChannel,
  canAccessChannel,
  extractUserIdFromChannel,
  getResourceChannel,
  isValidChannelName,
} from '@/lib/realtime/channels';
import { CHANNELS } from '@/lib/realtime/types';

describe('Realtime Channels', () => {
  describe('getUserChannel', () => {
    it('should return user-specific channel name', () => {
      const userId = 'user-123';
      const channel = getUserChannel(userId);
      expect(channel).toBe('private-user-user-123');
    });

    it('should handle different user ID formats', () => {
      expect(getUserChannel('abc-123')).toBe('private-user-abc-123');
      expect(getUserChannel('user_456')).toBe('private-user-user_456');
    });
  });

  describe('getPublicChannels', () => {
    it('should return array of public channel names', () => {
      const channels = getPublicChannels();
      expect(Array.isArray(channels)).toBe(true);
      expect(channels).toContain('bookings');
      expect(channels).toContain('orders');
      expect(channels).toContain('availability');
    });

    it('should return exactly 3 public channels', () => {
      const channels = getPublicChannels();
      expect(channels).toHaveLength(3);
    });
  });

  describe('isPrivateChannel', () => {
    it('should return true for private channels', () => {
      expect(isPrivateChannel('private-user-123')).toBe(true);
      expect(isPrivateChannel('private-admin')).toBe(true);
    });

    it('should return false for public channels', () => {
      expect(isPrivateChannel('bookings')).toBe(false);
      expect(isPrivateChannel('orders')).toBe(false);
      expect(isPrivateChannel('availability')).toBe(false);
    });
  });

  describe('canAccessChannel', () => {
    describe('public channels', () => {
      it('should allow access without authentication', () => {
        expect(canAccessChannel('bookings', null, null)).toBe(true);
        expect(canAccessChannel('orders', null, null)).toBe(true);
        expect(canAccessChannel('availability', null, null)).toBe(true);
      });

      it('should allow access with authentication', () => {
        expect(canAccessChannel('bookings', 'user-123', 'user')).toBe(true);
      });
    });

    describe('private channels', () => {
      it('should deny access without authentication', () => {
        expect(canAccessChannel('private-user-123', null, null)).toBe(false);
        expect(canAccessChannel('private-admin', null, null)).toBe(false);
      });

      it('should allow access to own user channel', () => {
        expect(canAccessChannel('private-user-user-123', 'user-123', 'user')).toBe(true);
      });

      it('should deny access to other user channels', () => {
        expect(canAccessChannel('private-user-user-456', 'user-123', 'user')).toBe(false);
      });

      it('should allow admin access to admin channel', () => {
        expect(canAccessChannel('private-admin', 'admin-1', 'admin')).toBe(true);
      });

      it('should deny non-admin access to admin channel', () => {
        expect(canAccessChannel('private-admin', 'user-123', 'user')).toBe(false);
        expect(canAccessChannel('private-admin', 'staff-1', 'staff')).toBe(false);
      });
    });
  });

  describe('extractUserIdFromChannel', () => {
    it('should extract user ID from user channel', () => {
      const userId = extractUserIdFromChannel('private-user-user-123');
      expect(userId).toBe('user-123');
    });

    it('should return null for non-user channels', () => {
      expect(extractUserIdFromChannel('bookings')).toBeNull();
      expect(extractUserIdFromChannel('private-admin')).toBeNull();
    });

    it('should handle complex user IDs', () => {
      expect(extractUserIdFromChannel('private-user-abc-123-def')).toBe('abc-123-def');
    });
  });

  describe('getResourceChannel', () => {
    it('should return correct channel for booking resource', () => {
      expect(getResourceChannel('booking')).toBe('bookings');
    });

    it('should return correct channel for order resource', () => {
      expect(getResourceChannel('order')).toBe('orders');
    });

    it('should return correct channel for availability resource', () => {
      expect(getResourceChannel('availability')).toBe('availability');
    });

    it('should throw error for unknown resource type', () => {
      // @ts-ignore - testing runtime error
      expect(() => getResourceChannel('invalid')).toThrow('Unknown resource type');
    });
  });

  describe('isValidChannelName', () => {
    it('should validate correct channel names', () => {
      expect(isValidChannelName('bookings')).toBe(true);
      expect(isValidChannelName('private-user-123')).toBe(true);
      expect(isValidChannelName('my_channel-123')).toBe(true);
    });

    it('should reject empty or null channel names', () => {
      expect(isValidChannelName('')).toBe(false);
      // @ts-ignore - testing runtime validation
      expect(isValidChannelName(null)).toBe(false);
      // @ts-ignore - testing runtime validation
      expect(isValidChannelName(undefined)).toBe(false);
    });

    it('should reject channel names with invalid characters', () => {
      expect(isValidChannelName('channel with spaces')).toBe(false);
      expect(isValidChannelName('channel@special')).toBe(false);
      expect(isValidChannelName('channel.dots')).toBe(false);
    });

    it('should reject channel names that are too long', () => {
      const longName = 'a'.repeat(201);
      expect(isValidChannelName(longName)).toBe(false);
    });

    it('should accept channel names up to 200 characters', () => {
      const maxName = 'a'.repeat(200);
      expect(isValidChannelName(maxName)).toBe(true);
    });
  });
});
