'use client'

import React from 'react'
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  CreditCard,
  Ban
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InlineLoader } from '@/components/common/PageLoader'
import { cn } from '@/lib/utils'

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: 'destructive' | 'warning' | 'info' | 'success' | undefined
  title: string
  description: string
  confirmLabel?: string | undefined
  cancelLabel?: string | undefined
  onConfirm: () => void | Promise<void>
  isLoading?: boolean | undefined
  disabled?: boolean | undefined
  showIcon?: boolean | undefined
  children?: React.ReactNode | undefined
}

// Predefined confirmation modal configurations
interface QuickConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  isLoading?: boolean | undefined
  itemName?: string | undefined
  amount?: number | undefined
  currency?: string | undefined
}

const variantConfig = {
  destructive: {
    icon: AlertTriangle,
    iconColor: 'text-destructive',
    confirmVariant: 'destructive' as const
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-orange-500',
    confirmVariant: 'default' as const
  },
  info: {
    icon: AlertCircle,
    iconColor: 'text-blue-500',
    confirmVariant: 'default' as const
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    confirmVariant: 'default' as const
  }
}

export default function ConfirmationModal({
  open,
  onOpenChange,
  variant = 'warning',
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading = false,
  disabled = false,
  showIcon = true,
  children
}: ConfirmationModalProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      console.error('Confirmation action failed:', error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {showIcon && (
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={disabled || isLoading}
            className={cn(config.confirmVariant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
          >
            {isLoading ? (
              <InlineLoader size="sm" text={confirmLabel} />
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Pre-configured confirmation modals for common actions

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  itemName = 'this item'
}: QuickConfirmationProps) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      variant="destructive"
      title="Delete Confirmation"
      description={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={onConfirm}
      {...(isLoading !== undefined && { isLoading })}
    >
      <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
        <Trash2 className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive font-medium">
          This action is permanent and cannot be undone
        </span>
      </div>
    </ConfirmationModal>
  )
}

export function CancelDealModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  itemName
}: QuickConfirmationProps) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      variant="warning"
      title="Cancel Deal"
      description={`Are you sure you want to cancel ${itemName || 'this deal'}? Any escrow funds will be returned to the buyer.`}
      confirmLabel="Cancel Deal"
      onConfirm={onConfirm}
      {...(isLoading !== undefined && { isLoading })}
    >
      <div className="flex items-center gap-2 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <Ban className="h-4 w-4 text-orange-500" />
        <span className="text-sm text-orange-700 dark:text-orange-300">
          Cancelling will affect your trust score
        </span>
      </div>
    </ConfirmationModal>
  )
}

export function RefundEscrowModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  amount,
  currency = 'USD'
}: QuickConfirmationProps) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      variant="warning"
      title="Refund Escrow"
      description="Are you sure you want to refund the escrow amount? This will return the funds to the buyer and close the deal."
      confirmLabel="Refund"
      onConfirm={onConfirm}
      {...(isLoading !== undefined && { isLoading })}
    >
      <div className="space-y-4">
        {amount && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">Refund Amount:</span>
            <Badge variant="outline" className="text-lg">
              ${amount.toLocaleString()} {currency}
            </Badge>
          </div>
        )}
        <div className="flex items-center gap-2 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <RefreshCw className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-orange-700 dark:text-orange-300">
            Funds will be returned within 3-5 business days
          </span>
        </div>
      </div>
    </ConfirmationModal>
  )
}

export function ReleaseEscrowModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  amount,
  currency = 'USD'
}: QuickConfirmationProps) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      variant="success"
      title="Release Escrow"
      description="Are you sure you want to release the escrow funds? This will transfer the money to the seller and complete the milestone."
      confirmLabel="Release Funds"
      onConfirm={onConfirm}
      {...(isLoading !== undefined && { isLoading })}
    >
      <div className="space-y-4">
        {amount && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">Release Amount:</span>
            <Badge variant="outline" className="text-lg">
              ${amount.toLocaleString()} {currency}
            </Badge>
          </div>
        )}
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <CreditCard className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-300">
            Funds will be transferred immediately
          </span>
        </div>
      </div>
    </ConfirmationModal>
  )
}

export function RejectDealModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  itemName
}: QuickConfirmationProps) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      variant="destructive"
      title="Reject Deal"
      description={`Are you sure you want to reject ${itemName || 'this deal'}? The buyer will be notified and the deal will be closed.`}
      confirmLabel="Reject Deal"
      onConfirm={onConfirm}
      {...(isLoading !== undefined && { isLoading })}
    >
      <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
        <XCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive font-medium">
          This action cannot be undone
        </span>
      </div>
    </ConfirmationModal>
  )
}

export function LogoutConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: Omit<QuickConfirmationProps, 'itemName'>) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      variant="info"
      title="Sign Out"
      description="Are you sure you want to sign out of your SafeSwap account?"
      confirmLabel="Sign Out"
      cancelLabel="Stay Signed In"
      onConfirm={onConfirm}
      {...(isLoading !== undefined && { isLoading })}
      showIcon={false}
    />
  )
}

export function UnsavedChangesModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: Omit<QuickConfirmationProps, 'itemName'>) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      variant="warning"
      title="Unsaved Changes"
      description="You have unsaved changes. Are you sure you want to leave without saving?"
      confirmLabel="Leave Without Saving"
      cancelLabel="Stay on Page"
      onConfirm={onConfirm}
      {...(isLoading !== undefined && { isLoading })}
    >
      <div className="flex items-center gap-2 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <span className="text-sm text-orange-700 dark:text-orange-300">
          Your changes will be lost if you leave now
        </span>
      </div>
    </ConfirmationModal>
  )
}