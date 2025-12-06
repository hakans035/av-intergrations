import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsCard } from '@/components/admin/StatsCard';
import { Calendar, Clock, Users, Euro, Plus, Settings } from 'lucide-react';
import { formatPrice } from '@/integrations/booking/lib/stripe';

async function getBookingStats() {
  const supabase = createServiceClient();

  // Get total bookings
  const { count: totalCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  // Get confirmed bookings
  const { count: confirmedCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'confirmed');

  // Get pending bookings
  const { count: pendingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Get upcoming bookings (next 7 days)
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const { count: upcomingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'confirmed')
    .gte('start_time', now.toISOString())
    .lte('start_time', nextWeek.toISOString());

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('bookings')
    .select('total_price_cents')
    .in('payment_status', ['deposit_paid', 'fully_paid']);

  const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_price_cents || 0), 0) || 0;

  return {
    total: totalCount || 0,
    confirmed: confirmedCount || 0,
    pending: pendingCount || 0,
    upcoming: upcomingCount || 0,
    revenue: totalRevenue,
  };
}

async function getRecentBookings() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('*, event_types(title, slug)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }

  return data || [];
}

async function getEventTypes() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .order('title');

  if (error) {
    console.error('Error fetching event types:', error);
    return [];
  }

  return data || [];
}

export default async function AdminBookingPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/admin/login');
  }

  const [stats, recentBookings, eventTypes] = await Promise.all([
    getBookingStats(),
    getRecentBookings(),
    getEventTypes(),
  ]);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    no_show: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'In afwachting',
    confirmed: 'Bevestigd',
    cancelled: 'Geannuleerd',
    completed: 'Voltooid',
    no_show: 'Niet verschenen',
  };

  return (
    <>
      <AdminHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Boekingen</h1>
            <p className="mt-1 text-sm text-white/60">
              Beheer afspraken en evenementen
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Totaal Boekingen"
            value={stats.total}
            icon={<Calendar className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="Bevestigd"
            value={stats.confirmed}
            icon={<Clock className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="In Afwachting"
            value={stats.pending}
            icon={<Users className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="Komende 7 dagen"
            value={stats.upcoming}
            icon={<Calendar className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="Totale Omzet"
            value={formatPrice(stats.revenue)}
            icon={<Euro className="w-6 h-6 text-white" />}
          />
        </div>

        {/* Event Types */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Evenement Types</h2>
            <Link
              href="/admin/booking/event-types"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Beheren →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventTypes.length === 0 ? (
              <div className="col-span-full glass rounded-2xl p-6 text-center">
                <p className="text-white/60 mb-4">Nog geen evenementen aangemaakt</p>
                <Link
                  href="/admin/booking/event-types/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Eerste Evenement Aanmaken
                </Link>
              </div>
            ) : (
              eventTypes.map((eventType) => (
                <Link
                  key={eventType.id}
                  href={`/admin/booking/event-types/${eventType.id}`}
                  className="glass rounded-2xl p-4 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{eventType.title}</h3>
                      <p className="text-sm text-white/60 mt-1">
                        {eventType.duration_minutes} min
                        {(eventType.price_cents ?? 0) > 0 && ` • ${formatPrice(eventType.price_cents ?? 0)}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      eventType.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {eventType.is_active ? 'Actief' : 'Inactief'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-xs">Bewerken</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recente Boekingen</h2>
            <Link
              href="/admin/booking/list"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Bekijk alles →
            </Link>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            {recentBookings.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-white/60">Nog geen boekingen</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Klant</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Evenement</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Datum</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Betaling</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-white">{booking.customer_name}</p>
                            <p className="text-xs text-white/50">{booking.customer_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-white/80">
                            {(booking.event_types as { title: string } | null)?.title || 'Onbekend'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-white/80">
                            {new Date(booking.start_time).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${booking.status ? statusColors[booking.status] : ''}`}>
                            {booking.status ? statusLabels[booking.status] : 'Onbekend'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-white/80">
                            {(booking.total_price_cents ?? 0) > 0 ? formatPrice(booking.total_price_cents ?? 0) : 'Gratis'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
