'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { DocumentUpload } from './DocumentUpload'
import { KYCStatus } from './KYCStatus'

import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'
import { ApiClient } from '@/lib/api'

import type { KYCDocumentType, KYCSubmission } from '@/lib/types'
import { cn } from '@/lib/utils'

import { CalendarIcon, AlertCircle, Shield, CheckCircle, Upload, User, MapPin, FileText } from 'lucide-react'
import { format } from 'date-fns'

// KYC Form validation schema - Updated to match exact types
const kycFormSchema = yup.object({
  documentType: yup
    .string()
    .required('Please select a document type')
    .oneOf(['passport', 'drivers_license', 'national_id'] as const, 'Please select a valid document type'),
  
  documentNumber: yup
    .string()
    .required('Document number is required')
    .min(5, 'Document number must be at least 5 characters')
    .max(50, 'Document number must be less than 50 characters'),
  
  dateOfBirth: yup
    .date()
    .required('Date of birth is required')
    .max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), 'You must be at least 18 years old')
    .typeError('Please enter a valid date'),
  
  nationality: yup
    .string()
    .required('Nationality is required')
    .min(2, 'Nationality must be at least 2 characters')
    .max(100, 'Nationality must be less than 100 characters'),
  
  address: yup
    .string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be less than 500 characters'),
}).required()

// Define form data type explicitly to match schema and avoid inference issues
interface KYCFormData {
  documentType: 'passport' | 'drivers_license' | 'national_id'
  documentNumber: string
  dateOfBirth: Date
  nationality: string
  address: string
}

// Define the API response type for file uploads
interface FileUploadResponse {
  url: string
  filename?: string
}

interface KYCFormProps {
  existingSubmission?: KYCSubmission
  onSuccess?: () => void
  className?: string
}

export function KYCForm({ existingSubmission, onSuccess, className }: KYCFormProps) {
  const { user } = useAuth()
  const { addToast } = useNotificationStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentImages, setDocumentImages] = useState<File[]>([])
  const [selfieImage, setSelfieImage] = useState<File | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const form = useForm<KYCFormData>({
    resolver: yupResolver(kycFormSchema),
    defaultValues: {
      documentType: (existingSubmission?.documentType || 'passport') as KYCFormData['documentType'],
      documentNumber: existingSubmission?.documentNumber || '',
      dateOfBirth: existingSubmission?.dateOfBirth ? new Date(existingSubmission.dateOfBirth) : new Date(),
      nationality: existingSubmission?.nationality || '',
      address: existingSubmission?.address || '',
    },
  })

  // Handle document image uploads
  const handleDocumentUpload = useCallback((files: File[]) => {
    if (files.length > 3) {
      addToast({
        type: 'error',
        title: 'Too many files',
        message: 'You can upload maximum 3 document images',
        duration: 5000
      })
      return
    }
    setDocumentImages(files)
  }, [addToast])

  // Handle selfie upload
  const handleSelfieUpload = useCallback((files: File[]) => {
    if (files.length > 1) {
      addToast({
        type: 'error',
        title: 'Single file only',
        message: 'Please upload only one selfie image',
        duration: 5000
      })
      return
    }
    setSelfieImage(files[0] || null)
  }, [addToast])

  // Submit KYC form
  const onSubmit = useCallback(async (data: KYCFormData) => {
    if (documentImages.length === 0) {
      addToast({
        type: 'error',
        title: 'Documents required',
        message: 'Please upload at least one document image',
        duration: 5000
      })
      return
    }

    if (!selfieImage) {
      addToast({
        type: 'error',
        title: 'Selfie required',
        message: 'Please upload a selfie image for verification',
        duration: 5000
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload document images with proper typing
      const documentUrls: string[] = []
      for (const file of documentImages) {
        const uploadResult = await ApiClient.uploadFile<FileUploadResponse>('/upload/kyc-document', file)
        documentUrls.push(uploadResult.data.url)
      }

      // Upload selfie image with proper typing
      const selfieResult = await ApiClient.uploadFile<FileUploadResponse>('/upload/kyc-selfie', selfieImage)

      // Submit KYC data
      const kycData = {
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
        nationality: data.nationality,
        address: data.address,
        documentImages: documentUrls,
        selfieImage: selfieResult.data.url,
      }

      await ApiClient.post('/kyc/submit', kycData)

      addToast({
        type: 'success',
        title: 'KYC submitted successfully',
        message: 'Your verification documents have been submitted for review. You will be notified once the review is complete.',
        duration: 6000
      })

      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit KYC documents'
      addToast({
        type: 'error',
        title: 'Submission failed',
        message: errorMessage,
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [documentImages, selfieImage, addToast, onSuccess])

  // Check if user already has a submission
  const hasExistingSubmission = existingSubmission && existingSubmission.status !== 'not_submitted'
  const canEdit = !hasExistingSubmission || existingSubmission?.status === 'rejected'

  if (hasExistingSubmission && existingSubmission.status !== 'rejected') {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">KYC Verification Status</CardTitle>
          <CardDescription>
            Your identity verification submission status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KYCStatus submission={existingSubmission} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('w-full max-w-4xl mx-auto space-y-8', className)}>
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Identity Verification</CardTitle>
          <CardDescription>
            Complete your KYC (Know Your Customer) verification to unlock all SafeSwap features
          </CardDescription>
          
          {existingSubmission?.status === 'rejected' && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your previous submission was rejected. {existingSubmission.rejectionReason}
                Please correct the issues and resubmit your documents.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
      </Card>

      {/* KYC Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Provide your personal details as they appear on your government-issued ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Document Type */}
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                          <SelectItem value="national_id">National ID</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Document Number */}
                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter document number"
                          {...field}
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                              disabled={!canEdit}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date || new Date())
                              setShowDatePicker(false)
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nationality */}
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your nationality"
                          {...field}
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Residential Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your full residential address"
                        className="min-h-[80px] resize-none"
                        {...field}
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Upload clear photos of your government-issued ID (front and back if applicable)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DocumentUpload
            title="Government ID Photos"
            description="Upload 1-3 clear photos of your selected document"
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={3}
            maxSize={10 * 1024 * 1024} // 10MB
            onFilesChange={handleDocumentUpload}
            disabled={!canEdit}
          />

          <DocumentUpload
            title="Selfie Photo"
            description="Upload a clear selfie holding your ID next to your face"
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={1}
            maxSize={10 * 1024 * 1024} // 10MB
            onFilesChange={handleSelfieUpload}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> All documents must be valid, clear, and readable. 
          Make sure your photos are well-lit and all text is visible. Processing typically 
          takes 1-3 business days. You&apos;ll be notified via email once your verification is complete.
        </AlertDescription>
      </Alert>

      {/* Submit Button */}
      {canEdit && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setDocumentImages([])
                  setSelfieImage(null)
                }}
                disabled={isSubmitting}
              >
                Reset Form
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit for Verification
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}