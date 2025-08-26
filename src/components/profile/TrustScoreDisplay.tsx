'use client'

import React, { useMemo } from 'react'
import { Star, TrendingUp, TrendingDown, Info, CheckCircle, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { useTrustScore } from '@/hooks/useTrustScore'
import type { User } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TrustScoreDisplayProps {
  user: User
  variant?: 'compact' | 'default' | 'detailed'
  showBreakdown?: boolean
  showTrend?: boolean
  showSuggestions?: boolean
  className?: string
}

export const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({
  user,
  variant = 'default',
  showBreakdown = false,
  showTrend = false,
  showSuggestions = false,
  className
}) => {
  const { 
    trustScoreMetrics, 
    trustScoreBreakdown,
    getTrustScoreColor,
    getTrustScoreBadgeVariant,
    formatTrustScoreChange,
    getImprovementSuggestions
  } = useTrustScore()

  // Calculate trust level info
  const trustLevelInfo = useMemo(() => {
    const score = user.trustScore

    if (score >= 95) {
      return {
        level: 'Excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Outstanding reputation with exceptional performance',
        icon: <Shield className="h-4 w-4" />
      }
    }

    if (score >= 85) {
      return {
        level: 'Very Good',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Strong reputation with consistent performance',
        icon: <CheckCircle className="h-4 w-4" />
      }
    }

    if (score >= 75) {
      return {
        level: 'Good',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-100',
        description: 'Reliable user with good track record',
        icon: <Star className="h-4 w-4" />
      }
    }

    if (score >= 60) {
      return {
        level: 'Fair',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        description: 'Adequate trust level, room for improvement',
        icon: <Star className="h-4 w-4" />
      }
    }

    if (score >= 40) {
      return {
        level: 'Poor',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        description: 'Limited trust history, proceed with caution',
        icon: <Star className="h-4 w-4" />
      }
    }

    return {
      level: 'Very Poor',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'New user or significant trust concerns',
      icon: <Star className="h-4 w-4" />
    }
  }, [user.trustScore])

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('flex items-center gap-1', trustLevelInfo.color)}>
          <Star className="h-4 w-4 fill-current" />
          <span className="font-medium">{user.trustScore}</span>
        </div>
        <Badge variant={getTrustScoreBadgeVariant(user.trustScore)}>
          {trustLevelInfo.level}
        </Badge>
        {showTrend && trustScoreMetrics && trustScoreMetrics.change !== 0 && (
          <div className={cn(
            'flex items-center gap-1 text-sm',
            trustScoreMetrics.change > 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {trustScoreMetrics.change > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{formatTrustScoreChange(trustScoreMetrics.change)}</span>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  if (variant === 'default') {
    return (
      <Card className={cn(trustLevelInfo.borderColor, className)}>
        <CardContent className={cn('p-4', trustLevelInfo.bgColor)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-full bg-white', trustLevelInfo.color)}>
                {trustLevelInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{user.trustScore}</span>
                  <Badge variant={getTrustScoreBadgeVariant(user.trustScore)}>
                    {trustLevelInfo.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trustLevelInfo.description}
                </p>
              </div>
            </div>

            {showTrend && trustScoreMetrics && trustScoreMetrics.change !== 0 && (
              <div className="text-right">
                <div className={cn(
                  'flex items-center gap-1 justify-end',
                  trustScoreMetrics.change > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {trustScoreMetrics.change > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {formatTrustScoreChange(trustScoreMetrics.change)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trustScoreMetrics.changePercentage > 0 ? '+' : ''}
                  {trustScoreMetrics.changePercentage.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Detailed variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Trust Score
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className={cn('p-4 rounded-lg', trustLevelInfo.bgColor, trustLevelInfo.borderColor, 'border')}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-full bg-white', trustLevelInfo.color)}>
                {trustLevelInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{user.trustScore}</span>
                  <span className="text-lg text-muted-foreground">/ 100</span>
                </div>
                <Badge variant={getTrustScoreBadgeVariant(user.trustScore)}>
                  {trustLevelInfo.level}
                </Badge>
              </div>
            </div>

            {showTrend && trustScoreMetrics && trustScoreMetrics.change !== 0 && (
              <div className="text-right">
                <div className={cn(
                  'flex items-center gap-1 justify-end text-lg font-medium',
                  trustScoreMetrics.change > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {trustScoreMetrics.change > 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <span>{formatTrustScoreChange(trustScoreMetrics.change)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trustScoreMetrics.changePercentage > 0 ? '+' : ''}
                  {trustScoreMetrics.changePercentage.toFixed(1)}% change
                </p>
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {trustLevelInfo.description}
          </p>
        </div>

        {/* Score Breakdown */}
        {showBreakdown && trustScoreBreakdown && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              Score Breakdown
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your trust score is calculated based on various factors</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate ({(trustScoreBreakdown.completionRate.weight * 100)}%)</span>
                  <span className="font-medium">{trustScoreBreakdown.completionRate.score.toFixed(0)}/100</span>
                </div>
                <Progress value={trustScoreBreakdown.completionRate.score} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Volume History ({(trustScoreBreakdown.volume.weight * 100)}%)</span>
                  <span className="font-medium">{trustScoreBreakdown.volume.score.toFixed(0)}/100</span>
                </div>
                <Progress value={trustScoreBreakdown.volume.score} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>User Feedback ({(trustScoreBreakdown.feedback.weight * 100)}%)</span>
                  <span className="font-medium">{trustScoreBreakdown.feedback.score.toFixed(0)}/100</span>
                </div>
                <Progress value={trustScoreBreakdown.feedback.score} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Verification ({(trustScoreBreakdown.verification.weight * 100)}%)</span>
                  <span className="font-medium">{trustScoreBreakdown.verification.score.toFixed(0)}/100</span>
                </div>
                <Progress value={trustScoreBreakdown.verification.score} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Activity Level ({(trustScoreBreakdown.activity.weight * 100)}%)</span>
                  <span className="font-medium">{trustScoreBreakdown.activity.score.toFixed(0)}/100</span>
                </div>
                <Progress value={trustScoreBreakdown.activity.score} className="h-2" />
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        {trustScoreMetrics && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {trustScoreMetrics.completedDeals}
              </div>
              <div className="text-sm text-muted-foreground">
                Completed Deals
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600">
                {trustScoreMetrics.successRate}%
              </div>
              <div className="text-sm text-muted-foreground">
                Success Rate
              </div>
            </div>
          </div>
        )}

        {/* Improvement Suggestions */}
        {showSuggestions && (
          <div className="space-y-3">
            <Separator />
            <h4 className="font-medium">Improvement Tips</h4>
            <div className="space-y-2">
              {getImprovementSuggestions().map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span className="text-muted-foreground">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}