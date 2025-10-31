/**
 * Tests for Pusher Client Configuration
 */

import { getPusherServer, getPusherClient, isPusherConfigured, disconnectPusher, getConnectionState } from '@/lib/realtime/client';

// Mock Pusher modules
jest.mock('pusher', () => {
  return jest.fn().mockImplementation(() => ({
    trigger: jest.fn(),
  }));
});

jest.mock('pusher-js', () => {
  return jest.fn().mockImplementation(() => ({
    connection: { state: 'connected' },
    disconnect: jest.fn(),
  }));
});

describe('Pusher Client Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isPusherConfigured', () => {
    it('should return true when all server variables are set', () => {
      process.env.PUSHER_APP_ID = 'test-app-id';
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
      process.env.PUSHER_SECRET = 'test-secret';

      expect(isPusherConfigured()).toBe(true);
    });

    it('should return false when PUSHER_APP_ID is missing', () => {
      delete process.env.PUSHER_APP_ID;
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
      process.env.PUSHER_SECRET = 'test-secret';

      expect(isPusherConfigured()).toBe(false);
    });

    it('should return false when NEXT_PUBLIC_PUSHER_KEY is missing', () => {
      process.env.PUSHER_APP_ID = 'test-app-id';
      delete process.env.NEXT_PUBLIC_PUSHER_KEY;
      process.env.PUSHER_SECRET = 'test-secret';

      expect(isPusherConfigured()).toBe(false);
    });

    it('should return false when PUSHER_SECRET is missing', () => {
      process.env.PUSHER_APP_ID = 'test-app-id';
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
      delete process.env.PUSHER_SECRET;

      expect(isPusherConfigured()).toBe(false);
    });

    it('should return false when all variables are missing', () => {
      delete process.env.PUSHER_APP_ID;
      delete process.env.NEXT_PUBLIC_PUSHER_KEY;
      delete process.env.PUSHER_SECRET;

      expect(isPusherConfigured()).toBe(false);
    });
  });

  describe('getPusherServer', () => {
    it('should throw error when configuration is missing', () => {
      delete process.env.PUSHER_APP_ID;
      delete process.env.NEXT_PUBLIC_PUSHER_KEY;
      delete process.env.PUSHER_SECRET;

      expect(() => getPusherServer()).toThrow('Missing Pusher configuration');
    });

    it('should create Pusher instance with correct configuration', () => {
      process.env.PUSHER_APP_ID = 'test-app-id';
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
      process.env.PUSHER_SECRET = 'test-secret';
      process.env.PUSHER_CLUSTER = 'eu';

      const Pusher = require('pusher');
      getPusherServer();

      expect(Pusher).toHaveBeenCalledWith({
        appId: 'test-app-id',
        key: 'test-key',
        secret: 'test-secret',
        cluster: 'eu',
        useTLS: true,
      });
    });

    it('should use default cluster when not specified', () => {
      process.env.PUSHER_APP_ID = 'test-app-id';
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
      process.env.PUSHER_SECRET = 'test-secret';
      delete process.env.PUSHER_CLUSTER;

      const Pusher = require('pusher');
      getPusherServer();

      expect(Pusher).toHaveBeenCalledWith(
        expect.objectContaining({
          cluster: 'us2',
        })
      );
    });

    it('should return singleton instance', () => {
      process.env.PUSHER_APP_ID = 'test-app-id';
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
      process.env.PUSHER_SECRET = 'test-secret';

      const instance1 = getPusherServer();
      const instance2 = getPusherServer();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getPusherClient', () => {
    beforeEach(() => {
      // Mock window object for client-side tests
      global.window = {} as any;
    });

    afterEach(() => {
      delete (global as any).window;
    });

    it('should throw error when called on server side', () => {
      delete (global as any).window;

      expect(() => getPusherClient()).toThrow('can only be called on the client side');
    });

    it('should throw error when NEXT_PUBLIC_PUSHER_KEY is missing', () => {
      delete process.env.NEXT_PUBLIC_PUSHER_KEY;

      expect(() => getPusherClient()).toThrow('Missing NEXT_PUBLIC_PUSHER_KEY');
    });

    it('should create PusherClient instance with correct configuration', () => {
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';
      process.env.PUSHER_CLUSTER = 'eu';

      const PusherClient = require('pusher-js');
      getPusherClient();

      expect(PusherClient).toHaveBeenCalledWith('test-key', {
        cluster: 'eu',
        forceTLS: true,
      });
    });

    it('should return singleton instance', () => {
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';

      const instance1 = getPusherClient();
      const instance2 = getPusherClient();

      expect(instance1).toBe(instance2);
    });
  });

  describe('disconnectPusher', () => {
    beforeEach(() => {
      global.window = {} as any;
    });

    afterEach(() => {
      delete (global as any).window;
    });

    it('should disconnect client when instance exists', () => {
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';

      const client = getPusherClient();
      const disconnectMock = client.disconnect as jest.Mock;

      disconnectPusher();

      expect(disconnectMock).toHaveBeenCalled();
    });

    it('should not throw when no client instance exists', () => {
      expect(() => disconnectPusher()).not.toThrow();
    });
  });

  describe('getConnectionState', () => {
    beforeEach(() => {
      global.window = {} as any;
    });

    afterEach(() => {
      delete (global as any).window;
    });

    it('should return disconnected when no client instance', () => {
      const state = getConnectionState();
      expect(state).toBe('disconnected');
    });

    it('should return connection state from client', () => {
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key';

      getPusherClient();
      const state = getConnectionState();

      expect(state).toBe('connected');
    });
  });
});
