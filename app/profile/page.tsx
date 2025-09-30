/**
 * User Profile Page
 * Protected route for viewing and editing user profile
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { WalletConnectButton } from '@/components/auth/WalletConnectButton'
import { NFTHolderBanner, NFTStatusIndicator } from '@/components/auth/NFTHolderBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, Mail, Phone, User, Wallet, Shield, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

function ProfileContent() {
  const { user, updateProfile, logout, verifyNFT } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifyingNFT, setIsVerifyingNFT] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
      })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyNFT = async () => {
    if (!user?.walletAddress) {
      toast.error('Please connect a wallet first')
      return
    }

    setIsVerifyingNFT(true)
    try {
      const isHolder = await verifyNFT(user.walletAddress)
      if (isHolder) {
        toast.success('NFT verified! You now have access to holder benefits.')
      } else {
        toast.info('No CitizenSpace NFT found in this wallet.')
      }
    } catch (error) {
      toast.error('Failed to verify NFT')
      console.error('Verify NFT error:', error)
    } finally {
      setIsVerifyingNFT(false)
    }
  }

  const handleDeleteAccount = async () => {
    // In a real implementation, this would call a delete account API
    toast.error('Account deletion is not implemented yet')
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) return null

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* NFT Holder Banner */}
        {user.nftHolder && <NFTHolderBanner />}

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </div>
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{user.fullName || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{format(new Date(user.createdAt), 'MMMM d, yyyy')}</p>
                  </div>
                </div>

                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        fullName: user?.fullName || '',
                        phone: user?.phone || '',
                      })
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Wallet Connection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription>Connect your Web3 wallet to unlock NFT holder benefits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.walletAddress ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Connected Wallet</p>
                    <p className="font-mono text-sm">{user.walletAddress}</p>
                  </div>
                  <NFTStatusIndicator isHolder={user.nftHolder} />
                </div>

                {!user.nftHolder && (
                  <Alert>
                    <AlertDescription>
                      <p className="mb-2">
                        Connect your wallet to verify CitizenSpace NFT ownership and unlock:
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        <li>50% off hourly desk bookings</li>
                        <li>10% off all cafe orders</li>
                        <li>Priority booking access</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleVerifyNFT} disabled={isVerifyingNFT} variant="outline">
                  {isVerifyingNFT ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify NFT Ownership'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Connect your wallet to unlock exclusive NFT holder benefits including 50% off
                    hourly bookings and 10% off cafe orders.
                  </AlertDescription>
                </Alert>
                <WalletConnectButton />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and
                      remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account on this device
                </p>
              </div>
              <Button variant="outline" onClick={() => logout()}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}