import React from 'react'
import { 
  Plus, 
  Search, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  User, 
  Shield, 
  HelpCircle,
  Upload,
  Download,
  Bell
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useAuth } from '@/hooks/useAuth'
import { useDealStore } from '@/store/dealStore'
import { useNotificationStore } from '@/store/notificationStore'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  layout?: 'grid' | 'list'
  showDescription?: boolean
  limit?: number
  className?: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href?: string
  onClick?: () => void
  badge?: {
    text: string | number
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  } | undefined
  disabled?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export default function QuickActions({ 
  layout = 'grid', 
  showDescription = true, 
  limit,
  className 
}: QuickActionsProps) {
  const { user, canCreateDeals } = useAuth()
  const { deals } = useDealStore()
  const { unreadCount } = useNotificationStore()

  // Count active deals that need attention
  const activeDealCount = deals.filter(deal => 
    (deal.buyerId === user?.id || deal.sellerId === user?.id) &&
    ['created', 'accepted', 'funded', 'in_progress', 'milestone_completed'].includes(deal.status)
  ).length

  // Count deals awaiting user action
  const actionRequiredCount = deals.filter(deal => {
    if (!user) return false
    
    // Buyer actions
    if (deal.buyerId === user.id) {
      return deal.status === 'accepted' || deal.status === 'milestone_completed'
    }
    
    // Seller actions
    if (deal.sellerId === user.id) {
      return deal.status === 'created' || deal.status === 'funded'
    }
    
    return false
  }).length

  const quickActions: QuickAction[] = [
    {
      id: 'create-deal',
      title: 'Create Deal',
      description: 'Start a new escrow transaction',
      icon: Plus,
      href: '/dashboard/deals/create',
      disabled: !canCreateDeals,
      priority: 'high'
    },
    {
      id: 'browse-deals',
      title: 'Browse Deals',
      description: 'Find deals to participate in',
      icon: Search,
      href: '/dashboard/deals',
      priority: 'high'
    },
    {
      id: 'active-deals',
      title: 'Active Deals',
      description: 'Manage your ongoing transactions',
      icon: Shield,
      href: '/dashboard/deals?status=active',
      badge: activeDealCount > 0 ? {
        text: activeDealCount,
        variant: 'default'
      } : undefined,
      priority: 'high'
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Chat with deal participants',
      icon: MessageSquare,
      href: '/dashboard/messages',
      priority: 'medium'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View your latest updates',
      icon: Bell,
      href: '/dashboard/notifications',
      badge: unreadCount > 0 ? {
        text: unreadCount,
        variant: 'destructive'
      } : undefined,
      priority: 'medium'
    },
    {
      id: 'transactions',
      title: 'Transactions',
      description: 'View payment history',
      icon: CreditCard,
      href: '/dashboard/transactions',
      priority: 'medium'
    },
    {
      id: 'profile',
      title: 'My Profile',
      description: 'Update your account information',
      icon: User,
      href: '/dashboard/profile',
      priority: 'low'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your preferences',
      icon: Settings,
      href: '/dashboard/settings',
      priority: 'low'
    }
  ]

  // Add conditional actions based on user status
  if (user && !user.isVerified) {
    quickActions.unshift({
      id: 'verify-account',
      title: 'Verify Account',
      description: 'Complete account verification',
      icon: Shield,
      href: '/dashboard/verify',
      badge: {
        text: 'Required',
        variant: 'destructive'
      },
      priority: 'high'
    })
  }

  if (user?.kycStatus !== 'approved') {
    quickActions.unshift({
      id: 'complete-kyc',
      title: 'Complete KYC',
      description: 'Verify your identity',
      icon: Upload,
      href: '/dashboard/kyc',
      badge: {
        text: 'Pending',
        variant: 'outline'
      },
      priority: 'high'
    })
  }

  if (actionRequiredCount > 0) {
    quickActions.unshift({
      id: 'action-required',
      title: 'Action Required',
      description: 'Deals need your attention',
      icon: Bell,
      href: '/dashboard/deals?filter=action-required',
      badge: {
        text: actionRequiredCount,
        variant: 'destructive'
      },
      priority: 'high'
    })
  }

  // Sort by priority and apply limit
  const sortedActions = quickActions
    .sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 }
      return priorities[b.priority || 'low'] - priorities[a.priority || 'low']
    })
    .slice(0, limit || quickActions.length)

  const ActionButton = ({ action }: { action: QuickAction }) => {
    const Icon = action.icon
    
    const button = (
      <Button
        variant="ghost"
        className={cn(
          "h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50",
          layout === 'list' && "flex-row justify-start gap-3 h-12",
          action.disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={action.disabled}
        onClick={action.onClick}
      >
        <div className="relative">
          <Icon className={cn(
            "h-6 w-6 text-muted-foreground",
            layout === 'list' && "h-5 w-5"
          )} />
          {action.badge && (
            <Badge 
              variant={action.badge.variant || 'default'}
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {action.badge.text}
            </Badge>
          )}
        </div>
        
        <div className={cn(
          "text-center",
          layout === 'list' && "text-left flex-1"
        )}>
          <p className={cn(
            "font-medium text-sm",
            layout === 'list' && "text-base"
          )}>
            {action.title}
          </p>
          {showDescription && (
            <p className={cn(
              "text-xs text-muted-foreground mt-1",
              layout === 'list' && "text-sm"
            )}>
              {action.description}
            </p>
          )}
        </div>
      </Button>
    )

    if (action.href) {
      return (
        <a href={action.href} className="block">
          {button}
        </a>
      )
    }

    return button
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className={cn(
          layout === 'grid' ? 
            "grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" :
            "space-y-1"
        )}>
          {sortedActions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>
        
        {/* Help section */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span className="text-xs">
              Need help? Visit our{' '}
              <a href="/help" className="text-blue-600 hover:underline">
                Help Center
              </a>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}