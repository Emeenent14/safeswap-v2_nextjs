import { Suspense } from 'react'
import { Metadata } from 'next'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
  Activity
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard - SafeSwap',
  description: 'Administrative dashboard for SafeSwap platform management',
  robots: 'noindex, nofollow'
}

// Mock admin statistics
const adminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  newUsersToday: 23,
  totalDeals: 3456,
  activeDeals: 234,
  completedDeals: 2891,
  totalVolume: 2847293.45,
  platformFees: 85418.80,
  openDisputes: 12,
  pendingKyc: 28,
  trustScoreUpdates: 156,
  systemAlerts: 3
}

const recentActivities = [
  {
    id: '1',
    type: 'kyc_approval',
    description: 'KYC approved for user john.doe@example.com',
    timestamp: '2024-08-27T10:30:00Z',
    severity: 'success'
  },
  {
    id: '2',
    type: 'dispute_created',
    description: 'New dispute opened for deal "Web Development Project"',
    timestamp: '2024-08-27T09:45:00Z',
    severity: 'warning'
  },
  {
    id: '3',
    type: 'trust_score_update',
    description: 'Trust score adjusted for user alice.smith@example.com (+5 points)',
    timestamp: '2024-08-27T09:15:00Z',
    severity: 'info'
  },
  {
    id: '4',
    type: 'system_alert',
    description: 'High transaction volume detected - monitoring required',
    timestamp: '2024-08-27T08:30:00Z',
    severity: 'error'
  }
]

function AdminStatsCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'stable'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend && (
              <TrendingUp 
                className={`h-3 w-3 ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`} 
              />
            )}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function RecentActivityItem({ activity }: { activity: typeof recentActivities[0] }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'kyc_approval': return ShieldCheck
      case 'dispute_created': return AlertTriangle
      case 'trust_score_update': return TrendingUp
      case 'system_alert': return Activity
      default: return FileText
    }
  }

  const Icon = getSeverityIcon(activity.type)

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className={`p-2 rounded-full ${getSeverityColor(activity.severity)}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {activity.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

function AdminDashboardContent() {
  return (
    <AdminLayout title="Dashboard" subtitle="Platform overview and recent activities">
      <div className="space-y-8">
        {/* Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AdminStatsCard
            title="Total Users"
            value={adminStats.totalUsers.toLocaleString()}
            subtitle={`+${adminStats.newUsersToday} today`}
            icon={Users}
            trend="up"
          />
          
          <AdminStatsCard
            title="Active Deals"
            value={adminStats.activeDeals}
            subtitle={`${adminStats.completedDeals.toLocaleString()} completed`}
            icon={FileText}
            trend="stable"
          />
          
          <AdminStatsCard
            title="Platform Volume"
            value={`$${(adminStats.totalVolume / 1000000).toFixed(1)}M`}
            subtitle={`$${adminStats.platformFees.toLocaleString()} in fees`}
            icon={DollarSign}
            trend="up"
          />
          
          <AdminStatsCard
            title="System Health"
            value="Operational"
            subtitle={`${adminStats.systemAlerts} alerts`}
            icon={Activity}
            trend={adminStats.systemAlerts > 0 ? 'down' : 'stable'}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/disputes">
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Disputes ({adminStats.openDisputes})
              </Button>
            </Link>
            
            <Link href="/admin/kyc">
              <Button variant="outline" className="w-full justify-start">
                <ShieldCheck className="h-4 w-4 mr-2" />
                KYC Reviews ({adminStats.pendingKyc})
              </Button>
            </Link>
            
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            
            <Link href="/admin/deals">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Review Deals
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Priority Alerts */}
        {adminStats.systemAlerts > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts ({adminStats.systemAlerts})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">High Transaction Volume</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Unusual spike in transaction activity detected
                    </p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Payment Gateway Latency</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stripe webhook processing delays
                    </p>
                  </div>
                  <Badge variant="outline">Warning</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivities.map((activity) => (
                <RecentActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                View All Activities
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="font-medium">{adminStats.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Registrations (7d)</span>
                  <span className="font-medium">147</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">KYC Approved</span>
                  <span className="font-medium">78%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Transaction Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium text-green-600">97.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Deal Value</span>
                  <span className="font-medium">$823</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dispute Rate</span>
                  <span className="font-medium text-yellow-600">2.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processing Time</span>
                  <span className="font-medium">1.3s avg</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      </AdminLayout>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}