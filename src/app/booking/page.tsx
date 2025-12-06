import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase';
import type { EventType } from '@/integrations/booking/types';
import { Clock, Video, MapPin, Users, ArrowRight, CheckCircle } from 'lucide-react';

interface BookingPageProps {
  searchParams: Promise<{ name?: string; email?: string; phone?: string; notes?: string }>;
}

export const metadata: Metadata = {
  title: 'Plan jouw Gratis Kennismaking - Ambition Valley',
  description: 'Plan direct een gratis kennismakingsgesprek met Ambition Valley. Kies tussen een 1-op-1 intake of een groepsdag.',
  openGraph: {
    title: 'Plan jouw Gratis Kennismaking - Ambition Valley',
    description: 'Plan direct een gratis kennismakingsgesprek met Ambition Valley',
  },
};

async function getIntakeEventTypes(): Promise<{ intake: EventType | null; groepsdag: EventType | null }> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .in('slug', ['gratis-intake', 'ambition-wealth-circle'])
    .eq('is_active', true);

  if (error) {
    console.error('Failed to fetch event types:', error);
    return { intake: null, groepsdag: null };
  }

  const intake = data?.find(e => e.slug === 'gratis-intake') as EventType | undefined;
  const groepsdag = data?.find(e => e.slug === 'ambition-wealth-circle') as EventType | undefined;

  return { intake: intake || null, groepsdag: groepsdag || null };
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const { intake, groepsdag } = await getIntakeEventTypes();
  const params = await searchParams;

  // Build URL with user data from form submission
  const buildBookingUrl = (slug: string) => {
    const url = new URL(`/booking/${slug}`, 'http://localhost');
    if (params.name) url.searchParams.set('name', params.name);
    if (params.email) url.searchParams.set('email', params.email);
    if (params.phone) url.searchParams.set('phone', params.phone);
    if (params.notes) url.searchParams.set('notes', params.notes);
    return url.pathname + url.search;
  };

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
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-12">
        {/* Success Message - Only show when coming from form */}
        {params.name && (
          <div className="glass rounded-2xl p-6 mb-8 border border-green-400/30 bg-green-500/10 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  Bedankt{params.name ? `, ${params.name.split(' ')[0]}` : ''}!
                </h2>
                <p className="text-white/70">
                  Je komt in aanmerking voor een gratis intake gesprek. Plan hieronder direct een moment dat jou uitkomt.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: params.name ? '100ms' : '0ms' }}>
          <p className="text-blue-200 text-sm font-medium mb-3 tracking-wide uppercase">
            Kennismakingsgesprek
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4">
            {params.name ? 'Kies je voorkeur' : 'Plan jouw Gratis Kennismaking'}
          </h1>
          <p className="text-lg text-blue-100/70 max-w-xl mx-auto">
            {params.name
              ? 'Kies hieronder hoe je kennis wilt maken met Ambition Valley.'
              : 'Ontdek in een vrijblijvend gesprek welk traject het beste past bij jouw financiële situatie en doelen.'
            }
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Option 1: 1-op-1 Intake */}
          {intake ? (
            <div className="glass rounded-3xl p-6 animate-fade-in-up flex flex-col" style={{ animationDelay: params.name ? '200ms' : '100ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-200" />
                </div>
                <div>
                  <span className="text-xs text-blue-200 uppercase tracking-wide font-medium">Optie 1</span>
                  <h2 className="text-xl font-bold text-white">1-op-1 Intake</h2>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-4 flex-1">
                Persoonlijk online gesprek waarin we jouw situatie bespreken en advies geven over het beste traject.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm mb-5">
                <span className="flex items-center gap-1.5 text-white/70">
                  <Clock className="w-4 h-4" />
                  {intake.duration_minutes} min
                </span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <Video className="w-4 h-4" />
                  Online
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                  Gratis
                </span>
              </div>
              <Link
                href={buildBookingUrl(intake.slug)}
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-white text-[#1062eb] rounded-xl font-semibold hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all group"
              >
                Plan 1-op-1 gesprek
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="glass rounded-3xl p-6 text-center animate-fade-in-up opacity-50">
              <p className="text-white/60">1-op-1 intake momenteel niet beschikbaar</p>
            </div>
          )}

          {/* Option 2: Groepsdag */}
          {groepsdag ? (
            <div className="glass rounded-3xl p-6 animate-fade-in-up flex flex-col" style={{ animationDelay: params.name ? '250ms' : '150ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <span className="text-xs text-purple-200 uppercase tracking-wide font-medium">Optie 2</span>
                  <h2 className="text-xl font-bold text-white">Groepsdag</h2>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-4 flex-1">
                Livedag met gelijkgestemde ondernemers. Leer strategieën om belasting te besparen en netwerk.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm mb-5">
                <span className="flex items-center gap-1.5 text-white/70">
                  <Clock className="w-4 h-4" />
                  Hele dag
                </span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <MapPin className="w-4 h-4" />
                  Op locatie
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                  Gratis
                </span>
              </div>
              <Link
                href={buildBookingUrl(groepsdag.slug)}
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all group"
              >
                Bekijk groepsdagen
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="glass rounded-3xl p-6 text-center animate-fade-in-up opacity-50">
              <p className="text-white/60">Groepsdag momenteel niet beschikbaar</p>
            </div>
          )}
        </div>

        {/* What to Expect */}
        <div className="animate-fade-in-up" style={{ animationDelay: params.name ? '300ms' : '200ms' }}>
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            Wat kun je verwachten?
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5 text-center">
              <div className="w-10 h-10 bg-blue-400/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <CheckCircle className="w-5 h-5 text-blue-200" />
              </div>
              <h4 className="font-medium text-white mb-1">Situatie bespreken</h4>
              <p className="text-sm text-white/60">
                We analyseren kort je huidige financiële situatie
              </p>
            </div>

            <div className="glass rounded-2xl p-5 text-center">
              <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <CheckCircle className="w-5 h-5 text-green-300" />
              </div>
              <h4 className="font-medium text-white mb-1">Doelen bepalen</h4>
              <p className="text-sm text-white/60">
                Wat wil je bereiken met betrekking tot belasting en vermogen?
              </p>
            </div>

            <div className="glass rounded-2xl p-5 text-center">
              <div className="w-10 h-10 bg-purple-400/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <CheckCircle className="w-5 h-5 text-purple-300" />
              </div>
              <h4 className="font-medium text-white mb-1">Advies op maat</h4>
              <p className="text-sm text-white/60">
                Je krijgt direct advies over welk traject bij jou past
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: params.name ? '400ms' : '300ms' }}>
          <p className="text-sm text-white/50">
            100% vrijblijvend • Geen verplichtingen • Direct inzicht in je mogelijkheden
          </p>
        </div>
      </div>
    </main>
  );
}
