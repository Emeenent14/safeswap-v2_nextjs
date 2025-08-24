import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DealStatusBadge from './DealStatusBadge'
import { Clock, DollarSign, User, MessageSquare } from 'lucide-react'
import type { Deal } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useDeals } from '@/hooks/useDeals'
import { cn } from '@/lib/utils'

interface DealCardProps {
  deal: Deal
  variant?: 'default' | 'compact'
  showActions?: boolean
  className?: string
}

export default function DealCard({ 
  deal, 
  variant = 'default',
  showActions = true,
  className 
}: DealCardProps) {
  const { user } = useAuth()
  const { acceptDeal, rejectDeal, cancelDeal, canAcceptDeal, canCancelDeal } = useDeals()

  const isCompact = variant === 'compact'
  const isBuyer = user?.id === deal.buyerId
  const isSeller = user?.id === deal.sellerId
  const isOwner = isBuyer || isSeller

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: deal.currency || 'USD'
    }).format(amount)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getOtherParty = () => {
    if (isBuyer) return deal.seller
    if (isSeller) return deal.buyer
    return null
  }

  const otherParty = getOtherParty()

  const handleAccept = async () => {
    try {
      await acceptDeal(deal.id)
    } catch (error) {
      // Error is handled by useDeals hook
    }
  }

  const handleReject = async () => {
    try {
      await rejectDeal(deal.id)
    } catch (error) {
      // Error is handled by useDeals hook
    }
  }

  const handleCancel = async () => {
    try {
      await cancelDeal(deal.id)
    } catch (error) {
      // Error is handled by useDeals hook
    }
  }

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isCompact ? 'p-3' : 'p-0',
      className
    )}>
      <CardHeader className={cn(
        'pb-3',
        isCompact && 'p-0 pb-2'
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              'text-lg font-semibold line-clamp-2',
              isCompact && 'text-base'
            )}>
              <Link 
                href={`/dashboard/deals/${deal.id}`}
                className="hover:text-primary transition-colors"
              >
                {deal.title}
              </Link>
            </CardTitle>
            
            {!isCompact && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {deal.description}
              </p>
            )}
          </div>
          
          <DealStatusBadge 
            status={deal.status}
            className="ml-3 shrink-0"
          />
        </div>
      </CardHeader>

      <CardContent className={cn(
        'py-3',
        isCompact && 'p-0 py-2'
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-lg font-bold text-green-600">
            <DollarSign className="h-4 w-4" />
            {formatCurrency(deal.amount)}
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {getCategoryLabel(deal.category)}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(deal.createdAt)}
          </div>
          
          {deal.messages && deal.messages.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {deal.messages.length}
            </div>
          )}
        </div>

        {otherParty && !isCompact && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <Avatar className="h-6 w-6">
              <AvatarImage src={otherParty.avatar || ''} />
              <AvatarFallback className="text-xs">
                {otherParty.firstName[0]}{otherParty.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {otherParty.firstName} {otherParty.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {isBuyer ? 'Seller' : 'Buyer'} • Trust Score: {otherParty.trustScore}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {showActions && !isCompact && (
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1"
            >
              <Link href={`/dashboard/deals/${deal.id}`}>
                View Details
              </Link>
            </Button>

            {canAcceptDeal(deal) && (
              <Button
                size="sm"
                onClick={handleAccept}
                className="flex-1"
              >
                Accept Deal
              </Button>
            )}

            {deal.status === 'created' && isSeller && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
              >
                Reject
              </Button>
            )}

            {canCancelDeal(deal) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-destructive hover:text-destructive"
              >
                Cancel
              </Button>
            )}

            {isOwner && deal.status === 'in_progress' && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/dashboard/messages/${deal.id}`}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}