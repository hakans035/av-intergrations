/**
 * Stripe Invoice API wrapper
 * Handles invoice creation, finalization, and PDF retrieval
 */

import Stripe from 'stripe';

// ============================================
// Configuration
// ============================================

let stripeInstance: Stripe | null = null;
let btwTaxRateId: string | null = null;

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
// Tax Rate Management
// ============================================

/**
 * Get or create the 21% Dutch BTW tax rate in Stripe
 * Tax rate is created as inclusive (prices include tax)
 */
export async function getOrCreateBTWTaxRate(): Promise<string> {
  // Return cached tax rate ID if available
  if (btwTaxRateId) {
    return btwTaxRateId;
  }

  // Check if tax rate ID is provided via environment variable
  const envTaxRateId = process.env.STRIPE_BTW_TAX_RATE_ID;
  if (envTaxRateId) {
    btwTaxRateId = envTaxRateId;
    return btwTaxRateId;
  }

  const stripe = getStripe();

  // Search for existing BTW tax rate
  const existingRates = await stripe.taxRates.list({
    limit: 100,
    active: true,
  });

  const existingBTW = existingRates.data.find(
    (rate) =>
      rate.display_name === 'BTW' &&
      rate.percentage === 21 &&
      rate.inclusive === true &&
      rate.country === 'NL'
  );

  if (existingBTW) {
    btwTaxRateId = existingBTW.id;
    return btwTaxRateId;
  }

  // Create new BTW tax rate
  const taxRate = await stripe.taxRates.create({
    display_name: 'BTW',
    description: 'Nederlandse BTW 21%',
    percentage: 21,
    inclusive: true, // Prices include BTW
    country: 'NL',
  });

  btwTaxRateId = taxRate.id;
  console.log('[Invoice] Created BTW tax rate:', btwTaxRateId);

  return btwTaxRateId;
}

// ============================================
// Invoice Creation
// ============================================

interface CreateStripeInvoiceParams {
  customerId: string;
  description: string;
  lineItems: Array<{
    description: string;
    amount_cents: number;
    quantity: number;
  }>;
  metadata?: Record<string, string>;
  paymentIntentId?: string;
}

/**
 * Create a Stripe Invoice
 * Invoice is created as already paid (for receipt purposes)
 */
export async function createStripeInvoice(
  params: CreateStripeInvoiceParams
): Promise<Stripe.Invoice> {
  const stripe = getStripe();
  const { customerId, description, lineItems, metadata, paymentIntentId } = params;

  // Get BTW tax rate
  const taxRateId = await getOrCreateBTWTaxRate();

  // Create invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    description,
    collection_method: 'charge_automatically',
    auto_advance: false, // We'll manually finalize
    metadata: {
      ...metadata,
      payment_intent_id: paymentIntentId || '',
    },
    // Add custom fields for Dutch compliance
    custom_fields: [
      {
        name: 'BTW Nummer',
        value: 'NL-BTW', // Would need actual BTW number
      },
    ],
  });

  // Add line items with tax
  for (const item of lineItems) {
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      description: item.description,
      amount: item.amount_cents,
      currency: 'eur',
      quantity: item.quantity,
      tax_rates: [taxRateId],
    });
  }

  return invoice;
}

/**
 * Finalize invoice and mark as paid
 * Use this after payment is already complete
 */
export async function finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  const stripe = getStripe();

  // Finalize the invoice
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoiceId);

  // Mark as paid (since payment was already received via Checkout)
  const paidInvoice = await stripe.invoices.pay(invoiceId, {
    paid_out_of_band: true, // Payment was received outside of Stripe Invoicing
  });

  return paidInvoice;
}

/**
 * Void an invoice (for cancellations before finalization)
 */
export async function voidInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  const stripe = getStripe();
  return stripe.invoices.voidInvoice(invoiceId);
}

// ============================================
// PDF Management
// ============================================

/**
 * Get invoice PDF URL from Stripe
 * Note: URL is only available after invoice is finalized
 */
export async function getStripeInvoicePdfUrl(invoiceId: string): Promise<string | null> {
  const stripe = getStripe();
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice.invoice_pdf || null;
}

/**
 * Download invoice PDF from Stripe as Buffer
 */
export async function downloadStripePdf(pdfUrl: string): Promise<Buffer> {
  const response = await fetch(pdfUrl);

  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ============================================
// Invoice Retrieval
// ============================================

/**
 * Get a Stripe invoice by ID
 */
export async function getStripeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  const stripe = getStripe();
  return stripe.invoices.retrieve(invoiceId);
}

/**
 * List invoices for a customer
 */
export async function listCustomerInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  const stripe = getStripe();
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });
  return invoices.data;
}

// ============================================
// Customer Management (Re-exported for convenience)
// ============================================

/**
 * Get or create a Stripe customer by email
 */
export async function getOrCreateCustomer(
  email: string,
  name: string,
  phone?: string
): Promise<string> {
  const stripe = getStripe();

  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    // Update name if different
    const existing = existingCustomers.data[0];
    if (existing.name !== name) {
      await stripe.customers.update(existing.id, { name, phone });
    }
    return existing.id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    phone,
  });

  return customer.id;
}
