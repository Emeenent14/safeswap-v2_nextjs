import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (content: string, files?: File[]) => Promise<void>
  dealId: string
  placeholder?: string
  maxLength?: number
  className?: string
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  dealId,
  placeholder = 'Type a message...',
  maxLength = 1000,
  className
}) => {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { sendTypingIndicator } = useWebSocket()
  const { user } = useAuth()

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [])

  // Handle content change
  const handleContentChange = useCallback((value: string) => {
    setContent(value)
    adjustTextareaHeight()

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      sendTypingIndicator(dealId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }, [adjustTextareaHeight, isTyping, sendTypingIndicator, dealId])

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!content.trim() || isSending) return

    setIsSending(true)
    
    try {
      await onSendMessage(content.trim())
      setContent('')
      setIsTyping(false)
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Reset textarea height
      setTimeout(adjustTextareaHeight, 0)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }, [content, isSending, onSendMessage, adjustTextareaHeight])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Handle paste (for future file paste support)
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items
    const files: File[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      // Add null/undefined check
      if (item && item.kind === 'file') {
        const file = item.getAsFile()
        if (file) {
          files.push(file)
        }
      }
    }

    if (files.length > 0) {
      e.preventDefault()
      // Handle pasted files (for future implementation)
      console.log('Files pasted:', files)
    }
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const remainingChars = maxLength - content.length
  const isNearLimit = remainingChars <= 50
  const isAtLimit = remainingChars <= 0

  return (
    <div className={cn('space-y-2', className)}>
      {/* Input Container */}
      <div className="relative flex items-end gap-2 p-2 border rounded-lg bg-background">
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={cn(
            'min-h-[40px] max-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0',
            'scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'
          )}
          maxLength={maxLength}
          disabled={isSending}
          rows={1}
        />

        {/* Send Button */}
        <div className="flex items-center gap-1">
          {/* Emoji Button (future implementation) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSending}
            className="h-8 w-8 p-0"
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Send Button */}
          <Button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() || isSending || isAtLimit}
            size="sm"
            className="h-8 w-8 p-0"
            title="Send message"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Character Counter */}
      {(isNearLimit || isAtLimit) && (
        <div className={cn(
          'text-xs text-right px-2',
          isAtLimit ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {remainingChars} characters remaining
        </div>
      )}

      {/* Typing Status (for debugging) */}
      {process.env.NODE_ENV === 'development' && isTyping && (
        <div className="text-xs text-muted-foreground px-2">
          Typing indicator sent...
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-muted-foreground px-2">
        Press <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">Enter</kbd> to send, 
        <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded ml-1">Shift+Enter</kbd> for new line
      </div>
    </div>
  )
}