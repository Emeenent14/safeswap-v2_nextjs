import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { currencyUtils, CreatePaymentIntentData } from '@/lib/stripe'
import type { ApiResponse, StripePaymentIntent } from '@/lib/types'

/**
 * POST /api/payments/stripe/create-intent
 * 
 * Django mapping: POST /api/payments/stripe/create-intent/
 * Schema: { dealId: string, amount: number, currency: string, buyerEmail: string, sellerEmail: string, description: string, metadata?: object }
 * Response: { data: StripePaymentIntent, message: string, success: boolean }
 * Auth: Required (JWT token in cookie)
 * 
 * Creates a Stripe Payment Intent for escrow deposit
 * Equivalent to Django's CreatePaymentIntentView with Stripe SDK integration
 * Production: stripe.PaymentIntent.create() with webhook handling
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from JWT token
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const { dealId, amount, currency = 'USD', buyerEmail, sellerEmail, description, metadata = {} } = body

    if (!dealId || !amount || !buyerEmail || !sellerEmail || !description) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: dealId, amount, buyerEmail, sellerEmail, description'
        },
        { status: 400 }
      )
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid amount. Must be a positive number'
        },
        { status: 400 }
      )
    }

    if (amount < 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'Minimum deal amount is $10'
        },
        { status: 400 }
      )
    }

    if (amount > 1000000) {
      return NextResponse.json(
        {
          success: false,
          message: 'Maximum deal amount is $1,000,000'
        },
        { status: 400 }
      )
    }

    // Validate currency
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD']
    if (!supportedCurrencies.includes(currency.toUpperCase())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unsupported currency. Supported currencies: USD, EUR, GBP, CAD'
        },
        { status: 400 }
      )
    }

    // Calculate fees
    const feeCalculation = currencyUtils.calculateFees(amount)
    const totalAmount = amount + feeCalculation.totalFees

    // Convert to Stripe amount (cents)
    const stripeAmount = currencyUtils.dollarsToStripeAmount(totalAmount, currency)

    // In production: 
    // 1. Verify deal exists and user is buyer
    // 2. Check deal status allows payment
    // 3. Create Stripe Payment Intent with proper metadata
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: stripeAmount,
    //   currency: currency.toLowerCase(),
    //   metadata: { dealId, userId: user.id, ...metadata },
    //   description,
    //   automatic_payment_methods: { enabled: true }
    // })

    // Mock Stripe Payment Intent response
    const mockPaymentIntent: StripePaymentIntent = {
      id: `pi_mock_${dealId}_${Date.now()}`,
      amount: stripeAmount,
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      clientSecret: `pi_mock_${dealId}_${Date.now()}_secret_mock`
    }

    // In production: Store payment intent in database
    // await Transaction.create({
    //   id: mockPaymentIntent.id,
    //   dealId,
    //   userId: user.id,
    //   type: 'escrow_deposit',
    //   amount: totalAmount,
    //   currency,
    //   status: 'pending',
    //   stripeIntentId: mockPaymentIntent.id,
    //   description
    // })

    const response: ApiResponse<StripePaymentIntent> = {
      data: mockPaymentIntent,
      message: `Payment intent created successfully. Total amount: ${currencyUtils.formatAmount(totalAmount, currency)} (includes ${currencyUtils.formatAmount(feeCalculation.totalFees, currency)} in fees)`,
      success: true
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Create payment intent API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create payment intent'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/stripe/create-intent
 * 
 * Django mapping: GET /api/payments/stripe/payment-intents/?deal_id=<dealId>
 * Response: { data: StripePaymentIntent[], success: boolean }
 * Auth: Required (JWT token in cookie)
 * 
 * Retrieves payment intents for a specific deal (for status checking)
 * Equivalent to Django's PaymentIntentListView with deal filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT token
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get('dealId')

    if (!dealId) {
      return NextResponse.json(
        {
          success: false,
          message: 'dealId parameter is required'
        },
        { status: 400 }
      )
    }

    // In production: 
    // 1. Verify user has access to this deal
    // 2. Fetch payment intents from database
    // const paymentIntents = await Transaction.find({
    //   dealId,
    //   type: 'escrow_deposit',
    //   $or: [{ userId: user.id }, { /* user is deal participant */ }]
    // })

    // Mock payment intent data
    const mockPaymentIntents: StripePaymentIntent[] = [
      {
        id: `pi_mock_${dealId}_${Date.now() - 3600000}`,
        amount: currencyUtils.dollarsToStripeAmount(1000, 'USD'),
        currency: 'usd',
        status: 'succeeded',
        clientSecret: `pi_mock_${dealId}_secret_completed`
      }
    ]

    const response: ApiResponse<StripePaymentIntent[]> = {
      data: mockPaymentIntents,
      success: true
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Get payment intents API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve payment intents'
      },
      { status: 500 }
    )
  }
}