/**
 * RegisterForm Component
 * Reusable registration form with password strength indicator
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

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

export function RegisterForm({ onSuccess, onError }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  // Update password strength on password change
  useState(() => {
    const strength = calculatePasswordStrength(password)
    setPasswordStrength(strength)
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await registerUser(data.email, data.password, data.fullName, data.phone)
      onSuccess?.()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          {...register('fullName')}
          disabled={isLoading}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName && (
          <p id="fullName-error" className="text-sm text-destructive">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          {...register('phone')}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          onChange={(e) => {
            register('password').onChange(e)
            setPasswordStrength(calculatePasswordStrength(e.target.value))
          }}
        />
        {password && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Password strength:</span>
              <span className="font-medium">{getPasswordStrengthLabel(passwordStrength)}</span>
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
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          disabled={isLoading}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox id="acceptTerms" {...register('acceptTerms')} disabled={isLoading} />
        <div className="space-y-1">
          <Label
            htmlFor="acceptTerms"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I accept the{' '}
            <a href="/legal/terms" className="text-primary hover:underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </Label>
          {errors.acceptTerms && (
            <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  )
}