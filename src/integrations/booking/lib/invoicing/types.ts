/**
 * Invoice system types
 */

// Invoice line item
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

// Invoice type - what kind of payment this invoice represents
export type InvoiceType = 'deposit' | 'balance' | 'full_payment' | 'refund';

// Invoice status
export type InvoiceStatus = 'draft' | 'paid' | 'voided' | 'refunded';

// Main Invoice interface (matches database schema)
export interface Invoice {
  id: string;
  invoice_number: string;
  booking_id: string | null;

  // Stripe references
  stripe_invoice_id: string | null;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;

  // Customer info
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;

  // Invoice details
  description: string;
  currency: string;
  line_items: InvoiceLineItem[];

  // Amount breakdown
  subtotal_cents: number;
  btw_percent: number;
  btw_amount_cents: number;
  total_cents: number;

  // Type and status
  invoice_type: InvoiceType;
  status: InvoiceStatus;

  // PDF storage
  pdf_url: string | null;
  pdf_path: string | null;
  stripe_pdf_url: string | null;

  // Timestamps
  invoice_date: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// Create invoice params (used when generating invoice after payment)
export interface CreateInvoiceParams {
  bookingId: string;
  customerId: string;
  paymentIntentId: string;
  invoiceType: InvoiceType;
  amountPaidCents: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventTitle: string;
  eventDate: string;
}

// Invoice with booking info (for admin list)
export interface InvoiceWithBooking extends Invoice {
  bookings?: {
    id: string;
    start_time: string;
    event_types: {
      title: string;
      slug: string;
    } | null;
  } | null;
}

// BTW calculation result
export interface BTWBreakdown {
  subtotal_cents: number;
  btw_amount_cents: number;
  total_cents: number;
  btw_percent: number;
}

// Invoice generation result
export interface InvoiceGenerationResult {
  success: boolean;
  invoice?: Invoice;
  error?: string;
}
