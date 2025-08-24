import React from 'react'
import { format } from 'date-fns'
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useDeals } from '@/hooks/useDeals'
import { usePayments } from '@/hooks/usePayments'
import { useAuth } from '@/hooks/useAuth'
import type { Deal, DealStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EscrowStatusProps {
  deal: Deal
  showActions?: boolean
  className?: string
}

const ESCROW_STATUS_CONFIG = {
  created: { 
    icon: Clock, 
    label: 'Awaiting Funding', 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Escrow payment is required to activate this deal'
  },
  accepted: { 
    icon: Clock, 
    label: 'Payment Required', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Deal accepted, awaiting escrow funding'
  },
  funded: { 
    icon: Shield, 
    label: 'Funds Secured', 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Funds are safely held in escrow'
  },
  in_progress: { 
    icon: Shield, 
    label: 'Funds Secured', 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Work in progress, funds secured in escrow'
  },
  milestone_completed: { 
    icon: Shield, 
    label: 'Funds Secured', 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Milestone completed, funds ready for release'
  },
  completed: { 
    icon: CheckCircle, 
    label: 'Funds Released', 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Deal completed successfully, funds released'
  },
  disputed: { 
    icon: AlertTriangle, 
    label: 'Funds Frozen', 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Dispute active, funds temporarily frozen'
  },
  cancelled: { 
    icon: ArrowUpRight, 
    label: 'Funds Returned', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Deal cancelled, funds refunded'
  },
  refunded: { 
    icon: ArrowUpRight, 
    label: 'Funds Refunded', 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Funds have been refunded to buyer'
  }
}

export default function EscrowStatus({ deal, showActions = true, className }: EscrowStatusProps) {
  const { user } = useAuth()
  const { releaseEscrow, refundEscrow } = useDeals()
  const { formatPaymentAmount, processRefund } = usePayments()

  const config = ESCROW_STATUS_CONFIG[deal.status]
  const Icon = config.icon
  const isBuyer = user?.id === deal.buyerId
  const isSeller = user?.id === deal.sellerId
  
  // Calculate progress percentage based on milestones
  const completedMilestones = deal.milestones.filter(m => m.status === 'approved').length
  const totalMilestones = deal.milestones.length
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  // Check if escrow can be released
  const canReleaseEscrow = () => {
    return isBuyer && 
           (deal.status === 'milestone_completed' || deal.status === 'completed') &&
           completedMilestones === totalMilestones
  }

  // Check if escrow can be refunded
  const canRefundEscrow = () => {
    return (isBuyer || isSeller) && 
           ['funded', 'in_progress', 'disputed'].includes(deal.status) &&
           progressPercentage < 50 // Only allow refunds if less than 50% complete
  }

  // Handle escrow release
  const handleReleaseEscrow = async () => {
    try {
      // Find the first completed milestone to release
      const completedMilestone = deal.milestones.find(m => m.status === 'completed')
      if (!completedMilestone) {
        console.error('No completed milestone found to release')
        return
      }
      await releaseEscrow(deal.id, completedMilestone.id)
    } catch (error) {
      console.error('Failed to release escrow:', error)
    }
  }

  // Handle escrow refund
  const handleRefundEscrow = async () => {
    try {
      if (deal.paymentIntentId) {
        await processRefund(deal.paymentIntentId, deal.escrowAmount, 'requested_by_customer')
      }
      // Provide appropriate reason based on user role and deal status
      const reason = isBuyer ? 'buyer_requested_refund' : 'seller_requested_refund'
      await refundEscrow(deal.id, reason)
    } catch (error) {
      console.error('Failed to refund escrow:', error)
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Escrow Status
        </CardTitle>
        <CardDescription>
          Secure payment protection for this transaction
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className={cn(
          "p-4 rounded-lg border",
          config.bgColor,
          config.borderColor
        )}>
          <div className="flex items-start gap-3">
            <Icon className={cn("h-6 w-6 mt-0.5", config.color)} />
            <div className="flex-1">
              <h4 className={cn("font-semibold", config.color)}>
                {config.label}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
          </div>
        </div>

        {/* Amount Information */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Escrow Amount:</span>
            <span className="font-semibold">
              {formatPaymentAmount(deal.escrowAmount, deal.currency)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Service Fee:</span>
            <span className="text-sm">
              {formatPaymentAmount(deal.escrowFee, deal.currency)}
            </span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Secured:</span>
            <span className="font-bold text-lg">
              {formatPaymentAmount(deal.escrowAmount + deal.escrowFee, deal.currency)}
            </span>
          </div>
        </div>

        {/* Progress Indicator */}
        {deal.milestones.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completion Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedMilestones}/{totalMilestones} milestones
              </span>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <p className="text-xs text-muted-foreground">
              {progressPercentage === 100 
                ? "All milestones completed, ready for final release"
                : `${progressPercentage.toFixed(0)}% complete`}
            </p>
          </div>
        )}

        {/* Timeline Information */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm">Transaction Timeline</h5>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Deal Created: {format(new Date(deal.createdAt), 'MMM d, yyyy HH:mm')}</div>
            {deal.status !== 'created' && (
              <div>Last Updated: {format(new Date(deal.updatedAt), 'MMM d, yyyy HH:mm')}</div>
            )}
            {deal.completedAt && (
              <div>Completed: {format(new Date(deal.completedAt), 'MMM d, yyyy HH:mm')}</div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Your funds are protected by SafeSwap&apos;s escrow service. Money is only released when 
            all parties agree the work is complete.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        {showActions && (isBuyer || isSeller) && (
          <div className="space-y-2">
            {canReleaseEscrow() && (
              <Button 
                onClick={handleReleaseEscrow}
                className="w-full"
                size="sm"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Release Funds to Seller
              </Button>
            )}
            
            {canRefundEscrow() && (
              <Button 
                variant="outline"
                onClick={handleRefundEscrow}
                className="w-full"
                size="sm"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Request Refund
              </Button>
            )}
            
            {/* Information for buyers about when they can release funds */}
            {isBuyer && deal.status === 'in_progress' && progressPercentage < 100 && (
              <p className="text-xs text-muted-foreground text-center">
                You can release funds once all milestones are completed
              </p>
            )}
            
            {/* Information for sellers */}
            {isSeller && ['funded', 'in_progress'].includes(deal.status) && (
              <p className="text-xs text-muted-foreground text-center">
                Complete your work milestones to unlock fund release
              </p>
            )}
          </div>
        )}

        {/* Special States */}
        {deal.status === 'disputed' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This deal is currently under dispute resolution. Funds will remain secure 
              until the dispute is resolved by our support team.
            </AlertDescription>
          </Alert>
        )}

        {deal.status === 'created' && isBuyer && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Complete the escrow funding to activate this deal and protect both parties.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}