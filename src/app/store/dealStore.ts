import { create } from 'zustand'
import type {
  Deal,
  DealStatus,
  DealCategory,
  Milestone,
  MilestoneStatus,
  CreateDealForm,
  CreateMilestoneForm,
  DealFilters,
  Transaction,
  LoadingState,
  ErrorState,
  PaginatedResponse
} from '../lib/types'

interface DealState {
  // State
  deals: Deal[]
  currentDeal: Deal | null
  milestones: Milestone[]
  transactions: Transaction[]
  filters: DealFilters
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }

  // Deal actions
  fetchDeals: (filters?: DealFilters) => Promise<void>
  fetchDealById: (id: string) => Promise<void>
  createDeal: (dealData: CreateDealForm) => Promise<Deal>
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>
  deleteDeal: (id: string) => Promise<void>
  acceptDeal: (id: string) => Promise<void>
  rejectDeal: (id: string) => Promise<void>
  cancelDeal: (id: string) => Promise<void>
  completeDeal: (id: string) => Promise<void>

  // Milestone actions
  fetchMilestones: (dealId: string) => Promise<void>
  createMilestone: (dealId: string, milestoneData: CreateMilestoneForm) => Promise<void>
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<void>
  completeMilestone: (id: string) => Promise<void>
  approveMilestone: (id: string) => Promise<void>
  rejectMilestone: (id: string, reason: string) => Promise<void>

  // Transaction actions
  fetchTransactions: (dealId?: string) => Promise<void>
  releaseEscrow: (dealId: string, milestoneId: string) => Promise<void>
  refundEscrow: (dealId: string, reason: string) => Promise<void>

  // Filter and pagination
  setFilters: (filters: Partial<DealFilters>) => void
  resetFilters: () => void
  setPage: (page: number) => void
  setCurrentDeal: (deal: Deal | null) => void

  // Utility actions
  clearError: () => void
  setLoading: (loading: boolean) => void
}

const initialFilters: DealFilters = {
  status: undefined,
  category: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  userId: undefined,
  search: ''
}

