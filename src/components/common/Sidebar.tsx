'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Handshake, 
  MessageSquare, 
  CreditCard, 
  AlertTriangle, 
  PiggyBank, 
  FileCheck, 
  User, 
  Settings,
  Shield,
  Users,
  UserCheck,
  ChevronDown,
  ChevronRight,
  X,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useUIStore } from '@/store/uiStore'
import { useTrustScore } from '@/hooks/useTrustScore'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
  onClose?: () => void
}

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number | undefined
  adminOnly?: boolean
  children?: NavigationItem[]
}

export default function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()
  const { trustScoreMetrics } = useTrustScore()

  // Mock data - replace with actual hooks when available
  const user = {
    firstName: 'John',
    email: 'john@example.com',
    trustScore: trustScoreMetrics?.currentScore
  }
  const dealStats = { active: 3 }
  const unreadCount = 2
  const isAdmin = () => false

  const [openSections, setOpenSections] = React.useState<string[]>(['deals'])

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const getDisplayName = () => {
    return user?.firstName || 'User'
  }

  const navigationItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Deals',
      href: '/dashboard/deals',
      icon: Handshake,
      badge: dealStats.active > 0 ? dealStats.active : undefined,
      children: [
        {
          title: 'All Deals',
          href: '/dashboard/deals',
          icon: Handshake,
        },
        {
          title: 'Create Deal',
          href: '/dashboard/deals/create',
          icon: Handshake,
        }
      ]
    },
    {
      title: 'Messages',
      href: '/dashboard/messages',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      title: 'Transactions',
      href: '/dashboard/transactions',
      icon: CreditCard,
    },
    {
      title: 'Disputes',
      href: '/dashboard/disputes',
      icon: AlertTriangle,
    },
    {
      title: 'Savings',
      href: '/dashboard/savings',
      icon: PiggyBank,
    }
  ]

  const accountItems: NavigationItem[] = [
    {
      title: 'KYC Verification',
      href: '/dashboard/kyc',
      icon: FileCheck,
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    }
  ]

  const adminItems: NavigationItem[] = [
    {
      title: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      adminOnly: true,
      children: [
        {
          title: 'Overview',
          href: '/admin',
          icon: Shield,
        },
        {
          title: 'Users',
          href: '/admin/users',
          icon: Users,
        },
        {
          title: 'Disputes',
          href: '/admin/disputes',
          icon: AlertTriangle,
        },
        {
          title: 'KYC Review',
          href: '/admin/kyc',
          icon: UserCheck,
        }
      ]
    }
  ]

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    if (item.adminOnly && !isAdmin()) {
      return null
    }

    const hasChildren = item.children && item.children.length > 0
    const isActive = isActiveLink(item.href)
    const sectionKey = item.title.toLowerCase().replace(/\s+/g, '-')
    const isOpen = openSections.includes(sectionKey)

    // If sidebar is collapsed, don't show children
    const shouldShowChildren = hasChildren && !sidebarCollapsed

    return (
      <div key={item.href}>
        {shouldShowChildren ? (
          <Collapsible open={isOpen} onOpenChange={() => toggleSection(sectionKey)}>
            <CollapsibleTrigger asChild>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10",
                  level > 0 && "ml-4 w-[calc(100%-1rem)]",
                  sidebarCollapsed && "px-2"
                )}
              >
                <item.icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 h-5">
                        {item.badge}
                      </Badge>
                    )}
                    {isOpen ? (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-2 h-4 w-4" />
                    )}
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            {!sidebarCollapsed && (
              <CollapsibleContent className="space-y-1">
                {item.children?.map((child) => renderNavigationItem(child, level + 1))}
              </CollapsibleContent>
            )}
          </Collapsible>
        ) : (
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-10",
              level > 0 && "ml-4 w-[calc(100%-1rem)]",
              sidebarCollapsed && "px-2"
            )}
            asChild
            onClick={onClose}
          >
            <Link href={item.href}>
              <item.icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 h-5">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex h-full flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
      sidebarCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/40">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          {!sidebarCollapsed && <span className="font-semibold">SafeSwap</span>}
        </div>
        
        {/* Collapse toggle - desktop */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="hidden md:flex"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Close button - mobile */}
        {onClose && (
          <Button variant="ghost" size="sm" className="md:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* User Info */}
      {!sidebarCollapsed && (
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getDisplayName()}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          {/* Fixed trust score conditional - check for valid score and handle no transactions case */}
          {trustScoreMetrics?.currentScore !== undefined ? (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
              <span className="text-xs text-muted-foreground">Trust Score</span>
              <Badge variant="outline" className="text-xs">
                {trustScoreMetrics.currentScore}/100
              </Badge>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
              <span className="text-xs text-muted-foreground">Trust Score</span>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                No transactions yet
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Collapsed User Avatar */}
      {sidebarCollapsed && (
        <div className="p-2 border-b border-border/40 flex justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-2">
        <nav className="space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigationItems.map((item) => renderNavigationItem(item))}
          </div>

          {!sidebarCollapsed && <Separator className="my-4" />}

          {/* Account Section */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Account
                </h3>
              </div>
            )}
            {accountItems.map((item) => renderNavigationItem(item))}
          </div>

          {/* Admin Section */}
          {isAdmin() && (
            <>
              {!sidebarCollapsed && <Separator className="my-4" />}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Administration
                    </h3>
                  </div>
                )}
                {adminItems.map((item) => renderNavigationItem(item))}
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-border/40">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 SafeSwap
            </p>
            <p className="text-xs text-muted-foreground">
              v1.0.0
            </p>
          </div>
        </div>
      )}
    </div>
  )
}