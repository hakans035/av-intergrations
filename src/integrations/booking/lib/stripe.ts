// Stripe Payment Integration for Booking System
// Handles checkout sessions, webhooks, and refunds

import Stripe from 'stripe';
import type { Booking, EventType, StripeCheckoutSession, StripeWebhookEvent } from '../types';

// ============================================
// Configuration
// ============================================

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeInstance;
}

// ============================================
// Price Calculations
// ============================================

/**
 * Calculate the deposit amount based on event type settings
 */
export function calculateDeposit(eventType: EventType): number {
  if (eventType.price_cents === 0) return 0;
  return Math.round((eventType.price_cents * eventType.deposit_percent) / 100);
}

/**
 * Calculate remaining balance after deposit
 */
export function calculateRemainingBalance(eventType: EventType): number {
  const deposit = calculateDeposit(eventType);
  return eventType.price_cents - deposit;
}

// ============================================
// Checkout Sessions
// ============================================

interface CreateCheckoutOptions {
  booking: Booking;
  eventType: EventType;
  successUrl: string;
  cancelUrl: string;
  depositOnly?: boolean;
}

/**
 * Create a Stripe Checkout session for booking payment
 * By default, charges the deposit amount (50% of total)
 */
export async function createCheckoutSession(
  options: CreateCheckoutOptions
): Promise<StripeCheckoutSession> {
  const stripe = getStripe();
  const { booking, eventType, successUrl, cancelUrl, depositOnly = true } = options;

  // Calculate amount to charge
  const chargeAmount = depositOnly
    ? calculateDeposit(eventType)
    : eventType.price_cents;

  if (chargeAmount === 0) {
    throw new Error('Cannot create checkout session for free event');
  }

  // Format the start time for display
  const startDate = new Date(booking.start_time);
  const formattedDate = startDate.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'ideal'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: eventType.title,
            description: `${formattedDate} om ${formattedTime}${depositOnly ? ' (Aanbetaling)' : ''}`,
          },
          unit_amount: chargeAmount,
        },
        quantity: 1,
      },
    ],
    customer_email: booking.customer_email,
    metadata: {
      booking_id: booking.id,
      event_type_id: eventType.id,
      deposit_only: depositOnly.toString(),
    },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return {
    id: session.id,
    url: session.url!,
    paymentIntentId: session.payment_intent as string,
    amount: chargeAmount,
    currency: 'eur',
  };
}

/**
 * Create checkout session for remaining balance payment
 */
export async function createBalanceCheckoutSession(
  booking: Booking,
  eventType: EventType,
  successUrl: string,
  cancelUrl: string
): Promise<StripeCheckoutSession> {
  const stripe = getStripe();

  const remainingBalance = calculateRemainingBalance(eventType);

  if (remainingBalance <= 0) {
    throw new Error('No remaining balance to pay');
  }

  const startDate = new Date(booking.start_time);
  const formattedDate = startDate.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'ideal'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${eventType.title} - Restbetaling`,
            description: `Restbetaling voor sessie op ${formattedDate}`,
          },
          unit_amount: remainingBalance,
        },
        quantity: 1,
      },
    ],
    customer_email: booking.customer_email,
    metadata: {
      booking_id: booking.id,
      event_type_id: eventType.id,
      is_balance_payment: 'true',
    },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
  });

  return {
    id: session.id,
    url: session.url!,
    paymentIntentId: session.payment_intent as string,
    amount: remainingBalance,
    currency: 'eur',
  };
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

// ============================================
// Webhook Handling
// ============================================

/**
 * Verify and parse Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Extract booking metadata from webhook event
 */
export function extractBookingMetadata(event: Stripe.Event): {
  bookingId: string | null;
  eventTypeId: string | null;
  isDeposit: boolean;
  isBalancePayment: boolean;
} {
  const data = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
  const metadata = data.metadata || {};

  return {
    bookingId: metadata.booking_id || null,
    eventTypeId: metadata.event_type_id || null,
    isDeposit: metadata.deposit_only === 'true',
    isBalancePayment: metadata.is_balance_payment === 'true',
  };
}

/**
 * Convert Stripe event to simplified webhook event type
 */
export function parseWebhookEvent(event: Stripe.Event): StripeWebhookEvent {
  const data = event.data.object as { id: string; metadata?: Record<string, string>; amount?: number; status?: string };

  return {
    type: event.type,
    data: {
      object: {
        id: data.id,
        metadata: data.metadata,
        amount: data.amount,
        status: data.status,
      },
    },
  };
}

// ============================================
// Refunds
// ============================================

interface RefundOptions {
  paymentIntentId: string;
  amount?: number; // If not specified, refunds full amount
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

/**
 * Create a refund for a payment
 */
export async function createRefund(options: RefundOptions): Promise<{
  id: string;
  amount: number;
  status: string;
}> {
  const stripe = getStripe();
  const { paymentIntentId, amount, reason = 'requested_by_customer' } = options;

  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason,
  };

  if (amount) {
    refundParams.amount = amount;
  }

  const refund = await stripe.refunds.create(refundParams);

  return {
    id: refund.id,
    amount: refund.amount,
    status: refund.status ?? 'pending',
  };
}

/**
 * Create partial refund (e.g., deposit only)
 */
export async function createPartialRefund(
  paymentIntentId: string,
  amountCents: number
): Promise<{
  id: string;
  amount: number;
  status: string;
}> {
  return createRefund({
    paymentIntentId,
    amount: amountCents,
    reason: 'requested_by_customer',
  });
}

// ============================================
// Payment Intent Management
// ============================================

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Check if payment was successful
 */
export async function isPaymentSuccessful(paymentIntentId: string): Promise<boolean> {
  const paymentIntent = await getPaymentIntent(paymentIntentId);
  return paymentIntent.status === 'succeeded';
}

// ============================================
// Customer Management
// ============================================

/**
 * Get or create a Stripe customer by email
 */
export async function getOrCreateCustomer(
  email: string,
  name: string
): Promise<string> {
  const stripe = getStripe();

  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer.id;
}

// ============================================
// Price Formatting
// ============================================

/**
 * Format cents to EUR display string
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

/**
 * Format price breakdown for display
 */
export function getPriceBreakdown(eventType: EventType): {
  total: string;
  deposit: string;
  remaining: string;
  depositPercent: number;
  isFree: boolean;
} {
  const deposit = calculateDeposit(eventType);
  const remaining = calculateRemainingBalance(eventType);

  return {
    total: formatPrice(eventType.price_cents),
    deposit: formatPrice(deposit),
    remaining: formatPrice(remaining),
    depositPercent: eventType.deposit_percent,
    isFree: eventType.price_cents === 0,
  };
}
