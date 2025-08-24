import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { DealStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DealStatusBadgeProps {
  status: DealStatus
  className?: string
}

const statusConfig: Record<DealStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
}> = {
  created: {
    label: 'Created',
    variant: 'outline',
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  accepted: {
    label: 'Accepted',
    variant: 'default',
    className: 'bg-green-50 text-green-700 border-green-200'
  },
  funded: {
    label: 'Funded',
    variant: 'default',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  in_progress: {
    label: 'In Progress',
    variant: 'default',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  },
  milestone_completed: {
    label: 'Milestone Complete',
    variant: 'default',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    className: 'bg-green-50 text-green-700 border-green-200'
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'secondary',
    className: 'bg-gray-50 text-gray-700 border-gray-200'
  },
  disputed: {
    label: 'Disputed',
    variant: 'destructive',
    className: 'bg-red-50 text-red-700 border-red-200'
  },
  refunded: {
    label: 'Refunded',
    variant: 'outline',
    className: 'bg-orange-50 text-orange-700 border-orange-200'
  }
}

export default function DealStatusBadge({ status, className }: DealStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'text-xs font-medium px-2 py-1',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}