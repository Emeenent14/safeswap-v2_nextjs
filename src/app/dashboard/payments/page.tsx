import { Suspense } from 'react'
import type { Metadata } from 'next'

import DashboardLayout from '@/components/layout/DashboardLayout'
import  TransactionList  from '@/components/payments/TransactionList'
import  PaymentMethodCard  from '@/components/payments/PaymentMethodCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

import { 
  CreditCard, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payments - SafeSwap',
  description: 'Manage your payments, transactions, and payment methods',
  robots: 'noindex, nofollow'
}

// Loading skeleton for the payments page
function PaymentsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mt-3" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Mock payment stats (would come from API in real app)
const paymentStats = {
  totalPaid: 15750.00,
  totalReceived: 12300.00,
  pendingTransactions: 3,
  thisMonthVolume: 8500.00,
  lastMonthVolume: 7200.00
}

// Mock payment methods (would come from API in real app)
// Mock payment methods (would come from API in real app)
const paymentMethods = [
  {
    id: 'pm_1',
    type: 'card' as const,
    card: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2025
    },
    is_default: true,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'pm_2',
    type: 'card' as const,
    card: {
      brand: 'mastercard',
      last4: '8888',
      exp_month: 8,
      exp_year: 2026
    },
    is_default: false,
    created_at: '2024-02-20T14:45:00Z'
  }
]
export default function PaymentsPage() {
  const volumeChange = paymentStats.thisMonthVolume - paymentStats.lastMonthVolume
  const volumeChangePercent = ((volumeChange / paymentStats.lastMonthVolume) * 100).toFixed(1)

  return (
    <DashboardLayout title="Payments & Transactions">
      <Suspense fallback={<PaymentsPageSkeleton />}>
        <div className="space-y-6">
          {/* Payment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  ${paymentStats.totalPaid.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Outgoing payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  ${paymentStats.totalReceived.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Incoming payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <TrendingUp className={`h-4 w-4 ${volumeChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <p className="text-2xl font-bold mt-2">
                  ${paymentStats.thisMonthVolume.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${volumeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {volumeChange >= 0 ? '+' : ''}{volumeChangePercent}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Transactions Alert */}
          {paymentStats.pendingTransactions > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      {paymentStats.pendingTransactions} pending transaction{paymentStats.pendingTransactions > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Some transactions are still being processed. Check back soon for updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="payment-methods" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Methods
              </TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    View all your payment transactions, including deals, refunds, and fees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionList 
                    showFilters={true}
                    showPagination={true}
                    limit={10}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Methods Tab */}
            <TabsContent value="payment-methods" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Payment Methods</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your saved payment methods for faster checkout
                  </p>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard 
                    key={method.id} 
                    paymentMethod={method}
                    showActions={true}
                  />
                ))}
              </div>

              {paymentMethods.length === 0 && (
                <Card className="p-8">
                  <div className="text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No payment methods</h3>
                    <p className="text-muted-foreground mb-4">
                      Add a payment method to make payments faster and easier
                    </p>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Payment Method
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Suspense>
    </DashboardLayout>
  )
}