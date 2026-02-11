export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Plus, ArrowLeft, Clock, Euro, Users, Video, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

async function getEventTypes() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching event types:', error);
    return [];
  }

  return data || [];
}

export default async function EventTypesPage() {
  const eventTypes = await getEventTypes();

  const locationIcons: Record<string, React.ReactNode> = {
    online: <Video className="w-4 h-4" />,
    on_location: <MapPin className="w-4 h-4" />,
    hybrid: <MapPin className="w-4 h-4" />,
  };

  const locationLabels: Record<string, string> = {
    online: 'Online',
    on_location: 'Op locatie',
    hybrid: 'Hybride',
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <Link
            href="/admin/booking"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Boekingen
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Evenement Types</h1>
              <p className="mt-1 text-sm text-white/60">
                Beheer de types afspraken die geboekt kunnen worden
              </p>
            </div>
            <Link
              href="/admin/booking/event-types/new"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nieuw Evenement
            </Link>
          </div>
        </div>

        {/* Event Types List */}
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {eventTypes.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white/60" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Geen evenementen</h2>
              <p className="text-white/60 mb-6">
                Maak uw eerste evenement type aan om boekingen te ontvangen
              </p>
              <Link
                href="/admin/booking/event-types/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Eerste Evenement Aanmaken
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {eventTypes.map((eventType) => (
                <Link
                  key={eventType.id}
                  href={`/admin/booking/event-types/${eventType.id}`}
                  className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{eventType.title}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          eventType.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {eventType.is_active ? 'Actief' : 'Inactief'}
                        </span>
                      </div>
                      {eventType.description && (
                        <p className="text-sm text-white/60 mt-1">{eventType.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/60">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {eventType.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          {locationIcons[eventType.location_type]}
                          {locationLabels[eventType.location_type]}
                        </span>
                        {(eventType.max_attendees ?? 0) > 1 && (
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            Max {eventType.max_attendees}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Euro className="w-4 h-4" />
                          {(eventType.price_cents ?? 0) > 0 ? formatPrice(eventType.price_cents ?? 0) : 'Gratis'}
                        </span>
                      </div>
                    </div>
                    <div className="text-white/40 group-hover:text-white/60 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
    </main>
  );
}
