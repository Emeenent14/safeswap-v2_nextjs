import { Suspense } from 'react'
import { Metadata } from 'next'
import AdminKYCManagement from './AdminKYCManagement'

export const metadata: Metadata = {
  title: 'KYC Management - SafeSwap Admin',
  description: 'Manage user identity verification submissions, approve or reject KYC documents',
  robots: 'noindex, nofollow'
}

// Loading skeleton for KYC management
function KYCManagementSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function AdminKYCPage() {
  return (
    <Suspense fallback={<KYCManagementSkeleton />}>
      <AdminKYCManagement />
    </Suspense>
  )
}