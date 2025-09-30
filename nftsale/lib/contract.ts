export const CITIZEN_SPACE_CONTRACT = {
  address: '0x1234567890123456789012345678901234567890' as `0x${string}`, // Replace with actual contract address
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