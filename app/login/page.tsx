/**
 * Login Page
 * Email/password login with wallet connect option
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { WalletConnectButton } from '@/components/auth/WalletConnectButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, connectWallet } = useAuth()
  const { address, isConnected } = useAccount()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/booking'
      sessionStorage.removeItem('redirectAfterLogin')
      router.push(redirectPath)
    }
  }, [isAuthenticated, router])

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && address) {
      handleWalletLogin(address)
    }
  }, [isConnected, address])

  const handleWalletLogin = async (walletAddress: string) => {
    try {
      // In a real implementation, you would sign a message to prove ownership
      const signature = 'mock-signature' // This should be a real signature
      await connectWallet(walletAddress, signature)
      toast.success('Wallet connected successfully!')
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/booking'
      sessionStorage.removeItem('redirectAfterLogin')
      router.push(redirectPath)
    } catch (error) {
      toast.error('Failed to connect wallet')
      console.error('Wallet login error:', error)
    }
  }

  const handleLoginSuccess = () => {
    toast.success('Logged in successfully!')
    const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/booking'
    sessionStorage.removeItem('redirectAfterLogin')
    router.push(redirectPath)
  }

  const handleLoginError = (error: Error) => {
    toast.error(error.message || 'Login failed. Please try again.')
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your CitizenSpace account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm onSuccess={handleLoginSuccess} onError={handleLoginError} />

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

            <div className="space-y-2 text-center text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>

            <Separator />

            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}