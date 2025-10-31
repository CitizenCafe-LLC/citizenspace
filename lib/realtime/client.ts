/**
 * Pusher Client Configuration
 * Server-side and client-side Pusher setup
 */

import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance (for triggering events)
let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (pusherServer) {
    return pusherServer;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || 'us2';

  if (!appId || !key || !secret) {
    throw new Error(
      'Missing Pusher configuration. Set PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, and PUSHER_SECRET environment variables.'
    );
  }

  pusherServer = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherServer;
}

// Client-side Pusher instance (for subscribing to events)
let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === 'undefined') {
    throw new Error('getPusherClient() can only be called on the client side');
  }

  if (pusherClient) {
    return pusherClient;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.PUSHER_CLUSTER || 'us2';

  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_PUSHER_KEY environment variable');
  }

  pusherClient = new PusherClient(key, {
    cluster,
    forceTLS: true,
  });

  return pusherClient;
}

// Check if Pusher is configured
export function isPusherConfigured(): boolean {
  if (typeof window === 'undefined') {
    // Server-side check
    return !!(
      process.env.PUSHER_APP_ID &&
      process.env.NEXT_PUBLIC_PUSHER_KEY &&
      process.env.PUSHER_SECRET
    );
  } else {
    // Client-side check
    return !!process.env.NEXT_PUBLIC_PUSHER_KEY;
  }
}

// Disconnect and cleanup
export function disconnectPusher(): void {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
}

// Get connection state
export function getConnectionState(): string {
  if (!pusherClient) {
    return 'disconnected';
  }
  return pusherClient.connection.state;
}
