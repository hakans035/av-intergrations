import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { downloadInvoicePdf } from '@/integrations/booking/lib/invoicing';

// GET: Download invoice PDF
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const supabaseAuth = await createClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createServiceClient();

    // Get invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('invoice_number, pdf_path, pdf_url, stripe_pdf_url')
      .eq('id', id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Try to get PDF from Supabase Storage first
    if (invoice.pdf_path) {
      try {
        const pdfBuffer = await downloadInvoicePdf(invoice.pdf_path);

        return new Response(new Uint8Array(pdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
          },
        });
      } catch (storageError) {
        console.error('Failed to download from storage:', storageError);
        // Fall back to Stripe URL
      }
    }

    // Try Stripe PDF URL
    if (invoice.stripe_pdf_url) {
      try {
        const response = await fetch(invoice.stripe_pdf_url);
        if (response.ok) {
          const pdfBuffer = await response.arrayBuffer();

          return new Response(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
            },
          });
        }
      } catch (stripeError) {
        console.error('Failed to download from Stripe:', stripeError);
      }
    }

    // No PDF available
    return NextResponse.json(
      { success: false, message: 'PDF not available' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Download invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
