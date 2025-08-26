import { Suspense } from 'react'
import { Metadata } from 'next'
import AuthLayout from '@/components/layout/AuthLayout'
import RegisterForm from '@/components/auth/RegisterForm'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Sign Up | SafeSwap',
  description: 'Create your SafeSwap account to start making secure digital transactions with escrow protection.',
  robots: {
    index: true,
    follow: true
  }
}

function RegisterFormSkeleton() {
  return (
    <div className="space-y-4">
      {/* Name fields skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Email field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Phone field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Password field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Confirm password skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Terms checkbox skeleton */}
      <div className="flex items-start space-x-2">
        <Skeleton className="h-4 w-4 mt-0.5" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Submit button skeleton */}
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Your Account"
      description="Join SafeSwap to start making secure transactions"
      showBackToHome={true}
    >
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  )
}