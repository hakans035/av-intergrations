import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendInvoiceEmail, type Invoice } from '@/integrations/booking/lib/invoicing';

// POST: Resend invoice email
export async function POST(
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

    // Get invoice with booking details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        bookings (
          start_time,
          event_types (
            title
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get event details for email
    const eventTitle = invoice.bookings?.event_types?.title || invoice.description;
    const eventDate = invoice.bookings?.start_time
      ? new Date(invoice.bookings.start_time).toLocaleDateString('nl-NL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    // Send email
    await sendInvoiceEmail(invoice as unknown as Invoice, eventTitle, eventDate);

    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully',
    });
  } catch (error) {
    console.error('Resend invoice error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
