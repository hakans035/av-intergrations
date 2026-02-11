'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { BookingCalendar, BookingForm } from '@/integrations/booking/components';
import type { EventType, TimeSlot, CreateBookingRequest } from '@/integrations/booking/types';

// Slugs that require form completion before booking
const FORM_REQUIRED_SLUGS = ['gratis-intake', 'gratis-groepsdag-intake'];

interface PageParams {
  slug: string;
}

export default function BookingSlugPage({ params }: { params: Promise<PageParams> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slug, setSlug] = useState<string | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get pre-filled user data from URL params (from form submission)
  const initialFormValues = {
    name: searchParams.get('name') || undefined,
    email: searchParams.get('email') || undefined,
    phone: searchParams.get('phone') || undefined,
    notes: searchParams.get('notes') || undefined,
  };

  // Resolve params
  useEffect(() => {
    params.then((p) => {
      // Redirect to form if this slug requires form completion and params are missing
      if (
        FORM_REQUIRED_SLUGS.includes(p.slug) &&
        !searchParams.get('name') &&
        !searchParams.get('email')
      ) {
        router.replace('/');
        return;
      }
      setSlug(p.slug);
    });
  }, [params, searchParams, router]);

  // Fetch event type
  useEffect(() => {
    if (!slug) return;

    async function fetchEventType() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/booking/event-types/${slug}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Evenement niet gevonden');
          return;
        }

        setEventType(data.data.eventType);
      } catch {
        setError('Er is een fout opgetreden bij het laden');
      } finally {
        setLoading(false);
      }
    }

    fetchEventType();
  }, [slug]);

  const handleSubmit = async (bookingData: CreateBookingRequest) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Er is een fout opgetreden');
        return;
      }

      // Redirect to confirmation page
      router.push(`/booking/${slug}/confirm?booking_id=${data.data.booking.id}`);
    } catch {
      setError('Er is een fout opgetreden bij het maken van de boeking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
          <Link href="/">
            <Image
              src="/av-logo-white.png"
              alt="Ambition Valley"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>
        </header>

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
              <p className="text-white/60">Laden...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !eventType) {
    return (
      <main className="bg-[#1062eb] text-white min-h-screen relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float animation-delay-200" />
        </div>

        {/* Logo */}
        <header className="absolute top-8 left-8 md:top-10 md:left-10 z-10">
          <Link href="/">
            <Image
              src="/av-logo-white.png"
              alt="Ambition Valley"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>
        </header>

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-12">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar overzicht
          </Link>
          <div className="glass rounded-2xl p-8 text-center border border-red-400/30">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!eventType) return null;

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
        <Link href="/">
          <Image
            src="/av-logo-white.png"
            alt="Ambition Valley"
            width={160}
            height={40}
            className="h-8 md:h-10 w-auto"
            priority
          />
        </Link>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-28 pb-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar overzicht
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{eventType.title}</h1>
          {eventType.description && (
            <p className="mt-2 text-white/60">{eventType.description}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 glass rounded-2xl p-4 border border-red-400/30 animate-fade-in-up">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-semibold text-white mb-4">
              Kies een datum en tijd
            </h2>
            <BookingCalendar
              eventTypeId={eventType.id}
              onSelectSlot={setSelectedSlot}
              selectedSlot={selectedSlot}
            />
          </div>

          {/* Booking Form */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {selectedSlot ? (
              <>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Uw gegevens
                </h2>
                <BookingForm
                  eventType={eventType}
                  selectedSlot={selectedSlot}
                  onSubmit={handleSubmit}
                  isLoading={submitting}
                  initialValues={initialFormValues}
                />
              </>
            ) : (
              <div className="glass rounded-2xl p-8 text-center h-full flex items-center justify-center min-h-[300px]">
                <p className="text-white/50">
                  Selecteer eerst een datum en tijd in de kalender
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
