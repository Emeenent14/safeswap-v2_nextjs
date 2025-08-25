import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Paperclip, Download, Image, FileText, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageInput } from './MessageInput'
import { FileUpload } from './FileUpload'
import { TypingIndicator } from './TypingIndicator'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { Message, Deal, MessageFile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MessageThreadProps {
  deal: Deal
  className?: string
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  deal,
  className
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showFileUpload, setShowFileUpload] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()
  const { addToast } = useNotifications()
  const { sendMessage, getTypingUsersForDeal, formatTypingIndicator } = useWebSocket()

  // Get typing users for this deal
  const typingUsers = getTypingUsersForDeal(deal.id)
  const typingText = formatTypingIndicator(typingUsers)

  // Fetch messages
  const fetchMessages = useCallback(async (page: number = 1) => {
    try {
      if (page === 1) {
        setIsLoading(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      const response = await fetch(`/api/deals/${deal.id}/messages?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      
      if (page === 1) {
        setMessages(data.data)
      } else {
        setMessages(prev => [...data.data, ...prev])
      }

      setHasMore(data.pagination.hasMore)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Failed to load messages',
        message: errorMessage,
        duration: 5000
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [deal.id, addToast])

  // Send message
  const handleSendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!user || (!content.trim() && !files?.length)) return

    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('dealId', deal.id)
      formData.append('senderId', user.id)

      if (files?.length) {
        files.forEach((file, index) => {
          formData.append(`files[${index}]`, file)
        })
      }

      const response = await fetch(`/api/deals/${deal.id}/messages`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const newMessage = await response.json()

      // Add to local state immediately
      setMessages(prev => [...prev, newMessage.data])

      // Send via WebSocket for real-time updates
      sendMessage({
        type: 'message',
        data: newMessage.data
      })

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      addToast({
        type: 'error',
        title: 'Failed to send message',
        message: errorMessage,
        duration: 5000
      })
    }
  }, [user, deal.id, addToast, sendMessage])

  // Download file
  const handleDownloadFile = useCallback(async (file: MessageFile) => {
    try {
      const response = await fetch(`/api/files/download/${file.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name // Changed from file.originalName to file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      addToast({
        type: 'success',
        title: 'Download started',
        message: `Downloading ${file.name}`, // Changed from file.originalName to file.name
        duration: 3000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      addToast({
        type: 'error',
        title: 'Download failed',
        message: errorMessage,
        duration: 5000
      })
    }
  }, [addToast])

  // Load more messages
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      const currentPage = Math.ceil(messages.length / 20) + 1
      fetchMessages(currentPage)
    }
  }, [hasMore, isLoadingMore, messages.length, fetchMessages])

  // Format message time
  const formatMessageTime = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    return date.toLocaleDateString()
  }, [])

  // Get file icon
  const getFileIcon = useCallback((fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-4 w-4" />
    }
    
    return <FileText className="h-4 w-4" />
  }, [])

  // Get user initials
  const getUserInitials = useCallback((firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }, [])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch initial messages
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  if (isLoading) {
    return (
      <Card className={cn('h-full flex flex-col', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn('flex gap-3', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
              {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              <div className={cn('space-y-2', i % 2 === 0 ? 'items-end' : 'items-start')}>
                <Skeleton className={cn('h-4', i % 2 === 0 ? 'w-32' : 'w-24')} />
                <Skeleton className={cn('h-12', i % 2 === 0 ? 'w-48' : 'w-40')} />
              </div>
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('h-full flex items-center justify-center', className)}>
        <CardContent className="text-center space-y-4">
          <div className="text-muted-foreground">
            Failed to load messages
          </div>
          <Button onClick={() => fetchMessages()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const otherParticipant = deal.buyerId === user?.id ? deal.seller : deal.buyer

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={otherParticipant?.avatar} />
              <AvatarFallback>
                {getUserInitials(otherParticipant?.firstName || '', otherParticipant?.lastName || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {otherParticipant?.firstName} {otherParticipant?.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {deal.title}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                View Deal Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                Export Messages
              </DropdownMenuItem>
              <DropdownMenuItem>
                Report Issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading...' : 'Load Earlier Messages'}
              </Button>
            </div>
          )}

          {/* Messages List */}
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.senderId === user?.id
              const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId
              const isRead = message.readAt !== null

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 max-w-[85%]',
                    isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  )}
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(message.sender.firstName, message.sender.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8" />
                  )}

                  {/* Message Content */}
                  <div className={cn('space-y-1', isOwn ? 'items-end' : 'items-start')}>
                    {showAvatar && (
                      <div className={cn('text-xs text-muted-foreground', isOwn ? 'text-right' : 'text-left')}>
                        {message.sender.firstName} • {formatMessageTime(message.createdAt)}
                      </div>
                    )}

                    {/* Text Message */}
                    {message.content && (
                      <div
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm break-words',
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.content}
                      </div>
                    )}

                    {/* File Attachments */}
                    {message.files?.map((file) => (
                      <div
                        key={file.id}
                        className={cn(
                          'rounded-lg border p-3 space-y-2 bg-background',
                          'max-w-sm'
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm">
                          {getFileIcon(file.name)} {/* Changed from file.originalName to file.name */}
                          <span className="truncate font-medium">{file.name}</span> {/* Changed from file.originalName to file.name */}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadFile(file)}
                            className="h-6 px-2"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Read Status */}
                    {isOwn && (
                      <div className="text-xs text-muted-foreground text-right">
                        {isRead ? 'Read' : 'Delivered'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Typing Indicator */}
            {typingText && (
              <TypingIndicator text={typingText} />
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Message Input */}
      <div className="p-4">
        <div className="flex gap-2">
          <MessageInput
            onSendMessage={handleSendMessage}
            dealId={deal.id}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFileUpload(true)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onUpload={(files) => handleSendMessage('', files)}
          onClose={() => setShowFileUpload(false)}
          maxFiles={5}
          maxSize={10 * 1024 * 1024} // 10MB
          acceptedTypes={['image/*', 'application/pdf', 'text/plain', '.doc', '.docx']}
        />
      )}
    </Card>
  )
}