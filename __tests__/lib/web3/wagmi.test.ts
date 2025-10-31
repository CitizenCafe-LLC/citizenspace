/**
 * Wagmi Configuration Tests
 *
 * Tests for Web3 provider configuration with RainbowKit and Wagmi.
 * Covers chain selection, environment configuration, and setup validation.
 */

// Mock RainbowKit before importing the module
jest.mock('@rainbow-me/rainbowkit', () => ({
  getDefaultConfig: jest.fn(() => ({
    appName: 'CitizenSpace',
    projectId: 'test-id',
    chains: [],
    ssr: true,
  })),
}))

// Mock wagmi chains
jest.mock('wagmi/chains', () => ({
  mainnet: { id: 1, name: 'Ethereum' },
  sepolia: { id: 11155111, name: 'Sepolia' },
  base: { id: 8453, name: 'Base' },
  baseSepolia: { id: 84532, name: 'Base Sepolia' },
}))

describe('Wagmi Configuration', () => {
  const originalEnv = process.env
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...originalEnv }
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    if (consoleWarnSpy) {
      consoleWarnSpy.mockRestore()
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('Configuration with WalletConnect Project ID', () => {
    it('should log warning when WalletConnect project ID is not set', () => {
      delete process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

      require('@/lib/web3/wagmi')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
      )
    })

    it('should log warning when project ID is empty string', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = ''

      require('@/lib/web3/wagmi')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
      )
    })

    it('should not log warning when project ID is provided', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'valid-project-id'

      require('@/lib/web3/wagmi')

      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should export config object', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-id'

      const { config } = require('@/lib/web3/wagmi')

      expect(config).toBeDefined()
      expect(config).toHaveProperty('chains')
    })
  })

  describe('Environment Variable Handling', () => {
    it('should handle undefined environment variable', () => {
      delete process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

      require('@/lib/web3/wagmi')

      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('should handle null environment variable', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = null as any

      require('@/lib/web3/wagmi')

      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('should accept various valid project IDs', () => {
      const validIds = [
        'simple-id',
        'project-123',
        'a1b2c3d4e5f6',
        'TEST_PROJECT_ID',
      ]

      validIds.forEach(id => {
        jest.resetModules()
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = id
        consoleWarnSpy.mockClear()

        require('@/lib/web3/wagmi')

        expect(consoleWarnSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe('Configuration Export', () => {
    it('should export a config object', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-id'

      const wagmi = require('@/lib/web3/wagmi')

      expect(wagmi).toHaveProperty('config')
      expect(wagmi.config).toBeDefined()
    })

    it('should have config with chains property', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-id'

      const { config } = require('@/lib/web3/wagmi')

      expect(config).toHaveProperty('chains')
      expect(Array.isArray(config.chains)).toBe(true)
    })

    it('should initialize config on module load', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-id'

      const { config } = require('@/lib/web3/wagmi')

      expect(config).not.toBeNull()
      expect(config).not.toBeUndefined()
    })
  })

  describe('Warning Message Content', () => {
    it('should include meaningful warning message', () => {
      delete process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

      require('@/lib/web3/wagmi')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Web3 features may not work correctly/)
      )
    })

    it('should warn about the specific missing variable', () => {
      delete process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

      require('@/lib/web3/wagmi')

      const warningCall = consoleWarnSpy.mock.calls[0][0]
      expect(warningCall).toContain('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')
    })
  })

  describe('Module Behavior', () => {
    it('should not throw error when project ID is missing', () => {
      delete process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

      expect(() => {
        require('@/lib/web3/wagmi')
      }).not.toThrow()
    })

    it('should not throw error when project ID is provided', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'valid-id'

      expect(() => {
        require('@/lib/web3/wagmi')
      }).not.toThrow()
    })

    it('should initialize successfully in production mode', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'prod-id'
      process.env.NODE_ENV = 'production'

      expect(() => {
        require('@/lib/web3/wagmi')
      }).not.toThrow()
    })

    it('should initialize successfully in development mode', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'dev-id'
      process.env.NODE_ENV = 'development'

      expect(() => {
        require('@/lib/web3/wagmi')
      }).not.toThrow()
    })

    it('should initialize successfully in test mode', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-id'
      process.env.NODE_ENV = 'test'

      expect(() => {
        require('@/lib/web3/wagmi')
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle whitespace-only project ID', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = '   '

      require('@/lib/web3/wagmi')

      // Whitespace is truthy, so no warning
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    it('should handle special characters in project ID', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-id-!@#$'

      expect(() => {
        require('@/lib/web3/wagmi')
      }).not.toThrow()
    })

    it('should handle very long project ID', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'a'.repeat(1000)

      expect(() => {
        require('@/lib/web3/wagmi')
      }).not.toThrow()
    })

    it('should handle numeric project ID', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = '123456'

      expect(() => {
        require('@/lib/web3/wagmi')
      }).not.toThrow()
    })
  })

  describe('Console Warning Behavior', () => {
    it('should warn exactly once when project ID is missing', () => {
      delete process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

      require('@/lib/web3/wagmi')

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
    })

    it('should not warn multiple times for valid ID', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'valid-id'

      require('@/lib/web3/wagmi')

      expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
    })

    it('should use console.warn specifically', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      delete process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

      require('@/lib/web3/wagmi')

      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Integration and Type Safety', () => {
    it('should maintain type safety for config export', () => {
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-id'

      const { config } = require('@/lib/web3/wagmi')

      // Verify config has expected structure
      expect(typeof config).toBe('object')
      expect(config).not.toBeNull()
    })

    it('should work with different NODE_ENV values', () => {
      const environments = ['development', 'production', 'test']

      environments.forEach(env => {
        jest.resetModules()
        consoleWarnSpy.mockClear()
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-id'
        process.env.NODE_ENV = env

        expect(() => {
          require('@/lib/web3/wagmi')
        }).not.toThrow()
      })
    })

    it('should handle missing NODE_ENV gracefully', () => {
      delete process.env.NODE_ENV
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-id'

      expect(() => {
        require('@/lib/web3/wagmi')
      }).not.toThrow()
    })
  })
})