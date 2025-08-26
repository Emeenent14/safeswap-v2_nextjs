import { Suspense } from 'react'
import { Metadata } from 'next'
import AuthLayout from '@/components/layout/AuthLayout'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Reset Password | SafeSwap',
  description: 'Reset your SafeSwap account password. Enter your email address to receive password reset instructions.',
  robots: {
    index: false,
    follow: false
  }
}

function ForgotPasswordFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="text-center">
        <Skeleton className="h-3 w-48 mx-auto" />
      </div>

      <div className="text-center pt-4 border-t">
        <Skeleton className="h-8 w-32 mx-auto" />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Password Reset"
      description="We'll help you get back into your account"
      showBackToHome={true}
      className="max-w-lg"
    >
      <Suspense fallback={<ForgotPasswordFormSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}