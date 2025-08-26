import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import DashboardLayout from '@/components/layout/DashboardLayout'
import DealDetails from '@/components/deals/DealDetails'
import PageLoader from '@/components/common/PageLoader'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface DealDetailsPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: DealDetailsPageProps): Promise<Metadata> {
  // In a real app, you'd fetch deal data to get the actual title
  // For now, we'll use a generic title
  return {
    title: `Deal Details - SafeSwap`,
    description: 'View and manage your SafeSwap deal details, milestones, and communications.',
    robots: 'noindex, nofollow'
  }
}

function DealDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-64" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
        </div>
        <div className="h-6 bg-gray-200 animate-pulse rounded w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-24 bg-gray-200 animate-pulse rounded-lg" />
        </div>
        
        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function DealDetailsPage({ params }: DealDetailsPageProps) {
  const dealId = params.id

  // Basic validation
  if (!dealId || typeof dealId !== 'string') {
    notFound()
  }

  return (
    <DashboardLayout showSidebar={true}>
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/deals">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deals
            </Link>
          </Button>
        </div>

        {/* Deal Details Content */}
        <Suspense fallback={<DealDetailsSkeleton />}>
          <DealDetails dealId={dealId} />
        </Suspense>

        {/* Additional Actions */}
        <div className="border-t pt-6">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/deals">
                View All Deals
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/dashboard/deals/create">
                Create New Deal
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/dashboard/transactions">
                View Transactions
              </Link>
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help with Your Deal?
          </h3>
          <p className="text-blue-800 mb-4">
            If you&apos;re experiencing issues with this deal or need assistance, our support team is here to help.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/help/deals">
                Deal Guide
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/support">
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/disputes/create">
                Report Issue
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}