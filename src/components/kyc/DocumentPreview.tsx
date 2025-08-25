'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface DocumentPreviewProps {
  url: string
  filename: string
  fileType: string
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function DocumentPreview({
  url,
  filename,
  fileType,
  isOpen,
  onClose,
  className
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Reset view state when modal opens/closes
  const resetView = useCallback(() => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setIsLoading(true)
    setHasError(false)
  }, [])

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.2))
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Handle rotation
  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
  }, [])

  // Handle image drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }, [zoom, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, dragStart, zoom])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle download
  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [url, filename])

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  // Determine if file is previewable
  const isImage = fileType.startsWith('image/')
  const isPDF = fileType === 'application/pdf'
  const isPreviewable = isImage || isPDF

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent 
        className={cn(
          'max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden',
          className
        )}
        onOpenAutoFocus={resetView}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              {isImage ? (
                <ImageIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <FileText className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">
                {filename}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {fileType.toUpperCase()} • {isPreviewable ? 'Preview Available' : 'Download to View'}
              </p>
            </div>
          </div>

          {/* Controls */}
          {isPreviewable && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.2}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-mono px-2 min-w-[4rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 5}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                disabled={zoom === 1 && position.x === 0 && position.y === 0}
              >
                <Move className="h-4 w-4" />
              </Button>
              
              {isImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden bg-muted/30">
          {isPreviewable ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading preview...
                </div>
              )}

              {/* Error State */}
              {hasError && (
                <Card className="max-w-md">
                  <CardContent className="pt-6">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load preview. You can still download the file to view it.
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={handleDownload}
                      className="w-full mt-4"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Image Preview */}
              {isImage && !hasError && (
                <div
                  className={cn(
                    'relative overflow-hidden rounded-lg shadow-lg max-w-full max-h-full',
                    zoom > 1 && 'cursor-move'
                  )}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                  }}
                >
                  <img
                    src={url}
                    alt={filename}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                    style={{
                      maxHeight: 'calc(90vh - 120px)',
                      maxWidth: 'calc(100vw - 100px)'
                    }}
                  />
                </div>
              )}

              {/* PDF Preview */}
              {isPDF && !hasError && (
                <div className="w-full h-full">
                  <iframe
                    src={url}
                    className="w-full h-full border-0"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    title={`PDF Preview: ${filename}`}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Non-previewable files */
            <div className="w-full h-full flex items-center justify-center p-8">
              <Card className="max-w-md text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
                  <p className="text-muted-foreground mb-4">
                    This file type cannot be previewed in the browser. 
                    Download the file to view it in an appropriate application.
                  </p>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Filename:</strong> {filename}</p>
                    <p><strong>Type:</strong> {fileType}</p>
                  </div>
                  
                  <Button 
                    onClick={handleDownload}
                    className="w-full mt-6"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer with zoom/drag hints */}
        {isImage && !hasError && (
          <div className="px-6 py-3 border-t bg-muted/50">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Use mouse wheel to zoom</span>
                {zoom > 1 && <span>Click and drag to pan</span>}
              </div>
              <div className="flex items-center gap-4">
                <span>Rotation: {rotation}°</span>
                <span>Position: {Math.round(position.x)}, {Math.round(position.y)}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}