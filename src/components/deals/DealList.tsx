import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DealCard from './DealCard'
import EmptyState from '@/components/common/EmptyState'
import PageLoader from '@/components/common/PageLoader'
import { Search, Filter, SortAsc, SortDesc, RefreshCw } from 'lucide-react'
import type { Deal, DealStatus, DealCategory, DealFilters } from '@/lib/types'
import { useDeals } from '@/hooks/useDeals'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface DealListProps {
  variant?: 'all' | 'my-deals' | 'buying' | 'selling'
  showFilters?: boolean
  showSearch?: boolean
  compact?: boolean
  limit?: number
  className?: string
}

const categoryOptions: { value: DealCategory | '', label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'digital_services', label: 'Digital Services' },
  { value: 'freelancing', label: 'Freelancing' },
  { value: 'goods', label: 'Goods' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'software', label: 'Software' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'writing', label: 'Writing' },
  { value: 'other', label: 'Other' }
]

const statusOptions: { value: DealStatus | '', label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'created', label: 'Created' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'funded', label: 'Funded' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'milestone_completed', label: 'Milestone Complete' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'refunded', label: 'Refunded' }
]

const sortOptions = [
  { value: 'created_date_desc', label: 'Newest First' },
  { value: 'created_date_asc', label: 'Oldest First' },
  { value: 'amount_desc', label: 'Highest Amount' },
  { value: 'amount_asc', label: 'Lowest Amount' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' }
]

// Type-safe sorting function
function sortDeals(deals: Deal[], sortBy: string): Deal[] {
  const [sortField, sortOrder] = sortBy.split('_') as [string, 'asc' | 'desc']
  
  return [...deals].sort((a, b) => {
    let aValue: string | number | Date
    let bValue: string | number | Date
    
    switch (sortField) {
      case 'created':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'amount':
        aValue = a.amount
        bValue = b.amount
        break
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      default:
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
}

export default function DealList({ 
  variant = 'all',
  showFilters = true,
  showSearch = true,
  compact = false,
  limit,
  className 
}: DealListProps) {
  const { user } = useAuth()
  const { 
    deals, 
    userDeals,
    myBuyerDeals,
    mySellerDeals,
    filters, 
    isLoading, 
    error,
    pagination,
    fetchDeals, 
    setFilters, 
    resetFilters,
    setPage 
  } = useDeals()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_date_desc')

  // Determine which deals to display
  const getDisplayDeals = (): Deal[] => {
    let displayDeals: Deal[] = []
    
    switch (variant) {
      case 'my-deals':
        displayDeals = userDeals
        break
      case 'buying':
        displayDeals = myBuyerDeals
        break
      case 'selling':
        displayDeals = mySellerDeals
        break
      default:
        displayDeals = deals
    }

    // Apply client-side sorting
    displayDeals = sortDeals(displayDeals, sortBy)

    // Apply limit if specified
    if (limit) {
      displayDeals = displayDeals.slice(0, limit)
    }

    return displayDeals
  }

  const displayDeals = getDisplayDeals()

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters({ search: query })
  }

  // Handle filter changes - type-safe version
  const handleFilterChange = (key: keyof DealFilters, value: string) => {
    const filterValue = value || undefined
    
    // Type-safe filter updates
    switch (key) {
      case 'category':
        setFilters({ [key]: filterValue as DealCategory | undefined })
        break
      case 'status':
        setFilters({ [key]: filterValue as DealStatus | undefined })
        break
      case 'search':
        setFilters({ [key]: filterValue })
        break
      case 'userId':
        setFilters({ [key]: filterValue })
        break
      case 'minAmount':
      case 'maxAmount':
        setFilters({ [key]: filterValue ? Number(filterValue) : undefined })
        break
      default:
        // This should never happen with proper typing, but adds safety
        break
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    await fetchDeals()
  }

  // Load initial data
  useEffect(() => {
    if (!deals.length && variant === 'all') {
      fetchDeals()
    }
  }, [])

  // Filter stats
  const getFilterStats = () => {
    const total = displayDeals.length
    const active = displayDeals.filter(d => 
      ['accepted', 'funded', 'in_progress', 'milestone_completed'].includes(d.status)
    ).length
    const completed = displayDeals.filter(d => d.status === 'completed').length
    
    return { total, active, completed }
  }

  const stats = getFilterStats()

  if (error && !deals.length) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading deals: {error}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Search Bar */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals by title, description, or category..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-4">
                <Select 
                  value={filters.category || ''} 
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.status || ''} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Filter Stats */}
            {displayDeals.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Badge variant="outline">
                  Total: {stats.total}
                </Badge>
                <Badge variant="outline">
                  Active: {stats.active}
                </Badge>
                <Badge variant="outline">
                  Completed: {stats.completed}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !displayDeals.length && (
        <PageLoader />
      )}

      {/* Empty State - Fixed with proper variant prop */}
      {!isLoading && displayDeals.length === 0 && (
        <EmptyState
          variant={variant === 'my-deals' || variant === 'buying' || variant === 'selling' ? 'deals' : 'search'}
          title="No deals found"
          description={
            variant === 'my-deals' 
              ? "You haven't created or participated in any deals yet."
              : variant === 'buying'
              ? "You haven't made any purchases yet."
              : variant === 'selling'
              ? "You haven't created any deals to sell yet."
              : "No deals match your current filters."
          }
          actionLabel={variant === 'my-deals' || variant === 'selling' ? "Create Deal" : undefined}
          actionHref={variant === 'my-deals' || variant === 'selling' ? "/dashboard/deals/create" : undefined}
          showRefresh={variant === 'all'}
          onRefresh={variant === 'all' ? handleRefresh : undefined}
        />
      )}

      {/* Deal Cards */}
      {!isLoading && displayDeals.length > 0 && (
        <div className={cn(
          'grid gap-4',
          compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
        )}>
          {displayDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              variant={compact ? 'compact' : 'default'}
              showActions={!compact}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!compact && pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} deals
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page === 1 || isLoading}
            >
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page + 1)}
              disabled={!pagination.hasMore || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}