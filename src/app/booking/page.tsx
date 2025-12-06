import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase';
import type { EventType } from '@/integrations/booking/types';
import { Clock, Video, ArrowRight, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Plan jouw Gratis Intake - Ambition Valley',
  description: 'Plan direct een gratis kennismakingsgesprek met Ambition Valley. Ontdek welk traject het beste bij jouw situatie past.',
  openGraph: {
    title: 'Plan jouw Gratis Intake - Ambition Valley',
    description: 'Plan direct een gratis kennismakingsgesprek met Ambition Valley',
  },
};

async function getIntakeEventType(): Promise<EventType | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('slug', 'gratis-intake')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Failed to fetch intake event type:', error);
    return null;
  }

  return data as EventType;
}

export default async function BookingPage() {
  const intakeEvent = await getIntakeEventType();

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
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <p className="text-blue-200 text-sm font-medium mb-3 tracking-wide uppercase">
            Kennismakingsgesprek
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4">
            Plan jouw Gratis Intake
          </h1>
          <p className="text-lg text-blue-100/70 max-w-xl mx-auto">
            Ontdek in een vrijblijvend gesprek welk traject het beste past bij jouw financiële situatie en doelen.
          </p>
        </div>

        {/* Intake Card */}
        {intakeEvent ? (
          <div className="glass rounded-3xl p-8 mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {intakeEvent.title}
                </h2>
                <p className="text-white/70 mb-4">
                  {intakeEvent.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 text-white/80">
                    <Clock className="w-4 h-4" />
                    {intakeEvent.duration_minutes} minuten
                  </span>
                  <span className="flex items-center gap-2 text-white/80">
                    <Video className="w-4 h-4" />
                    Online via Teams
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                    Gratis
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href={`/booking/${intakeEvent.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1062eb] rounded-xl font-semibold text-lg hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all group"
                >
                  Plan je intake
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 mb-10 text-center animate-fade-in-up">
            <p className="text-white/60">
              Het intake gesprek is momenteel niet beschikbaar. Neem contact met ons op.
            </p>
          </div>
        )}

        {/* What to Expect */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
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
        <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <p className="text-sm text-white/50">
            100% vrijblijvend • Geen verplichtingen • Direct inzicht in je mogelijkheden
          </p>
        </div>
      </div>
    </main>
  );
}
