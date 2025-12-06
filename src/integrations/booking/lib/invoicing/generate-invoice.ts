/**
 * Main invoice generation logic
 * Orchestrates the complete invoice creation flow
 */

import React from 'react';
import { createServiceClient } from '@/lib/supabase';
import type { Json } from '@/lib/supabase/types';
import {
  createStripeInvoice,
  finalizeInvoice,
  getStripeInvoicePdfUrl,
  downloadStripePdf,
  getOrCreateCustomer,
} from './stripe-invoice';
import { uploadInvoicePdf, ensureBucketExists } from './storage';
import { sendEmail, InvoiceEmail, getInvoiceEmailSubject } from '@/lib/email';
import type {
  Invoice,
  InvoiceType,
  InvoiceLineItem,
  BTWBreakdown,
  InvoiceGenerationResult,
  CreateInvoiceParams,
} from './types';

// ============================================
// BTW Calculation
// ============================================

/**
 * Calculate BTW breakdown from total amount (prices include BTW)
 * Dutch BTW: total_incl_btw / 1.21 = subtotal (excl BTW)
 * BTW amount = total - subtotal
 */
export function calculateBTWBreakdown(
  totalCents: number,
  btwPercent: number = 21
): BTWBreakdown {
  // Calculate subtotal (excl. BTW)
  const subtotalCents = Math.round(totalCents / (1 + btwPercent / 100));
  const btwAmountCents = totalCents - subtotalCents;

  return {
    subtotal_cents: subtotalCents,
    btw_amount_cents: btwAmountCents,
    total_cents: totalCents,
    btw_percent: btwPercent,
  };
}

// ============================================
// Invoice Number Generation
// ============================================

/**
 * Generate a new invoice number using PostgreSQL sequence
 * Format: AV-YYYY-NNNN (e.g., AV-2025-0001)
 */
export async function generateInvoiceNumber(): Promise<string> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc('generate_invoice_number');

  if (error) {
    console.error('[Invoice] Error generating invoice number:', error);
    throw new Error(`Failed to generate invoice number: ${error.message}`);
  }

  return data as string;
}

// ============================================
// Invoice Description Helpers
// ============================================

/**
 * Get description for invoice based on type
 */
function getInvoiceDescription(
  eventTitle: string,
  invoiceType: InvoiceType
): string {
  switch (invoiceType) {
    case 'deposit':
      return `Aanbetaling - ${eventTitle}`;
    case 'balance':
      return `Restbetaling - ${eventTitle}`;
    case 'full_payment':
      return eventTitle;
    case 'refund':
      return `Creditnota - ${eventTitle}`;
    default:
      return eventTitle;
  }
}

/**
 * Get line item description based on type
 */
function getLineItemDescription(
  eventTitle: string,
  eventDate: string,
  invoiceType: InvoiceType
): string {
  const baseDescription = `${eventTitle} - ${eventDate}`;

  switch (invoiceType) {
    case 'deposit':
      return `${baseDescription} (Aanbetaling 50%)`;
    case 'balance':
      return `${baseDescription} (Restbetaling)`;
    case 'refund':
      return `${baseDescription} (Terugbetaling)`;
    default:
      return baseDescription;
  }
}

// ============================================
// Main Invoice Generation
// ============================================

/**
 * Create invoice after successful payment
 * Full flow: Stripe customer -> Stripe invoice -> Download PDF -> Upload to Supabase -> Save to DB
 */