export const useDealStore = create<DealState>((set, get) => ({
  // Initial state
  deals: [],
  currentDeal: null,
  milestones: [],
  transactions: [],
  filters: initialFilters,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false
  },

  // Fetch deals with filters
  fetchDeals: async (filters?: DealFilters) => {
    set({ isLoading: true, error: null })
    
    try {
      const currentFilters = filters || get().filters
      const { pagination } = get()
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(currentFilters.status && { status: currentFilters.status }),
        ...(currentFilters.category && { category: currentFilters.category }),
        ...(currentFilters.minAmount && { minAmount: currentFilters.minAmount.toString() }),
        ...(currentFilters.maxAmount && { maxAmount: currentFilters.maxAmount.toString() }),
        ...(currentFilters.userId && { userId: currentFilters.userId }),
        ...(currentFilters.search && { search: currentFilters.search })
      })

      const response = await fetch(`/api/deals?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch deals')
      }

      const data: PaginatedResponse<Deal> = await response.json()
      
      set({
        deals: data.data,
        pagination: {
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          hasMore: data.pagination.page < data.pagination.totalPages
        },
        isLoading: false,
        error: null
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch deals',
        isLoading: false
      })
    }
  },

  // Fetch single deal by ID
  fetchDealById: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/deals/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Deal not found')
      }

      const data = await response.json()
      
      set({
        currentDeal: data.deal,
        isLoading: false,
        error: null
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch deal',
        isLoading: false,
        currentDeal: null
      })
    }
  },

  // Create new deal
  createDeal: async (dealData: CreateDealForm) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create deal')
      }

      const data = await response.json()
      
      set(state => ({
        deals: [data.deal, ...state.deals],
        isLoading: false,
        error: null
      }))

      return data.deal
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create deal',
        isLoading: false
      })
      throw error
    }
  },

  // Update deal
  updateDeal: async (id: string, updates: Partial<Deal>) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update deal')
      }

      const data = await response.json()
      
      set(state => ({
        deals: state.deals.map(deal => 
          deal.id === id ? data.deal : deal
        ),
        currentDeal: state.currentDeal?.id === id ? data.deal : state.currentDeal,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update deal',
        isLoading: false
      })
      throw error
    }
  },

  // Delete deal
  deleteDeal: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete deal')
      }

      set(state => ({
        deals: state.deals.filter(deal => deal.id !== id),
        currentDeal: state.currentDeal?.id === id ? null : state.currentDeal,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete deal',
        isLoading: false
      })
      throw error
    }
  },

  // Accept deal - using 'accepted' status from DealStatus type
  acceptDeal: async (id: string) => {
    await get().updateDeal(id, { status: 'accepted' as DealStatus })
  },

  // Reject deal - using 'cancelled' status since 'rejected' doesn't exist
  rejectDeal: async (id: string) => {
    await get().updateDeal(id, { status: 'cancelled' as DealStatus })
  },

  // Cancel deal
  cancelDeal: async (id: string) => {
    await get().updateDeal(id, { status: 'cancelled' as DealStatus })
  },

  // Complete deal
  completeDeal: async (id: string) => {
    await get().updateDeal(id, { status: 'completed' as DealStatus })
  },

  // Fetch milestones for a deal
  fetchMilestones: async (dealId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/deals/${dealId}/milestones`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch milestones')
      }

      const data = await response.json()
      
      set({
        milestones: data.milestones,
        isLoading: false,
        error: null
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch milestones',
        isLoading: false
      })
    }
  },

  // Create milestone
  createMilestone: async (dealId: string, milestoneData: CreateMilestoneForm) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/deals/${dealId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestoneData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create milestone')
      }

      const data = await response.json()
      
      set(state => ({
        milestones: [...state.milestones, data.milestone],
        isLoading: false,
        error: null
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create milestone',
        isLoading: false
      })
      throw error
    }
  },

  // Update milestone
  updateMilestone: async (id: string, updates: Partial<Milestone>) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/milestones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update milestone')
      }

      const data = await response.json()
      
      set(state => ({
        milestones: state.milestones.map(milestone => 
          milestone.id === id ? data.milestone : milestone
        ),
        isLoading: false,
        error: null
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update milestone',
        isLoading: false
      })
      throw error
    }
  },

  // Complete milestone
  completeMilestone: async (id: string) => {
    await get().updateMilestone(id, { status: 'completed' as MilestoneStatus })
  },

  // Approve milestone
  approveMilestone: async (id: string) => {
    await get().updateMilestone(id, { status: 'approved' as MilestoneStatus })
  },

  // Reject milestone - using 'disputed' status since 'rejected' doesn't exist in MilestoneStatus
  rejectMilestone: async (id: string, reason: string) => {
    await get().updateMilestone(id, { 
      status: 'disputed' as MilestoneStatus
      // Note: If you need to store rejection reason, add it to Milestone interface
      // or handle it through a separate API call
    })
  },

  // Fetch transactions
  fetchTransactions: async (dealId?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const url = dealId ? `/api/deals/${dealId}/transactions` : '/api/transactions'
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch transactions')
      }

      const data = await response.json()
      
      set({
        transactions: data.transactions,
        isLoading: false,
        error: null
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
        isLoading: false
      })
    }
  },

  // Release escrow
  releaseEscrow: async (dealId: string, milestoneId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/deals/${dealId}/release-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to release escrow')
      }

      // Refresh deal and transactions
      await get().fetchDealById(dealId)
      await get().fetchTransactions(dealId)
      
      set({ isLoading: false, error: null })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to release escrow',
        isLoading: false
      })
      throw error
    }
  },

  // Refund escrow
  refundEscrow: async (dealId: string, reason: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch(`/api/deals/${dealId}/refund-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to refund escrow')
      }

      // Refresh deal and transactions
      await get().fetchDealById(dealId)
      await get().fetchTransactions(dealId)
      
      set({ isLoading: false, error: null })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refund escrow',
        isLoading: false
      })
      throw error
    }
  },

  // Set filters
  setFilters: (filters: Partial<DealFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page when filtering
    }))
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: initialFilters,
      pagination: { page: 1, limit: 10, total: 0, hasMore: false }
    })
  },

  // Set page
  setPage: (page: number) => {
    set(state => ({
      pagination: { ...state.pagination, page }
    }))
  },

  // Set current deal
  setCurrentDeal: (deal: Deal | null) => {
    set({ currentDeal: deal })
  },

  // Utility actions
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading })
}))