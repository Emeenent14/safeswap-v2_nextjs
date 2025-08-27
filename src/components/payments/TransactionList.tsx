import React, { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  RefreshCw, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

import { usePayments } from '@/hooks/usePayments'
import type { Transaction, TransactionType, TransactionStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TransactionListProps {
  dealId?: string
  userId?: string
  showFilters?: boolean
  compact?: boolean
  limit?: number
  showPagination?: boolean; 
  className?: string
}

// Define the filter interface
interface TransactionFilters {
  dealId?: string
  userId?: string
  status?: TransactionStatus
  type?: TransactionType
}

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  escrow_deposit: 'Escrow Deposit',
  escrow_release: 'Escrow Release',
  escrow_refund: 'Escrow Refund',
  fee_payment: 'Service Fee',
  savings_deposit: 'Savings Deposit',
  savings_withdrawal: 'Savings Withdrawal',
  peer_transfer: 'Peer Transfer'
}

const TRANSACTION_STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'Processing', icon: RefreshCw, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Completed', icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200' },
  failed: { label: 'Failed', icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-gray-100 text-gray-800 border-gray-200' },
  refunded: { label: 'Refunded', icon: ArrowUpRight, className: 'bg-orange-100 text-orange-800 border-orange-200' }
}

export default function TransactionList({ 
  dealId, 
  userId, 
  showFilters = true, 
  compact = false, 
  limit,
  className 
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')

  const { getTransactionHistory, formatPaymentAmount } = usePayments()

  // Load transactions
  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const filters: TransactionFilters = {}
      if (dealId) filters.dealId = dealId
      if (userId) filters.userId = userId
      if (statusFilter !== 'all') filters.status = statusFilter
      if (typeFilter !== 'all') filters.type = typeFilter

      const data = await getTransactionHistory(filters)
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [dealId, userId, statusFilter, typeFilter])

  // Filter transactions by search query
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(query) ||
        tx.id.toLowerCase().includes(query) ||
        tx.stripeIntentId?.toLowerCase().includes(query)
      )
    }

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    return filtered
  }, [transactions, searchQuery, limit])

  // Get transaction icon based on type and amount
  const getTransactionIcon = (transaction: Transaction) => {
    const isOutgoing = transaction.type === 'escrow_deposit' || 
                     transaction.type === 'fee_payment' || 
                     transaction.type === 'savings_deposit' ||
                     (transaction.type === 'peer_transfer' && transaction.userId === userId)
    
    return isOutgoing ? ArrowUpRight : ArrowDownRight
  }

  // Get transaction color based on type
  const getTransactionColor = (transaction: Transaction) => {
    const isOutgoing = transaction.type === 'escrow_deposit' || 
                     transaction.type === 'fee_payment' || 
                     transaction.type === 'savings_deposit'
    
    if (transaction.status === 'failed' || transaction.status === 'cancelled') {
      return 'text-red-600'
    }
    
    return isOutgoing ? 'text-red-600' : 'text-green-600'
  }

  // Transaction status badge
  const TransactionStatusBadge = ({ status }: { status: TransactionStatus }) => {
    const config = TRANSACTION_STATUS_CONFIG[status]
    const Icon = config.icon
    
    return (
      <Badge variant="outline" className={cn("gap-1", config.className)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Transaction item component
  const TransactionItem = ({ transaction, isCompact = false }: { transaction: Transaction, isCompact?: boolean }) => {
    const Icon = getTransactionIcon(transaction)
    const amountColor = getTransactionColor(transaction)
    const isOutgoing = transaction.type === 'escrow_deposit' || 
                      transaction.type === 'fee_payment' || 
                      transaction.type === 'savings_deposit'

    if (isCompact) {
      return (
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isOutgoing ? "bg-red-100" : "bg-green-100"
            )}>
              <Icon className={cn("h-4 w-4", amountColor)} />
            </div>
            <div>
              <p className="font-medium text-sm">{TRANSACTION_TYPE_LABELS[transaction.type]}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(transaction.createdAt), 'MMM d, HH:mm')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("font-semibold", amountColor)}>
              {isOutgoing ? '-' : '+'}{formatPaymentAmount(transaction.amount, transaction.currency)}
            </p>
            <TransactionStatusBadge status={transaction.status} />
          </div>
        </div>
      )
    }

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-full",
                isOutgoing ? "bg-red-100" : "bg-green-100"
              )}>
                <Icon className={cn("h-5 w-5", amountColor)} />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">{TRANSACTION_TYPE_LABELS[transaction.type]}</h4>
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>ID: {transaction.id.slice(0, 8)}...</span>
                  <span>{format(new Date(transaction.createdAt), 'MMM d, yyyy HH:mm')}</span>
                  {transaction.stripeIntentId && (
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Stripe
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <p className={cn("text-lg font-bold", amountColor)}>
                {isOutgoing ? '-' : '+'}{formatPaymentAmount(transaction.amount, transaction.currency)}
              </p>
              <TransactionStatusBadge status={transaction.status} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <p className="text-sm text-muted-foreground">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadTransactions}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      )}

      {/* Filters */}
      {showFilters && !compact && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value: TransactionStatus | 'all') => setStatusFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={(value: TransactionType | 'all') => setTypeFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="escrow_deposit">Escrow Deposit</SelectItem>
                    <SelectItem value="escrow_release">Escrow Release</SelectItem>
                    <SelectItem value="escrow_refund">Escrow Refund</SelectItem>
                    <SelectItem value="fee_payment">Service Fee</SelectItem>
                    <SelectItem value="savings_deposit">Savings Deposit</SelectItem>
                    <SelectItem value="savings_withdrawal">Savings Withdrawal</SelectItem>
                    <SelectItem value="peer_transfer">Peer Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">Loading transactions...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Empty State */}
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? "Try adjusting your search criteria or filters."
                    : "Transaction history will appear here once you make your first payment."}
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Transaction List */
            <div className={cn(
              compact ? "space-y-0" : "space-y-3",
              compact && "divide-y"
            )}>
              {filteredTransactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <TransactionItem transaction={transaction} isCompact={compact} />
                  {compact && index < filteredTransactions.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}

          {/* Show more button for compact view */}
          {compact && limit && transactions.length > limit && (
            <div className="text-center pt-4">
              <Button variant="ghost" size="sm">
                View all {transactions.length} transactions
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}