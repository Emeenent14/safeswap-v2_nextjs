import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { fileUploadSchema } from '@/lib/validations'
import type { ApiResponse } from '@/lib/types'

/**
 * POST /api/upload
 * 
 * Django mapping: POST /api/files/upload/
 * Content-Type: multipart/form-data
 * Fields: file (File), dealId? (string), description? (string), type? ('deal'|'kyc'|'dispute'|'message')
 * Response: { data: { id: string, url: string, name: string, size: number, type: string }, success: boolean }
 * Auth: Required (JWT token in cookie)
 * 
 * Handles file uploads for deals, KYC documents, dispute evidence, and messages
 * Equivalent to Django's FileUploadView with S3/media storage integration
 * Production: File validation, virus scanning, cloud storage (S3/GCS/Azure)
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from JWT token
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const dealId = formData.get('dealId') as string || undefined
    const description = formData.get('description') as string || undefined
    const uploadType = formData.get('type') as string || 'general'

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'No file provided'
        },
        { status: 400 }
      )
    }

    // Validate file using Yup schema
    try {
      await fileUploadSchema.validate({
        file,
        description
      }, { abortEarly: false })
    } catch (validationError: unknown) {
      const isYupError = (error: unknown): error is { errors?: string[] } => {
        return typeof error === 'object' && error !== null && 'errors' in error
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'File validation failed',
          errors: isYupError(validationError) ? validationError.errors || ['Invalid file'] : ['Invalid file']
        },
        { status: 400 }
      )
    }

    // Additional file type validation based on upload type
    const allowedTypes = getAllowedFileTypes(uploadType)
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: `File type ${file.type} not allowed for ${uploadType} uploads. Allowed types: ${allowedTypes.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Check file size based on type
    const maxSize = getMaxFileSize(uploadType)
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds limit of ${maxSizeMB}MB for ${uploadType} uploads`
        },
        { status: 400 }
      )
    }

    // Generate unique file ID and secure filename
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safeFileName = `${user.id}_${timestamp}_${fileId}.${fileExtension}`

    // In production:
    // 1. Scan file for viruses
    // 2. Upload to cloud storage (S3, GCS, Azure Blob)
    // 3. Generate secure URLs with expiration
    // 4. Store file metadata in database
    // 5. Apply access controls based on upload type

    // Mock file processing
    const fileBuffer = await file.arrayBuffer()
    const fileSizeKB = Math.round(fileBuffer.byteLength / 1024)
    
    console.log(`Processing file upload: ${file.name} (${fileSizeKB}KB) for user ${user.id}`)

    // Mock cloud storage URL (in production, this would be actual cloud storage)
    const mockCloudUrl = generateMockStorageUrl(uploadType, safeFileName)

    // Create file record
    const fileRecord = {
      id: fileId,
      originalName: file.name,
      safeFileName,
      url: mockCloudUrl,
      size: file.size,
      type: file.type,
      uploadType,
      uploadedBy: user.id,
      dealId,
      description: description?.trim() || undefined,
      uploadedAt: new Date().toISOString(),
      // Security metadata
      isScanned: true, // Mock virus scan result
      scanResult: 'clean',
      accessLevel: getFileAccessLevel(uploadType)
    }

    // In production: Save to database
    // await File.create(fileRecord)

    // Update related records based on upload type
    if (uploadType === 'deal' && dealId) {
      // In production: Add file to deal's files array
      console.log(`Adding file ${fileId} to deal ${dealId}`)
    } else if (uploadType === 'kyc') {
      // In production: Update KYC submission with document
      console.log(`Adding KYC document ${fileId} for user ${user.id}`)
    } else if (uploadType === 'dispute' && dealId) {
      // In production: Add to dispute evidence
      console.log(`Adding dispute evidence ${fileId} to deal ${dealId}`)
    }

    // Return file information (excluding sensitive data)
    const response: ApiResponse<{
      id: string;
      url: string;
      name: string;
      size: number;
      type: string;
      uploadedAt: string;
    }> = {
      data: {
        id: fileRecord.id,
        url: fileRecord.url,
        name: fileRecord.originalName,
        size: fileRecord.size,
        type: fileRecord.type,
        uploadedAt: fileRecord.uploadedAt
      },
      message: `File uploaded successfully (${fileSizeKB}KB)`,
      success: true
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('File upload API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'File upload failed'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload
 * 
 * Django mapping: GET /api/files/?type=<uploadType>&deal_id=<dealId>
 * Response: { data: File[], success: boolean }
 * Auth: Required (JWT token in cookie)
 * 
 * Retrieves uploaded files for the current user with optional filtering
 * Equivalent to Django's FileListView with user and type filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT token
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const uploadType = searchParams.get('type') || undefined
    const dealId = searchParams.get('dealId') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    // In production: Query database with filters and pagination
    // const files = await File.find({
    //   uploadedBy: user.id,
    //   ...(uploadType && { uploadType }),
    //   ...(dealId && { dealId })
    // }).limit(limit).skip(offset).sort({ uploadedAt: -1 })

    // Mock file data
    const mockFiles = generateMockUserFiles(user.id, uploadType, dealId)
      .slice(offset, offset + limit)

    const response: ApiResponse<typeof mockFiles> = {
      data: mockFiles,
      success: true
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('File list API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve files'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload
 * 
 * Django mapping: DELETE /api/files/<file_id>/
 * Query: fileId (string)
 * Response: { message: string, success: boolean }
 * Auth: Required (JWT token in cookie)
 * 
 * Deletes a file uploaded by the current user
 * Equivalent to Django's FileDeleteView with ownership verification
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get current user from JWT token
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        {
          success: false,
          message: 'fileId parameter is required'
        },
        { status: 400 }
      )
    }

    // In production: 
    // 1. Verify file exists and user owns it
    // 2. Check if file is still needed (active deals, KYC, disputes)
    // 3. Delete from cloud storage
    // 4. Remove database record
    // 5. Update related records

    // const file = await File.findOne({ id: fileId, uploadedBy: user.id })
    // if (!file) {
    //   return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 })
    // }

    // Check if file can be deleted
    // if (file.uploadType === 'kyc' && user.kycStatus === 'approved') {
    //   return NextResponse.json({
    //     success: false,
    //     message: 'Cannot delete KYC documents after verification approval'
    //   }, { status: 403 })
    // }

    console.log(`Deleting file ${fileId} for user ${user.id}`)

    // Mock deletion process
    // await cloudStorage.deleteFile(file.safeFileName)
    // await File.deleteOne({ id: fileId })

    const response = {
      message: 'File deleted successfully',
      success: true
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('File deletion API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete file'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper functions for file upload processing
 */

