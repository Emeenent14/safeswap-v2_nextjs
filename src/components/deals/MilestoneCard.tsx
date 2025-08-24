import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import type { Milestone, MilestoneStatus } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useDeals } from '@/hooks/useDeals'
import { cn } from '@/lib/utils'

interface MilestoneCardProps {
  milestone: Milestone
  dealId: string
  isBuyer: boolean
  isSeller: boolean
  className?: string
}

const statusConfig: Record<MilestoneStatus, {
  label: string
  icon: React.ReactNode
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
}> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="h-3 w-3" />,
    variant: 'outline',
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  in_progress: {
    label: 'In Progress',
    icon: <Clock className="h-3 w-3" />,
    variant: 'default',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="h-3 w-3" />,
    variant: 'default',
    className: 'bg-green-50 text-green-700 border-green-200'
  },
  approved: {
    label: 'Approved',
    icon: <CheckCircle className="h-3 w-3" />,
    variant: 'default',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  disputed: {
    label: 'Disputed',
    icon: <AlertTriangle className="h-3 w-3" />,
    variant: 'destructive',
    className: 'bg-red-50 text-red-700 border-red-200'
  }
}

export default function MilestoneCard({ 
  milestone, 
  dealId,
  isBuyer, 
  isSeller,
  className 
}: MilestoneCardProps) {
  const { user } = useAuth()
  const { 
    completeMilestone, 
    approveMilestone, 
    rejectMilestone,
    isLoading 
  } = useDeals()

  const config = statusConfig[milestone.status]
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'No due date'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOverdue = milestone.dueDate && 
    new Date(milestone.dueDate) < new Date() && 
    !['completed', 'approved'].includes(milestone.status)

  const getProgressValue = () => {
    switch (milestone.status) {
      case 'pending':
        return 0
      case 'in_progress':
        return 50
      case 'completed':
        return 75
      case 'approved':
        return 100
      case 'disputed':
        return 25
      default:
        return 0
    }
  }

  const handleComplete = async () => {
    try {
      await completeMilestone(milestone.id)
    } catch (error) {
      // Error handled by useDeals hook
    }
  }

  const handleApprove = async () => {
    try {
      await approveMilestone(milestone.id)
    } catch (error) {
      // Error handled by useDeals hook
    }
  }

  const handleDispute = async () => {
    try {
      const reason = prompt('Please provide a reason for disputing this milestone:')
      if (reason && reason.trim()) {
        await rejectMilestone(milestone.id, reason.trim())
      }
    } catch (error) {
      // Error handled by useDeals hook
    }
  }

  const canComplete = isSeller && milestone.status === 'in_progress'
  const canApprove = isBuyer && milestone.status === 'completed'
  const canDispute = isBuyer && ['in_progress', 'completed'].includes(milestone.status)

  return (
    <Card className={cn(
      'transition-all duration-200',
      isOverdue && 'border-red-200 bg-red-50/30',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {milestone.title}
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </CardTitle>
            {milestone.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {milestone.description}
              </p>
            )}
          </div>
          
          <Badge
            variant={config.variant}
            className={cn(
              'text-xs font-medium px-2 py-1 flex items-center gap-1',
              config.className
            )}
          >
            {config.icon}
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{getProgressValue()}%</span>
          </div>
          <Progress 
            value={getProgressValue()} 
            className="h-2"
          />
        </div>

        {/* Milestone Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-lg font-bold text-green-600">
            <DollarSign className="h-4 w-4" />
            {formatCurrency(milestone.amount)}
          </div>
          
          {milestone.dueDate && (
            <div className={cn(
              'flex items-center gap-1 text-sm',
              isOverdue ? 'text-red-600' : 'text-muted-foreground'
            )}>
              <Calendar className="h-3 w-3" />
              {formatDate(milestone.dueDate)}
            </div>
          )}
        </div>

        {/* Completion Dates */}
        {milestone.completedAt && (
          <div className="text-xs text-muted-foreground">
            Completed: {formatDate(milestone.completedAt)}
          </div>
        )}

        {milestone.approvedAt && (
          <div className="text-xs text-muted-foreground">
            Approved: {formatDate(milestone.approvedAt)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          {canComplete && (
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={isLoading}
              className="flex-1"
            >
              Mark Complete
            </Button>
          )}

          {canApprove && (
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isLoading}
              className="flex-1"
            >
              Approve
            </Button>
          )}

          {canDispute && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDispute}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Dispute
            </Button>
          )}

          {milestone.status === 'disputed' && (
            <div className="flex-1 text-center">
              <p className="text-xs text-muted-foreground">
                Disputed milestone - awaiting admin resolution
              </p>
            </div>
          )}

          {milestone.status === 'approved' && (
            <div className="flex-1 text-center">
              <p className="text-xs text-green-600 font-medium">
                ✓ Milestone completed and approved
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}