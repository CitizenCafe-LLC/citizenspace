'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_CONFIG, CONTRACT_ABI } from '@/config/contract';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

export function useNFTContract() {
  const { address: userAddress } = useAccount();

  // Read total supply
  const { data: totalSupply = 0n } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  });

  // Read max supply
  const { data: maxSupply = BigInt(CONTRACT_CONFIG.maxSupply) } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'maxSupply',
  });

  // Read mint price
  const { data: mintPrice = parseEther(CONTRACT_CONFIG.mintPrice) } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'mintPrice',
  });

  // Check sale status
  const { data: saleIsActive = false } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'saleIsActive',
  });

  // Get user's balance
  const { data: userBalance = 0n } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
  });

  // Get number minted by user
  const { data: numberMinted = 0n } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'numberMinted',
    args: userAddress ? [userAddress] : undefined,
  });

  // Mint function
  const {
    writeContract: mint,
    data: mintTxHash,
    isPending: isMintPending,
    error: mintError,
  } = useWriteContract();

  // Wait for mint transaction
  const {
    isLoading: isMintConfirming,
    isSuccess: isMintSuccess,
    error: mintConfirmError,
  } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  const mintNFT = async (quantity: number = 1) => {
    if (!userAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!saleIsActive) {
      toast.error('Sale is not active yet');
      return;
    }

    const remainingSupply = Number(maxSupply - totalSupply);
    if (quantity > remainingSupply) {
      toast.error(`Only ${remainingSupply} NFTs remaining`);
      return;
    }

    const totalCost = mintPrice * BigInt(quantity);

    try {
      mint({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [BigInt(quantity)],
        value: totalCost,
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('Failed to mint NFT');
    }
  };

  return {
    // Contract state
    totalSupply: Number(totalSupply),
    maxSupply: Number(maxSupply),
    mintPrice: formatEther(mintPrice),
    saleIsActive,
    soldOut: totalSupply >= maxSupply,
    remainingSupply: Number(maxSupply - totalSupply),
    progress: maxSupply > 0n ? (Number(totalSupply) / Number(maxSupply)) * 100 : 0,

    // User state
    userBalance: Number(userBalance),
    numberMinted: Number(numberMinted),
    isHolder: userBalance > 0n,
    canMint: saleIsActive && totalSupply < maxSupply,

    // Mint functions
    mintNFT,
    isMintPending,
    isMintConfirming,
    isMintSuccess,
    mintError: mintError || mintConfirmError,
    mintTxHash,
  };
}