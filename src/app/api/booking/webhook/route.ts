import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import {
  constructWebhookEvent,
  extractBookingMetadata,
  calculateDeposit,
} from '@/integrations/booking/lib/stripe';
import { createBookingWithMeeting } from '@/integrations/booking/lib/microsoft-graph';
import { sendBookingEmails } from '@/lib/email/workflows';
import { processInvoiceGeneration } from '@/integrations/booking/lib/invoicing';
import type { EventType, Booking } from '@/integrations/booking/types';

// POST: Handle Stripe webhooks
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const metadata = extractBookingMetadata(event);

        if (!metadata.bookingId) {
          console.log('[Webhook] No booking ID in checkout session');
          break;
        }

        // Get the booking
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('*, event_types(*)')
          .eq('id', metadata.bookingId)
          .single();

        if (bookingError || !booking) {
          console.error('[Webhook] Booking not found:', metadata.bookingId);
          break;
        }

        // Skip if already processed
        if (booking.status === 'confirmed' && booking.payment_status !== 'pending') {
          console.log('[Webhook] Booking already processed');
          break;
        }

        const eventType = booking.event_types as EventType;
        const paymentStatus = metadata.isDeposit ? 'deposit_paid' : 'fully_paid';
        const bookingStatus = eventType.requires_approval ? 'pending' : 'confirmed';

        // Update booking
        const { data: updatedBooking, error: updateError } = await supabase
          .from('bookings')
          .update({
            payment_status: paymentStatus,
            status: bookingStatus,
            stripe_payment_intent_id: (event.data.object as { payment_intent?: string }).payment_intent || null,
          })
          .eq('id', metadata.bookingId)
          .select()
          .single();

        if (updateError) {
          console.error('[Webhook] Failed to update booking:', updateError);
          break;
        }

        // Create calendar event if confirmed
        if (bookingStatus === 'confirmed') {
          try {
            const { calendarEvent, meetingUrl } = await createBookingWithMeeting(
              updatedBooking as Booking,
              eventType
            );

            await supabase
              .from('bookings')
              .update({
                meeting_url: meetingUrl,
                meeting_id: calendarEvent.id,
              })
              .eq('id', metadata.bookingId);

            console.log('[Webhook] Calendar event created for booking:', metadata.bookingId);
          } catch (calendarError) {
            console.error('[Webhook] Failed to create calendar event:', calendarError);
          }

          // Send booking confirmation emails
          try {
            await sendBookingEmails(metadata.bookingId, 'booking_confirmed');
            console.log('[Webhook] Booking confirmation emails triggered for:', metadata.bookingId);
          } catch (emailError) {
            console.error('[Webhook] Failed to send booking emails:', emailError);
          }
        }

        // Generate invoice for paid bookings
        if (eventType.price_cents > 0) {
          try {
            const paymentIntentId = (event.data.object as { payment_intent?: string }).payment_intent;
            const amountPaid = metadata.isDeposit
              ? calculateDeposit(eventType)
              : eventType.price_cents;

            // Format event date for invoice
            const eventDate = new Date(booking.start_time).toLocaleDateString('nl-NL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const invoiceResult = await processInvoiceGeneration({
              bookingId: metadata.bookingId,
              paymentIntentId: paymentIntentId || '',
              invoiceType: metadata.isDeposit ? 'deposit' : 'full_payment',
              amountPaidCents: amountPaid,
              customerName: booking.customer_name,
              customerEmail: booking.customer_email,
              customerPhone: booking.customer_phone ?? undefined,
              eventTitle: eventType.title,
              eventDate,
            });

            if (invoiceResult.success) {
              console.log('[Webhook] Invoice generated:', invoiceResult.invoice?.invoice_number);
            } else {
              console.error('[Webhook] Invoice generation failed:', invoiceResult.error);
            }
          } catch (invoiceError) {
            console.error('[Webhook] Failed to generate invoice:', invoiceError);
            // Don't fail the webhook - invoice generation is non-critical
          }
        }

        console.log('[Webhook] Checkout completed for booking:', metadata.bookingId);
        break;
      }

      case 'payment_intent.succeeded': {
        const metadata = extractBookingMetadata(event);

        if (metadata.bookingId && metadata.isBalancePayment) {
          // Get booking details for invoice
          const { data: booking } = await supabase
            .from('bookings')
            .select('*, event_types(*)')
            .eq('id', metadata.bookingId)
            .single();

          // Update to fully paid
          await supabase
            .from('bookings')
            .update({
              payment_status: 'fully_paid',
            })
            .eq('id', metadata.bookingId);

          console.log('[Webhook] Balance payment received for booking:', metadata.bookingId);

          // Generate balance invoice
          if (booking && booking.event_types) {
            try {
              const eventType = booking.event_types as EventType;
              const paymentIntent = event.data.object as { id: string; amount: number };
              const balanceAmount = paymentIntent.amount;

              const eventDate = new Date(booking.start_time).toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const invoiceResult = await processInvoiceGeneration({
                bookingId: metadata.bookingId,
                paymentIntentId: paymentIntent.id,
                invoiceType: 'balance',
                amountPaidCents: balanceAmount,
                customerName: booking.customer_name,
                customerEmail: booking.customer_email,
                customerPhone: booking.customer_phone ?? undefined,
                eventTitle: eventType.title,
                eventDate,
              });

              if (invoiceResult.success) {
                console.log('[Webhook] Balance invoice generated:', invoiceResult.invoice?.invoice_number);
              }
            } catch (invoiceError) {
              console.error('[Webhook] Failed to generate balance invoice:', invoiceError);
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const metadata = extractBookingMetadata(event);

        if (metadata.bookingId) {
          await supabase
            .from('bookings')
            .update({
              payment_status: 'failed',
            })
            .eq('id', metadata.bookingId);

          console.log('[Webhook] Payment failed for booking:', metadata.bookingId);
        }
        break;
      }

      case 'charge.refunded': {
        // Handle refund notifications
        console.log('[Webhook] Refund processed');
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook handler error' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
