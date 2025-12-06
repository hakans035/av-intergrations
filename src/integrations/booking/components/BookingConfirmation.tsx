'use client';

import { CheckCircle, Calendar, Clock, MapPin, Video, Mail, ExternalLink } from 'lucide-react';
import type { Booking, EventType } from '../types';
import { formatDate, formatTimeSlot } from '../lib/availability';
import { formatPrice } from '../lib/stripe';

interface BookingConfirmationProps {
  booking: Booking;
  eventType: EventType;
  meetingUrl?: string | null;
}

export function BookingConfirmation({
  booking,
  eventType,
  meetingUrl,
}: BookingConfirmationProps) {
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const timeSlot = {
    start: startTime,
    end: endTime,
    available: true,
  };

  // Generate Google Calendar link
  const generateCalendarLink = () => {
    const startStr = startTime.toISOString().replace(/-|:|\.\d+/g, '');
    const endStr = endTime.toISOString().replace(/-|:|\.\d+/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventType.title,
      dates: `${startStr}/${endStr}`,
      details: `Boeking bij Ambition Valley${meetingUrl ? `\n\nMeeting link: ${meetingUrl}` : ''}`,
      location: meetingUrl || eventType.location_address || '',
    });

    return `https://calendar.google.com/calendar/render?${params}`;
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-3">Boeking bevestigd!</h1>
        <p className="text-white/70">
          We hebben een bevestiging gestuurd naar {booking.customer_email}
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="glass rounded-2xl overflow-hidden mb-6">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h2 className="font-semibold text-white">{eventType.title}</h2>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-white/50 mt-0.5" />
            <div>
              <p className="font-medium text-white">
                {formatDate(startTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-white/50 mt-0.5" />
            <div>
              <p className="font-medium text-white">
                {formatTimeSlot(timeSlot)}
              </p>
              <p className="text-sm text-white/50">
                {eventType.duration_minutes} minuten
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {eventType.location_type === 'online' ? (
              <Video className="w-5 h-5 text-white/50 mt-0.5" />
            ) : (
              <MapPin className="w-5 h-5 text-white/50 mt-0.5" />
            )}
            <div>
              {eventType.location_type === 'online' ? (
                <>
                  <p className="font-medium text-white">Online via Microsoft Teams</p>
                  {meetingUrl && (
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/60 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      Deelnemen aan meeting
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </>
              ) : (
                <>
                  <p className="font-medium text-white">Op locatie</p>
                  {eventType.location_address && (
                    <p className="text-sm text-white/50">{eventType.location_address}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {booking.total_price_cents > 0 && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Totaal betaald</span>
                <span className="font-medium text-white">
                  {formatPrice(
                    booking.payment_status === 'deposit_paid'
                      ? booking.deposit_cents
                      : booking.total_price_cents
                  )}
                </span>
              </div>
              {booking.payment_status === 'deposit_paid' && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-white/60">Nog te betalen</span>
                  <span className="text-white/80">
                    {formatPrice(booking.total_price_cents - booking.deposit_cents)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <a
          href={generateCalendarLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 px-4 glass rounded-xl text-white font-medium hover:bg-white/10 transition-all"
        >
          <Calendar className="w-5 h-5" />
          Toevoegen aan Google Calendar
        </a>

        {meetingUrl && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-white text-[#1062eb] rounded-xl font-semibold hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all"
          >
            <Video className="w-5 h-5" />
            Deelnemen aan meeting
          </a>
        )}
      </div>

      {/* Email Note */}
      <div className="mt-6 glass rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-white/50 mt-0.5" />
          <div className="text-sm text-white/60">
            <p className="font-medium text-white/80 mb-1">Bevestiging per e-mail</p>
            <p>
              U ontvangt binnen enkele minuten een bevestigingsmail met alle details en
              een link om de afspraak te annuleren indien nodig.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
