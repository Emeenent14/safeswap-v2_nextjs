import React from 'react'
import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  text: string
  className?: string
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  text,
  className
}) => {
  if (!text) return null

  return (
    <div className={cn('flex items-center gap-3 max-w-[85%] mr-auto', className)}>
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      
      {/* Typing bubble */}
      <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{text}</span>
        
        {/* Typing dots animation */}
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}