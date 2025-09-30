'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Plus, 
  Minus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Zap
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CITIZEN_SPACE_CONTRACT, MINT_PRICE, MAX_SUPPLY } from '@/lib/contract';
import { toast } from 'sonner';

export function MintModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { address, isConnected } = useAccount();

  // Contract reads
  const { data: totalSupply } = useReadContract({
    ...CITIZEN_SPACE_CONTRACT,
    functionName: 'totalSupply',
  });

  const { data: userBalance } = useReadContract({
    ...CITIZEN_SPACE_CONTRACT,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: mintPrice } = useReadContract({
    ...CITIZEN_SPACE_CONTRACT,
    functionName: 'mintPrice',
  });

  // Contract write
  const { 
    writeContract, 
    data: hash, 
    error: mintError, 
    isPending: isMinting 
  } = useWriteContract();

  // Transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash,
  });

  const totalCost = parseEther((parseFloat(MINT_PRICE) * quantity).toString());
  const remaining = MAX_SUPPLY - (Number(totalSupply) || 0);
  const maxMintable = Math.min(remaining, 10); // Max 10 per transaction

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxMintable) {
      setQuantity(newQuantity);
    }
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      writeContract({
        ...CITIZEN_SPACE_CONTRACT,
        functionName: 'mint',
        args: [address, BigInt(quantity)],
        value: totalCost,
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('Failed to initiate mint transaction');
    }
  };

  const resetModal = () => {
    setQuantity(1);
    setIsOpen(false);
  };

  // Success state
  if (isConfirmed && hash) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="bg-cs-blue hover:bg-cs-blue/90">
            <Zap className="mr-2 h-5 w-5" />
            Mint Founder NFT
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Mint Successful! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Your Founder NFT has been minted successfully
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-cs-success mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-cs-espresso mb-2">
                Welcome to the Founders Circle!
              </h3>
              <p className="text-cs-muted">
                You've successfully minted {quantity} Founder NFT{quantity > 1 ? 's' : ''}
              </p>
            </div>

            <div className="bg-cs-success/10 border border-cs-success/20 rounded-lg p-4">
              <h4 className="font-medium text-cs-espresso mb-2">Your Benefits Are Now Active:</h4>
              <ul className="text-sm text-cs-muted space-y-1">
                <li>• 50% lifetime discount on memberships</li>
                <li>• Access to founder-only Discord</li>
                <li>• Priority booking for events and spaces</li>
                <li>• Exclusive founder recognition</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => window.open(`https://etherscan.io/tx/${hash}`, '_blank')}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Etherscan
              </Button>
              <Button onClick={resetModal} className="w-full bg-cs-blue hover:bg-cs-blue/90">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-cs-blue hover:bg-cs-blue/90">
          <Zap className="mr-2 h-5 w-5" />
          Mint Founder NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mint Your Founder NFT</DialogTitle>
          <DialogDescription>
            Join the founding community with lifetime benefits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Collection Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-display text-2xl font-bold text-cs-espresso">
                {Number(totalSupply) || 0}
              </div>
              <div className="text-xs text-cs-muted">Minted</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-cs-espresso">
                {remaining}
              </div>
              <div className="text-xs text-cs-muted">Remaining</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-cs-espresso">
                {Number(userBalance) || 0}
              </div>
              <div className="text-xs text-cs-muted">You Own</div>
            </div>
          </div>

          {!isConnected ? (
            <div className="space-y-4">
              <div className="text-center">
                <Wallet className="h-12 w-12 text-cs-muted mx-auto mb-3" />
                <p className="text-cs-muted">Connect your wallet to mint</p>
              </div>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button onClick={openConnectModal} className="w-full bg-cs-blue hover:bg-cs-blue/90">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-cs-espresso">Quantity</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= maxMintable) {
                        setQuantity(val);
                      }
                    }}
                    className="text-center w-20"
                    min={1}
                    max={maxMintable}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxMintable}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-cs-muted">
                  Max {maxMintable} per transaction • {remaining} remaining
                </p>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-cs-sun/10 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price per NFT:</span>
                  <span className="font-medium">{MINT_PRICE} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="border-t border-cs-border pt-2 flex justify-between font-semibold">
                  <span>Total Cost:</span>
                  <span>{formatEther(totalCost)} ETH</span>
                </div>
                <p className="text-xs text-cs-muted">+ gas fees</p>
              </div>

              {/* Benefits Reminder */}
              <div className="bg-cs-blue/10 rounded-lg p-3">
                <h4 className="font-medium text-cs-espresso text-sm mb-1">Included Benefits:</h4>
                <ul className="text-xs text-cs-muted space-y-1">
                  <li>• 50% lifetime discount on memberships</li>
                  <li>• Founder-only Discord access</li>
                  <li>• Priority event booking</li>
                </ul>
              </div>

              {/* Error Display */}
              {(mintError || confirmError) && (
                <div className="flex items-center space-x-2 p-3 bg-cs-alert/10 border border-cs-alert/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-cs-alert" />
                  <span className="text-sm text-cs-alert">
                    {mintError?.message || confirmError?.message || 'Transaction failed'}
                  </span>
                </div>
              )}

              {/* Mint Button */}
              <Button
                onClick={handleMint}
                disabled={isMinting || isConfirming || remaining <= 0}
                className="w-full bg-cs-blue hover:bg-cs-blue/90"
              >
                {isMinting || isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isMinting ? 'Confirming...' : 'Processing...'}
                  </>
                ) : remaining <= 0 ? (
                  'Sold Out'
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Mint {quantity} NFT{quantity > 1 ? 's' : ''} for {formatEther(totalCost)} ETH
                  </>
                )}
              </Button>

              {/* Transaction Status */}
              {hash && (
                <div className="text-center">
                  <Badge variant="secondary" className="bg-cs-sun/20 text-cs-espresso">
                    {isConfirming ? 'Confirming Transaction...' : 'Transaction Submitted'}
                  </Badge>
                  <p className="text-xs text-cs-muted mt-1">
                    <button
                      onClick={() => window.open(`https://etherscan.io/tx/${hash}`, '_blank')}
                      className="hover:underline"
                    >
                      View on Etherscan ↗
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}