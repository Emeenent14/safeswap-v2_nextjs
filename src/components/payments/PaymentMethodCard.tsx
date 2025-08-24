import React from 'react'
import { CreditCard, Trash2, Edit, Check } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'digital_wallet'
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
  bank_account?: {
    bank_name: string
    account_type: string
    last4: string
  }
  digital_wallet?: {
    provider: string
    email: string
  }
  is_default: boolean
  created_at: string
}

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod
  isSelected?: boolean
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  showActions?: boolean
  className?: string
}

const CARD_BRAND_COLORS = {
  visa: 'bg-blue-600',
  mastercard: 'bg-red-600', 
  amex: 'bg-blue-800',
  discover: 'bg-orange-600',
  unknown: 'bg-gray-600'
}

const CARD_BRAND_NAMES = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express', 
  discover: 'Discover',
  unknown: 'Card'
}

export default function PaymentMethodCard({
  paymentMethod,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
  className
}: PaymentMethodCardProps) {
  
  const renderCardDetails = () => {
    if (paymentMethod.type === 'card' && paymentMethod.card) {
      const { brand, last4, exp_month, exp_year } = paymentMethod.card
      const brandColor = CARD_BRAND_COLORS[brand as keyof typeof CARD_BRAND_COLORS] || CARD_BRAND_COLORS.unknown
      const brandName = CARD_BRAND_NAMES[brand as keyof typeof CARD_BRAND_NAMES] || CARD_BRAND_NAMES.unknown

      return (
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded", brandColor)}>
            <CreditCard className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{brandName}</span>
              <span className="text-muted-foreground">•••• {last4}</span>
              {paymentMethod.is_default && (
                <Badge variant="secondary" className="text-xs">Default</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Expires {String(exp_month).padStart(2, '0')}/{exp_year}
            </p>
          </div>
        </div>
      )
    }

    if (paymentMethod.type === 'bank_account' && paymentMethod.bank_account) {
      const { bank_name, account_type, last4 } = paymentMethod.bank_account
      
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-green-600">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{bank_name}</span>
              <span className="text-muted-foreground">•••• {last4}</span>
              {paymentMethod.is_default && (
                <Badge variant="secondary" className="text-xs">Default</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {account_type} account
            </p>
          </div>
        </div>
      )
    }

    if (paymentMethod.type === 'digital_wallet' && paymentMethod.digital_wallet) {
      const { provider, email } = paymentMethod.digital_wallet
      
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-purple-600">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{provider}</span>
              {paymentMethod.is_default && (
                <Badge variant="secondary" className="text-xs">Default</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors",
        isSelected && "ring-2 ring-blue-500 bg-blue-50",
        className
      )}
      onClick={() => onSelect?.(paymentMethod.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {renderCardDetails()}
          </div>
          
          <div className="flex items-center gap-1">
            {isSelected && (
              <div className="p-1 rounded-full bg-blue-500 text-white mr-2">
                <Check className="h-3 w-3" />
              </div>
            )}
            
            {showActions && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(paymentMethod.id)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                
                {onDelete && !paymentMethod.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(paymentMethod.id)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}