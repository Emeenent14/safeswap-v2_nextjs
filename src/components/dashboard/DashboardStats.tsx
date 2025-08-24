import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Star, ArrowUpRight } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { useAuthStore } from '@/store/authStore'
import { useDealStore } from '@/store/dealStore'
import { useAuth } from '@/hooks/useAuth'
import { usePayments } from '@/hooks/usePayments'
import type { Deal, DealStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DashboardStatsProps {
  timeframe?: 'week' | 'month' | 'quarter' | 'year'
  className?: string
}

interface StatCard {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
    timeframe: string
  }
  href?: string
}

interface Insight {
  type: 'success' | 'warning' | 'suggestion'
  message: string
  action: string
}

export default function DashboardStats({ timeframe = 'month', className }: DashboardStatsProps) {
  const { user, userProfile } = useAuthStore()
  const { deals } = useDealStore()
  const { formatPaymentAmount } = usePayments()

  // Calculate statistics based on user's deals
  const stats = useMemo(() => {
    if (!user || !deals.length) {
      return {
        totalDeals: 0,
        activeDeals: 0,
        completedDeals: 0,
        totalVolume: 0,
        averageDealValue: 0,
        successRate: 0,
        trustScore: user?.trustScore || 0
      }
    }

    // Filter deals by user involvement
    const userDeals = deals.filter(deal => 
      deal.buyerId === user.id || deal.sellerId === user.id
    )

    const activeStatuses: DealStatus[] = ['accepted', 'funded', 'in_progress', 'milestone_completed']
    const completedStatuses: DealStatus[] = ['completed']
    
    const activeDeals = userDeals.filter(deal => activeStatuses.includes(deal.status))
    const completedDeals = userDeals.filter(deal => completedStatuses.includes(deal.status))
    
    const totalVolume = completedDeals.reduce((sum, deal) => sum + deal.amount, 0)
    const averageDealValue = completedDeals.length > 0 ? totalVolume / completedDeals.length : 0
    const successRate = userDeals.length > 0 ? (completedDeals.length / userDeals.length) * 100 : 0

    return {
      totalDeals: userDeals.length,
      activeDeals: activeDeals.length,
      completedDeals: completedDeals.length,
      totalVolume,
      averageDealValue,
      successRate,
      trustScore: user.trustScore
    }
  }, [user, deals])

  // Mock trend data (in real app, this would come from API)
  const getTrendData = (currentValue: number, type: string) => {
    // Generate mock trend based on timeframe
    const mockVariance = Math.random() * 20 - 10 // -10% to +10%
    const isPositive = mockVariance > 0
    
    return {
      value: Math.abs(mockVariance),
      isPositive,
      timeframe: timeframe === 'week' ? 'vs last week' : 
                 timeframe === 'month' ? 'vs last month' :
                 timeframe === 'quarter' ? 'vs last quarter' : 'vs last year'
    }
  }

  const statCards: StatCard[] = [
    {
      title: 'Total Volume',
      value: formatPaymentAmount(stats.totalVolume),
      description: 'Total transaction value',
      icon: DollarSign,
      trend: getTrendData(stats.totalVolume, 'volume'),
      href: '/dashboard/transactions'
    },
    {
      title: 'Active Deals',
      value: stats.activeDeals,
      description: 'Currently ongoing deals',
      icon: ShoppingBag,
      trend: getTrendData(stats.activeDeals, 'deals'),
      href: '/dashboard/deals'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      description: 'Successfully completed deals',
      icon: TrendingUp,
      trend: getTrendData(stats.successRate, 'rate'),
      href: '/dashboard/profile'
    },
    {
      title: 'Trust Score',
      value: stats.trustScore.toFixed(1),
      description: 'Your trust rating',
      icon: Star,
      trend: getTrendData(stats.trustScore, 'trust'),
      href: '/dashboard/profile'
    }
  ]

  const TrendIndicator = ({ trend }: { trend: StatCard['trend'] }) => {
    if (!trend) return null

    return (
      <div className={cn(
        "flex items-center gap-1 text-xs",
        trend.isPositive ? "text-green-600" : "text-red-600"
      )}>
        {trend.isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{trend.value.toFixed(1)}% {trend.timeframe}</span>
      </div>
    )
  }

  const StatCardComponent = ({ stat }: { stat: StatCard }) => {
    const Icon = stat.icon

    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <TrendIndicator trend={stat.trend} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Additional insights based on user data
  const insights = useMemo<Insight[]>(() => {
  const insights: Insight[] = []

  if (stats.activeDeals === 0 && stats.totalDeals < 3) {
    insights.push({
      type: 'suggestion',
      message: 'Complete your profile to attract more deals',
      action: 'Complete Profile'
    })
  }

  if (stats.trustScore < 4.0) {
    insights.push({
      type: 'warning',
      message: 'Low trust score may affect deal opportunities',
      action: 'Improve Score'
    })
  }

  if (stats.successRate > 90 && stats.completedDeals > 5) {
    insights.push({
      type: 'success',
      message: "Excellent success rate! You're a trusted user",
      action: 'View Profile'
    })
  }

  return insights
}, [stats])


  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCardComponent key={index} stat={stat} />
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Completed Deals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDeals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDeals > 0 ? 
                `${((stats.completedDeals / stats.totalDeals) * 100).toFixed(1)}% of total deals` :
                'No deals completed yet'
              }
            </p>
          </CardContent>
        </Card>

        {/* Average Deal Value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Deal Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageDealValue > 0 ? formatPaymentAmount(stats.averageDealValue) : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per completed deal
            </p>
          </CardContent>
        </Card>

        {/* User Role Badge */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={user?.isVerified ? "default" : "secondary"}>
                {user?.isVerified ? "Verified" : "Unverified"}
              </Badge>
              <Badge variant={user?.kycStatus === 'approved' ? "default" : "secondary"}>
                {user?.kycStatus === 'approved' ? "KYC Approved" : "KYC Pending"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {user?.isVerified && user?.kycStatus === 'approved' 
                ? "Full access enabled"
                : "Complete verification for full access"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Insights & Recommendations</CardTitle>
            <CardDescription>
              Personalized suggestions to improve your SafeSwap experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  insight.type === 'success' && "bg-green-50 border-green-200",
                  insight.type === 'warning' && "bg-yellow-50 border-yellow-200",
                  insight.type === 'suggestion' && "bg-blue-50 border-blue-200"
                )}>
                  <p className="text-sm flex-1">{insight.message}</p>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground ml-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Create Deal</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Browse Deals</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">View Transactions</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Profile Settings</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}