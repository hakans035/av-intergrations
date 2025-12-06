'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { BookingConfirmation } from '@/integrations/booking/components';
import type { Booking, EventType } from '@/integrations/booking/types';

export default function BookingConfirmPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) {
        setError('Geen boeking gevonden');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch booking details from admin API
        const response = await fetch(`/api/admin/bookings/${bookingId}`);
        const data = await response.json();

        if (!data.success) {
          // Still show success page - booking was created
          setLoading(false);
          return;
        }

        setBooking(data.data);
        setEventType(data.data.event_types);
      } catch {
        // Still show success page even if fetch fails
        // The booking was already created successfully
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <main className="bg-[#1062eb] text-white min-h-screen relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float animation-delay-200" />
        </div>

        {/* Logo */}
        <header className="absolute top-8 left-8 md:top-10 md:left-10 z-10">
          <a href="https://ambitionvalley.nl/">
            <Image
              src="/av-logo-white.png"
              alt="Ambition Valley"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </a>
        </header>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Bevestiging laden...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-[#1062eb] text-white min-h-screen relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float animation-delay-200" />
        </div>

        {/* Logo */}
        <header className="absolute top-8 left-8 md:top-10 md:left-10 z-10">
          <a href="https://ambitionvalley.nl/">
            <Image
              src="/av-logo-white.png"
              alt="Ambition Valley"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </a>
        </header>

        <div className="relative z-10 max-w-lg mx-auto px-4 pt-28 pb-12">
          <div className="glass rounded-2xl p-6 text-center border border-red-400/30 animate-fade-in-up">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 mb-4">{error}</p>
            <a
              href="https://ambitionvalley.nl/"
              className="inline-block px-6 py-3 bg-white text-[#1062eb] rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              Terug naar website
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Show success page even without full booking data
  if (!booking || !eventType) {
    return (
      <main className="bg-[#1062eb] text-white min-h-screen relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float animation-delay-200" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <header className="absolute top-8 left-8 md:top-10 md:left-10 z-10">
          <a href="https://ambitionvalley.nl/">
            <Image
              src="/av-logo-white.png"
              alt="Ambition Valley"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </a>
        </header>

        <div className="relative z-10 max-w-lg mx-auto px-4 pt-28 pb-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-3">Boeking bevestigd!</h1>
          <p className="text-white/70 mb-8">
            U ontvangt binnen enkele minuten een bevestigingsmail met alle details.
          </p>
          <a
            href="https://ambitionvalley.nl/"
            className="inline-block px-8 py-4 bg-white text-[#1062eb] rounded-xl font-semibold text-lg hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all"
          >
            Terug naar website
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#1062eb] text-white min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Logo */}
      <header className="absolute top-8 left-8 md:top-10 md:left-10 z-10">
        <a href="https://ambitionvalley.nl/">
          <Image
            src="/av-logo-white.png"
            alt="Ambition Valley"
            width={160}
            height={40}
            className="h-8 md:h-10 w-auto"
            priority
          />
        </a>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-12 animate-fade-in-up">
        <BookingConfirmation
          booking={booking}
          eventType={eventType}
          meetingUrl={booking.meeting_url}
        />

        <div className="mt-8 text-center">
          <a
            href="https://ambitionvalley.nl/"
            className="text-white/60 hover:text-white transition-colors"
          >
            Terug naar website
          </a>
        </div>
      </div>
    </main>
  );
}
