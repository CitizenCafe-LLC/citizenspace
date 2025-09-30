/**
 * CitizenSpace NFT Contract Configuration
 *
 * This file contains the ABI and configuration for interacting with
 * the CitizenSpace NFT smart contract on-chain.
 */

export const CITIZEN_SPACE_NFT_CONTRACT = {
  address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  abi: [
    {
      inputs: [{ name: 'to', type: 'address' }, { name: 'quantity', type: 'uint256' }],
      name: 'mint',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'mintPrice',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'maxSupply',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ name: 'owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const,
} as const;

export const MINT_PRICE = '0.10'; // ETH
export const MAX_SUPPLY = 500;

// NFT holder discount rates
export const NFT_HOLDER_DISCOUNTS = {
  WORKSPACE: 0.5, // 50% discount on workspace bookings
  CAFE: 0.1, // 10% discount on cafe orders
} as const;