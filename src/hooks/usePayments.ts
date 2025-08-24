import { useState, useCallback, useMemo } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { useDealStore } from '@/store/dealStore'
import { useAuthStore } from '@/store/authStore'
import type { 
  Deal, 
  Transaction, 
  TransactionStatus,
  StripePaymentIntent,
  ApiResponse 
} from '@/lib/types'

interface PaymentState {
  isProcessing: boolean
  error: string | null
  paymentIntent: StripePaymentIntent | null
}

interface CreatePaymentIntentParams {
  amount: number
  currency: string
  dealId: string
  description: string
}

interface PaymentMethodData {
  card: {
    number: string
    exp_month: number
    exp_year: number
    cvc: string
  }
  billing_details: {
    name: string
    email: string
    address?: {
      line1: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
}

export const usePayments = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    paymentIntent: null
  })

  const { user } = useAuthStore()
  const { addToast } = useNotificationStore()
  const { fetchTransactions, fetchDealById } = useDealStore()

  // Create Stripe payment intent
  const createPaymentIntent = useCallback(async (params: CreatePaymentIntentParams): Promise<StripePaymentIntent> => {
    setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }))

    try {
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create payment intent')
      }

      const data: ApiResponse<StripePaymentIntent> = await response.json()
      
      setPaymentState(prev => ({
        ...prev,
        paymentIntent: data.data,
        isProcessing: false,
        error: null
      }))

      addToast({
        type: 'info',
        title: 'Payment ready',
        message: 'Payment intent created. Complete your payment to proceed.',
        duration: 4000
      })

      return data.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent'
      
      setPaymentState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
        paymentIntent: null
      }))

      addToast({
        type: 'error',
        title: 'Payment setup failed',
        message: errorMessage,
        duration: 5000
      })

      throw error
    }
  }, [addToast])

  // Process payment with Stripe (mock implementation)
  const processPayment = useCallback(async (
    paymentIntentId: string, 
    paymentMethodData: PaymentMethodData
  ): Promise<boolean> => {
    setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }))

    try {
      // Mock payment processing - in real app, this would use Stripe Elements
      const response = await fetch('/api/payments/stripe/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method_data: paymentMethodData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Payment processing failed')
      }

      const data = await response.json()

      setPaymentState(prev => ({
        ...prev,
        isProcessing: false,
        error: null
      }))

      addToast({
        type: 'success',
        title: 'Payment successful!',
        message: `Payment of $${data.amount / 100} has been processed successfully.`,
        duration: 5000
      })

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed'
      
      setPaymentState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false
      }))

      addToast({
        type: 'error',
        title: 'Payment failed',
        message: errorMessage,
        duration: 6000
      })

      return false
    }
  }, [addToast])

  // Fund escrow for a deal
  const fundEscrow = useCallback(async (
    deal: Deal, 
    paymentMethodData: PaymentMethodData
  ): Promise<boolean> => {
    try {
      // Create payment intent for escrow amount
      const paymentIntent = await createPaymentIntent({
        amount: deal.escrowAmount * 100, // Convert to cents
        currency: deal.currency.toLowerCase(),
        dealId: deal.id,
        description: `Escrow funding for deal: ${deal.title}`
      })

      // Process the payment
      const success = await processPayment(paymentIntent.id, paymentMethodData)

      if (success) {
        // Refresh deal data to get updated status
        await fetchDealById(deal.id)
        
        addToast({
          type: 'success',
          title: 'Escrow funded!',
          message: `$${deal.escrowAmount} has been deposited into escrow for "${deal.title}".`,
          duration: 5000
        })
      }

      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Escrow funding failed'
      addToast({
        type: 'error',
        title: 'Funding failed',
        message: errorMessage,
        duration: 5000
      })
      return false
    }
  }, [createPaymentIntent, processPayment, fetchDealById, addToast])

  // Get payment status
  const getPaymentIntentStatus = useCallback(async (paymentIntentId: string) => {
    try {
      const response = await fetch(`/api/payments/stripe/status/${paymentIntentId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get payment status')
      }

      const data = await response.json()
      return data.status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get payment status'
      addToast({
        type: 'error',
        title: 'Status check failed',
        message: errorMessage,
        duration: 4000
      })
      return null
    }
  }, [addToast])

  // Calculate escrow amount with fees
  const calculateEscrowAmount = useCallback((dealAmount: number): { escrowAmount: number; fee: number; total: number } => {
    const feePercentage = 0.025 // 2.5% escrow fee
    const fee = dealAmount * feePercentage
    const total = dealAmount + fee
    
    return {
      escrowAmount: dealAmount,
      fee,
      total
    }
  }, [])

  // Validate payment method data
  const validatePaymentMethod = useCallback((paymentMethodData: PaymentMethodData): string | null => {
    const { card, billing_details } = paymentMethodData

    if (!card.number || card.number.length < 13) {
      return 'Invalid card number'
    }

    if (!card.cvc || card.cvc.length < 3) {
      return 'Invalid CVC'
    }

    if (card.exp_month < 1 || card.exp_month > 12) {
      return 'Invalid expiration month'
    }

    const currentYear = new Date().getFullYear()
    if (card.exp_year < currentYear) {
      return 'Card has expired'
    }

    if (!billing_details.name.trim()) {
      return 'Cardholder name is required'
    }

    if (!billing_details.email.trim()) {
      return 'Email is required'
    }

    return null
  }, [])

  // Format payment amount for display
  const formatPaymentAmount = useCallback((amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount)
  }, [])

  // Get transaction history with filtering
  const getTransactionHistory = useCallback(async (filters?: {
    dealId?: string
    type?: string
    status?: TransactionStatus
    startDate?: string
    endDate?: string
  }) => {
    try {
      const params = new URLSearchParams()
      
      if (filters?.dealId) params.append('dealId', filters.dealId)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/payments/transactions?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history')
      }

      const data = await response.json()
      return data.transactions || data.data || []
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions'
      addToast({
        type: 'error',
        title: 'Failed to load transactions',
        message: errorMessage,
        duration: 5000
      })
      return []
    }
  }, [addToast])

  // Cancel payment intent
  const cancelPaymentIntent = useCallback(async (paymentIntentId: string): Promise<boolean> => {
    setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }))

    try {
      const response = await fetch(`/api/payments/stripe/cancel/${paymentIntentId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to cancel payment')
      }

      setPaymentState(prev => ({
        ...prev,
        paymentIntent: null,
        isProcessing: false,
        error: null
      }))

      addToast({
        type: 'info',
        title: 'Payment cancelled',
        message: 'Payment intent has been cancelled successfully.',
        duration: 4000
      })

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel payment'
      
      setPaymentState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false
      }))

      addToast({
        type: 'error',
        title: 'Cancellation failed',
        message: errorMessage,
        duration: 5000
      })

      return false
    }
  }, [addToast])

  // Process refund
  const processRefund = useCallback(async (
    paymentIntentId: string, 
    amount?: number,
    reason?: string
  ): Promise<boolean> => {
    setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }))

    try {
      const response = await fetch('/api/payments/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          amount: amount ? amount * 100 : undefined, // Convert to cents if specified
          reason: reason || 'requested_by_customer'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Refund processing failed')
      }

      const data = await response.json()

      setPaymentState(prev => ({
        ...prev,
        isProcessing: false,
        error: null
      }))

      addToast({
        type: 'success',
        title: 'Refund processed!',
        message: `Refund of ${formatPaymentAmount(data.amount / 100)} has been initiated.`,
        duration: 5000
      })

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refund processing failed'
      
      setPaymentState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false
      }))

      addToast({
        type: 'error',
        title: 'Refund failed',
        message: errorMessage,
        duration: 5000
      })

      return false
    }
  }, [addToast, formatPaymentAmount])

  // Clear payment state
  const clearPaymentState = useCallback(() => {
    setPaymentState({
      isProcessing: false,
      error: null,
      paymentIntent: null
    })
  }, [])

  // Computed values
  const canProcessPayments = useMemo(() => {
    return user?.isVerified && user?.kycStatus === 'approved'
  }, [user?.isVerified, user?.kycStatus])

  const hasActivePaymentIntent = useMemo(() => {
    return paymentState.paymentIntent !== null
  }, [paymentState.paymentIntent])

  return {
    // State
    ...paymentState,
    canProcessPayments,
    hasActivePaymentIntent,

    // Actions
    createPaymentIntent,
    processPayment,
    fundEscrow,
    getPaymentIntentStatus,
    cancelPaymentIntent,
    processRefund,
    getTransactionHistory,
    clearPaymentState,

    // Utilities
    calculateEscrowAmount,
    validatePaymentMethod,
    formatPaymentAmount
  }
}