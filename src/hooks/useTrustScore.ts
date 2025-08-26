"use client"


import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import type { 
  TrustScoreUpdate, 
  User,
  Deal,
  ApiResponse 
} from '../lib/types'

interface TrustScoreState {
  updates: TrustScoreUpdate[]
  isLoading: boolean
  error: string | null
}

interface TrustScoreMetrics {
  currentScore: number
  previousScore: number
  change: number
  changePercentage: number
  rank: string
  completedDeals: number
  successRate: number
  averageRating: number
  totalVolume: number
  daysActive: number
}

interface TrustScoreBreakdown {
  completionRate: { score: number; weight: number }
  volume: { score: number; weight: number }
  feedback: { score: number; weight: number }
  verification: { score: number; weight: number }
  activity: { score: number; weight: number }
}

export const useTrustScore = () => {
  const [trustScoreState, setTrustScoreState] = useState<TrustScoreState>({
    updates: [],
    isLoading: false,
    error: null
  })

  const { user, userProfile } = useAuthStore()
  const { addToast } = useNotificationStore()

  // Fetch trust score updates history
  const fetchTrustScoreUpdates = useCallback(async (userId?: string) => {
    setTrustScoreState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const targetUserId = userId || user?.id
      if (!targetUserId) {
        throw new Error('User ID is required')
      }

      const response = await fetch(`/api/user/trust-score/${targetUserId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch trust score updates')
      }

      const data: ApiResponse<TrustScoreUpdate[]> = await response.json()
      
      setTrustScoreState(prev => ({
        ...prev,
        updates: data.data,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trust score updates'
      
      setTrustScoreState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        updates: []
      }))

      addToast({
        type: 'error',
        title: 'Failed to load trust score',
        message: errorMessage,
        duration: 5000
      })
    }
  }, [user?.id, addToast])

  // Calculate trust score metrics
  const trustScoreMetrics = useMemo((): TrustScoreMetrics | null => {
    if (!user || !userProfile) return null

    const currentScore = user.trustScore
    const latestUpdate = trustScoreState.updates[0]
    const previousScore = latestUpdate?.previousScore || currentScore
    const change = currentScore - previousScore
    const changePercentage = previousScore > 0 ? (change / previousScore) * 100 : 0

    // Calculate rank based on score
    const getRank = (score: number): string => {
      if (score >= 95) return 'Excellent'
      if (score >= 85) return 'Very Good'
      if (score >= 75) return 'Good'
      if (score >= 60) return 'Fair'
      if (score >= 40) return 'Poor'
      return 'Very Poor'
    }

    // Calculate days active
    const createdAt = new Date(user.createdAt)
    const now = new Date()
    const daysActive = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

    return {
      currentScore,
      previousScore,
      change,
      changePercentage,
      rank: getRank(currentScore),
      completedDeals: userProfile.completedDeals,
      successRate: userProfile.successRate,
      averageRating: 4.5, // Mock average rating
      totalVolume: userProfile.totalVolume,
      daysActive
    }
  }, [user, userProfile, trustScoreState.updates])

  // Calculate trust score breakdown
  const trustScoreBreakdown = useMemo((): TrustScoreBreakdown | null => {
    if (!user || !userProfile || !trustScoreMetrics) return null

    // Mock breakdown calculation based on various factors
    const completionRateScore = Math.min(100, userProfile.successRate)
    const volumeScore = Math.min(100, Math.log10(userProfile.totalVolume + 1) * 20)
    const feedbackScore = trustScoreMetrics.averageRating * 20
    const verificationScore = user.isVerified ? (user.kycStatus === 'approved' ? 100 : 70) : 30
    const activityScore = Math.min(100, trustScoreMetrics.daysActive * 2)

    return {
      completionRate: { score: completionRateScore, weight: 0.3 },
      volume: { score: volumeScore, weight: 0.25 },
      feedback: { score: feedbackScore, weight: 0.2 },
      verification: { score: verificationScore, weight: 0.15 },
      activity: { score: activityScore, weight: 0.1 }
    }
  }, [user, userProfile, trustScoreMetrics])

  // Get trust score color based on score
  const getTrustScoreColor = useCallback((score: number): string => {
    if (score >= 85) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }, [])

  // Get trust score badge variant
  const getTrustScoreBadgeVariant = useCallback((score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 85) return 'default'
    if (score >= 75) return 'secondary'
    if (score >= 40) return 'outline'
    return 'destructive'
  }, [])

  // Format trust score change
  const formatTrustScoreChange = useCallback((change: number): string => {
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}`
  }, [])

  // Get improvement suggestions
  const getImprovementSuggestions = useCallback((): string[] => {
    if (!trustScoreBreakdown) return []

    const suggestions: string[] = []

    if (trustScoreBreakdown.completionRate.score < 80) {
      suggestions.push('Complete more deals successfully to improve your completion rate')
    }

    if (trustScoreBreakdown.verification.score < 70) {
      suggestions.push('Complete KYC verification to boost your trust score')
    }

    if (trustScoreBreakdown.volume.score < 50) {
      suggestions.push('Participate in higher value deals to increase your volume score')
    }

    if (trustScoreBreakdown.feedback.score < 80) {
      suggestions.push('Focus on providing excellent service to get better feedback')
    }

    if (trustScoreBreakdown.activity.score < 60) {
      suggestions.push('Stay active on the platform to improve your activity score')
    }

    return suggestions
  }, [trustScoreBreakdown])

  // Simulate trust score update (for demonstration)
  const simulateTrustScoreUpdate = useCallback(async (reason: string, scoreChange: number) => {
    if (!user) return

    try {
      const response = await fetch('/api/user/trust-score/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          scoreChange,
          reason
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update trust score')
      }

      const data = await response.json()

      // Add the update to our local state
      setTrustScoreState(prev => ({
        ...prev,
        updates: [data.update, ...prev.updates]
      }))

      // Show toast notification
      const isPositive = scoreChange > 0
      addToast({
        type: isPositive ? 'success' : 'warning',
        title: `Trust Score ${isPositive ? 'Increased' : 'Decreased'}`,
        message: `Your trust score ${isPositive ? 'increased' : 'decreased'} by ${Math.abs(scoreChange)} points: ${reason}`,
        duration: 5000
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update trust score'
      addToast({
        type: 'error',
        title: 'Update failed',
        message: errorMessage,
        duration: 5000
      })
    }
  }, [user, addToast])

  // Auto-fetch updates when user changes
  useEffect(() => {
    if (user?.id) {
      fetchTrustScoreUpdates()
    }
  }, [user?.id, fetchTrustScoreUpdates])

  // Calculate trust level for other users (public profiles)
  const calculateUserTrustLevel = useCallback((targetUser: User): {
    level: string
    color: string
    description: string
  } => {
    const score = targetUser.trustScore

    if (score >= 95) {
      return {
        level: 'Excellent',
        color: 'text-green-600',
        description: 'Highly trusted user with exceptional track record'
      }
    }

    if (score >= 85) {
      return {
        level: 'Very Good',
        color: 'text-blue-600',
        description: 'Very reliable user with strong performance history'
      }
    }

    if (score >= 75) {
      return {
        level: 'Good',
        color: 'text-blue-500',
        description: 'Reliable user with good transaction history'
      }
    }

    if (score >= 60) {
      return {
        level: 'Fair',
        color: 'text-yellow-600',
        description: 'User with adequate trust level'
      }
    }

    if (score >= 40) {
      return {
        level: 'Poor',
        color: 'text-orange-600',
        description: 'User with limited trust history'
      }
    }

    return {
      level: 'Very Poor',
      color: 'text-red-600',
      description: 'New user or user with trust concerns'
    }
  }, [])

  // Clear error state
  const clearError = useCallback(() => {
    setTrustScoreState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    ...trustScoreState,
    trustScoreMetrics,
    trustScoreBreakdown,

    // Actions
    fetchTrustScoreUpdates,
    simulateTrustScoreUpdate,
    clearError,

    // Utilities
    getTrustScoreColor,
    getTrustScoreBadgeVariant,
    formatTrustScoreChange,
    getImprovementSuggestions,
    calculateUserTrustLevel
  }
}