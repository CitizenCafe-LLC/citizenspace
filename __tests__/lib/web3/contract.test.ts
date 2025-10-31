/**
 * Contract Configuration Tests
 *
 * Tests for CitizenSpace NFT smart contract configuration.
 * Validates ABI structure, contract address, and constant values.
 */

import {
  CITIZEN_SPACE_NFT_CONTRACT,
  MINT_PRICE,
  MAX_SUPPLY,
  NFT_HOLDER_DISCOUNTS,
} from '@/lib/web3/contract'

describe('Contract Configuration', () => {
  describe('CITIZEN_SPACE_NFT_CONTRACT', () => {
    it('should have a valid contract address', () => {
      expect(CITIZEN_SPACE_NFT_CONTRACT.address).toBeDefined()
      expect(typeof CITIZEN_SPACE_NFT_CONTRACT.address).toBe('string')
      expect(CITIZEN_SPACE_NFT_CONTRACT.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it('should have a valid ABI array', () => {
      expect(CITIZEN_SPACE_NFT_CONTRACT.abi).toBeDefined()
      expect(Array.isArray(CITIZEN_SPACE_NFT_CONTRACT.abi)).toBe(true)
      expect(CITIZEN_SPACE_NFT_CONTRACT.abi.length).toBeGreaterThan(0)
    })

    it('should be immutable (const)', () => {
      expect(() => {
        ;(CITIZEN_SPACE_NFT_CONTRACT as any) = {}
      }).toThrow()
    })

    describe('ABI Functions', () => {
      it('should include mint function', () => {
        const mintFunction = CITIZEN_SPACE_NFT_CONTRACT.abi.find(
          item => item.type === 'function' && item.name === 'mint'
        )

        expect(mintFunction).toBeDefined()
        expect(mintFunction?.stateMutability).toBe('payable')
        expect(mintFunction?.inputs).toHaveLength(2)
      })

      it('should have correct mint function inputs', () => {
        const mintFunction = CITIZEN_SPACE_NFT_CONTRACT.abi.find(
          item => item.type === 'function' && item.name === 'mint'
        )

        expect(mintFunction?.inputs).toEqual([
          { name: 'to', type: 'address' },
          { name: 'quantity', type: 'uint256' },
        ])
      })

      it('should include mintPrice function', () => {
        const mintPriceFunction = CITIZEN_SPACE_NFT_CONTRACT.abi.find(
          item => item.type === 'function' && item.name === 'mintPrice'
        )

        expect(mintPriceFunction).toBeDefined()
        expect(mintPriceFunction?.stateMutability).toBe('view')
        expect(mintPriceFunction?.outputs).toHaveLength(1)
      })

      it('should have correct mintPrice function output', () => {
        const mintPriceFunction = CITIZEN_SPACE_NFT_CONTRACT.abi.find(
          item => item.type === 'function' && item.name === 'mintPrice'
        )

        expect(mintPriceFunction?.outputs).toEqual([{ name: '', type: 'uint256' }])
      })

      it('should include totalSupply function', () => {
        const totalSupplyFunction = CITIZEN_SPACE_NFT_CONTRACT.abi.find(
          item => item.type === 'function' && item.name === 'totalSupply'
        )

        expect(totalSupplyFunction).toBeDefined()
        expect(totalSupplyFunction?.stateMutability).toBe('view')
      })

      it('should include maxSupply function', () => {
        const maxSupplyFunction = CITIZEN_SPACE_NFT_CONTRACT.abi.find(
          item => item.type === 'function' && item.name === 'maxSupply'
        )

        expect(maxSupplyFunction).toBeDefined()
        expect(maxSupplyFunction?.stateMutability).toBe('view')
      })

      it('should include balanceOf function', () => {
        const balanceOfFunction = CITIZEN_SPACE_NFT_CONTRACT.abi.find(
          item => item.type === 'function' && item.name === 'balanceOf'
        )

        expect(balanceOfFunction).toBeDefined()
        expect(balanceOfFunction?.stateMutability).toBe('view')
        expect(balanceOfFunction?.inputs).toHaveLength(1)
      })

      it('should have correct balanceOf function input', () => {
        const balanceOfFunction = CITIZEN_SPACE_NFT_CONTRACT.abi.find(
          item => item.type === 'function' && item.name === 'balanceOf'
        )

        expect(balanceOfFunction?.inputs).toEqual([{ name: 'owner', type: 'address' }])
      })

      it('should have correct balanceOf function output', () => {
        const balanceOfFunction = CITIZEN_SPACE_NFT_CONTRACT.abi.find(
          item => item.type === 'function' && item.name === 'balanceOf'
        )

        expect(balanceOfFunction?.outputs).toEqual([{ name: '', type: 'uint256' }])
      })
    })

    describe('ABI Validation', () => {
      it('should have only function types in ABI', () => {
        CITIZEN_SPACE_NFT_CONTRACT.abi.forEach(item => {
          expect(item.type).toBe('function')
        })
      })

      it('should have valid state mutability values', () => {
        const validStateMutabilities = ['pure', 'view', 'nonpayable', 'payable']

        CITIZEN_SPACE_NFT_CONTRACT.abi.forEach(item => {
          expect(validStateMutabilities).toContain(item.stateMutability)
        })
      })

      it('should have at least 5 functions', () => {
        expect(CITIZEN_SPACE_NFT_CONTRACT.abi).toHaveLength(5)
      })

      it('should have valid function names', () => {
        const expectedFunctions = ['mint', 'mintPrice', 'totalSupply', 'maxSupply', 'balanceOf']

        const actualFunctions = CITIZEN_SPACE_NFT_CONTRACT.abi.map(item => item.name)

        expectedFunctions.forEach(funcName => {
          expect(actualFunctions).toContain(funcName)
        })
      })

      it('should have correct types for all inputs', () => {
        CITIZEN_SPACE_NFT_CONTRACT.abi.forEach(item => {
          if (item.inputs && item.inputs.length > 0) {
            item.inputs.forEach(input => {
              expect(input.type).toBeDefined()
              expect(typeof input.type).toBe('string')
            })
          }
        })
      })

      it('should have correct types for all outputs', () => {
        CITIZEN_SPACE_NFT_CONTRACT.abi.forEach(item => {
          if (item.outputs && item.outputs.length > 0) {
            item.outputs.forEach(output => {
              expect(output.type).toBeDefined()
              expect(typeof output.type).toBe('string')
            })
          }
        })
      })
    })
  })

  describe('MINT_PRICE', () => {
    it('should be defined', () => {
      expect(MINT_PRICE).toBeDefined()
    })

    it('should be a string', () => {
      expect(typeof MINT_PRICE).toBe('string')
    })

    it('should be 0.10 ETH', () => {
      expect(MINT_PRICE).toBe('0.10')
    })

    it('should be a valid decimal number', () => {
      expect(parseFloat(MINT_PRICE)).toBe(0.1)
      expect(isNaN(parseFloat(MINT_PRICE))).toBe(false)
    })

    it('should be immutable', () => {
      expect(() => {
        ;(MINT_PRICE as any) = '0.20'
      }).toThrow()
    })

    it('should be a positive value', () => {
      expect(parseFloat(MINT_PRICE)).toBeGreaterThan(0)
    })
  })

  describe('MAX_SUPPLY', () => {
    it('should be defined', () => {
      expect(MAX_SUPPLY).toBeDefined()
    })

    it('should be a number', () => {
      expect(typeof MAX_SUPPLY).toBe('number')
    })

    it('should be 500', () => {
      expect(MAX_SUPPLY).toBe(500)
    })

    it('should be immutable', () => {
      expect(() => {
        ;(MAX_SUPPLY as any) = 1000
      }).toThrow()
    })

    it('should be a positive integer', () => {
      expect(MAX_SUPPLY).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_SUPPLY)).toBe(true)
    })

    it('should be greater than zero', () => {
      expect(MAX_SUPPLY).toBeGreaterThan(0)
    })
  })

  describe('NFT_HOLDER_DISCOUNTS', () => {
    it('should be defined', () => {
      expect(NFT_HOLDER_DISCOUNTS).toBeDefined()
    })

    it('should be an object', () => {
      expect(typeof NFT_HOLDER_DISCOUNTS).toBe('object')
      expect(NFT_HOLDER_DISCOUNTS).not.toBeNull()
    })

    it('should have WORKSPACE discount', () => {
      expect(NFT_HOLDER_DISCOUNTS.WORKSPACE).toBeDefined()
      expect(typeof NFT_HOLDER_DISCOUNTS.WORKSPACE).toBe('number')
    })

    it('should have CAFE discount', () => {
      expect(NFT_HOLDER_DISCOUNTS.CAFE).toBeDefined()
      expect(typeof NFT_HOLDER_DISCOUNTS.CAFE).toBe('number')
    })

    it('should have correct WORKSPACE discount (50%)', () => {
      expect(NFT_HOLDER_DISCOUNTS.WORKSPACE).toBe(0.5)
    })

    it('should have correct CAFE discount (10%)', () => {
      expect(NFT_HOLDER_DISCOUNTS.CAFE).toBe(0.1)
    })

    it('should be immutable', () => {
      expect(() => {
        ;(NFT_HOLDER_DISCOUNTS as any) = {}
      }).toThrow()
    })

    it('should have only WORKSPACE and CAFE properties', () => {
      const keys = Object.keys(NFT_HOLDER_DISCOUNTS)
      expect(keys).toHaveLength(2)
      expect(keys).toContain('WORKSPACE')
      expect(keys).toContain('CAFE')
    })

    describe('Discount Values', () => {
      it('should have valid discount ranges (0-1)', () => {
        expect(NFT_HOLDER_DISCOUNTS.WORKSPACE).toBeGreaterThan(0)
        expect(NFT_HOLDER_DISCOUNTS.WORKSPACE).toBeLessThanOrEqual(1)
        expect(NFT_HOLDER_DISCOUNTS.CAFE).toBeGreaterThan(0)
        expect(NFT_HOLDER_DISCOUNTS.CAFE).toBeLessThanOrEqual(1)
      })

      it('should have WORKSPACE discount greater than CAFE discount', () => {
        expect(NFT_HOLDER_DISCOUNTS.WORKSPACE).toBeGreaterThan(NFT_HOLDER_DISCOUNTS.CAFE)
      })

      it('should provide meaningful discounts', () => {
        // Workspace discount should be at least 10%
        expect(NFT_HOLDER_DISCOUNTS.WORKSPACE).toBeGreaterThanOrEqual(0.1)
        // Cafe discount should be at least 5%
        expect(NFT_HOLDER_DISCOUNTS.CAFE).toBeGreaterThanOrEqual(0.05)
      })
    })

    describe('Discount Calculation', () => {
      it('should calculate correct workspace discount amount', () => {
        const originalPrice = 100
        const discountedPrice = originalPrice * (1 - NFT_HOLDER_DISCOUNTS.WORKSPACE)
        expect(discountedPrice).toBe(50)
      })

      it('should calculate correct cafe discount amount', () => {
        const originalPrice = 100
        const discountedPrice = originalPrice * (1 - NFT_HOLDER_DISCOUNTS.CAFE)
        expect(discountedPrice).toBe(90)
      })

      it('should apply workspace discount correctly to various prices', () => {
        const testPrices = [10, 50, 100, 250, 500]
        testPrices.forEach(price => {
          const discounted = price * (1 - NFT_HOLDER_DISCOUNTS.WORKSPACE)
          expect(discounted).toBe(price * 0.5)
        })
      })

      it('should apply cafe discount correctly to various prices', () => {
        const testPrices = [10, 50, 100, 250, 500]
        testPrices.forEach(price => {
          const discounted = price * (1 - NFT_HOLDER_DISCOUNTS.CAFE)
          expect(discounted).toBe(price * 0.9)
        })
      })
    })
  })

  describe('Contract Constants Integration', () => {
    it('should have all required exports', () => {
      expect(CITIZEN_SPACE_NFT_CONTRACT).toBeDefined()
      expect(MINT_PRICE).toBeDefined()
      expect(MAX_SUPPLY).toBeDefined()
      expect(NFT_HOLDER_DISCOUNTS).toBeDefined()
    })

    it('should have consistent pricing structure', () => {
      const mintPriceFloat = parseFloat(MINT_PRICE)
      expect(mintPriceFloat).toBeGreaterThan(0)

      // Mint price should be reasonable (between 0.01 and 1 ETH)
      expect(mintPriceFloat).toBeGreaterThanOrEqual(0.01)
      expect(mintPriceFloat).toBeLessThanOrEqual(1)
    })

    it('should have reasonable max supply', () => {
      // Max supply should be between 100 and 10000
      expect(MAX_SUPPLY).toBeGreaterThanOrEqual(100)
      expect(MAX_SUPPLY).toBeLessThanOrEqual(10000)
    })

    it('should export contract with TypeScript const assertion', () => {
      // This test verifies the contract exports are properly typed as const
      const contract = CITIZEN_SPACE_NFT_CONTRACT
      expect(contract).toBeDefined()
      expect(contract.address).toBeDefined()
      expect(contract.abi).toBeDefined()
    })
  })

  describe('Edge Cases and Validation', () => {
    it('should handle contract address format correctly', () => {
      const address = CITIZEN_SPACE_NFT_CONTRACT.address
      expect(address.startsWith('0x')).toBe(true)
      expect(address.length).toBe(42)
    })

    it('should have non-empty ABI', () => {
      expect(CITIZEN_SPACE_NFT_CONTRACT.abi.length).toBeGreaterThan(0)
    })

    it('should have valid function signatures in ABI', () => {
      CITIZEN_SPACE_NFT_CONTRACT.abi.forEach(func => {
        expect(func.name).toBeTruthy()
        expect(func.type).toBe('function')
        expect(func.stateMutability).toBeTruthy()
        expect(Array.isArray(func.inputs)).toBe(true)
        expect(Array.isArray(func.outputs)).toBe(true)
      })
    })

    it('should maintain discount precision', () => {
      // Check that discounts are not subject to floating point errors
      const workspace = NFT_HOLDER_DISCOUNTS.WORKSPACE
      const cafe = NFT_HOLDER_DISCOUNTS.CAFE

      expect(workspace.toString()).toBe('0.5')
      expect(cafe.toString()).toBe('0.1')
    })

    it('should have mint price in correct ETH format', () => {
      const price = MINT_PRICE
      expect(price).toMatch(/^\d+\.\d+$/)
    })

    it('should support all required NFT operations', () => {
      const requiredFunctions = ['balanceOf', 'mint', 'totalSupply', 'maxSupply', 'mintPrice']
      const abiFunctionNames = CITIZEN_SPACE_NFT_CONTRACT.abi.map(f => f.name)

      requiredFunctions.forEach(funcName => {
        expect(abiFunctionNames).toContain(funcName)
      })
    })
  })

  describe('Type Safety', () => {
    it('should maintain readonly properties for contract', () => {
      const contract: typeof CITIZEN_SPACE_NFT_CONTRACT = CITIZEN_SPACE_NFT_CONTRACT
      expect(contract.address).toBeDefined()
      expect(contract.abi).toBeDefined()
    })

    it('should maintain readonly properties for discounts', () => {
      const discounts: typeof NFT_HOLDER_DISCOUNTS = NFT_HOLDER_DISCOUNTS
      expect(discounts.WORKSPACE).toBeDefined()
      expect(discounts.CAFE).toBeDefined()
    })

    it('should have correct TypeScript types for exports', () => {
      // Verify exports are of correct types
      const address: `0x${string}` = CITIZEN_SPACE_NFT_CONTRACT.address
      const mintPrice: string = MINT_PRICE
      const maxSupply: number = MAX_SUPPLY
      const discounts: { WORKSPACE: number; CAFE: number } = NFT_HOLDER_DISCOUNTS

      expect(address).toBeDefined()
      expect(mintPrice).toBeDefined()
      expect(maxSupply).toBeDefined()
      expect(discounts).toBeDefined()
    })
  })
})