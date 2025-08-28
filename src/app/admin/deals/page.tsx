'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import DealList from '@/components/deals/DealList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Settings,
  Ban,
  CheckCircle,
  Clock
} from 'lucide-react'
import type { Deal, DealStatus, DealCategory } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useDeals } from '@/hooks/useDeals'
import { useNotificationStore } from '@/store/notificationStore'

// Mock expanded deal data for admin view
const mockAdminDeals: Deal[] = [
  {
    id: 'deal_1',
    title: 'E-commerce Website Development',
    description: 'Complete e-commerce solution with payment integration',
    category: 'software',
    amount: 5000,
    currency: 'USD',
    buyerId: 'user_1',
    sellerId: 'user_2',
    buyer: {
      id: 'user_1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      avatar: undefined,
      trustScore: 85,
      isVerified: true,
      kycStatus: 'approved',
      role: 'user',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-08-20T14:45:00Z'
    },
    seller: {
      id: 'user_2',
      email: 'alice.smith@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      phone: '+1-555-0124',
      avatar: undefined,
      trustScore: 92,
      isVerified: true,
      kycStatus: 'approved',
      role: 'user',
      createdAt: '2024-02-10T09:15:00Z',
      updatedAt: '2024-08-25T11:30:00Z'
    },
    status: 'in_progress',
    escrowAmount: 5000,
    escrowFee: 150,
    milestones: [],
    messages: [],
    files: [],
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2024-08-25T14:30:00Z',
    paymentIntentId: 'pi_example_1'
  },
  {
    id: 'deal_2',
    title: 'Logo Design Package',
    description: 'Professional logo design with brand guidelines',
    category: 'design',
    amount: 800,
    currency: 'USD',
    buyerId: 'user_3',
    sellerId: 'user_1',
    buyer: {
      id: 'user_3',
      email: 'bob.wilson@example.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      phone: undefined,
      avatar: undefined,
      trustScore: 45,
      isVerified: false,
      kycStatus: 'pending',
      role: 'user',
      createdAt: '2024-08-01T16:20:00Z',
      updatedAt: '2024-08-26T08:45:00Z'
    },
    seller: {
      id: 'user_1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      avatar: undefined,
      trustScore: 85,
      isVerified: true,
      kycStatus: 'approved',
      role: 'user',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-08-20T14:45:00Z'
    },
    status: 'disputed',
    escrowAmount: 800,
    escrowFee: 24,
    milestones: [],
    messages: [],
    files: [],
    createdAt: '2024-08-20T09:00:00Z',
    updatedAt: '2024-08-26T16:15:00Z',
    disputeId: 'dispute_1',
    paymentIntentId: 'pi_example_2'
  }
]

interface AdminActionDialogProps {
  deal: Deal | null
  isOpen: boolean
  onClose: () => void
  action: 'suspend' | 'force_complete' | 'refund' | null
  onConfirm: (dealId: string, action: string, reason: string) => void
}

