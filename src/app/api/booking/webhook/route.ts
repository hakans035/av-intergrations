import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import {
  constructWebhookEvent,
  extractBookingMetadata,
} from '@/integrations/booking/lib/stripe';
import { createBookingWithMeeting } from '@/integrations/booking/lib/microsoft-graph';
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
        }

        console.log('[Webhook] Checkout completed for booking:', metadata.bookingId);
        break;
      }

      case 'payment_intent.succeeded': {
        const metadata = extractBookingMetadata(event);

        if (metadata.bookingId && metadata.isBalancePayment) {
          // Update to fully paid
          await supabase
            .from('bookings')
            .update({
              payment_status: 'fully_paid',
            })
            .eq('id', metadata.bookingId);

          console.log('[Webhook] Balance payment received for booking:', metadata.bookingId);
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
