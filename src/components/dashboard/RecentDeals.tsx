import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { ArrowRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import  DealStatusBadge  from '@/components/deals/DealStatusBadge'
import { useDealStore } from '@/store/dealStore'
import { useAuthStore } from '@/store/authStore'
import { usePayments } from '@/hooks/usePayments'
import type { Deal } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RecentDealsProps {
  limit?: number
  showAllDeals?: boolean
  className?: string
}

export default function RecentDeals({ limit = 5, showAllDeals = false, className }: RecentDealsProps) {
  const { deals } = useDealStore()
  const { user } = useAuthStore()
  const { formatPaymentAmount } = usePayments()

  // Filter and sort deals
  const recentDeals = useMemo(() => {
    if (!user) return []

    let filteredDeals = deals

    // If not showing all deals, filter by user involvement
    if (!showAllDeals) {
      filteredDeals = deals.filter(deal => 
        deal.buyerId === user.id || deal.sellerId === user.id
      )
    }

    // Sort by creation date (most recent first) and limit
    return filteredDeals
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }, [deals, user, showAllDeals, limit])

  // Get user role in deal
  const getUserRole = (deal: Deal) => {
    if (!user) return null
    if (deal.buyerId === user.id) return 'buyer'
    if (deal.sellerId === user.id) return 'seller'
    return null
  }

  // Get the other party in the deal
  const getOtherParty = (deal: Deal) => {
    if (!user) return null
    if (deal.buyerId === user.id) return deal.seller
    if (deal.sellerId === user.id) return deal.buyer
    return null
  }

  // Get user initials for avatar fallback
  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '?'
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  // Get next action for deal
  const getNextAction = (deal: Deal) => {
    const userRole = getUserRole(deal)
    
    switch (deal.status) {
      case 'created':
        return userRole === 'seller' 
          ? { text: 'Accept Deal', urgency: 'high' }
          : { text: 'Awaiting Response', urgency: 'medium' }
      
      case 'accepted':
        return userRole === 'buyer'
          ? { text: 'Fund Escrow', urgency: 'high' }
          : { text: 'Awaiting Payment', urgency: 'medium' }
      
      case 'funded':
        return userRole === 'seller'
          ? { text: 'Start Work', urgency: 'high' }
          : { text: 'Work Starting', urgency: 'low' }
      
      case 'in_progress':
        return userRole === 'seller'
          ? { text: 'Complete Milestone', urgency: 'medium' }
          : { text: 'Track Progress', urgency: 'low' }
      
      case 'milestone_completed':
        return userRole === 'buyer'
          ? { text: 'Approve Milestone', urgency: 'high' }
          : { text: 'Awaiting Approval', urgency: 'medium' }
      
      case 'disputed':
        return { text: 'Resolve Dispute', urgency: 'high' }
      
      default:
        return { text: 'View Details', urgency: 'low' }
    }
  }

  if (recentDeals.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Recent Deals</CardTitle>
          <CardDescription>Your latest deal activity</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No recent deals</h3>
          <p className="text-muted-foreground mb-4">
            {showAllDeals 
              ? "No deals found in the system yet."
              : "You haven't participated in any deals yet."
            }
          </p>
          <Button>
            {showAllDeals ? 'Browse Available Deals' : 'Create Your First Deal'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Deals</CardTitle>
            <CardDescription>
              {showAllDeals ? 'Latest deals in the system' : 'Your recent deal activity'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-0">
        {recentDeals.map((deal, index) => {
          const userRole = getUserRole(deal)
          const otherParty = getOtherParty(deal)
          const nextAction = getNextAction(deal)
          
          return (
            <div key={deal.id}>
              <div className="py-4">
                <div className="flex items-start justify-between">
                  {/* Deal Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Other party avatar (or deal icon if showAllDeals) */}
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage 
                        src={otherParty?.avatar || '/placeholder-avatars/user.png'} 
                        alt={otherParty ? `${otherParty.firstName} ${otherParty.lastName}` : 'User'}
                      />
                      <AvatarFallback>
                        {otherParty 
                          ? getUserInitials(otherParty.firstName, otherParty.lastName)
                          : '?'
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm truncate pr-2">{deal.title}</h4>
                        <DealStatusBadge status={deal.status} className="shrink-0" />
                      </div>
                      
                      <div className="space-y-1">
                        {/* Other party info and role */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {otherParty && (
                            <>
                              <span>{otherParty.firstName} {otherParty.lastName}</span>
                              <span>•</span>
                            </>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {userRole === 'buyer' ? 'You are buying' : 
                             userRole === 'seller' ? 'You are selling' : 
                             'External deal'}
                          </Badge>
                          <span>•</span>
                          <span>{format(new Date(deal.createdAt), 'MMM d')}</span>
                        </div>
                        
                        {/* Deal amount and next action */}
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            {formatPaymentAmount(deal.amount, deal.currency)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs",
                              nextAction.urgency === 'high' && "text-red-600",
                              nextAction.urgency === 'medium' && "text-yellow-600",
                              nextAction.urgency === 'low' && "text-green-600"
                            )}>
                              {nextAction.text}
                            </span>
                            
                            {nextAction.urgency === 'high' && (
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                            )}
                            {nextAction.urgency === 'medium' && (
                              <Clock className="h-3 w-3 text-yellow-600" />
                            )}
                            {nextAction.urgency === 'low' && (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Separator (not for last item) */}
              {index < recentDeals.length - 1 && <Separator />}
            </div>
          )
        })}
        
        {/* Footer with total stats */}
        <div className="pt-4 border-t mt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{recentDeals.length} recent deals</span>
            <Button variant="ghost" size="sm" className="text-xs">
              View all deals →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}