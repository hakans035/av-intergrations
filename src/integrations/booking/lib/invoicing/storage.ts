/**
 * Supabase Storage operations for invoice PDFs
 */

import { createServiceClient } from '@/lib/supabase';

const BUCKET_NAME = 'invoices';

// ============================================
// PDF Upload
// ============================================

/**
 * Upload invoice PDF to Supabase Storage
 * Path format: invoices/YYYY/AV-YYYY-NNNN.pdf
 */
export async function uploadInvoicePdf(
  pdfBuffer: Buffer,
  invoiceNumber: string
): Promise<{ path: string; publicUrl: string }> {
  const supabase = createServiceClient();

  // Extract year from invoice number (AV-2025-0001 -> 2025)
  const year = invoiceNumber.split('-')[1];
  const path = `${year}/${invoiceNumber}.pdf`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error('[Storage] Upload error:', error);
    throw new Error(`Failed to upload invoice PDF: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
  };
}

// ============================================
// PDF Download
// ============================================

/**
 * Get signed URL for invoice download (for private bucket)
 * URL expires in 1 hour by default
 */
export async function getSignedDownloadUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('[Storage] Signed URL error:', error);
    throw new Error(`Failed to get download URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Get public URL for invoice (for public bucket)
 */
export function getPublicUrl(path: string): string {
  const supabase = createServiceClient();

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Download invoice PDF from storage
 */
export async function downloadInvoicePdf(path: string): Promise<Buffer> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path);

  if (error) {
    console.error('[Storage] Download error:', error);
    throw new Error(`Failed to download invoice PDF: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ============================================
// PDF Deletion
// ============================================

/**
 * Delete invoice PDF from storage
 */
export async function deleteInvoicePdf(path: string): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('[Storage] Delete error:', error);
    throw new Error(`Failed to delete invoice PDF: ${error.message}`);
  }
}

// ============================================
// Bucket Management
// ============================================

/**
 * Ensure the invoices bucket exists
 * Call this during app initialization or first invoice creation
 */
export async function ensureBucketExists(): Promise<void> {
  const supabase = createServiceClient();

  // List buckets to check if invoices bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('[Storage] List buckets error:', listError);
    return;
  }

  const bucketExists = buckets.some((b) => b.name === BUCKET_NAME);

  if (!bucketExists) {
    // Create the bucket (public for easy access to invoices)
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true, // Make PDFs publicly accessible via URL
      fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
      allowedMimeTypes: ['application/pdf'],
    });

    if (createError) {
      console.error('[Storage] Create bucket error:', createError);
      // Bucket might already exist (race condition), continue
    } else {
      console.log('[Storage] Created invoices bucket');
    }
  }
}
