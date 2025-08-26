import { Suspense } from 'react'
import { Metadata } from 'next'
import AuthLayout from '@/components/layout/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Sign In | SafeSwap',
  description: 'Sign in to your SafeSwap account to manage your secure digital transactions.',
  robots: {
    index: true,
    follow: true
  }
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your account to continue"
      showBackToHome={true}
    >
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}