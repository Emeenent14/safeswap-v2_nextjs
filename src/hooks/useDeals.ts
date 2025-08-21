import { useCallback, useMemo } from 'react'
import { useDealStore } from '../store/dealStore'
import { useNotificationStore } from '../store/notificationStore'
import { useAuthStore } from '../store/authStore'
import type { 
  Deal, 
  DealStatus, 
  DealFilters, 
  CreateDealForm, 
  CreateMilestoneForm,
  Milestone
} from '../lib/types'

export const useDeals = () => {
  const {
    deals,
    currentDeal,
    milestones,
    transactions,
    filters,
    isLoading,
    error,
    pagination,
    fetchDeals: storeFetchDeals,
    fetchDealById,
    createDeal: storeCreateDeal,
    updateDeal: storeUpdateDeal,
    deleteDeal: storeDeleteDeal,
    acceptDeal: storeAcceptDeal,
    rejectDeal: storeRejectDeal,
    cancelDeal: storeCancelDeal,
    completeDeal: storeCompleteDeal,
    fetchMilestones,
    createMilestone: storeCreateMilestone,
    updateMilestone,
    completeMilestone: storeCompleteMilestone,
    approveMilestone: storeApproveMilestone,
    rejectMilestone: storeRejectMilestone,
    fetchTransactions,
    releaseEscrow: storeReleaseEscrow,
    refundEscrow: storeRefundEscrow,
    setFilters,
    resetFilters,
    setPage,
    setCurrentDeal,
    clearError,
    setLoading
  } = useDealStore()

  const { user } = useAuthStore()
  const { addToast } = useNotificationStore()

  // Enhanced create deal with validation and toast notifications
  const createDeal = useCallback(async (dealData: CreateDealForm) => {
    try {
      const deal = await storeCreateDeal(dealData)
      addToast({
        type: 'success',
        title: 'Deal created!',
        message: `"${deal.title}" has been successfully created.`,
        duration: 4000
      })
      return deal
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create deal'
      addToast({
        type: 'error',
        title: 'Creation failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeCreateDeal, addToast])

  // Enhanced accept deal with toast notifications
  const acceptDeal = useCallback(async (id: string) => {
    try {
      await storeAcceptDeal(id)
      const deal = deals.find(d => d.id === id)
      addToast({
        type: 'success',
        title: 'Deal accepted!',
        message: deal ? `You've accepted "${deal.title}".` : 'Deal has been accepted.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept deal'
      addToast({
        type: 'error',
        title: 'Accept failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeAcceptDeal, addToast, deals])

  // Enhanced reject deal with toast notifications
  const rejectDeal = useCallback(async (id: string) => {
    try {
      await storeRejectDeal(id)
      const deal = deals.find(d => d.id === id)
      addToast({
        type: 'info',
        title: 'Deal rejected',
        message: deal ? `You've rejected "${deal.title}".` : 'Deal has been rejected.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject deal'
      addToast({
        type: 'error',
        title: 'Reject failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeRejectDeal, addToast, deals])

  // Enhanced cancel deal with toast notifications
  const cancelDeal = useCallback(async (id: string) => {
    try {
      await storeCancelDeal(id)
      const deal = deals.find(d => d.id === id)
      addToast({
        type: 'warning',
        title: 'Deal cancelled',
        message: deal ? `"${deal.title}" has been cancelled.` : 'Deal has been cancelled.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel deal'
      addToast({
        type: 'error',
        title: 'Cancel failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeCancelDeal, addToast, deals])

  // Enhanced complete deal with toast notifications
  const completeDeal = useCallback(async (id: string) => {
    try {
      await storeCompleteDeal(id)
      const deal = deals.find(d => d.id === id)
      addToast({
        type: 'success',
        title: 'Deal completed!',
        message: deal ? `"${deal.title}" has been completed successfully.` : 'Deal completed successfully.',
        duration: 5000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete deal'
      addToast({
        type: 'error',
        title: 'Complete failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeCompleteDeal, addToast, deals])

  // Enhanced create milestone with toast notifications
  const createMilestone = useCallback(async (dealId: string, milestoneData: CreateMilestoneForm) => {
    try {
      await storeCreateMilestone(dealId, milestoneData)
      addToast({
        type: 'success',
        title: 'Milestone created',
        message: `"${milestoneData.title}" milestone has been added.`,
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create milestone'
      addToast({
        type: 'error',
        title: 'Creation failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeCreateMilestone, addToast])

  // Enhanced complete milestone with toast notifications
  const completeMilestone = useCallback(async (id: string) => {
    try {
      await storeCompleteMilestone(id)
      const milestone = milestones.find(m => m.id === id)
      addToast({
        type: 'success',
        title: 'Milestone completed!',
        message: milestone ? `"${milestone.title}" has been marked as completed.` : 'Milestone completed.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete milestone'
      addToast({
        type: 'error',
        title: 'Complete failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeCompleteMilestone, addToast, milestones])

  // Enhanced approve milestone with toast notifications
  const approveMilestone = useCallback(async (id: string) => {
    try {
      await storeApproveMilestone(id)
      const milestone = milestones.find(m => m.id === id)
      addToast({
        type: 'success',
        title: 'Milestone approved!',
        message: milestone ? `"${milestone.title}" has been approved.` : 'Milestone approved.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve milestone'
      addToast({
        type: 'error',
        title: 'Approve failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeApproveMilestone, addToast, milestones])

  // Enhanced reject milestone with toast notifications
  const rejectMilestone = useCallback(async (id: string, reason: string) => {
    try {
      await storeRejectMilestone(id, reason)
      const milestone = milestones.find(m => m.id === id)
      addToast({
        type: 'warning',
        title: 'Milestone disputed',
        message: milestone ? `"${milestone.title}" has been disputed.` : 'Milestone has been disputed.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to dispute milestone'
      addToast({
        type: 'error',
        title: 'Dispute failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeRejectMilestone, addToast, milestones])

  // Enhanced release escrow with toast notifications
  const releaseEscrow = useCallback(async (dealId: string, milestoneId: string) => {
    try {
      await storeReleaseEscrow(dealId, milestoneId)
      addToast({
        type: 'success',
        title: 'Escrow released!',
        message: 'Funds have been successfully released.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to release escrow'
      addToast({
        type: 'error',
        title: 'Release failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeReleaseEscrow, addToast])

  // Enhanced refund escrow with toast notifications
  const refundEscrow = useCallback(async (dealId: string, reason: string) => {
    try {
      await storeRefundEscrow(dealId, reason)
      addToast({
        type: 'info',
        title: 'Escrow refunded',
        message: 'Funds have been refunded successfully.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refund escrow'
      addToast({
        type: 'error',
        title: 'Refund failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeRefundEscrow, addToast])

  // Fetch deals with enhanced error handling
  const fetchDeals = useCallback(async (newFilters?: DealFilters) => {
    try {
      await storeFetchDeals(newFilters)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load deals'
      addToast({
        type: 'error',
        title: 'Load failed',
        message: errorMessage,
        duration: 5000
      })
    }
  }, [storeFetchDeals, addToast])

  // Computed values
  const userDeals = useMemo(() => {
    if (!user) return []
    return deals.filter(deal => 
      deal.buyerId === user.id || deal.sellerId === user.id
    )
  }, [deals, user])

  const myBuyerDeals = useMemo(() => {
    if (!user) return []
    return deals.filter(deal => deal.buyerId === user.id)
  }, [deals, user])

  const mySellerDeals = useMemo(() => {
    if (!user) return []
    return deals.filter(deal => deal.sellerId === user.id)
  }, [deals, user])

  const activeDealsByStatus = useMemo(() => {
    const statusGroups: Record<DealStatus, Deal[]> = {
      created: [],
      accepted: [],
      funded: [],
      in_progress: [],
      milestone_completed: [],
      completed: [],
      cancelled: [],
      disputed: [],
      refunded: []
    }

    userDeals.forEach(deal => {
      statusGroups[deal.status].push(deal)
    })

    return statusGroups
  }, [userDeals])

  const dealStats = useMemo(() => {
    const stats = {
      total: userDeals.length,
      active: 0,
      completed: 0,
      cancelled: 0,
      disputed: 0,
      totalValue: 0,
      averageValue: 0
    }

    userDeals.forEach(deal => {
      stats.totalValue += deal.amount
      
      switch (deal.status) {
        case 'in_progress':
        case 'accepted':
        case 'funded':
        case 'milestone_completed':
          stats.active++
          break
        case 'completed':
          stats.completed++
          break
        case 'cancelled':
        case 'refunded':
          stats.cancelled++
          break
        case 'disputed':
          stats.disputed++
          break
      }
    })

    stats.averageValue = stats.total > 0 ? stats.totalValue / stats.total : 0

    return stats
  }, [userDeals])

  // Check if user can perform actions on specific deal
  const canModifyDeal = useCallback((deal: Deal) => {
    if (!user) return false
    return deal.buyerId === user.id || deal.sellerId === user.id
  }, [user])

  const canAcceptDeal = useCallback((deal: Deal) => {
    if (!user) return false
    return deal.sellerId === user.id && deal.status === 'created'
  }, [user])

  const canCancelDeal = useCallback((deal: Deal) => {
    if (!user) return false
    return (deal.buyerId === user.id || deal.sellerId === user.id) && 
           ['created', 'accepted'].includes(deal.status)
  }, [user])

  return {
    // State
    deals,
    currentDeal,
    milestones,
    transactions,
    filters,
    isLoading,
    error,
    pagination,

    // Actions
    fetchDeals,
    fetchDealById,
    createDeal,
    updateDeal: storeUpdateDeal,
    deleteDeal: storeDeleteDeal,
    acceptDeal,
    rejectDeal,
    cancelDeal,
    completeDeal,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    completeMilestone,
    approveMilestone,
    rejectMilestone,
    fetchTransactions,
    releaseEscrow,
    refundEscrow,
    setFilters,
    resetFilters,
    setPage,
    setCurrentDeal,
    clearError,
    setLoading,

    // Computed values
    userDeals,
    myBuyerDeals,
    mySellerDeals,
    activeDealsByStatus,
    dealStats,

    // Utilities
    canModifyDeal,
    canAcceptDeal,
    canCancelDeal
  }
}