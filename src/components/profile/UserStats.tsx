import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Award, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { User, UserProfile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface UserStatsProps {
  user: User
  profile: UserProfile
  variant?: 'default' | 'compact' | 'detailed'
  showComparison?: boolean
  className?: string
}

interface StatItem {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    period: string
  }
  color?: string
  description?: string
}

export const UserStats: React.FC<UserStatsProps> = ({
  user,
  profile,
  variant = 'default',
  showComparison = false,
  className
}) => {
  // Calculate additional metrics
  const additionalMetrics = useMemo(() => {
    const joinDate = new Date(user.createdAt)
    const now = new Date()
    const daysActive = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
    const monthsActive = Math.max(1, Math.floor(daysActive / 30))
    
    // Calculate average deal value
    const avgDealValue = profile.completedDeals > 0 
      ? profile.totalVolume / profile.completedDeals 
      : 0

    // Calculate deals per month
    const dealsPerMonth = profile.completedDeals / monthsActive

    // Mock additional metrics (in real app, these would come from API)
    const averageCompletionTime = 7 // days
    const repeatCustomerRate = 25 // percentage
    const responseTime = 2 // hours

    return {
      daysActive,
      monthsActive,
      avgDealValue,
      dealsPerMonth,
      averageCompletionTime,
      repeatCustomerRate,
      responseTime
    }
  }, [user.createdAt, profile.completedDeals, profile.totalVolume])

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return `${amount.toLocaleString()}`
  }

  // Format number with suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  // Primary stats
  const primaryStats: StatItem[] = [
    {
      label: 'Trust Score',
      value: user.trustScore,
      icon: <Award className="h-4 w-4" />,
      color: user.trustScore >= 85 ? 'text-green-600' : user.trustScore >= 60 ? 'text-blue-600' : 'text-yellow-600',
      description: 'Overall trustworthiness rating'
    },
    {
      label: 'Completed Deals',
      value: profile.completedDeals,
      icon: <Target className="h-4 w-4" />,
      trend: {
        value: 12,
        isPositive: true,
        period: 'this month'
      },
      color: 'text-primary',
      description: 'Successfully completed transactions'
    },
    {
      label: 'Success Rate',
      value: `${profile.successRate}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      color: profile.successRate >= 90 ? 'text-green-600' : profile.successRate >= 75 ? 'text-blue-600' : 'text-yellow-600',
      description: 'Percentage of deals completed successfully'
    },
    {
      label: 'Total Volume',
      value: formatCurrency(profile.totalVolume),
      icon: <DollarSign className="h-4 w-4" />,
      trend: {
        value: 8.5,
        isPositive: true,
        period: 'vs last month'
      },
      color: 'text-green-600',
      description: 'Total value of completed deals'
    }
  ]

  // Secondary stats
  const secondaryStats: StatItem[] = [
    {
      label: 'Avg Deal Value',
      value: formatCurrency(additionalMetrics.avgDealValue),
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Average value per completed deal'
    },
    {
      label: 'Deals/Month',
      value: additionalMetrics.dealsPerMonth.toFixed(1),
      icon: <Calendar className="h-4 w-4" />,
      description: 'Average deals completed per month'
    },
    {
      label: 'Avg Completion',
      value: `${additionalMetrics.averageCompletionTime} days`,
      icon: <Clock className="h-4 w-4" />,
      description: 'Average time to complete deals'
    },
    {
      label: 'Response Time',
      value: `${additionalMetrics.responseTime}h`,
      icon: <Clock className="h-4 w-4" />,
      description: 'Average response time to messages'
    }
  ]

  // Performance stats
  const performanceStats: StatItem[] = [
    {
      label: 'Days Active',
      value: additionalMetrics.daysActive,
      icon: <Calendar className="h-4 w-4" />,
      description: 'Days since joining the platform'
    },
    {
      label: 'Repeat Customers',
      value: `${additionalMetrics.repeatCustomerRate}%`,
      icon: <Users className="h-4 w-4" />,
      description: 'Percentage of repeat customers'
    }
  ]

  // Render stat card
  const renderStatCard = (stat: StatItem, size: 'sm' | 'md' | 'lg' = 'md') => (
    <Card key={stat.label} className="relative overflow-hidden">
      <CardContent className={cn(
        'p-4',
        size === 'sm' && 'p-3',
        size === 'lg' && 'p-6'
      )}>
        <div className="flex items-center justify-between">
          <div className={cn('p-2 rounded-full bg-muted', stat.color)}>
            {stat.icon}
          </div>
          {stat.trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {stat.trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{stat.trend.isPositive ? '+' : '-'}{stat.trend.value}%</span>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <div className={cn(
            'font-bold',
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'
          )}>
            {stat.value}
          </div>
          <p className={cn(
            'text-muted-foreground',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {stat.label}
          </p>
          {stat.description && size !== 'sm' && (
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          )}
          {stat.trend && (
            <p className="text-xs text-muted-foreground mt-1">
              {stat.trend.period}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
        {primaryStats.map(stat => renderStatCard(stat, 'sm'))}
      </div>
    )
  }

  // Default variant
  if (variant === 'default') {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryStats.map(stat => renderStatCard(stat, 'md'))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {secondaryStats.map(stat => renderStatCard(stat, 'sm'))}
        </div>
      </div>
    )
  }

  // Detailed variant with tabs
  return (
    <div className={className}>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Featured Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {primaryStats.slice(0, 2).map(stat => renderStatCard(stat, 'lg'))}
          </div>

          {/* Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {primaryStats.slice(2).concat(secondaryStats.slice(0, 2)).map(stat => 
              renderStatCard(stat, 'md')
            )}
          </div>

          {/* Progress Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Towards Next Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Trust Score Progress</span>
                  <span>{user.trustScore}/100</span>
                </div>
                <Progress value={user.trustScore} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Success Rate Goal</span>
                  <span>{profile.successRate}/95%</span>
                </div>
                <Progress value={(profile.successRate / 95) * 100} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Volume Milestone</span>
                  <span>{formatCurrency(profile.totalVolume)}/{formatCurrency(50000)}</span>
                </div>
                <Progress value={(profile.totalVolume / 50000) * 100} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...secondaryStats, ...performanceStats].map(stat => 
              renderStatCard(stat, 'md')
            )}
          </div>

          {/* Performance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Strengths</h4>
                  <div className="space-y-2">
                    {profile.successRate >= 90 && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        Excellent success rate
                      </div>
                    )}
                    {user.trustScore >= 85 && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        High trust score
                      </div>
                    )}
                    {additionalMetrics.responseTime <= 4 && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        Quick response time
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Areas for Improvement</h4>
                  <div className="space-y-2">
                    {profile.completedDeals < 10 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                        Complete more deals to build reputation
                      </div>
                    )}
                    {profile.totalVolume < 5000 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                        Increase transaction volume
                      </div>
                    )}
                    {!user.isVerified && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                        Complete account verification
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {additionalMetrics.daysActive}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Days Active
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {profile.completedDeals}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Deals
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {additionalMetrics.dealsPerMonth.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Deals per Month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.trustScore >= 85 && (
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="gap-1">
                      <Award className="h-3 w-3" />
                      High Trust Score
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Achieved trust score of {user.trustScore}
                    </span>
                  </div>
                )}
                
                {profile.successRate >= 90 && (
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <Target className="h-3 w-3" />
                      Success Master
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Maintained {profile.successRate}% success rate
                    </span>
                  </div>
                )}
                
                {profile.completedDeals >= 10 && (
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      Experienced Trader
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Completed {profile.completedDeals} successful deals
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}