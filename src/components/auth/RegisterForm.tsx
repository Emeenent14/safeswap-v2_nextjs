'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema } from '@/lib/validations'
import { validatePasswordStrength } from '@/lib/validations'
import type { RegisterForm as RegisterFormType } from '@/lib/types'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Loader2,
  Check,
  X
} from 'lucide-react'

export default function RegisterForm() {
  const router = useRouter()
  const { register: registerUser, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<RegisterFormType>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      termsAccepted: false
    }
  })

  const watchPassword = watch('password')
  const watchTermsAccepted = watch('termsAccepted')

  // Password strength validation
  const passwordStrength = validatePasswordStrength(watchPassword || '')
  const getPasswordStrengthColor = () => {
    const validCount = passwordStrength.errors.length
    if (validCount === 0) return 'bg-green-500'
    if (validCount <= 2) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const getPasswordStrengthPercent = () => {
    const validCount = 5 - passwordStrength.errors.length
    return (validCount / 5) * 100
  }

  const onSubmit = async (data: RegisterFormType) => {
    try {
      setIsLoading(true)
      clearError()
      await registerUser(data)
      router.push('/verify-email')
    } catch (error) {
      // Error is handled by useAuth hook with toast notifications
      console.error('Registration failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                className="pl-10"
                {...register('firstName')}
                aria-invalid={!!errors.firstName}
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-600" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                className="pl-10"
                {...register('lastName')}
                aria-invalid={!!errors.lastName}
              />
            </div>
            {errors.lastName && (
              <p className="text-sm text-red-600" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="pl-10"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number <span className="text-gray-400">(Optional)</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="pl-10"
              {...register('phone')}
              aria-invalid={!!errors.phone}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="pl-10 pr-10"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {watchPassword && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Progress 
                  value={getPasswordStrengthPercent()} 
                  className="flex-1 h-2"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {passwordStrength.isValid ? 'Strong' : 'Weak'}
                </span>
              </div>
              
              {/* Password Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-1">
                  {watchPassword.length >= 8 ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 text-red-500" />
                  )}
                  <span>8+ characters</span>
                </div>
                <div className="flex items-center gap-1">
                  {/[A-Z]/.test(watchPassword) ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 text-red-500" />
                  )}
                  <span>Uppercase letter</span>
                </div>
                <div className="flex items-center gap-1">
                  {/[a-z]/.test(watchPassword) ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 text-red-500" />
                  )}
                  <span>Lowercase letter</span>
                </div>
                <div className="flex items-center gap-1">
                  {/\d/.test(watchPassword) ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 text-red-500" />
                  )}
                  <span>Number</span>
                </div>
                <div className="flex items-center gap-1 sm:col-span-2">
                  {/[@$!%*?&]/.test(watchPassword) ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 text-red-500" />
                  )}
                  <span>Special character (@$!%*?&)</span>
                </div>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="pl-10 pr-10"
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="termsAccepted"
              checked={watchTermsAccepted}
              onCheckedChange={(checked) => setValue('termsAccepted', !!checked)}
              className="mt-0.5"
            />
            <Label
              htmlFor="termsAccepted"
              className="text-sm font-normal leading-normal cursor-pointer"
            >
              I agree to the{' '}
              <Link
                href="/legal/terms"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                target="_blank"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/legal/privacy"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-red-600" role="alert">
              {errors.termsAccepted.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}