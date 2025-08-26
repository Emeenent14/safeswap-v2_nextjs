import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'

import DashboardLayout from '@/components/layout/DashboardLayout'
import DealList from '@/components/deals/DealList'
import PageLoader from '@/components/common/PageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, DollarSign, HandHeart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Deals - SafeSwap',
  description: 'Manage your SafeSwap deals, view active transactions, and track your deal history.',
  robots: 'noindex, nofollow'
}

function DealsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="h-24 bg-gray-200 animate-pulse rounded-lg" />
      
      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
      
      {/* Filters skeleton */}
      <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
      
      {/* Deal list skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function DealsPage() {
  return (
    <DashboardLayout title="My Deals">
      <div className="space-y-6">
        {/* Page Header with Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Manage Your Deals
            </h2>
            <p className="text-sm text-gray-600">
              View and manage all your active and completed deals
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/dashboard/deals/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Deal
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">
                All-time transaction value
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <HandHeart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Deal Categories Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Categories</CardTitle>
            <CardDescription>
              Filter deals by your participation type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="cursor-pointer">
                All Deals
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                Buying
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                Selling
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                Completed
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Deal List */}
        <Suspense fallback={<DealsPageSkeleton />}>
          <DealList 
            variant="my-deals"
            showFilters={true}
            showSearch={true}
            compact={false}
          />
        </Suspense>

        {/* Help Section */}
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ready to create your first deal?</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Set up an escrow transaction with clear milestones and secure payment handling. 
              Our platform ensures both parties are protected throughout the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard/deals/create">
                  Create New Deal
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/deals?status=created">
                  Browse Available Deals
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Deal Management Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>Create Clear Milestones:</strong> Break down your deal into specific, 
              measurable milestones to track progress and ensure smooth payments.
            </div>
            <div>
              <strong>Communicate Regularly:</strong> Use the built-in messaging system to 
              stay in touch with your deal partners and address any issues quickly.
            </div>
            <div>
              <strong>Complete Your Profile:</strong> A complete profile with verification 
              increases trust and helps you secure better deals.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}