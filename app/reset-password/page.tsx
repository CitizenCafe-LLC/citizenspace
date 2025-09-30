/**
 * Reset Password Page
 * Reset password with token from email
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

const calculatePasswordStrength = (password: string): number => {
  let strength = 0
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 25
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 20
  if (/[0-9]/.test(password)) strength += 15
  if (/[^A-Za-z0-9]/.test(password)) strength += 15
  return Math.min(strength, 100)
}

const getPasswordStrengthColor = (strength: number): string => {
  if (strength < 40) return 'bg-red-500'
  if (strength < 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getPasswordStrengthLabel = (strength: number): string => {
  if (strength < 40) return 'Weak'
  if (strength < 70) return 'Medium'
  return 'Strong'
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password', '')

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
    }
  }, [token])

  useEffect(() => {
    const strength = calculatePasswordStrength(password)
    setPasswordStrength(strength)
  }, [password])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid or missing reset token')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password')
      }

      setIsSuccess(true)
      toast.success('Password reset successfully!')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset password. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading || !token}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className="font-medium">
                          {getPasswordStrengthLabel(passwordStrength)}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength}
                        className={`h-2 ${getPasswordStrengthColor(passwordStrength)}`}
                      />
                    </div>
                  )}
                  {errors.password && (
                    <p id="password-error" className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    disabled={isLoading || !token}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  />
                  {errors.confirmPassword && (
                    <p id="confirmPassword-error" className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !token}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Password Reset Successfully</h3>
                  <p className="text-sm text-muted-foreground">
                    Your password has been reset. Redirecting to login...
                  </p>
                </div>

                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full">Continue to Login</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}