/**
 * Register Page
 * User registration with email/password or wallet
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { WalletConnectButton } from '@/components/auth/WalletConnectButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, connectWallet } = useAuth()
  const { address, isConnected } = useAccount()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/booking')
    }
  }, [isAuthenticated, router])

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && address) {
      handleWalletRegister(address)
    }
  }, [isConnected, address])

  const handleWalletRegister = async (walletAddress: string) => {
    try {
      // In a real implementation, you would sign a message to prove ownership
      const signature = 'mock-signature' // This should be a real signature
      await connectWallet(walletAddress, signature)
      toast.success('Wallet connected successfully!')
      router.push('/booking')
    } catch (error) {
      toast.error('Failed to connect wallet')
      console.error('Wallet registration error:', error)
    }
  }

  const handleRegisterSuccess = () => {
    toast.success('Account created successfully! Welcome to CitizenSpace.')
    router.push('/booking')
  }

  const handleRegisterError = (error: Error) => {
    toast.error(error.message || 'Registration failed. Please try again.')
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Join CitizenSpace and start booking your workspace today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RegisterForm onSuccess={handleRegisterSuccess} onError={handleRegisterError} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <WalletConnectButton />
            </div>

            <Separator />

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}