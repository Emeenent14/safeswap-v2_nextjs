"use client"

import { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description?: string
  showBackToHome?: boolean
  className?: string
}

export default function AuthLayout({ 
  children, 
  title, 
  description,
  showBackToHome = true,
  className
}: AuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect if already authenticated
  if (!isLoading && isAuthenticated) {
    redirect('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Branding */}
        <div className="text-center space-y-2">
          <Link 
            href="/" 
            className="inline-block text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            SafeSwap
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Secure escrow for digital transactions
          </p>
        </div>

        {/* Auth Form Card */}
        <Card className={cn("shadow-lg border-0 bg-white/80 backdrop-blur-sm", className)}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
          </CardContent>
        </Card>

        {/* Back to Home Link */}
        {showBackToHome && (
          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
            >
              ← Back to Home
            </Link>
          </div>
        )}

        {/* Legal Links */}
        <div className="text-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <Link 
            href="/legal/terms" 
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Terms of Service
          </Link>
          <span>•</span>
          <Link 
            href="/legal/privacy" 
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}