'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';

interface PageParams {
  id: string;
}

interface BookingDetails {
  id: string;
  customer_name: string;
  customer_email: string;
  start_time: string;
  status: string;
  event_types?: {
    title: string;
  };
}

export default function CancelBookingPage({ params }: { params: Promise<PageParams> }) {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  // Resolve params
  useEffect(() => {
    params.then((p) => setBookingId(p.id));
  }, [params]);

  // Fetch booking details
  useEffect(() => {
    if (!bookingId) return;

    async function fetchBooking() {
      setLoading(true);
      try {
        // In a real app, you'd have a public endpoint to view booking details
        // For now, we'll show a simplified view
        if (bookingId) {
          setBooking({
            id: bookingId,
            customer_name: '',
            customer_email: '',
            start_time: '',
            status: 'pending',
          });
        }
      } catch {
        setError('Boeking niet gevonden');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    if (!bookingId) return;

    setCancelling(true);
    setError(null);

    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          reason: reason.trim() || undefined,
          refund: true,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Er is een fout opgetreden');
        return;
      }

      setCancelled(true);
    } catch {
      setError('Er is een fout opgetreden bij het annuleren');
    } finally {
      setCancelling(false);
    }
  };

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

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Laden...</p>
          </div>
        </div>
      </main>
    );
  }

  if (cancelled) {
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

        <div className="relative z-10 max-w-lg mx-auto px-4 pt-28 pb-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-3">Boeking geannuleerd</h1>
          <p className="text-white/70 mb-8">
            Uw boeking is succesvol geannuleerd. Als u al betaald heeft, wordt het bedrag
            binnen 5-10 werkdagen teruggestort.
          </p>
          <Link
            href="/booking"
            className="inline-block px-8 py-4 bg-white text-[#1062eb] rounded-xl font-semibold text-lg hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all"
          >
            Nieuwe afspraak boeken
          </Link>
        </div>
      </main>
    );
  }

  if (error && !booking) {
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

        <div className="relative z-10 max-w-lg mx-auto px-4 pt-28 pb-12">
          <div className="glass rounded-2xl p-6 text-center border border-red-400/30 animate-fade-in-up">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 mb-4">{error}</p>
            <Link
              href="/booking"
              className="inline-block px-6 py-3 bg-white text-[#1062eb] rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              Terug naar boeken
            </Link>
          </div>
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

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-28 pb-12">
        <div className="glass rounded-2xl overflow-hidden animate-fade-in-up">
          <div className="p-4 border-b border-red-400/20 bg-red-500/10">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <h1 className="text-lg font-semibold text-white">
                Boeking annuleren
              </h1>
            </div>
          </div>

          <div className="p-6">
            <p className="text-white/70 mb-6">
              Weet u zeker dat u deze boeking wilt annuleren? Als u al betaald heeft,
              wordt het bedrag automatisch teruggestort.
            </p>

            {error && (
              <div className="mb-4 glass rounded-xl p-3 border border-red-400/30">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Reden voor annulering (optioneel)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-transparent border-b-2 border-white/20 focus:border-white/60 transition-all duration-200 text-white placeholder-white/40 focus:outline-none resize-none"
                placeholder="Laat ons weten waarom u annuleert..."
                disabled={cancelling}
              />
            </div>

            <div className="flex gap-3">
              <Link
                href="/booking"
                className="flex-1 py-3 px-4 text-center glass rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                Terug
              </Link>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className={`
                  flex-1 py-3 px-4 rounded-xl font-semibold transition-all
                  ${cancelling
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                  }
                `}
              >
                {cancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Annuleren...
                  </span>
                ) : (
                  'Bevestig annulering'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
