import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  onClose: () => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  className?: string
}

interface FileWithProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  onClose,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', 'text/plain', '.doc', '.docx'],
  className
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithProgress[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useNotifications()

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Get file icon
  const getFileIcon = useCallback((fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-blue-500" />
    }
    
    return <FileText className="h-5 w-5 text-gray-500" />
  }, [])

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`
    }

    // Check file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()
    
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type)
      }
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', '/'))
      }
      return fileType === type
    })

    if (!isAccepted) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }

    return null
  }, [maxSize, formatFileSize, acceptedTypes])

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList) => {
    const newFiles: FileWithProgress[] = []
    const errors: string[] = []

    // Check total file count
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Add null check for file
      if (!file) continue

      // Check if file already selected
      if (selectedFiles.some(f => f.file.name === file.name && f.file.size === file.size)) {
        errors.push(`${file.name} is already selected`)
        continue
      }

      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
        continue
      }

      newFiles.push({
        file,
        progress: 0,
        status: 'pending'
      })
    }

    if (errors.length > 0) {
      setError(errors.join('. '))
      addToast({
        type: 'error',
        title: 'File validation failed',
        message: errors[0]!, // Non-null assertion since errors.length > 0
        duration: 5000
      })
    } else {
      setError(null)
    }

    setSelectedFiles(prev => [...prev, ...newFiles])
  }, [selectedFiles, maxFiles, validateFile, addToast])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
    // Reset input value to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect])

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // Remove file
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setError(null)
  }, [])

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || isUploading) return

    setIsUploading(true)
    setError(null)

    try {
      // Update all files to uploading status
      setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })))

      // Simulate progress for demo
      const progressInterval = setInterval(() => {
        setSelectedFiles(prev => prev.map(f => {
          if (f.status === 'uploading' && f.progress < 90) {
            return { ...f, progress: f.progress + 10 }
          }
          return f
        }))
      }, 200)

      // Call the upload handler
      const files = selectedFiles.map(f => f.file)
      await onUpload(files)

      // Complete the progress
      clearInterval(progressInterval)
      setSelectedFiles(prev => prev.map(f => ({ 
        ...f, 
        progress: 100, 
        status: 'completed' as const 
      })))

      addToast({
        type: 'success',
        title: 'Files uploaded',
        message: `${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`,
        duration: 3000
      })

      // Close after a brief delay
      setTimeout(onClose, 1000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setSelectedFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const,
        error: errorMessage
      })))

      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: errorMessage, // errorMessage is guaranteed to be a string
        duration: 5000
      })
    } finally {
      setIsUploading(false)
    }
  }, [selectedFiles, isUploading, onUpload, onClose, addToast])

  // Clear all files
  const clearAllFiles = useCallback(() => {
    setSelectedFiles([])
    setError(null)
  }, [])

  const hasFiles = selectedFiles.length > 0
  const allCompleted = selectedFiles.every(f => f.status === 'completed')
  const hasErrors = selectedFiles.some(f => f.status === 'error')

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={cn('max-w-2xl max-h-[80vh] overflow-hidden', className)}>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <div className="text-lg font-medium">
                Drag and drop files here
              </div>
              <div className="text-sm text-muted-foreground">
                or{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Maximum {maxFiles} files • {formatFileSize(maxSize)} per file
              </div>
              <div className="text-xs text-muted-foreground">
                Supported: {acceptedTypes.join(', ')}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Selected Files List */}
          {hasFiles && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllFiles}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedFiles.map((fileWithProgress, index) => (
                  <div
                    key={`${fileWithProgress.file.name}-${index}`}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {getFileIcon(fileWithProgress.file.name)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">
                          {fileWithProgress.file.name}
                        </span>
                        <Badge 
                          variant={
                            fileWithProgress.status === 'completed' ? 'default' :
                            fileWithProgress.status === 'error' ? 'destructive' :
                            fileWithProgress.status === 'uploading' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {fileWithProgress.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(fileWithProgress.file.size)}
                      </div>
                      
                      {/* Progress Bar */}
                      {fileWithProgress.status === 'uploading' && (
                        <Progress 
                          value={fileWithProgress.progress} 
                          className="w-full h-2 mt-2" 
                        />
                      )}

                      {/* Error Message */}
                      {fileWithProgress.status === 'error' && fileWithProgress.error && (
                        <div className="text-xs text-destructive mt-1">
                          {fileWithProgress.error}
                        </div>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {fileWithProgress.status === 'completed' ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : fileWithProgress.status === 'error' ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : fileWithProgress.status === 'uploading' ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!hasFiles || isUploading || allCompleted}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Uploading...
              </>
            ) : allCompleted ? (
              'Completed'
            ) : (
              `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}