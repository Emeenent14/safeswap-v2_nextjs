'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

import {
  Upload,
  X,
  File,
  Image,
  AlertCircle,
  CheckCircle,
  FileImage,
  Eye
} from 'lucide-react'

interface DocumentUploadProps {
  title: string
  description: string
  acceptedTypes: string[]
  maxFiles: number
  maxSize: number // in bytes
  onFilesChange: (files: File[]) => void
  disabled?: boolean
  className?: string
}

interface FileWithPreview extends File {
  preview?: string
  uploadProgress?: number
  error?: string | null
}

export function DocumentUpload({
  title,
  description,
  acceptedTypes,
  maxFiles,
  maxSize,
  onFilesChange,
  disabled = false,
  className
}: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file type and size
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload: ${acceptedTypes.map(type => {
        if (!type) return 'unknown'
        const parts = type.split('/')
        return parts[1] ? parts[1] : type
      }).join(', ')}`
    }
    
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
    }
    
    return null
  }, [acceptedTypes, maxSize])

  // Create file preview
  const createFilePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        resolve('')
      }
    })
  }, [])

  // Process selected files
  const processFiles = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles)
    
    if (files.length + fileArray.length > maxFiles) {
      setUploadError(`You can only upload up to ${maxFiles} file${maxFiles > 1 ? 's' : ''}`)
      return
    }
    
    const validFiles: FileWithPreview[] = []
    const errors: string[] = []
    
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
        continue
      }
      
      const preview = await createFilePreview(file)
      const fileWithPreview: FileWithPreview = Object.assign(file, {
        preview,
        uploadProgress: 0,
        error: null as string | null
      })
      
      validFiles.push(fileWithPreview)
    }
    
    if (errors.length > 0) {
      setUploadError(errors.join('\n'))
    } else {
      setUploadError(null)
    }
    
    if (validFiles.length > 0) {
      const newFiles = [...files, ...validFiles]
      setFiles(newFiles)
      onFilesChange(newFiles)
    }
  }, [files, maxFiles, validateFile, createFilePreview, onFilesChange])

  // Handle file selection
  const handleFileSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])

  // Handle drag and drop
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(false)
    }
  }, [disabled])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    if (!disabled) {
      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles)
      }
    }
  }, [disabled, processFiles])

  // Remove file
  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange(newFiles)
    setUploadError(null)
  }, [files, onFilesChange])

  // Open file selector
  const openFileSelector = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Get accepted file types for display
  const getAcceptedTypesText = useCallback(() => {
    return acceptedTypes
      .map(type => {
        if (!type) return 'UNKNOWN'
        const parts = type.split('/')
        return parts[1] ? parts[1].toUpperCase() : type.toUpperCase()
      })
      .join(', ')
  }, [acceptedTypes])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Header */}
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors',
          isDragOver && !disabled && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-primary/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className={cn(
              'mx-auto mb-4 p-3 rounded-full',
              isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              <Upload className="h-6 w-6" />
            </div>
            
            <h4 className="text-lg font-medium mb-2">
              {isDragOver ? 'Drop files here' : 'Upload files'}
            </h4>
            
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to browse
            </p>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Accepted formats: {getAcceptedTypesText()}</p>
              <p>Maximum file size: {formatFileSize(maxSize)}</p>
              <p>Maximum files: {maxFiles}</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={openFileSelector}
              disabled={disabled}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Error Alert */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">
            {uploadError}
          </AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <Card key={`${file.name}-${index}`} className="p-3">
                <div className="flex items-center gap-3">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        {file.type && file.type.startsWith('image/') ? (
                          <FileImage className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <File className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {(() => {
                        if (!file.type) return 'UNKNOWN'
                        const parts = file.type.split('/')
                        return parts[1] ? parts[1].toUpperCase() : file.type.toUpperCase()
                      })()}
                    </p>
                    
                    {/* Upload Progress */}
                    {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                      <div className="mt-2">
                        <Progress value={file.uploadProgress} className="h-1" />
                      </div>
                    )}
                    
                    {/* File Error */}
                    {file.error && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {file.preview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Open preview in new window/modal
                          window.open(file.preview, '_blank')
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}