/**
 * Get allowed file types based on upload context
 */
function getAllowedFileTypes(uploadType: string): string[] {
  const baseTypes = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'application/pdf'
  ]

  switch (uploadType) {
    case 'kyc':
      // KYC documents: images and PDFs only
      return baseTypes

    case 'dispute':
      // Dispute evidence: images, PDFs, and documents
      return [
        ...baseTypes,
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

    case 'deal':
    case 'message':
      // General uploads: all supported types
      return [
        ...baseTypes,
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

    default:
      return baseTypes
  }
}

/**
 * Get maximum file size based on upload context
 */
function getMaxFileSize(uploadType: string): number {
  switch (uploadType) {
    case 'kyc':
      return 10 * 1024 * 1024 // 10MB for KYC documents
    
    case 'dispute':
      return 25 * 1024 * 1024 // 25MB for dispute evidence
    
    case 'deal':
    case 'message':
    default:
      return 10 * 1024 * 1024 // 10MB for general uploads
  }
}

/**
 * Get file access level based on upload context
 */
function getFileAccessLevel(uploadType: string): 'private' | 'deal_participants' | 'admin_only' {
  switch (uploadType) {
    case 'kyc':
      return 'admin_only'
    
    case 'dispute':
      return 'admin_only'
    
    case 'deal':
    case 'message':
    default:
      return 'deal_participants'
  }
}

/**
 * Generate mock cloud storage URL
 */
function generateMockStorageUrl(uploadType: string, fileName: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const bucket = uploadType === 'kyc' ? 'kyc-documents' :
                 uploadType === 'dispute' ? 'dispute-evidence' : 'general-files'
  
  // In production, this would be actual cloud storage URL with signed access
  return `${baseUrl}/api/files/${bucket}/${fileName}?expires=${Date.now() + 86400000}` // 24h expiry
}

/**
 * Generate mock user files for development
 */
function generateMockUserFiles(userId: string, uploadType?: string, dealId?: string) {
  const mockFiles = [
    {
      id: 'file_1',
      originalName: 'contract_draft.pdf',
      url: generateMockStorageUrl('deal', 'contract_draft.pdf'),
      size: 245760, // ~240KB
      type: 'application/pdf',
      uploadType: 'deal',
      dealId: 'deal_1',
      uploadedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'file_2',
      originalName: 'identity_document.jpg',
      url: generateMockStorageUrl('kyc', 'identity_document.jpg'),
      size: 1572864, // ~1.5MB
      type: 'image/jpeg',
      uploadType: 'kyc',
      uploadedAt: '2024-01-10T14:20:00Z'
    },
    {
      id: 'file_3',
      originalName: 'project_screenshot.png',
      url: generateMockStorageUrl('dispute', 'project_screenshot.png'),
      size: 3145728, // ~3MB
      type: 'image/png',
      uploadType: 'dispute',
      dealId: 'deal_2',
      uploadedAt: '2024-01-20T16:45:00Z'
    }
  ]

  return mockFiles.filter(file => {
    if (uploadType && file.uploadType !== uploadType) return false
    if (dealId && file.dealId !== dealId) return false
    return true
  })
}