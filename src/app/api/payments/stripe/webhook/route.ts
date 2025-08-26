import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { StripeWebhook } from '@/lib/stripe'
import type { ApiResponse } from '@/lib/types'

// Type definitions for Stripe webhook events
interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, string>;
  last_payment_error?: {
    message: string;
  };
}

interface StripeDispute {
  id: string;
  charge: string;
  reason: string;
  amount: number;
  created: number;
}

interface StripeWebhookEvent {
  type: string;
  data: {
    object: StripePaymentIntent | StripeDispute;
  };
}

/**
 * POST /api/payments/stripe/webhook
 * 
 * Django mapping: POST /api/payments/stripe/webhook/
 * Headers: stripe-signature
 * Body: Raw Stripe webhook payload
 * Response: { message: string, success: boolean }
 * Auth: Webhook signature verification only
 * 
 * Handles Stripe webhook events for payment processing
 * Equivalent to Django's StripeWebhookView with event processing
 * Production: Processes payment_intent.succeeded, payment_intent.payment_failed, etc.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text()
    const headersList = await headers()
    const stripeSignature = headersList.get('stripe-signature')

    if (!stripeSignature) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing stripe-signature header'
        },
        { status: 400 }
      )
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret'

    // Verify webhook signature
    const isSignatureValid = StripeWebhook.verifySignature(
      body,
      stripeSignature,
      webhookSecret
    )

    if (!isSignatureValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid webhook signature'
        },
        { status: 401 }
      )
    }

    // Parse the webhook event
    let event: StripeWebhookEvent
    try {
      event = JSON.parse(body) as StripeWebhookEvent
    } catch (error) {
      console.error('Invalid webhook payload:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid webhook payload'
        },
        { status: 400 }
      )
    }

    // Validate event structure
    if (!event.type || !event.data || !event.data.object) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid webhook event structure'
        },
        { status: 400 }
      )
    }

    console.log(`Processing webhook event: ${event.type}`)

    // Process the webhook event based on type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as StripePaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as StripePaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as StripePaymentIntent)
        break

      case 'payment_intent.created':
        await handlePaymentCreated(event.data.object as StripePaymentIntent)
        break

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object as StripePaymentIntent)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as StripeDispute)
        break

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
        // Don't return an error for unhandled events
        break
    }

    // Always return success for properly formatted webhooks
    const response: ApiResponse<null> = {
      data: null,
      message: `Webhook event ${event.type} processed successfully`,
      success: true
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Stripe webhook processing error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Webhook processing failed'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment
 * Maps to Django: Update deal status and create transaction record
 */
async function handlePaymentSucceeded(paymentIntent: StripePaymentIntent) {
  try {
    const dealId = paymentIntent.metadata?.dealId
    const amount = paymentIntent.amount / 100 // Convert from cents

    console.log(`Payment succeeded for deal ${dealId}: ${paymentIntent.id} - $${amount}`)

    // In production:
    // 1. Update deal status to 'funded'
    // 2. Create transaction record
    // 3. Send notifications to both parties
    // 4. Update user trust scores
    // 5. Trigger any escrow release conditions

    // await Deal.findByIdAndUpdate(dealId, {
    //   status: 'funded',
    //   paymentIntentId: paymentIntent.id,
    //   fundedAt: new Date()
    // })

    // await Transaction.create({
    //   id: paymentIntent.id,
    //   dealId,
    //   type: 'escrow_deposit',
    //   amount,
    //   currency: paymentIntent.currency.toUpperCase(),
    //   status: 'completed',
    //   stripeIntentId: paymentIntent.id,
    //   description: `Escrow deposit for deal ${dealId}`,
    //   completedAt: new Date()
    // })

    // Send notifications
    // await NotificationService.sendDealFundedNotifications(dealId)

  } catch (error) {
    console.error(`Error handling payment success for ${paymentIntent.id}:`, error)
    throw error
  }
}

/**
 * Handle failed payment
 * Maps to Django: Log payment failure and notify users
 */
async function handlePaymentFailed(paymentIntent: StripePaymentIntent) {
  try {
    const dealId = paymentIntent.metadata?.dealId
    const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed'

    console.log(`Payment failed for deal ${dealId}: ${paymentIntent.id} - ${failureReason}`)

    // In production:
    // 1. Update deal status if needed
    // 2. Create failed transaction record
    // 3. Send failure notifications
    // 4. Allow retry if appropriate

    // await Transaction.create({
    //   id: paymentIntent.id,
    //   dealId,
    //   type: 'escrow_deposit',
    //   amount: paymentIntent.amount / 100,
    //   currency: paymentIntent.currency.toUpperCase(),
    //   status: 'failed',
    //   stripeIntentId: paymentIntent.id,
    //   description: `Failed escrow deposit for deal ${dealId}: ${failureReason}`,
    //   failedAt: new Date()
    // })

    // Send failure notifications
    // await NotificationService.sendPaymentFailedNotifications(dealId, failureReason)

  } catch (error) {
    console.error(`Error handling payment failure for ${paymentIntent.id}:`, error)
    throw error
  }
}

