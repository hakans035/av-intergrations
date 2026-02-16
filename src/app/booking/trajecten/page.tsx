export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase';
import type { EventType } from '@/integrations/booking/types';
import { Clock, Video, Users, MapPin, Euro, ArrowRight, Target, Rocket, UsersRound } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kies jouw Traject - Ambition Valley',
  description: 'Kies het traject dat het beste bij jouw situatie past. Financieel Fundament, Private Wealth of Ambition Wealth Circle.',
  openGraph: {
    title: 'Kies jouw Traject - Ambition Valley',
    description: 'Kies het traject dat het beste bij jouw situatie past',
  },
};

async function getPaidEventTypes(): Promise<EventType[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('is_active', true)
    .neq('slug', 'gratis-intake') // Exclude free intake
    .order('price_cents', { ascending: false });

  if (error) {
    console.error('Failed to fetch event types:', error);
    return [];
  }

  return data as EventType[];
}

function formatPrice(cents: number): string {
  if (cents === 0) return 'Op aanvraag';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

const locationLabels: Record<string, string> = {
  online: 'Online via Teams',
  on_location: 'Op locatie',
  hybrid: 'Online + Op locatie',
};

// Icons for each package type
const packageIcons: Record<string, React.ReactNode> = {
  'financieel-fundament': <Target className="w-8 h-8" />,
  'private-wealth': <Rocket className="w-8 h-8" />,
  'ambition-wealth-circle': <UsersRound className="w-8 h-8" />,
};

// Feature lists for each package
const packageFeatures: Record<string, string[]> = {
  'financieel-fundament': [
    'Diepgaand Fiscaal & Financieel consult',
    'Gericht op belastingbesparing en vermogensgroei',
    'Concreet overzicht van jouw fiscale "quick wins"',
    'Levenslange toegang tot Realtime Dashboard',
    'Toegang tot alle artikelen en strategieën',
  ],
  'private-wealth': [
    'Alles uit Financieel Fundament',
    'Exclusief 1-op-1 Masterconsult',
    'Volledige situatie doorrekenen',
    'Persoonlijk fiscaal & financieel plan',
    'Precies weten welke stappen je wanneer zet',
  ],
  'ambition-wealth-circle': [
    'Leer slimme strategieën om direct minder belasting te betalen',
    'Krijg inzicht in vermogensgroei',
    'Netwerk met gelijkgestemde ondernemers',
    'Directe toepassing op jouw situatie',
    'Levenslange toegang tot het Realtime Dashboard',
  ],
};

export default async function TrajectenPage() {
  const eventTypes = await getPaidEventTypes();

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

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <p className="text-blue-200 text-sm font-medium mb-3 tracking-wide uppercase italic">
            Trajecten
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4">
            Kies Jouw Route Naar Succes
          </h1>
          <p className="text-lg text-blue-100/70 max-w-2xl mx-auto">
            Selecteer het traject dat het beste past bij jouw financiële doelen en ambities
          </p>
        </div>

        {/* Event Types Grid */}
        {eventTypes.length === 0 ? (
          <div className="text-center py-12 animate-fade-in-up">
            <p className="text-white/60">
              Er zijn momenteel geen trajecten beschikbaar.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {eventTypes.map((eventType, index) => (
              <div
                key={eventType.id}
                className="glass rounded-3xl p-6 flex flex-col animate-fade-in-up hover:bg-white/15 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-blue-200">
                  {packageIcons[eventType.slug] || <Target className="w-8 h-8" />}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 italic">
                  {eventType.title}
                </h3>

                {/* Description */}
                <p className="text-white/60 text-sm mb-4 italic">
                  {eventType.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {(packageFeatures[eventType.slug] || []).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                      <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {(() => {
                      const bookingMin = eventType.booking_duration_minutes ?? eventType.duration_minutes;
                      return bookingMin >= 60
                        ? `${Math.floor(bookingMin / 60)} uur sessie`
                        : `${bookingMin} min sessie`;
                    })()}
                  </span>
                  <span className="flex items-center gap-1">
                    {eventType.location_type === 'online' ? (
                      <Video className="w-3.5 h-3.5" />
                    ) : eventType.location_type === 'on_location' ? (
                      <MapPin className="w-3.5 h-3.5" />
                    ) : (
                      <Video className="w-3.5 h-3.5" />
                    )}
                    {locationLabels[eventType.location_type]}
                  </span>
                  {eventType.max_attendees > 1 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Max {eventType.max_attendees}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  {eventType.price_cents === 0 ? (
                    <span className="text-white/70 text-sm">Prijs op aanvraag</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-white font-bold text-xl">
                      <Euro className="w-5 h-5" />
                      {formatPrice(eventType.price_cents)}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={`/booking/${eventType.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#1062eb] rounded-xl font-semibold hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all group"
                >
                  {eventType.slug === 'ambition-wealth-circle' ? 'Meld je aan' : 'Plan jouw onboarding'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Payment Info */}
        <div className="glass rounded-2xl p-4 border border-blue-300/20 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <p className="text-sm text-white/80 text-center">
            <strong className="text-white">Betaling:</strong> Voor betaalde sessies vragen we 50% aanbetaling bij het boeken.
            Het resterende bedrag wordt na de sessie gefactureerd.
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <Link
            href="https://ambitionvalley.nl/"
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Terug naar Ambition Valley
          </Link>
        </div>
      </div>
    </main>
  );
}
