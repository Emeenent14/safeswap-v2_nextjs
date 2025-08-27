import { Suspense } from 'react'
import type { Metadata } from 'next'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { KYCForm } from '@/components/kyc/KYCForm'
import { KYCStatus } from '@/components/kyc/KYCStatus'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  HelpCircle,
  ArrowRight,
  Lock,
  Star,
  Zap
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'

export const metadata: Metadata = {
  title: 'KYC Verification - SafeSwap',
  description: 'Complete your identity verification to unlock all SafeSwap features',
  robots: 'noindex, nofollow'
}

// Loading skeleton for the KYC page
function KYCPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Status card skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-2 w-full mt-4" />
        </CardContent>
      </Card>

      {/* Benefits skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <Skeleton className="h-8 w-8 rounded-full mx-auto mb-3" />
              <Skeleton className="h-5 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function KYCPage() {
  const { user } = useAuth()
  
  // Determine KYC status from user data
  const kycStatus = user?.kycStatus || 'not_submitted'
  const isVerified = user?.isVerified && kycStatus === 'approved'

  // Mock KYC submission data (would come from API in real app)
  const mockKYCSubmission = {
    id: 'kyc_123',
    userId: 'user_123',
    status: kycStatus,
    documentType: 'passport' as const,
    documentNumber: 'A12345678',
    dateOfBirth: '1990-05-15',
    nationality: 'United States',
    address: '123 Main Street, Anytown, NY 12345, United States',
    documentImages: [
      'https://example.com/passport-front.jpg',
      'https://example.com/passport-back.jpg'
    ],
    selfieImage: 'https://example.com/selfie.jpg',
    submittedAt: '2024-01-15T10:30:00Z',
    reviewedAt: '2024-01-16T14:20:00Z',
    reviewer: {
      id: 'admin_1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@safeswap.com',
      trustScore: 100,
      isVerified: true,
      kycStatus: 'approved' as const,
      role: 'admin' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    // Fix: Use undefined instead of null for rejectionReason
    rejectionReason: kycStatus === 'rejected' ? 'Document quality is poor. Please upload clearer images.' : undefined,
    // Add the required user property
    user: user || {
      id: 'user_123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
      isVerified: isVerified || false,
      kycStatus: kycStatus,
      trustScore: 75,
      role: 'user' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    }
  }

  // Mock submission based on user KYC status
  const currentSubmission = kycStatus !== 'not_submitted' ? mockKYCSubmission : null

  return (
    <DashboardLayout title="KYC Verification">
      <Suspense fallback={<KYCPageSkeleton />}>
        <div className="space-y-6">
          {/* KYC Status Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    isVerified 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : kycStatus === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/20'
                      : kycStatus === 'rejected'
                      ? 'bg-red-100 dark:bg-red-900/20'
                      : 'bg-gray-100 dark:bg-gray-900/20'
                  }`}>
                    {isVerified ? (
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : kycStatus === 'pending' ? (
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    ) : kycStatus === 'rejected' ? (
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    ) : (
                      <Shield className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {isVerified ? 'Identity Verified' : 
                       kycStatus === 'pending' ? 'Verification Pending' :
                       kycStatus === 'rejected' ? 'Verification Rejected' :
                       'Identity Verification Required'}
                    </h2>
                    <p className="text-muted-foreground">
                      {isVerified ? 'Your identity has been successfully verified' :
                       kycStatus === 'pending' ? 'Your documents are being reviewed by our team' :
                       kycStatus === 'rejected' ? 'Your submission needs corrections. Please resubmit.' :
                       'Complete KYC verification to unlock all SafeSwap features'}
                    </p>
                  </div>
                </div>
                
                <Badge 
                  variant={isVerified ? 'default' : kycStatus === 'pending' ? 'secondary' : kycStatus === 'rejected' ? 'destructive' : 'outline'}
                  className={`px-3 py-1 ${
                    isVerified ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' : ''
                  }`}
                >
                  {isVerified ? 'Verified' :
                   kycStatus === 'pending' ? 'Under Review' :
                   kycStatus === 'rejected' ? 'Rejected' :
                   'Not Verified'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Benefits of Verification (show when not verified) */}
          {!isVerified && (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Why Verify Your Identity?</h3>
                <p className="text-muted-foreground">
                  Identity verification helps build trust in the SafeSwap community and unlocks premium features.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-3">
                      <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Higher Trust Score</h4>
                    <p className="text-sm text-muted-foreground">
                      Verified users receive a significant boost to their trust score
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mx-auto mb-3">
                      <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Higher Deal Limits</h4>
                    <p className="text-sm text-muted-foreground">
                      Access to deals with higher values and premium features
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit mx-auto mb-3">
                      <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Enhanced Security</h4>
                    <p className="text-sm text-muted-foreground">
                      Additional security measures and priority customer support
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Main KYC Content */}
          {currentSubmission ? (
            <KYCStatus 
              submission={currentSubmission}
              showDetails={true}
              {...(kycStatus === 'rejected' && {
                onResubmit: () => {
                  // Handle resubmission - could navigate to form or reset status
                  window.location.reload()
                }
              })}
            />
          ) : (
            <KYCForm 
              onSuccess={() => {
                // Handle successful submission
                window.location.reload()
              }}
            />
          )}

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">How long does KYC verification take?</h4>
                <p className="text-sm text-muted-foreground">
                  Most verifications are completed within 1-3 business days. Complex cases may take up to 5 business days.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-1">What documents do I need?</h4>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll need a government-issued photo ID (passport, driver&apos;s license, or national ID) and a clear selfie holding your ID.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Is my information secure?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, all documents are encrypted and stored securely. We comply with international data protection standards.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-1">What if my verification is rejected?</h4>
                <p className="text-sm text-muted-foreground">
                  You can resubmit with corrected documents. Common issues include poor image quality or mismatched information.
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full sm:w-auto">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> For security reasons, do not share your verification documents with anyone. 
              SafeSwap staff will never ask for your documents via email or phone. All verification is done securely 
              through this platform only.
            </AlertDescription>
          </Alert>
        </div>
      </Suspense>
    </DashboardLayout>
  )
}