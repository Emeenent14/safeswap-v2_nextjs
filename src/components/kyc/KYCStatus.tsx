'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

import type { KYCSubmission, KYCStatus as KYCStatusType } from '@/lib/types'
import { cn } from '@/lib/utils'

import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Calendar,
  MapPin,
  Eye,
  RefreshCw,
  Shield,
  Camera
} from 'lucide-react'

interface KYCStatusProps {
  submission: KYCSubmission
  showDetails?: boolean
  onResubmit?: () => void
  className?: string
}

// Status configuration
const statusConfig = {
  not_submitted: {
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
    icon: FileText,
    title: 'Not Submitted',
    description: 'Complete your KYC verification to access all features',
    progress: 0
  },
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700',
    icon: Clock,
    title: 'Under Review',
    description: 'Your documents are being reviewed by our team',
    progress: 50
  },
  approved: {
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
    icon: CheckCircle,
    title: 'Approved',
    description: 'Your identity has been successfully verified',
    progress: 100
  },
  rejected: {
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700',
    icon: XCircle,
    title: 'Rejected',
    description: 'Your submission requires corrections. Please resubmit.',
    progress: 25
  }
}

export function KYCStatus({
  submission,
  showDetails = true,
  onResubmit,
  className
}: KYCStatusProps) {
  const status = statusConfig[submission.status]
  const StatusIcon = status.icon

  // Format document type for display
  const formatDocumentType = (type: string) => {
    const types = {
      passport: 'Passport',
      drivers_license: "Driver's License",
      national_id: 'National ID'
    }
    return types[type as keyof typeof types] || type
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-full',
                submission.status === 'approved' && 'bg-green-100 dark:bg-green-900/20',
                submission.status === 'pending' && 'bg-yellow-100 dark:bg-yellow-900/20',
                submission.status === 'rejected' && 'bg-red-100 dark:bg-red-900/20',
                submission.status === 'not_submitted' && 'bg-gray-100 dark:bg-gray-900/20'
              )}>
                <StatusIcon className={cn(
                  'h-6 w-6',
                  submission.status === 'approved' && 'text-green-600 dark:text-green-400',
                  submission.status === 'pending' && 'text-yellow-600 dark:text-yellow-400',
                  submission.status === 'rejected' && 'text-red-600 dark:text-red-400',
                  submission.status === 'not_submitted' && 'text-gray-600 dark:text-gray-400'
                )} />
              </div>
              <div>
                <CardTitle className="text-xl">{status.title}</CardTitle>
                <CardDescription className="mt-1">
                  {status.description}
                </CardDescription>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn('px-3 py-1', status.color)}
            >
              {status.title}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Verification Progress</span>
              <span className="font-medium">{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>

          {/* Status-specific content */}
          {submission.status === 'pending' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your documents are currently under review. This process typically takes 1-3 business days. 
                We&apos;ll notify you via email once the review is complete.
              </AlertDescription>
            </Alert>
          )}

          {submission.status === 'approved' && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-300">
                Congratulations! Your identity has been verified. You now have access to all SafeSwap features.
                Verified on {formatDate(submission.reviewedAt || submission.submittedAt)}.
              </AlertDescription>
            </Alert>
          )}

          {submission.status === 'rejected' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Your submission was rejected:</p>
                  <p>{submission.rejectionReason || 'Please ensure all documents are clear, valid, and match the information provided.'}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Submission Details */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Document Type:</span>
                  <span className="ml-2 font-medium">
                    {formatDocumentType(submission.documentType)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Document Number:</span>
                  <span className="ml-2 font-mono">
                    {submission.documentNumber.replace(/./g, '*').slice(0, -4) + submission.documentNumber.slice(-4)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="ml-2">{new Date(submission.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nationality:</span>
                  <span className="ml-2">{submission.nationality}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="text-sm mt-1">{submission.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Document Images */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Uploaded Documents
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {submission.documentImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg border bg-muted overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`Document ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:text-white hover:bg-white/20"
                          onClick={() => window.open(imageUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Document {index + 1}
                    </p>
                  </div>
                ))}
                
                {/* Selfie Image */}
                <div className="relative group">
                  <div className="aspect-square rounded-lg border bg-muted overflow-hidden">
                    <img
                      src={submission.selfieImage}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:text-white hover:bg-white/20"
                        onClick={() => window.open(submission.selfieImage, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Selfie
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span>{formatDate(submission.submittedAt)}</span>
                </div>
                
                {submission.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {submission.status === 'approved' ? 'Approved:' : 'Reviewed:'}
                    </span>
                    <span>{formatDate(submission.reviewedAt)}</span>
                  </div>
                )}
                
                {submission.reviewer && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reviewed by:</span>
                    <span>{submission.reviewer.firstName} {submission.reviewer.lastName}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {submission.status === 'rejected' && onResubmit && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={onResubmit} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Resubmit Documents
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:support@safeswap.com">
                  Contact Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {submission.status === 'approved' && (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Identity Verified</p>
                  <p className="text-sm text-muted-foreground">
                    You can now access all SafeSwap features
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}