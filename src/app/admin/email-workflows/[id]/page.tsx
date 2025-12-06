'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2, Play, Pause } from 'lucide-react';

interface EventType {
  id: string;
  slug: string;
  title: string;
}

interface Workflow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  event_type_id: string | null;
  trigger_type: string;
  trigger_offset_minutes: number;
  email_subject: string;
  email_template: string;
  is_active: boolean;
}

const triggerTypes = [
  { value: 'booking_confirmed', label: 'Bij bevestiging', description: 'Direct na bevestiging van de boeking' },
  { value: 'booking_cancelled', label: 'Bij annulering', description: 'Direct na annulering van de boeking' },
  { value: 'before_event', label: 'Voor afspraak', description: 'X dagen/uren voor de afspraak' },
  { value: 'after_event', label: 'Na afspraak', description: 'Direct na afloop van de afspraak' },
];

const templates = [
  { value: 'booking_confirmation', label: 'Bevestigingsmail', triggers: ['booking_confirmed'] },
  { value: 'booking_cancellation', label: 'Annuleringsmail', triggers: ['booking_cancelled'] },
  { value: 'booking_reminder', label: 'Herinneringsmail', triggers: ['before_event'] },
  { value: 'intake_follow_up', label: 'Intake Follow-up', triggers: ['after_event'] },
  { value: 'traject_follow_up', label: 'Traject Follow-up', triggers: ['after_event'] },
];

function parseOffset(minutes: number): { value: number; unit: string } {
  const absMinutes = Math.abs(minutes);
  if (absMinutes >= 60 * 24) {
    return { value: Math.floor(absMinutes / (60 * 24)), unit: 'days' };
  } else if (absMinutes >= 60) {
    return { value: Math.floor(absMinutes / 60), unit: 'hours' };
  }
  return { value: absMinutes, unit: 'hours' };
}

export default function EditEmailWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    eventTypeId: '',
    triggerType: 'booking_confirmed',
    triggerOffsetValue: 0,
    triggerOffsetUnit: 'days',
    emailSubject: '',
    emailTemplate: 'booking_confirmation',
    isActive: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch event types
        const etRes = await fetch('/api/booking/event-types');
        const etData = await etRes.json();
        if (etData.success) {
          setEventTypes(etData.data);
        }

        // Fetch workflow
        const wfRes = await fetch(`/api/admin/email-workflows/${resolvedParams.id}`);
        const wfData = await wfRes.json();

        if (!wfRes.ok || !wfData.success) {
          throw new Error(wfData.message || 'Workflow niet gevonden');
        }

        const wf = wfData.data as Workflow;
        setWorkflow(wf);

        const offset = parseOffset(wf.trigger_offset_minutes);
        setFormData({
          name: wf.name,
          slug: wf.slug,
          description: wf.description || '',
          eventTypeId: wf.event_type_id || '',
          triggerType: wf.trigger_type,
          triggerOffsetValue: offset.value,
          triggerOffsetUnit: offset.unit,
          emailSubject: wf.email_subject,
          emailTemplate: wf.email_template,
          isActive: wf.is_active,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resolvedParams.id]);

  // Filter templates based on trigger type
  const availableTemplates = templates.filter(t => t.triggers.includes(formData.triggerType));

  // Update template when trigger changes
  useEffect(() => {
    const currentTemplateValid = availableTemplates.some(t => t.value === formData.emailTemplate);
    if (!currentTemplateValid && availableTemplates.length > 0) {
      setFormData(prev => ({ ...prev, emailTemplate: availableTemplates[0].value }));
    }
  }, [formData.triggerType, availableTemplates, formData.emailTemplate]);

  const calculateOffsetMinutes = (): number => {
    const value = Math.abs(formData.triggerOffsetValue);
    let minutes = 0;

    switch (formData.triggerOffsetUnit) {
      case 'hours':
        minutes = value * 60;
        break;
      case 'days':
        minutes = value * 60 * 24;
        break;
      default:
        minutes = value;
    }

    // For "before_event", offset should be negative
    if (formData.triggerType === 'before_event') {
      return -minutes;
    }
    return minutes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/email-workflows/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          eventTypeId: formData.eventTypeId || null,
          triggerType: formData.triggerType,
          triggerOffsetMinutes: calculateOffsetMinutes(),
          emailSubject: formData.emailSubject,
          emailTemplate: formData.emailTemplate,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Er is een fout opgetreden');
      }

      router.push('/admin/email-workflows');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/email-workflows/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !formData.isActive }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Er is een fout opgetreden');
      }

      setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je deze workflow wilt verwijderen?')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/email-workflows/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Er is een fout opgetreden');
      }

      router.push('/admin/email-workflows');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1062eb] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </main>
    );
  }

  if (!workflow) {
    return (
      <main className="min-h-screen bg-[#1062eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-white/60 mb-4">Workflow niet gevonden</p>
            <Link
              href="/admin/email-workflows"
              className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar workflows
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1062eb]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <Link
            href="/admin/email-workflows"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar workflows
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Workflow Bewerken</h1>
              <p className="mt-1 text-sm text-white/60">
                {workflow.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleActive}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  formData.isActive
                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                }`}
              >
                {formData.isActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Deactiveren
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Activeren
                  </>
                )}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-xl text-sm font-medium transition-colors"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Verwijderen
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Basis Informatie</h2>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Naam *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Beschrijving
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                rows={2}
              />
            </div>
          </div>

          {/* Trigger Settings */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Trigger Instellingen</h2>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Evenement Type
              </label>
              <select
                value={formData.eventTypeId}
                onChange={(e) => setFormData(prev => ({ ...prev, eventTypeId: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="">Alle evenementen</option>
                {eventTypes.map((et) => (
                  <option key={et.id} value={et.id}>{et.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Wanneer versturen? *
              </label>
              <div className="space-y-2">
                {triggerTypes.map((trigger) => (
                  <label
                    key={trigger.value}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      formData.triggerType === trigger.value
                        ? 'bg-white/20 border border-white/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="triggerType"
                      value={trigger.value}
                      checked={formData.triggerType === trigger.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, triggerType: e.target.value }))}
                      className="mt-1"
                    />
                    <div>
                      <span className="block text-white font-medium">{trigger.label}</span>
                      <span className="block text-sm text-white/50">{trigger.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {formData.triggerType === 'before_event' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Hoeveel tijd voor de afspraak?
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    value={formData.triggerOffsetValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, triggerOffsetValue: parseInt(e.target.value) || 0 }))}
                    className="w-24 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <select
                    value={formData.triggerOffsetUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, triggerOffsetUnit: e.target.value }))}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="hours">uren</option>
                    <option value="days">dagen</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Email Settings */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">E-mail Instellingen</h2>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                E-mail Template *
              </label>
              <select
                value={formData.emailTemplate}
                onChange={(e) => setFormData(prev => ({ ...prev, emailTemplate: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              >
                {availableTemplates.map((template) => (
                  <option key={template.value} value={template.value}>{template.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Onderwerp *
              </label>
              <input
                type="text"
                value={formData.emailSubject}
                onChange={(e) => setFormData(prev => ({ ...prev, emailSubject: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/email-workflows"
              className="px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              Annuleren
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#1062eb] rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Wijzigingen Opslaan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
