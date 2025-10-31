/**
 * Pusher Channel Management
 * Helper functions for channel subscriptions and authorization
 */

import { CHANNELS } from './types';

// Get user-specific channel name
export function getUserChannel(userId: string): string {
  return `${CHANNELS.USER_PREFIX}${userId}`;
}

// Get all public channel names
export function getPublicChannels(): string[] {
  return [CHANNELS.BOOKINGS, CHANNELS.ORDERS, CHANNELS.AVAILABILITY];
}

// Check if channel is private
export function isPrivateChannel(channelName: string): boolean {
  return channelName.startsWith('private-');
}

// Check if user is authorized for channel
export function canAccessChannel(channelName: string, userId: string | null, userRole: string | null): boolean {
  // Public channels are accessible to everyone
  if (!isPrivateChannel(channelName)) {
    return true;
  }

  // User must be authenticated for private channels
  if (!userId) {
    return false;
  }

  // Admin channel requires admin role
  if (channelName === CHANNELS.ADMIN) {
    return userRole === 'admin';
  }

  // User-specific channels require matching user ID
  if (channelName.startsWith(CHANNELS.USER_PREFIX)) {
    const channelUserId = channelName.replace(CHANNELS.USER_PREFIX, '');
    return channelUserId === userId;
  }

  return false;
}

// Parse channel name to extract user ID
export function extractUserIdFromChannel(channelName: string): string | null {
  if (!channelName.startsWith(CHANNELS.USER_PREFIX)) {
    return null;
  }
  return channelName.replace(CHANNELS.USER_PREFIX, '');
}

// Get channel for a specific resource type
export function getResourceChannel(resourceType: 'booking' | 'order' | 'availability'): string {
  switch (resourceType) {
    case 'booking':
      return CHANNELS.BOOKINGS;
    case 'order':
      return CHANNELS.ORDERS;
    case 'availability':
      return CHANNELS.AVAILABILITY;
    default:
      throw new Error(`Unknown resource type: ${resourceType}`);
  }
}

// Validate channel name format
export function isValidChannelName(channelName: string): boolean {
  if (!channelName || typeof channelName !== 'string') {
    return false;
  }

  // Check for invalid characters
  if (!/^[a-z0-9\-_]+$/i.test(channelName)) {
    return false;
  }

  // Check length
  if (channelName.length > 200) {
    return false;
  }

  return true;
}