function AdminActionDialog({ deal, isOpen, onClose, action, onConfirm }: AdminActionDialogProps) {
  const [reason, setReason] = useState('')

  const getActionDetails = () => {
    switch (action) {
      case 'suspend':
        return {
          title: 'Suspend Deal',
          description: 'This will suspend the deal and prevent further actions.',
          buttonText: 'Suspend Deal',
          variant: 'destructive' as const
        }
      case 'force_complete':
        return {
          title: 'Force Complete',
          description: 'This will mark the deal as completed and release escrow.',
          buttonText: 'Complete Deal',
          variant: 'default' as const
        }
      case 'refund':
        return {
          title: 'Issue Refund',
          description: 'This will refund the escrow amount to the buyer.',
          buttonText: 'Issue Refund',
          variant: 'outline' as const
        }
      default:
        return { title: '', description: '', buttonText: '', variant: 'default' as const }
    }
  }

  const actionDetails = getActionDetails()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (deal && action && reason.trim().length >= 10) {
      onConfirm(deal.id, action, reason.trim())
      setReason('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{actionDetails.title}</DialogTitle>
        </DialogHeader>
        
        {deal && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {actionDetails.description}
              </p>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{deal.title}</p>
                <p className="text-sm text-muted-foreground">
                  ${deal.amount.toLocaleString()} • Status: {deal.status}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Administrative Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a detailed reason for this administrative action..."
                rows={3}
                required
                minLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters ({reason.length}/10)
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant={actionDetails.variant}
                disabled={!reason.trim() || reason.length < 10}
              >
                {actionDetails.buttonText}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AdminDealCard({ deal, onAdminAction }: { 
  deal: Deal
  onAdminAction: (deal: Deal, action: 'suspend' | 'force_complete' | 'refund') => void
}) {
  const getStatusBadge = (status: DealStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'disputed':
        return <Badge variant="destructive">Disputed</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      case 'funded':
        return <Badge className="bg-purple-100 text-purple-800">Funded</Badge>
      default:
        return <Badge variant="secondary">{status.replace('_', ' ')}</Badge>
    }
  }

  const getRiskLevel = (deal: Deal) => {
    let riskScore = 0
    
    // Low trust scores increase risk
    if (deal.buyer.trustScore < 50 || deal.seller.trustScore < 50) riskScore += 2
    
    // Unverified users increase risk
    if (!deal.buyer.isVerified || !deal.seller.isVerified) riskScore += 1
    
    // High amounts increase risk
    if (deal.amount > 2000) riskScore += 1
    
    // Disputed status is high risk
    if (deal.status === 'disputed') riskScore += 3

    if (riskScore >= 4) return { level: 'High', color: 'text-red-600' }
    if (riskScore >= 2) return { level: 'Medium', color: 'text-yellow-600' }
    return { level: 'Low', color: 'text-green-600' }
  }

  const risk = getRiskLevel(deal)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2">{deal.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {deal.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {getStatusBadge(deal.status)}
              <Badge variant="outline">{deal.category.replace('_', ' ')}</Badge>
              <Badge className={risk.color}>Risk: {risk.level}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Buyer</p>
                <p className="font-medium">{deal.buyer.firstName} {deal.buyer.lastName}</p>
                <p className="text-xs text-muted-foreground">Trust: {deal.buyer.trustScore}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Seller</p>
                <p className="font-medium">{deal.seller.firstName} {deal.seller.lastName}</p>
                <p className="text-xs text-muted-foreground">Trust: {deal.seller.trustScore}</p>
              </div>
            </div>
          </div>

          <div className="text-right ml-4">
            <p className="text-2xl font-bold">${deal.amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              Fee: ${deal.escrowFee.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAdminAction(deal, 'force_complete')}
            disabled={deal.status === 'completed'}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Force Complete
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAdminAction(deal, 'refund')}
            disabled={deal.status === 'completed' || deal.status === 'refunded'}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Refund
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAdminAction(deal, 'suspend')}
            disabled={deal.status === 'cancelled'}
          >
            <Ban className="h-4 w-4 mr-1" />
            Suspend
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDealsPage() {
  const { addToast } = useNotificationStore()
  
  const [deals, setDeals] = useState<Deal[]>(mockAdminDeals)
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>(mockAdminDeals)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<DealStatus | ''>('')
  const [riskFilter, setRiskFilter] = useState<'low' | 'medium' | 'high' | ''>('')
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [adminAction, setAdminAction] = useState<'suspend' | 'force_complete' | 'refund' | null>(null)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)

  // Filter deals based on search and filters
  useEffect(() => {
    let filtered = deals

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.buyer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.buyer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.seller.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.seller.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(deal => deal.status === statusFilter)
    }

    // Risk filter
    if (riskFilter) {
      filtered = filtered.filter(deal => {
        let riskScore = 0
        if (deal.buyer.trustScore < 50 || deal.seller.trustScore < 50) riskScore += 2
        if (!deal.buyer.isVerified || !deal.seller.isVerified) riskScore += 1
        if (deal.amount > 2000) riskScore += 1
        if (deal.status === 'disputed') riskScore += 3

        const level = riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low'
        return level === riskFilter
      })
    }

    setFilteredDeals(filtered)
  }, [deals, searchQuery, statusFilter, riskFilter])

  const handleAdminAction = (deal: Deal, action: 'suspend' | 'force_complete' | 'refund') => {
    setSelectedDeal(deal)
    setAdminAction(action)
    setIsActionDialogOpen(true)
  }

  const handleActionConfirm = async (dealId: string, action: string, reason: string) => {
    try {
      // In production, this would call the admin API
      // await fetch(`/api/admin/deals/${dealId}/action`, { method: 'POST', ... })
      
      // Update local state
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === dealId 
            ? { 
                ...deal, 
                status: action === 'suspend' ? 'cancelled' : 
                       action === 'force_complete' ? 'completed' : 
                       'refunded' as DealStatus,
                updatedAt: new Date().toISOString()
              }
            : deal
        )
      )

      addToast({
        type: 'success',
        title: 'Action completed',
        message: `Deal ${action.replace('_', ' ')} successfully applied`,
        duration: 4000
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Action failed',
        message: 'Failed to apply administrative action',
        duration: 5000
      })
    }
  }

  const stats = {
    total: deals.length,
    inProgress: deals.filter(d => d.status === 'in_progress').length,
    disputed: deals.filter(d => d.status === 'disputed').length,
    completed: deals.filter(d => d.status === 'completed').length,
    totalVolume: deals.reduce((sum, deal) => sum + deal.amount, 0),
    totalFees: deals.reduce((sum, deal) => sum + deal.escrowFee, 0)
  }

  return (
    <AdminLayout 
      title="Deal Management" 
      subtitle={`Monitor and manage ${deals.length} platform deals`}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                {stats.disputed} disputed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats.totalVolume / 1000).toFixed(0)}k
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats.totalFees.toLocaleString()} in fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((stats.completed / stats.total) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completed} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals, users, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value: DealStatus | '') => setStatusFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={(value: 'low' | 'medium' | 'high' | '') => setRiskFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('')
                  setRiskFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>

            {filteredDeals.length !== deals.length && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredDeals.length} of {deals.length} deals
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deal List */}
        <div className="space-y-4">
          {filteredDeals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No deals found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter || riskFilter 
                    ? "No deals match your current filters."
                    : "No deals to display."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredDeals.map((deal) => (
              <AdminDealCard
                key={deal.id}
                deal={deal}
                onAdminAction={handleAdminAction}
              />
            ))
          )}
        </div>

        {/* Admin Action Dialog */}
        <AdminActionDialog
          deal={selectedDeal}
          isOpen={isActionDialogOpen}
          onClose={() => {
            setIsActionDialogOpen(false)
            setSelectedDeal(null)
            setAdminAction(null)
          }}
          action={adminAction}
          onConfirm={handleActionConfirm}
        />
      </div>
    </AdminLayout>
  )
}