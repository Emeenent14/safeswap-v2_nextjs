'use client'

import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'
import { ApiClient } from '@/lib/api'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

import { KYCStatus } from '@/components/kyc/KYCStatus'
import { DocumentPreview } from '@/components/kyc/DocumentPreview'

import type { KYCSubmission, KYCStatus as KYCStatusType, KYCDocumentType, PaginatedResponse } from '@/lib/types'
import { cn } from '@/lib/utils'

import {
  Shield,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Calendar,
  MoreVertical,
  Loader2,
  RefreshCw,
  User
} from 'lucide-react'

interface AdminKYCStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function AdminKYCManagement() {
  const { user } = useAuth()
  const { addToast } = useNotificationStore()

  // State management
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [stats, setStats] = useState<AdminKYCStats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<KYCStatusType | 'all'>('all')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<KYCDocumentType | 'all'>('all')
  
  // Selected submission for actions
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  
  // Document preview
  const [previewDocument, setPreviewDocument] = useState<{
    url: string
    filename: string
    type: string
  } | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load KYC submissions
  const loadSubmissions = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (documentTypeFilter !== 'all') params.append('documentType', documentTypeFilter)

      const response = await ApiClient.get<PaginatedResponse<KYCSubmission>>(`/kyc?${params.toString()}`)
      
      setSubmissions(response.data.data)
      setCurrentPage(response.data.pagination.page)
      setTotalPages(response.data.pagination.totalPages)

      // Calculate stats
      const allSubmissions = response.data.data
      const newStats: AdminKYCStats = {
        total: allSubmissions.length,
        pending: allSubmissions.filter(s => s.status === 'pending').length,
        approved: allSubmissions.filter(s => s.status === 'approved').length,
        rejected: allSubmissions.filter(s => s.status === 'rejected').length
      }
      setStats(newStats)

    } catch (error) {
      addToast({
        type: 'error',
        title: 'Load failed',
        message: error instanceof Error ? error.message : 'Failed to load KYC submissions',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, statusFilter, documentTypeFilter, addToast])

  // Load data on component mount and filter changes
  useState(() => {
    loadSubmissions()
  })

  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadSubmissions(1)
  }, [loadSubmissions])

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1)
    loadSubmissions(1)
  }, [loadSubmissions])

  // Open action dialog
  const openActionDialog = useCallback((submission: KYCSubmission, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission)
    setActionType(action)
    setRejectionReason('')
    setShowActionDialog(true)
  }, [])

  // Process KYC action
  const processKYCAction = useCallback(async () => {
    if (!selectedSubmission || !actionType) return

    try {
      setIsProcessingAction(true)

      const data = actionType === 'reject' ? { rejectionReason } : {}
      
      await ApiClient.patch(`/kyc/${selectedSubmission.id}`, {
        action: actionType,
        ...data
      })

      addToast({
        type: 'success',
        title: `KYC ${actionType}d`,
        message: `Successfully ${actionType}d KYC submission for ${selectedSubmission.user.firstName} ${selectedSubmission.user.lastName}`,
        duration: 5000
      })

      // Reload submissions
      await loadSubmissions(currentPage)
      setShowActionDialog(false)
      setSelectedSubmission(null)
      setActionType(null)

    } catch (error) {
      addToast({
        type: 'error',
        title: `${actionType === 'approve' ? 'Approval' : 'Rejection'} failed`,
        message: error instanceof Error ? error.message : `Failed to ${actionType} KYC submission`,
        duration: 5000
      })
    } finally {
      setIsProcessingAction(false)
    }
  }, [selectedSubmission, actionType, rejectionReason, addToast, loadSubmissions, currentPage])

  // Format document type for display
  const formatDocumentType = useCallback((type: KYCDocumentType) => {
    const types = {
      passport: 'Passport',
      drivers_license: "Driver's License",
      national_id: 'National ID'
    }
    return types[type] || type
  }, [])

  // Status configuration
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    not_submitted: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle }
  }

  // Check admin permissions
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin permissions required to view KYC management.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            KYC Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve user identity verification submissions
          </p>
        </div>
        
        <Button onClick={() => loadSubmissions(currentPage)} disabled={isLoading}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search users or document numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <Select 
              value={statusFilter} 
              onValueChange={(value: KYCStatusType | 'all') => {
                setStatusFilter(value)
                handleFilterChange()
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={documentTypeFilter}
              onValueChange={(value: KYCDocumentType | 'all') => {
                setDocumentTypeFilter(value)
                handleFilterChange()
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                <SelectItem value="national_id">National ID</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-muted rounded-full"></div>
                      <div className="space-y-1">
                        <div className="h-4 w-32 bg-muted rounded"></div>
                        <div className="h-3 w-24 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-muted rounded"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-3 w-full bg-muted rounded"></div>
                    <div className="h-3 w-full bg-muted rounded"></div>
                    <div className="h-3 w-full bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No KYC submissions found</h3>
              <p className="text-muted-foreground mt-2">
                No submissions match your current filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const status = statusConfig[submission.status]
            const StatusIcon = status.icon

            return (
              <Card key={submission.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={submission.user.avatar} 
                          alt={`${submission.user.firstName} ${submission.user.lastName}`}
                        />
                        <AvatarFallback>
                          {submission.user.firstName[0]}{submission.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">
                          {submission.user.firstName} {submission.user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {submission.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge className={cn('px-3 py-1 flex items-center gap-1', status.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Submission Details */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Document:</span>
                      <span className="ml-2 font-medium">
                        {formatDocumentType(submission.documentType)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nationality:</span>
                      <span className="ml-2">{submission.nationality}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="ml-2">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trust Score:</span>
                      <span className="ml-2">{submission.user.trustScore}/100</span>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {submission.documentImages.map((imageUrl, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewDocument({
                            url: imageUrl,
                            filename: `Document ${index + 1}`,
                            type: 'image/jpeg'
                          })}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Doc {index + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewDocument({
                          url: submission.selfieImage,
                          filename: 'Selfie',
                          type: 'image/jpeg'
                        })}
                      >
                        <User className="mr-1 h-3 w-3" />
                        Selfie
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  {submission.status === 'pending' && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => openActionDialog(submission, 'reject')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => openActionDialog(submission, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Rejection Reason */}
                  {submission.status === 'rejected' && submission.rejectionReason && (
                    <>
                      <Separator className="my-4" />
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Rejection Reason:</strong> {submission.rejectionReason}
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => loadSubmissions(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => loadSubmissions(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} KYC Submission
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <>
                  {actionType === 'approve' 
                    ? `Approve identity verification for ${selectedSubmission.user.firstName} ${selectedSubmission.user.lastName}?`
                    : `Reject identity verification for ${selectedSubmission.user.firstName} ${selectedSubmission.user.lastName}?`
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="py-4">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea
                placeholder="Explain why this submission is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActionDialog(false)}
              disabled={isProcessingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={processKYCAction}
              disabled={isProcessingAction || (actionType === 'reject' && !rejectionReason.trim())}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isProcessingAction ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : actionType === 'approve' ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview */}
      {previewDocument && (
        <DocumentPreview
          url={previewDocument.url}
          filename={previewDocument.filename}
          fileType={previewDocument.type}
          isOpen={true}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  )
}