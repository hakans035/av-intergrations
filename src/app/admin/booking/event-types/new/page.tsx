'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

export default function NewEventTypePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration_minutes: 30,
    location_type: 'online' as 'online' | 'on_location' | 'hybrid',
    location_address: '',
    price_cents: 0,
    deposit_percent: 50,
    max_attendees: 1,
    is_active: true,
    requires_approval: false,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
  });

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    { day_of_week: 1, start_time: '09:00', end_time: '17:00', is_active: true },
    { day_of_week: 2, start_time: '09:00', end_time: '17:00', is_active: true },
    { day_of_week: 3, start_time: '09:00', end_time: '17:00', is_active: true },
    { day_of_week: 4, start_time: '09:00', end_time: '17:00', is_active: true },
    { day_of_week: 5, start_time: '09:00', end_time: '17:00', is_active: true },
  ]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const toggleDay = (dayOfWeek: number) => {
    const existing = availability.find((a) => a.day_of_week === dayOfWeek);
    if (existing) {
      setAvailability(availability.map((a) =>
        a.day_of_week === dayOfWeek ? { ...a, is_active: !a.is_active } : a
      ));
    } else {
      setAvailability([
        ...availability,
        { day_of_week: dayOfWeek, start_time: '09:00', end_time: '17:00', is_active: true },
      ]);
    }
  };

  const updateAvailability = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(availability.map((a) =>
      a.day_of_week === dayOfWeek ? { ...a, [field]: value } : a
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/event-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || ''}`,
        },
        body: JSON.stringify({
          ...formData,
          availability: availability.filter((a) => a.is_active),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Er is een fout opgetreden');
        return;
      }

      router.push('/admin/booking/event-types');
    } catch {
      setError('Er is een fout opgetreden bij het opslaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1062eb] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10">
        <header className="glass border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/admin/booking/event-types" className="flex items-center gap-2 text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
                <span>Terug</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Nieuw Evenement</h1>
            <p className="mt-1 text-sm text-white/60">
              Maak een nieuw type afspraak aan
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Basis Informatie</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Titel *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-white/30"
                    placeholder="b.v. Gratis Intake"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-white/30"
                    placeholder="gratis-intake"
                    required
                  />
                  <p className="text-xs text-white/50 mt-1">URL: /booking/{formData.slug || 'slug'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Beschrijving</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-white/30"
                    placeholder="Beschrijf het evenement..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Duur (minuten) *</label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                      min={5}
                      max={480}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Max Deelnemers</label>
                    <input
                      type="number"
                      value={formData.max_attendees}
                      onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || 1 })}
                      min={1}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-white/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Locatie</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['online', 'on_location', 'hybrid'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, location_type: type })}
                        className={`py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                          formData.location_type === type
                            ? 'bg-white text-blue-600'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {type === 'online' ? 'Online' : type === 'on_location' ? 'Op locatie' : 'Hybride'}
                      </button>
                    ))}
                  </div>
                </div>

                {(formData.location_type === 'on_location' || formData.location_type === 'hybrid') && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Adres</label>
                    <input
                      type="text"
                      value={formData.location_address}
                      onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      placeholder="Adres van de locatie"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Prijs</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Prijs (EUR)</label>
                  <input
                    type="number"
                    value={formData.price_cents / 100}
                    onChange={(e) => setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                    min={0}
                    step={0.01}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  />
                  <p className="text-xs text-white/50 mt-1">0 voor gratis</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Aanbetaling (%)</label>
                  <input
                    type="number"
                    value={formData.deposit_percent}
                    onChange={(e) => setFormData({ ...formData, deposit_percent: parseInt(e.target.value) || 50 })}
                    min={0}
                    max={100}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Beschikbaarheid</h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                  const slot = availability.find((a) => a.day_of_week === day);
                  const isActive = slot?.is_active ?? false;

                  return (
                    <div key={day} className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-24 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive ? 'bg-white text-blue-600' : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {dayNames[day]}
                      </button>
                      {isActive && slot && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateAvailability(day, 'start_time', e.target.value)}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                          />
                          <span className="text-white/50">tot</span>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => updateAvailability(day, 'end_time', e.target.value)}
                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Settings */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Instellingen</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500"
                  />
                  <span className="text-white/70">Actief (zichtbaar voor bezoekers)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_approval}
                    onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500"
                  />
                  <span className="text-white/70">Handmatige goedkeuring vereist</span>
                </label>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Buffer voor (min)</label>
                    <input
                      type="number"
                      value={formData.buffer_before_minutes}
                      onChange={(e) => setFormData({ ...formData, buffer_before_minutes: parseInt(e.target.value) || 0 })}
                      min={0}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Buffer na (min)</label>
                    <input
                      type="number"
                      value={formData.buffer_after_minutes}
                      onChange={(e) => setFormData({ ...formData, buffer_after_minutes: parseInt(e.target.value) || 0 })}
                      min={0}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-white/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link
                href="/admin/booking/event-types"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
              >
                Annuleren
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                  loading
                    ? 'bg-white/30 text-white/50 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-white/90'
                }`}
              >
                <Save className="w-5 h-5" />
                {loading ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
