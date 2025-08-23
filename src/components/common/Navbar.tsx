'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Handshake, 
  MessageSquare, 
  CreditCard, 
  User,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useDeals } from '@/hooks/useDeals'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

interface NavbarProps {
  className?: string | undefined
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number | undefined
}

export default function Navbar({ className }: NavbarProps) {
  const pathname = usePathname()
  const { user, canCreateDeals } = useAuth()
  const { dealStats } = useDeals()
  const { unreadCount } = useNotifications()

  const navItems: NavItem[] = [
    {
      title: 'Home',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Deals',
      href: '/dashboard/deals',
      icon: Handshake,
      badge: dealStats.active > 0 ? dealStats.active : undefined,
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
      title: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    }
  ]

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  if (!user) {
    return null
  }

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden",
      className
    )}>
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = isActiveLink(item.href)
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className={cn(
                "flex-col h-auto py-2 px-3 relative",
                isActive && "text-primary"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className={cn(
                  "h-5 w-5 mb-1",
                  isActive && "text-primary"
                )} />
                <span className="text-xs font-medium">
                  {item.title}
                </span>
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </Link>
            </Button>
          )
        })}

        {/* Floating Action Button for Create Deal */}
        {canCreateDeals() && (
          <Button
            size="sm"
            className="h-12 w-12 rounded-full shadow-lg"
            asChild
          >
            <Link href="/dashboard/deals/create">
              <Plus className="h-6 w-6" />
              <span className="sr-only">Create Deal</span>
            </Link>
          </Button>
        )}
      </div>
    </nav>
  )
}