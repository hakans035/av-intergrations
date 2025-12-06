/**
 * Invoice System Exports
 */

// Types
export type {
  Invoice,
  InvoiceType,
  InvoiceStatus,
  InvoiceLineItem,
  InvoiceWithBooking,
  BTWBreakdown,
  InvoiceGenerationResult,
  CreateInvoiceParams,
} from './types';

// Main invoice generation
export {
  processInvoiceGeneration,
  createInvoiceAfterPayment,
  generateInvoiceNumber,
  calculateBTWBreakdown,
  getInvoiceById,
  getInvoicesForBooking,
  formatPrice,
  sendInvoiceEmail,
} from './generate-invoice';

// Stripe invoice operations
export {
  createStripeInvoice,
  finalizeInvoice,
  voidInvoice,
  getStripeInvoice,
  getStripeInvoicePdfUrl,
  downloadStripePdf,
  getOrCreateBTWTaxRate,
  getOrCreateCustomer,
  listCustomerInvoices,
} from './stripe-invoice';

// Storage operations
export {
  uploadInvoicePdf,
  downloadInvoicePdf,
  getSignedDownloadUrl,
  getPublicUrl,
  deleteInvoicePdf,
  ensureBucketExists,
} from './storage';
