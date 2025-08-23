'use client'

import React from 'react'
import { Shield, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PageLoaderProps {
  variant?: 'spinner' | 'progress' | 'skeleton' | 'brand'
  size?: 'sm' | 'md' | 'lg'
  text?: string | undefined
  progress?: number | undefined
  className?: string
}

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'profile' | 'deal' | 'table'
  count?: number
  className?: string | undefined
}

// Main PageLoader component
export default function PageLoader({ 
  variant = 'brand', 
  size = 'md', 
  text,
  progress,
  className 
}: PageLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  if (variant === 'spinner') {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
          {text && (
            <p className="text-sm text-muted-foreground animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'progress') {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <Progress value={progress || 0} className="w-full" />
          {text && (
            <p className="text-sm text-muted-foreground text-center">
              {text}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'brand') {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px] p-8", className)}>
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <Shield className="h-16 w-16 text-primary animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">SafeSwap</h3>
            <p className="text-sm text-muted-foreground">
              {text || 'Loading...'}
            </p>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  return <SkeletonLoader variant="card" className={className} />
}

// Skeleton loader component for different content types
export function SkeletonLoader({ 
  variant = 'card', 
  count = 1, 
  className 
}: SkeletonLoaderProps) {
  if (variant === 'card') {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-[80px]" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center space-x-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-8 w-[60px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'deal') {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-[300px]" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                </div>
                <Skeleton className="h-6 w-[80px]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="border-b p-4">
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
          {/* Table Rows */}
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="border-b p-4 last:border-b-0">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
      ))}
    </div>
  )
}

// Inline loading component for buttons and small elements
export function InlineLoader({ 
  size = 'sm', 
  text, 
  className 
}: { 
  size?: 'xs' | 'sm' | 'md'
  text?: string
  className?: string 
}) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  )
}

// Full page overlay loader
export function OverlayLoader({ 
  text, 
  progress,
  className 
}: { 
  text?: string
  progress?: number
  className?: string 
}) {
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
      className
    )}>
      <PageLoader 
        variant={progress !== undefined ? 'progress' : 'brand'}
        text={text}
        progress={progress}
        size="lg"
      />
    </div>
  )
}