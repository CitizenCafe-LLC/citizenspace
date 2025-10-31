// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream } from 'stream/web'

// Set up environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long-for-security'
process.env.JWT_ACCESS_TOKEN_EXPIRY = '15m'
process.env.JWT_REFRESH_TOKEN_EXPIRY = '7d'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-for-testing-purposes-only'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key-for-testing-purposes-only'

// Polyfill TextEncoder/TextDecoder for Node.js environment (needed by pg library)
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill Web APIs for Next.js server components
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream
}

// Mock minimal Web APIs for testing
// These are used by Next.js internally
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || ''
      this.headers = new Headers(init.headers)
      this.ok = this.status >= 200 && this.status < 300
    }

    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body)
      }
      return this.body
    }

    async text() {
      if (typeof this.body === 'string') {
        return this.body
      }
      return JSON.stringify(this.body)
    }

    static json(data, init) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      })
    }

    static redirect(url, status = 302) {
      return new Response(null, {
        status,
        headers: { Location: url },
      })
    }
  }
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this._url = typeof input === 'string' ? input : input.url || input
      this.method = init.method || 'GET'
      this.headers = new Headers(init.headers)
      this._bodyInit = init.body
    }

    get url() {
      return this._url
    }

    async json() {
      if (typeof this._bodyInit === 'string') {
        return JSON.parse(this._bodyInit)
      }
      return this._bodyInit
    }

    async text() {
      if (typeof this._bodyInit === 'string') {
        return this._bodyInit
      }
      return JSON.stringify(this._bodyInit)
    }
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = new Map()
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.set(key, value)
        })
      }
    }

    get(key) {
      return this._headers.get(key.toLowerCase()) || null
    }

    set(key, value) {
      this._headers.set(key.toLowerCase(), String(value))
      return this
    }

    has(key) {
      return this._headers.has(key.toLowerCase())
    }

    delete(key) {
      return this._headers.delete(key.toLowerCase())
    }

    entries() {
      return this._headers.entries()
    }

    keys() {
      return this._headers.keys()
    }

    values() {
      return this._headers.values()
    }

    forEach(callback, thisArg) {
      this._headers.forEach((value, key) => {
        callback.call(thisArg, value, key, this)
      })
    }
  }
}

// Mock jose library globally
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    setIssuer: jest.fn().mockReturnThis(),
    setAudience: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mocked.jwt.token'),
  })),
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user',
      nftHolder: false,
      walletAddress: null,
      type: 'access',
    },
  }),
}))

// Mock bcryptjs for password tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}))

// Patch date-fns after modules are loaded
beforeAll(() => {
  // This runs after modules are loaded, ensuring date-fns is available
  // No-op for now - using real date-fns
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia (only in browser environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}
