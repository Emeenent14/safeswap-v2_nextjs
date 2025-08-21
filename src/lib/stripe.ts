import { loadStripe, Stripe } from "@stripe/stripe-js";
import { StripePaymentIntent } from "./types";

/**
 * Stripe integration for SafeSwap escrow payments
 * Maps to Django: Stripe integration with webhooks and payment tracking
 * 
 * Production Django equivalent:
 * - stripe library integration
 * - Payment model for tracking transactions
 * - Webhook handlers for payment events
 * - Escrow account management
 */

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_your_stripe_publishable_key_here";

// Initialize Stripe instance (singleton pattern)
let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance
 * Maps to Django: Stripe client initialization in settings
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Payment intent creation data
 * Maps to Django: PaymentIntent serializer
 */
export interface CreatePaymentIntentData {
  dealId: string;
  amount: number; // Amount in cents
  currency: string;
  buyerEmail: string;
  sellerEmail: string;
  description: string;
  metadata?: Record<string, string>;
}

/**
 * Payment methods configuration
 * Maps to Django: Stripe payment method configuration
 */
export const PAYMENT_METHODS = {
  card: {
    enabled: true,
    name: "Credit/Debit Card",
    icon: "💳",
    description: "Visa, Mastercard, American Express, and more",
  },
  bank_transfer: {
    enabled: false, // Enable in production
    name: "Bank Transfer",
    icon: "🏦",
    description: "Direct bank transfer (ACH)",
  },
  digital_wallet: {
    enabled: false, // Enable in production
    name: "Digital Wallet", 
    icon: "📱",
    description: "Apple Pay, Google Pay, etc.",
  },
};

/**
 * Stripe client-side utilities
 */
export class StripeClient {
  private static stripe: Stripe | null = null;

  /**
   * Initialize Stripe client
   */
  static async initialize(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await getStripe();
    }
    return this.stripe;
  }

  /**
   * Create payment intent on client side
   * Maps to Django: Create payment intent API call
   */
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<StripePaymentIntent> {
    const response = await fetch("/api/payments/stripe/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create payment intent");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Confirm payment with payment method
   * Maps to Django: Payment confirmation with webhook handling
   */
  static async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string,
    returnUrl?: string
  ): Promise<{ success: boolean; error?: string; paymentIntent?: any }> {
    try {
      const stripe = await this.initialize();
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
          return_url: returnUrl || window.location.origin + "/dashboard/deals",
        }
      );

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        paymentIntent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Payment confirmation failed",
      };
    }
  }

  /**
   * Create payment method from card element
   * Maps to Django: Payment method creation for future use
   */
  static async createPaymentMethod(
    cardElement: any,
    billingDetails: {
      name: string;
      email: string;
      address?: {
        city?: string;
        country?: string;
        line1?: string;
        line2?: string;
        postal_code?: string;
        state?: string;
      };
    }
  ): Promise<{ success: boolean; paymentMethod?: any; error?: string }> {
    try {
      const stripe = await this.initialize();
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: billingDetails,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        paymentMethod,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to create payment method",
      };
    }
  }

  /**
   * Handle payment success
   * Maps to Django: Payment success webhook processing
   */
  static async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    try {
      await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ paymentIntentId }),
      });
    } catch (error) {
      console.error("Failed to confirm payment:", error);
    }
  }
}

/**
 * Stripe webhook utilities (server-side)
 */