export async function createInvoiceAfterPayment(
  params: CreateInvoiceParams
): Promise<InvoiceGenerationResult> {
  const supabase = createServiceClient();
  const {
    bookingId,
    customerId,
    paymentIntentId,
    invoiceType,
    amountPaidCents,
    customerName,
    customerEmail,
    customerPhone,
    eventTitle,
    eventDate,
  } = params;

  console.log('[Invoice] Starting invoice generation for booking:', bookingId);

  try {
    // Ensure storage bucket exists
    await ensureBucketExists();

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();
    console.log('[Invoice] Generated invoice number:', invoiceNumber);

    // Calculate BTW breakdown
    const btwBreakdown = calculateBTWBreakdown(amountPaidCents);

    // Prepare line items
    const lineItemDescription = getLineItemDescription(
      eventTitle,
      eventDate,
      invoiceType
    );

    const lineItems: InvoiceLineItem[] = [
      {
        description: lineItemDescription,
        quantity: 1,
        unit_price_cents: amountPaidCents,
        total_cents: amountPaidCents,
      },
    ];

    // Create Stripe invoice
    const stripeInvoice = await createStripeInvoice({
      customerId,
      description: getInvoiceDescription(eventTitle, invoiceType),
      lineItems: [
        {
          description: lineItemDescription,
          amount_cents: amountPaidCents,
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: bookingId,
        invoice_number: invoiceNumber,
        invoice_type: invoiceType,
      },
      paymentIntentId,
    });

    console.log('[Invoice] Created Stripe invoice:', stripeInvoice.id);

    // Finalize and mark as paid
    const finalizedInvoice = await finalizeInvoice(stripeInvoice.id);
    console.log('[Invoice] Finalized Stripe invoice');

    // Get PDF URL from Stripe
    const stripePdfUrl = await getStripeInvoicePdfUrl(finalizedInvoice.id);

    // Download and upload PDF to Supabase
    let pdfUrl: string | null = null;
    let pdfPath: string | null = null;

    if (stripePdfUrl) {
      try {
        const pdfBuffer = await downloadStripePdf(stripePdfUrl);
        const uploadResult = await uploadInvoicePdf(pdfBuffer, invoiceNumber);
        pdfUrl = uploadResult.publicUrl;
        pdfPath = uploadResult.path;
        console.log('[Invoice] Uploaded PDF to Supabase:', pdfPath);
      } catch (pdfError) {
        console.error('[Invoice] Failed to upload PDF, continuing without:', pdfError);
        // Continue without local PDF - we still have Stripe URL
      }
    }

    // Save invoice to database
    const now = new Date().toISOString();
    const { data: invoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        booking_id: bookingId,
        stripe_invoice_id: finalizedInvoice.id,
        stripe_customer_id: customerId,
        stripe_payment_intent_id: paymentIntentId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        description: getInvoiceDescription(eventTitle, invoiceType),
        currency: 'EUR',
        line_items: lineItems as unknown as Json,
        subtotal_cents: btwBreakdown.subtotal_cents,
        btw_percent: btwBreakdown.btw_percent,
        btw_amount_cents: btwBreakdown.btw_amount_cents,
        total_cents: btwBreakdown.total_cents,
        invoice_type: invoiceType,
        status: 'paid',
        pdf_url: pdfUrl,
        pdf_path: pdfPath,
        stripe_pdf_url: stripePdfUrl,
        invoice_date: now,
        paid_at: now,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Invoice] Database insert error:', insertError);
      throw new Error(`Failed to save invoice: ${insertError.message}`);
    }

    console.log('[Invoice] Invoice saved to database:', invoice.id);

    // Send invoice email
    try {
      await sendInvoiceEmail(invoice as unknown as Invoice, eventTitle, eventDate);
      console.log('[Invoice] Invoice email sent to:', customerEmail);
    } catch (emailError) {
      console.error('[Invoice] Failed to send invoice email:', emailError);
      // Don't fail invoice generation if email fails
    }

    return {
      success: true,
      invoice: invoice as unknown as Invoice,
    };
  } catch (error) {
    console.error('[Invoice] Invoice generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// Invoice Email
// ============================================

/**
 * Send invoice email to customer
 */
export async function sendInvoiceEmail(
  invoice: Invoice,
  eventTitle: string,
  eventDate: string
): Promise<void> {
  const { renderToStaticMarkup } = await import('react-dom/server');

  // Format date for display
  const invoiceDateFormatted = new Date(invoice.invoice_date).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Prepare line items for email
  const lineItemsForEmail = invoice.line_items.map((item) => ({
    description: item.description,
    amount: formatPrice(item.total_cents),
  }));

  const emailProps = {
    customerName: invoice.customer_name,
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoiceDateFormatted,
    eventTitle,
    eventDate,
    lineItems: lineItemsForEmail,
    subtotal: formatPrice(invoice.subtotal_cents),
    btwAmount: formatPrice(invoice.btw_amount_cents),
    btwPercent: invoice.btw_percent,
    total: formatPrice(invoice.total_cents),
    pdfUrl: invoice.pdf_url || invoice.stripe_pdf_url || undefined,
    invoiceType: invoice.invoice_type,
  };

  const html = `<!DOCTYPE html>${renderToStaticMarkup(React.createElement(InvoiceEmail, emailProps))}`;
  const subject = getInvoiceEmailSubject(invoice.invoice_number);

  await sendEmail({
    to: invoice.customer_email,
    subject,
    html,
  });
}

// ============================================
// Invoice Processing Entry Point
// ============================================

interface ProcessInvoiceParams {
  bookingId: string;
  paymentIntentId: string;
  invoiceType: InvoiceType;
  amountPaidCents: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventTitle: string;
  eventDate: string;
}

/**
 * Main entry point for invoice processing
 * Creates Stripe customer if needed, then generates invoice
 */
export async function processInvoiceGeneration(
  params: ProcessInvoiceParams
): Promise<InvoiceGenerationResult> {
  console.log('[Invoice] Processing invoice for payment:', params.paymentIntentId);

  try {
    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(
      params.customerEmail,
      params.customerName,
      params.customerPhone
    );

    console.log('[Invoice] Using Stripe customer:', customerId);

    // Generate the invoice
    return await createInvoiceAfterPayment({
      ...params,
      customerId,
    });
  } catch (error) {
    console.error('[Invoice] Process invoice failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// Invoice Retrieval
// ============================================

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error) {
    console.error('[Invoice] Get invoice error:', error);
    return null;
  }

  return data as unknown as Invoice;
}

/**
 * Get invoices for a booking
 */
export async function getInvoicesForBooking(bookingId: string): Promise<Invoice[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Invoice] Get booking invoices error:', error);
    return [];
  }

  return data as unknown as Invoice[];
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
