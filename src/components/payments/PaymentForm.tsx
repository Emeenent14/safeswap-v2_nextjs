import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { CreditCard, Lock, AlertCircle, CheckCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { usePayments } from '@/hooks/usePayments'
import { currencyUtils, MOCK_STRIPE_DATA } from '@/lib/stripe'
import type { Deal } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PaymentFormProps {
  deal: Deal
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

const paymentSchema = yup.object({
  cardNumber: yup.string()
    .required('Card number is required')
    .min(13, 'Invalid card number')
    .max(19, 'Invalid card number'),
  expiryMonth: yup.number()
    .required('Expiry month is required')
    .min(1, 'Invalid month')
    .max(12, 'Invalid month'),
  expiryYear: yup.number()
    .required('Expiry year is required')
    .min(new Date().getFullYear(), 'Card has expired'),
  cvc: yup.string()
    .required('CVC is required')
    .min(3, 'Invalid CVC')
    .max(4, 'Invalid CVC'),
  cardholderName: yup.string()
    .required('Cardholder name is required')
    .min(2, 'Name too short'),
  email: yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  billingAddress: yup.object({
    line1: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State/Province is required'),
    postalCode: yup.string().required('Postal code is required'),
    country: yup.string().required('Country is required')
  })
})

type PaymentFormData = yup.InferType<typeof paymentSchema>

export default function PaymentForm({ deal, onSuccess, onCancel, className }: PaymentFormProps) {
  const [useTestCard, setUseTestCard] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  
  const { 
    fundEscrow, 
    isProcessing, 
    error: paymentError,
    calculateEscrowAmount,
    formatPaymentAmount 
  } = usePayments()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<PaymentFormData>({
    resolver: yupResolver(paymentSchema),
    mode: 'onChange',
    defaultValues: {
      email: deal.buyer.email,
      billingAddress: {
        country: 'US'
      }
    }
  })

  const watchedCardNumber = watch('cardNumber')
  const watchedExpiryMonth = watch('expiryMonth')
  const watchedExpiryYear = watch('expiryYear')

  // Calculate payment amounts
  const { escrowAmount, fee, total } = calculateEscrowAmount(deal.amount)
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match: string = matches && matches[0] ? matches[0] : ''
  const parts: string[] = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  return parts.length ? parts.join(' ') : v
}

  // Detect card brand
  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '')
    if (number.match(/^4/)) return 'visa'
    if (number.match(/^5[1-5]/)) return 'mastercard'
    if (number.match(/^3[47]/)) return 'amex'
    if (number.match(/^6/)) return 'discover'
    return 'unknown'
  }

  const cardBrand = getCardBrand(watchedCardNumber || '')

  // Fill test card data - renamed to avoid hook naming convention
  const fillTestCardData = (cardType: keyof typeof MOCK_STRIPE_DATA.testCards) => {
    const testCard = MOCK_STRIPE_DATA.testCards[cardType]
    setValue('cardNumber', formatCardNumber(testCard))
    setValue('expiryMonth', 12)
    setValue('expiryYear', 2025)
    setValue('cvc', '123')
    setValue('cardholderName', `${deal.buyer.firstName} ${deal.buyer.lastName}`)
    setUseTestCard(true)
  }

  // Handle form submission
  const onSubmit = async (data: PaymentFormData) => {
    setPaymentStep('processing')

    try {
      const paymentMethodData = {
        card: {
          number: data.cardNumber.replace(/\s/g, ''),
          exp_month: data.expiryMonth,
          exp_year: data.expiryYear,
          cvc: data.cvc
        },
        billing_details: {
          name: data.cardholderName,
          email: data.email,
          address: {
            line1: data.billingAddress.line1,
            city: data.billingAddress.city,
            state: data.billingAddress.state,
            postal_code: data.billingAddress.postalCode, // Changed from postalCode to postal_code
            country: data.billingAddress.country
          }
        }
      }

      const success = await fundEscrow(deal, paymentMethodData)
      
      if (success) {
        setPaymentStep('success')
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      } else {
        setPaymentStep('error')
      }
    } catch (error) {
      setPaymentStep('error')
    }
  }

  // Success state
  if (paymentStep === 'success') {
    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">
                {formatPaymentAmount(total)} has been deposited into escrow
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (paymentStep === 'error') {
    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Payment Failed</h3>
              <p className="text-sm text-muted-foreground">
                {paymentError || 'Something went wrong with your payment'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setPaymentStep('form')}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Fund Escrow
        </CardTitle>
        <CardDescription>
          Secure payment for &quot;{deal.title}&quot;
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Deal Amount:</span>
            <span>{formatPaymentAmount(deal.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Escrow Fee (2.5%):</span>
            <span>{formatPaymentAmount(fee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total to Pay:</span>
            <span>{formatPaymentAmount(total)}</span>
          </div>
        </div>

        {/* Test Card Options */}
        {process.env.NODE_ENV === 'development' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Test Cards (Development)</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillTestCardData('success')}
              >
                Success Card
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillTestCardData('declined')}
              >
                Declined Card
              </Button>
            </div>
            {useTestCard && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Using test card data. This will not process real payments.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                {...register('cardNumber')}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value)
                  setValue('cardNumber', formatted)
                }}
                className={cn(
                  "pr-12",
                  errors.cardNumber && "border-red-500"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {cardBrand === 'visa' && <Badge variant="outline" className="text-xs">VISA</Badge>}
                {cardBrand === 'mastercard' && <Badge variant="outline" className="text-xs">MC</Badge>}
                {cardBrand === 'amex' && <Badge variant="outline" className="text-xs">AMEX</Badge>}
              </div>
            </div>
            {errors.cardNumber && (
              <p className="text-xs text-red-500">{errors.cardNumber.message}</p>
            )}
          </div>

          {/* Expiry and CVC */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <Input
                id="expiryMonth"
                type="number"
                placeholder="MM"
                min="1"
                max="12"
                {...register('expiryMonth', { valueAsNumber: true })}
                className={errors.expiryMonth ? "border-red-500" : ""}
              />
              {errors.expiryMonth && (
                <p className="text-xs text-red-500">{errors.expiryMonth.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Year</Label>
              <Input
                id="expiryYear"
                type="number"
                placeholder="YYYY"
                min={new Date().getFullYear()}
                {...register('expiryYear', { valueAsNumber: true })}
                className={errors.expiryYear ? "border-red-500" : ""}
              />
              {errors.expiryYear && (
                <p className="text-xs text-red-500">{errors.expiryYear.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                maxLength={4}
                {...register('cvc')}
                className={errors.cvc ? "border-red-500" : ""}
              />
              {errors.cvc && (
                <p className="text-xs text-red-500">{errors.cvc.message}</p>
              )}
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              {...register('cardholderName')}
              className={errors.cardholderName ? "border-red-500" : ""}
            />
            {errors.cardholderName && (
              <p className="text-xs text-red-500">{errors.cardholderName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Billing Address */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Billing Address</Label>
            
            <div className="space-y-2">
              <Input
                placeholder="Street Address"
                {...register('billingAddress.line1')}
                className={errors.billingAddress?.line1 ? "border-red-500" : ""}
              />
              {errors.billingAddress?.line1 && (
                <p className="text-xs text-red-500">{errors.billingAddress.line1.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="City"
                  {...register('billingAddress.city')}
                  className={errors.billingAddress?.city ? "border-red-500" : ""}
                />
                {errors.billingAddress?.city && (
                  <p className="text-xs text-red-500">{errors.billingAddress.city.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="State/Province"
                  {...register('billingAddress.state')}
                  className={errors.billingAddress?.state ? "border-red-500" : ""}
                />
                {errors.billingAddress?.state && (
                  <p className="text-xs text-red-500">{errors.billingAddress.state.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Postal Code"
                  {...register('billingAddress.postalCode')}
                  className={errors.billingAddress?.postalCode ? "border-red-500" : ""}
                />
                {errors.billingAddress?.postalCode && (
                  <p className="text-xs text-red-500">{errors.billingAddress.postalCode.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Country"
                  {...register('billingAddress.country')}
                  className={errors.billingAddress?.country ? "border-red-500" : ""}
                />
                {errors.billingAddress?.country && (
                  <p className="text-xs text-red-500">{errors.billingAddress.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your payment information is encrypted and secure. We never store your card details.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={paymentStep === 'processing'}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={!isValid || paymentStep === 'processing'}
              className="flex-1"
            >
              {paymentStep === 'processing' ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay {formatPaymentAmount(total)}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}