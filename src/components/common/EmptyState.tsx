'use client'

import React from 'react'
import Link from 'next/link'
import { 
  FileX, 
  Handshake, 
  MessageSquare, 
  CreditCard, 
  AlertTriangle, 
  Users, 
  Search,
  Plus,
  RefreshCw,
  Shield,
  PiggyBank,
  FileCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  variant: 'deals' | 'messages' | 'transactions' | 'disputes' | 'notifications' | 'users' | 'search' | 'savings' | 'kyc' | 'generic'
  title?: string | undefined
  description?: string | undefined
  actionLabel?: string | undefined
  actionHref?: string | undefined
  onAction?: (() => void) | undefined
  showRefresh?: boolean | undefined
  onRefresh?: (() => void) | undefined
  className?: string | undefined
  size?: 'sm' | 'md' | 'lg' | undefined
}

// Fixed config type to make all properties optional
interface EmptyStateConfig {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string | undefined
  actionHref?: string | undefined
  showRefresh?: boolean | undefined
}

const emptyStateConfigs: Record<EmptyStateProps['variant'], EmptyStateConfig> = {
  deals: {
    icon: Handshake,
    title: 'No deals yet',
    description: 'Start your first secure transaction by creating a new deal.',
    actionLabel: 'Create Deal',
    actionHref: '/dashboard/deals/create'
  },
  messages: {
    icon: MessageSquare,
    title: 'No messages',
    description: 'Once you start communicating with other users, your messages will appear here.',
    actionLabel: 'Browse Deals',
    actionHref: '/dashboard/deals'
  },
  transactions: {
    icon: CreditCard,
    title: 'No transactions',
    description: 'Your transaction history will appear here once you complete your first deal.',
    actionLabel: 'View Deals',
    actionHref: '/dashboard/deals'
  },
  disputes: {
    icon: AlertTriangle,
    title: 'No disputes',
    description: 'Great! You have no active disputes. Keep up the good communication.',
    actionLabel: 'View Deals',
    actionHref: '/dashboard/deals'
  },
  notifications: {
    icon: Shield,
    title: 'All caught up!',
    description: 'You have no new notifications at the moment.',
    actionLabel: 'Go to Dashboard',
    actionHref: '/dashboard'
  },
  users: {
    icon: Users,
    title: 'No users found',
    description: 'No users match your current search criteria.',
    actionLabel: 'Clear Filters',
    showRefresh: true
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
    actionLabel: 'Clear Search',
    showRefresh: true
  },
  savings: {
    icon: PiggyBank,
    title: 'Start saving today',
    description: 'Create your first savings goal or transfer funds from completed deals.',
    actionLabel: 'Add Savings',
    actionHref: '/dashboard/savings/create'
  },
  kyc: {
    icon: FileCheck,
    title: 'Verification required',
    description: 'Complete your KYC verification to unlock all SafeSwap features.',
    actionLabel: 'Start Verification',
    actionHref: '/dashboard/kyc'
  },
  generic: {
    icon: FileX,
    title: 'Nothing here',
    description: 'There\'s nothing to display at the moment.',
    actionLabel: 'Go Back',
    actionHref: '/dashboard'
  }
}

export default function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  showRefresh,
  onRefresh,
  className,
  size = 'md'
}: EmptyStateProps) {
  const config = emptyStateConfigs[variant]
  const Icon = config.icon

  const finalTitle = title || config.title
  const finalDescription = description || config.description
  const finalActionLabel = actionLabel || config.actionLabel
  const finalActionHref = actionHref || config.actionHref
  const finalShowRefresh = showRefresh ?? config.showRefresh ?? false

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-3'
    },
    md: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-4'
    },
    lg: {
      container: 'py-16',
      icon: 'h-20 w-20',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-6'
    }
  }

  const sizes = sizeClasses[size]

  const handleActionClick = () => {
    if (onAction) {
      onAction()
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  // Determine if we should show the primary action button
  const shouldShowPrimaryAction = finalActionLabel && (finalActionHref || onAction)

  return (
    <div className={cn(
      "flex items-center justify-center w-full",
      sizes.container,
      className
    )}>
      <Card className="w-full max-w-md">
        <CardContent className={cn("flex flex-col items-center text-center p-8", sizes.spacing)}>
          {/* Icon */}
          <div className="flex items-center justify-center rounded-full bg-muted p-4">
            <Icon className={cn("text-muted-foreground", sizes.icon)} />
          </div>

          {/* Content */}
          <div className={cn("space-y-2", sizes.spacing)}>
            <h3 className={cn("font-semibold text-foreground", sizes.title)}>
              {finalTitle}
            </h3>
            <p className={cn("text-muted-foreground max-w-sm", sizes.description)}>
              {finalDescription}
            </p>
          </div>

          {/* Actions */}
          {(shouldShowPrimaryAction || (finalShowRefresh && onRefresh)) && (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {/* Primary Action */}
              {shouldShowPrimaryAction && (
                <Button
                  className="flex-1"
                  onClick={onAction ? handleActionClick : undefined}
                  asChild={!onAction}
                >
                  {onAction ? (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {finalActionLabel}
                    </>
                  ) : finalActionHref ? (
                    <Link href={finalActionHref}>
                      <Plus className="mr-2 h-4 w-4" />
                      {finalActionLabel}
                    </Link>
                  ) : null}
                </Button>
              )}

              {/* Refresh Action */}
              {finalShowRefresh && onRefresh && (
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className={cn(shouldShowPrimaryAction ? "flex-1" : "w-full")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Specialized empty state components for common use cases
export function DealsEmptyState({ 
  className,
  userRole = 'buyer'
}: { 
  className?: string | undefined
  userRole?: 'buyer' | 'seller' | 'both'
}) {
  const getDescription = () => {
    switch (userRole) {
      case 'buyer':
        return 'Browse available deals or create a new one to get started.'
      case 'seller':
        return 'Create your first deal to start earning with SafeSwap.'
      case 'both':
      default:
        return 'Start your first secure transaction by creating a new deal.'
    }
  }

  return (
    <EmptyState
      variant="deals"
      description={getDescription()}
      {...(className !== undefined && { className })}
    />
  )
}

export function SearchEmptyState({ 
  query, 
  onClearSearch,
  className 
}: { 
  query?: string | undefined
  onClearSearch?: (() => void) | undefined
  className?: string | undefined
}) {
  return (
    <EmptyState
      variant="search"
      title={query ? `No results for "${query}"` : 'No results found'}
      description="Try adjusting your search terms or clearing filters to find what you're looking for."
      actionLabel="Clear Search"
      {...(onClearSearch !== undefined && { onAction: onClearSearch })}
      showRefresh={false}
      {...(className !== undefined && { className })}
    />
  )
}

export function FilteredEmptyState({ 
  onClearFilters,
  onRefresh,
  className 
}: { 
  onClearFilters?: (() => void) | undefined
  onRefresh?: (() => void) | undefined
  className?: string | undefined
}) {
  return (
    <EmptyState
      variant="search"
      title="No items match your filters"
      description="Try removing some filters or refreshing to see more results."
      actionLabel="Clear Filters"
      {...(onClearFilters !== undefined && { onAction: onClearFilters })}
      showRefresh={true}
      {...(onRefresh !== undefined && { onRefresh })}
      {...(className !== undefined && { className })}
    />
  )
}

export function NotificationEmptyState({ className }: { className?: string | undefined }) {
  return (
    <EmptyState
      variant="notifications"
      {...(className !== undefined && { className })}
      size="sm"
    />
  )
}