/**
 * Handle canceled payment
 * Maps to Django: Update deal status and notify users
 */
async function handlePaymentCanceled(paymentIntent: StripePaymentIntent) {
  try {
    const dealId = paymentIntent.metadata?.dealId

    console.log(`Payment canceled for deal ${dealId}: ${paymentIntent.id}`)

    // In production:
    // 1. Update deal status to reflect cancellation
    // 2. Create canceled transaction record
    // 3. Send cancellation notifications
    // 4. Handle any cleanup needed

    // await Transaction.create({
    //   id: paymentIntent.id,
    //   dealId,
    //   type: 'escrow_deposit',
    //   amount: paymentIntent.amount / 100,
    //   currency: paymentIntent.currency.toUpperCase(),
    //   status: 'cancelled',
    //   stripeIntentId: paymentIntent.id,
    //   description: `Canceled escrow deposit for deal ${dealId}`,
    //   canceledAt: new Date()
    // })

    // Send cancellation notifications
    // await NotificationService.sendPaymentCanceledNotifications(dealId)

  } catch (error) {
    console.error(`Error handling payment cancellation for ${paymentIntent.id}:`, error)
    throw error
  }
}

/**
 * Handle payment intent created
 * Maps to Django: Log payment intent creation
 */
async function handlePaymentCreated(paymentIntent: StripePaymentIntent) {
  try {
    const dealId = paymentIntent.metadata?.dealId

    console.log(`Payment intent created for deal ${dealId}: ${paymentIntent.id}`)

    // In production: Log the creation, update any necessary status
    // await Transaction.findOneAndUpdate(
    //   { stripeIntentId: paymentIntent.id },
    //   { status: 'processing' }
    // )

  } catch (error) {
    console.error(`Error handling payment creation for ${paymentIntent.id}:`, error)
    throw error
  }
}

/**
 * Handle payment requiring additional action
 * Maps to Django: Notify user of additional requirements (3D Secure, etc.)
 */
async function handlePaymentRequiresAction(paymentIntent: StripePaymentIntent) {
  try {
    const dealId = paymentIntent.metadata?.dealId

    console.log(`Payment requires action for deal ${dealId}: ${paymentIntent.id}`)

    // In production:
    // 1. Send notification to user about required action
    // 2. Update payment status to indicate action needed
    // 3. Provide instructions for completing the payment

    // await NotificationService.sendPaymentActionRequiredNotification(dealId, paymentIntent.id)

  } catch (error) {
    console.error(`Error handling payment action required for ${paymentIntent.id}:`, error)
    throw error
  }
}

/**
 * Handle charge disputes
 * Maps to Django: Create dispute record and notify admins
 */
async function handleChargeDispute(dispute: StripeDispute) {
  try {
    const chargeId = dispute.charge
    const reason = dispute.reason
    const amount = dispute.amount / 100

    console.log(`Charge dispute created for charge ${chargeId}: ${dispute.id} - ${reason}`)

    // In production:
    // 1. Create dispute record in database
    // 2. Notify deal participants and admins
    // 3. Pause any pending releases
    // 4. Gather evidence for dispute response

    // const paymentIntent = await stripe.charges.retrieve(chargeId).payment_intent
    // const dealId = paymentIntent.metadata?.dealId

    // await Dispute.create({
    //   id: dispute.id,
    //   dealId,
    //   type: 'payment_dispute',
    //   reason: reason,
    //   amount: amount,
    //   status: 'open',
    //   stripeDisputeId: dispute.id,
    //   createdAt: new Date(dispute.created * 1000)
    // })

    // await NotificationService.sendChargeDisputeNotifications(dealId, dispute.id)

  } catch (error) {
    console.error(`Error handling charge dispute for ${dispute.id}:`, error)
    throw error
  }
}

/**
 * GET /api/payments/stripe/webhook
 * 
 * Django mapping: GET /api/payments/stripe/webhook-status/
 * Response: { data: { webhookEndpoint: string, eventsReceived: number }, success: boolean }
 * Auth: Admin only
 * 
 * Returns webhook endpoint status and recent events (for admin monitoring)
 */
export async function GET(request: NextRequest) {
  try {
    // In production: Verify admin permissions
    // const user = await getCurrentUser(request)
    // if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    //   return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    // }

    const webhookStatus = {
      webhookEndpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/stripe/webhook`,
      isConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      lastEventReceived: new Date().toISOString(), // Mock data
      eventsReceivedToday: 42, // Mock data
      failedEvents: 0 // Mock data
    }

    const response: ApiResponse<typeof webhookStatus> = {
      data: webhookStatus,
      success: true
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Webhook status API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve webhook status'
      },
      { status: 500 }
    )
  }
}