export class StripeWebhook {
  /**
   * Verify webhook signature
   * Maps to Django: Stripe webhook signature verification
   */
  static verifySignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): boolean {
    try {
      // In production, use Stripe's webhook signature verification
      // For mock implementation, we'll return true
      return true;
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return false;
    }
  }

  /**
   * Process webhook event
   * Maps to Django: Webhook event processing with model updates
   */
  static async processEvent(event: any): Promise<void> {
    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSucceeded(event.data.object);
        break;
      
      case "payment_intent.payment_failed":
        await this.handlePaymentFailed(event.data.object);
        break;
      
      case "payment_intent.canceled":
        await this.handlePaymentCanceled(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle successful payment
   * Maps to Django: Update deal status and create transaction record
   */
  private static async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    const dealId = paymentIntent.metadata?.dealId;
    if (!dealId) {
      console.error("No dealId in payment intent metadata");
      return;
    }

    // In production, this would update the database
    console.log(`Payment succeeded for deal ${dealId}:`, paymentIntent.id);
    
    // Mock implementation - in production, update deal status
    // await Deal.objects.filter(id=dealId).update(status='active')
    // await Transaction.objects.create(...)
  }

  /**
   * Handle failed payment
   * Maps to Django: Log payment failure and notify users
   */
  private static async handlePaymentFailed(paymentIntent: any): Promise<void> {
    const dealId = paymentIntent.metadata?.dealId;
    if (!dealId) {
      console.error("No dealId in payment intent metadata");
      return;
    }

    console.log(`Payment failed for deal ${dealId}:`, paymentIntent.id);
    
    // Mock implementation - in production, handle failure
    // await Deal.objects.filter(id=dealId).update(status='payment_failed')
    // Send notification to users
  }

  /**
   * Handle canceled payment
   * Maps to Django: Update deal status and notify users
   */
  private static async handlePaymentCanceled(paymentIntent: any): Promise<void> {
    const dealId = paymentIntent.metadata?.dealId;
    if (!dealId) {
      console.error("No dealId in payment intent metadata");
      return;
    }

    console.log(`Payment canceled for deal ${dealId}:`, paymentIntent.id);
    
    // Mock implementation - in production, handle cancellation
    // await Deal.objects.filter(id=dealId).update(status='pending')
  }
}

/**
 * Currency and amount utilities
 * Maps to Django: Currency handling and formatting
 */
export const currencyUtils = {
  /**
   * Convert dollars to cents for Stripe
   */
  dollarsToStripeAmount: (dollars: number, currency: string = "USD"): number => {
    // Most currencies use 2 decimal places, some use 0 (JPY, KRW), some use 3 (BHD)
    const zeroDecimalCurrencies = ["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"];
    
    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return Math.round(dollars);
    }
    
    return Math.round(dollars * 100);
  },

  /**
   * Convert Stripe amount to dollars
   */
  stripeAmountToDollars: (stripeAmount: number, currency: string = "USD"): number => {
    const zeroDecimalCurrencies = ["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"];
    
    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return stripeAmount;
    }
    
    return stripeAmount / 100;
  },

  /**
   * Format amount for display
   */
  formatAmount: (amount: number, currency: string = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  },

  /**
   * Calculate fees for escrow service
   * Maps to Django: Fee calculation logic
   */
  calculateFees: (amount: number): {
    escrowFee: number;
    stripeFee: number;
    totalFees: number;
    netAmount: number;
  } => {
    // SafeSwap escrow fee: 2.9% + $0.30 per transaction
    const escrowFee = Math.round(amount * 0.029 * 100) / 100 + 0.30;
    
    // Stripe processing fee: 2.9% + $0.30 per transaction
    const stripeFee = Math.round(amount * 0.029 * 100) / 100 + 0.30;
    
    const totalFees = escrowFee + stripeFee;
    const netAmount = amount - totalFees;
    
    return {
      escrowFee,
      stripeFee,
      totalFees,
      netAmount: Math.max(0, netAmount),
    };
  },
};

/**
 * Mock Stripe data for development
 * Maps to Django: Test fixtures for payment testing
 */
export const MOCK_STRIPE_DATA = {
  paymentMethods: [
    {
      id: "pm_mock_visa",
      type: "card",
      card: {
        brand: "visa",
        last4: "4242",
        exp_month: 12,
        exp_year: 2025,
      },
    },
    {
      id: "pm_mock_mastercard", 
      type: "card",
      card: {
        brand: "mastercard",
        last4: "4444",
        exp_month: 8,
        exp_year: 2026,
      },
    },
  ],
  
  testCards: {
    success: "4242424242424242",
    declined: "4000000000000002",
    requiresAuth: "4000002500003155",
    insufficientFunds: "4000000000009995",
  },
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Simulate payment success for testing
   */
  simulatePaymentSuccess: async (dealId: string): Promise<void> => {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("This function is only available in development");
    }
    
    console.log(`Simulating payment success for deal ${dealId}`);
    
    // Mock webhook call
    const mockEvent = {
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: `pi_mock_${dealId}`,
          metadata: { dealId },
          amount: 10000, // $100.00
          currency: "usd",
          status: "succeeded",
        },
      },
    };
    
    await StripeWebhook.processEvent(mockEvent);
  },
  
  /**
   * Get test card numbers for different scenarios
   */
  getTestCards: () => MOCK_STRIPE_DATA.testCards,
};

export default StripeClient;