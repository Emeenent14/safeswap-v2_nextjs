import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import DealStatusBadge from './DealStatusBadge'
import MilestoneCard from './MilestoneCard'
import  ConfirmationModal  from '@/components/common/ConfirmationModal'
import { 
  Calendar, 
  DollarSign, 
  User, 
  MessageSquare, 
  FileText, 
  Clock,
  AlertTriangle,
  CheckCircle,
  CreditCard
} from 'lucide-react'
import type { Deal, DealCategory } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useDeals } from '@/hooks/useDeals'
import { cn } from '@/lib/utils'

interface DealDetailsProps {
  dealId: string
  className?: string
}

export default function DealDetails({ dealId, className }: DealDetailsProps) {
  const { user } = useAuth()
  const { 
    currentDeal,
    milestones,
    isLoading,
    error,
    fetchDealById,
    fetchMilestones,
    acceptDeal,
    rejectDeal,
    cancelDeal,
    completeDeal,
    canAcceptDeal,
    canCancelDeal
  } = useDeals()

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    fetchDealById(dealId)
    fetchMilestones(dealId)
  }, [dealId, fetchDealById, fetchMilestones])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentDeal?.currency || 'USD'
    }).format(amount)
  }

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryLabel = (category: DealCategory): string => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getProgressPercentage = (): number => {
    if (!milestones.length) return 0
    const completedMilestones = milestones.filter(m => m.status === 'approved').length
    return (completedMilestones / milestones.length) * 100
  }

  const getTotalMilestoneValue = (): number => {
    return milestones.reduce((sum, milestone) => sum + milestone.amount, 0)
  }

  const getCompletedValue = (): number => {
    return milestones
      .filter(m => m.status === 'approved')
      .reduce((sum, milestone) => sum + milestone.amount, 0)
  }

  const handleAccept = async (): Promise<void> => {
    try {
      await acceptDeal(dealId)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleReject = async (): Promise<void> => {
    try {
      await rejectDeal(dealId)
      setShowRejectModal(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleCancel = async (): Promise<void> => {
    try {
      await cancelDeal(dealId)
      setShowCancelModal(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleComplete = async (): Promise<void> => {
    try {
      await completeDeal(dealId)
    } catch (error) {
      // Error handled by hook
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading deal details...</div>
  }

  if (error || !currentDeal) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">
          {error || 'Deal not found'}
        </p>
        <Button asChild>
          <Link href="/dashboard/deals">Back to Deals</Link>
        </Button>
      </div>
    )
  }

  const deal = currentDeal
  const isBuyer = user?.id === deal.buyerId
  const isSeller = user?.id === deal.sellerId
  const isOwner = isBuyer || isSeller

  const getActionButtons = (): React.ReactElement[] => {
    const buttons: React.ReactElement[] = []

    // Accept/Reject for sellers when deal is created
    if (canAcceptDeal(deal)) {
      buttons.push(
        <Button key="accept" onClick={handleAccept}>
          Accept Deal
        </Button>
      )
      buttons.push(
        <Button 
          key="reject" 
          variant="destructive"
          onClick={() => setShowRejectModal(true)}
        >
          Reject Deal
        </Button>
      )
    }

    // Cancel for both parties when appropriate
    if (canCancelDeal(deal)) {
      buttons.push(
        <Button 
          key="cancel"
          variant="outline"
          onClick={() => setShowCancelModal(true)}
          className="text-red-600 hover:text-red-700"
        >
          Cancel Deal
        </Button>
      )
    }

    // Complete deal when all milestones are approved
    if (isOwner && deal.status === 'milestone_completed' && 
        milestones.every(m => m.status === 'approved')) {
      buttons.push(
        <Button key="complete" onClick={handleComplete}>
          Complete Deal
        </Button>
      )
    }

    // Chat and other actions
    if (isOwner && ['accepted', 'funded', 'in_progress', 'milestone_completed'].includes(deal.status)) {
      buttons.push(
        <Button key="chat" variant="outline" asChild>
          <Link href={`/dashboard/messages/${deal.id}`}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Link>
        </Button>
      )
    }

    return buttons
  }

  const actionButtons = getActionButtons()

  return (
    <div className={cn('max-w-6xl mx-auto space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{deal.title}</h1>
          <p className="text-muted-foreground">
            Created {formatDate(deal.createdAt)}
          </p>
        </div>
        <DealStatusBadge status={deal.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Deal Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {deal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(deal.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Value</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {milestones.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Milestones</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(getProgressPercentage())}%
                  </div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {getCategoryLabel(deal.category)}
                  </div>
                  <div className="text-xs text-muted-foreground">Category</div>
                </div>
              </div>

              {/* Progress Bar */}
              {milestones.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Deal Progress</span>
                    <span>{formatCurrency(getCompletedValue())} / {formatCurrency(getTotalMilestoneValue())}</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-3" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          {milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {milestones.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    dealId={deal.id}
                    isBuyer={isBuyer}
                    isSeller={isSeller}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {actionButtons.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  {actionButtons}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buyer */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={deal.buyer?.avatar || ''} />
                  <AvatarFallback>
                    {deal.buyer?.firstName?.[0] || '?'}{deal.buyer?.lastName?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {deal.buyer ? `${deal.buyer.firstName} ${deal.buyer.lastName}` : 'Unknown'}
                    </p>
                    {isBuyer && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Buyer • Trust Score: {deal.buyer?.trustScore ?? 'N/A'}
                  </p>
                </div>
                {deal.buyer && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/public-profile/${deal.buyer.id}`}>
                      View Profile
                    </Link>
                  </Button>
                )}
              </div>

              <Separator />

              {/* Seller */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={deal.seller?.avatar || ''} />
                  <AvatarFallback>
                    {deal.seller?.firstName?.[0] || '?'}{deal.seller?.lastName?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {deal.seller ? `${deal.seller.firstName} ${deal.seller.lastName}` : 'Not assigned'}
                    </p>
                    {isSeller && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seller • Trust Score: {deal.seller?.trustScore ?? 'N/A'}
                  </p>
                </div>
                {deal.seller && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/public-profile/${deal.seller.id}`}>
                      View Profile
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Deal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <DealStatusBadge status={deal.status} />
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="text-sm font-medium">
                  {getCategoryLabel(deal.category)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {new Date(deal.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {deal.updatedAt !== deal.createdAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Updated</span>
                  <span className="text-sm font-medium">
                    {new Date(deal.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(deal.amount)}
                </span>
              </div>

              {deal.escrowAmount && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Escrow</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(deal.escrowAmount)}
                  </span>
                </div>
              )}

              {deal.escrowFee && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fee</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(deal.escrowFee)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href={`/dashboard/messages/${deal.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Messages
                  </Link>
                </Button>
                
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href={`/dashboard/transactions?dealId=${deal.id}`}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Transactions
                  </Link>
                </Button>

                {deal.status === 'disputed' && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href={`/dashboard/disputes?dealId=${deal.id}`}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      View Dispute
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deal Files */}
          {deal.files && deal.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attached Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deal.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onConfirm={handleCancel}
        title="Cancel Deal"
        description="Are you sure you want to cancel this deal? This action cannot be undone."
        confirmLabel="Cancel Deal"
        variant="destructive"
      />

      <ConfirmationModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        onConfirm={handleReject}
        title="Reject Deal"
        description="Are you sure you want to reject this deal? The buyer will be notified."
        confirmLabel="Reject Deal"
        variant="destructive"
      />
    </div>
  )
}