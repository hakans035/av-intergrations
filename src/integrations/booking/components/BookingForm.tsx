'use client';

import { useState } from 'react';
import { User, Mail, Phone, FileText, Users, Plus, X, Loader2 } from 'lucide-react';
import type { TimeSlot, EventType, CreateBookingRequest } from '../types';
import { formatTimeSlot, formatDate } from '../lib/availability';
import { getPriceBreakdown } from '../lib/stripe';

interface BookingFormProps {
  eventType: EventType;
  selectedSlot: TimeSlot;
  onSubmit: (data: CreateBookingRequest) => Promise<void>;
  isLoading?: boolean;
}

interface Attendee {
  name: string;
  email: string;
}

export function BookingForm({
  eventType,
  selectedSlot,
  onSubmit,
  isLoading = false,
}: BookingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isGroupEvent = eventType.max_attendees > 1;
  const priceBreakdown = getPriceBreakdown(eventType);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Naam is verplicht (minimaal 2 karakters)';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Geldig e-mailadres is verplicht';
    }

    // Validate attendees if provided
    attendees.forEach((attendee, index) => {
      if (!attendee.name.trim() || attendee.name.trim().length < 2) {
        newErrors[`attendee_${index}_name`] = 'Naam is verplicht';
      }
      if (!attendee.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email)) {
        newErrors[`attendee_${index}_email`] = 'Geldig e-mailadres is verplicht';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const bookingData: CreateBookingRequest = {
      eventTypeId: eventType.id,
      startTime: selectedSlot.start.toISOString(),
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim() || undefined,
      customerNotes: notes.trim() || undefined,
      attendees: attendees.length > 0 ? attendees : undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    await onSubmit(bookingData);
  };

  const addAttendee = () => {
    if (attendees.length < eventType.max_attendees - 1) {
      setAttendees([...attendees, { name: '', email: '' }]);
    }
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const updateAttendee = (index: number, field: 'name' | 'email', value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected Time Summary */}
      <div className="glass rounded-2xl p-4 border border-white/20">
        <h3 className="font-medium text-white mb-1">{eventType.title}</h3>
        <p className="text-white/70">{formatDate(selectedSlot.start)}</p>
        <p className="text-white/70">{formatTimeSlot(selectedSlot)}</p>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
            Naam *
          </label>
          <div className="relative">
            <User className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`
                w-full pl-8 pr-4 py-3 bg-transparent border-b-2 transition-all duration-200
                text-white placeholder-white/40 focus:outline-none
                ${errors.name
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-white/20 focus:border-white/60'
                }
              `}
              placeholder="Uw volledige naam"
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-red-300">{errors.name}</p>
          )}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            E-mail *
          </label>
          <div className="relative">
            <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`
                w-full pl-8 pr-4 py-3 bg-transparent border-b-2 transition-all duration-200
                text-white placeholder-white/40 focus:outline-none
                ${errors.email
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-white/20 focus:border-white/60'
                }
              `}
              placeholder="uw@email.nl"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-300">{errors.email}</p>
          )}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
            Telefoon (optioneel)
          </label>
          <div className="relative">
            <Phone className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-transparent border-b-2 border-white/20 focus:border-white/60 transition-all duration-200 text-white placeholder-white/40 focus:outline-none"
              placeholder="+31 6 12345678"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <label htmlFor="notes" className="block text-sm font-medium text-white/80 mb-2">
            Opmerkingen (optioneel)
          </label>
          <div className="relative">
            <FileText className="absolute left-0 top-3 w-5 h-5 text-white/40" />
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full pl-8 pr-4 py-3 bg-transparent border-b-2 border-white/20 focus:border-white/60 transition-all duration-200 text-white placeholder-white/40 focus:outline-none resize-none"
              placeholder="Eventuele vragen of opmerkingen..."
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Additional Attendees (for group events) */}
      {isGroupEvent && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Extra deelnemers
            </h4>
            {attendees.length < eventType.max_attendees - 1 && (
              <button
                type="button"
                onClick={addAttendee}
                className="text-sm text-white/60 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Deelnemer toevoegen
              </button>
            )}
          </div>

          {attendees.map((attendee, index) => (
            <div key={index} className="glass rounded-xl p-4 relative">
              <button
                type="button"
                onClick={() => removeAttendee(index)}
                className="absolute top-2 right-2 text-white/40 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm text-white/50 mb-3">Deelnemer {index + 2}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={attendee.name}
                    onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                    className={`
                      w-full px-3 py-2 bg-transparent border-b-2 text-sm text-white placeholder-white/40 focus:outline-none transition-all
                      ${errors[`attendee_${index}_name`]
                        ? 'border-red-400'
                        : 'border-white/20 focus:border-white/60'
                      }
                    `}
                    placeholder="Naam"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={attendee.email}
                    onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                    className={`
                      w-full px-3 py-2 bg-transparent border-b-2 text-sm text-white placeholder-white/40 focus:outline-none transition-all
                      ${errors[`attendee_${index}_email`]
                        ? 'border-red-400'
                        : 'border-white/20 focus:border-white/60'
                      }
                    `}
                    placeholder="E-mail"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price Summary */}
      {!priceBreakdown.isFree && (
        <div className="glass rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h4 className="text-sm font-medium text-white/80 mb-2">Kosten</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Totaal</span>
              <span className="font-medium text-white">{priceBreakdown.total}</span>
            </div>
            {priceBreakdown.depositPercent < 100 && (
              <>
                <div className="flex justify-between text-green-300">
                  <span>Nu te betalen ({priceBreakdown.depositPercent}%)</span>
                  <span className="font-medium">{priceBreakdown.deposit}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Later te betalen</span>
                  <span>{priceBreakdown.remaining}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 animate-fade-in-up
          ${isLoading
            ? 'bg-white/20 text-white/50 cursor-not-allowed'
            : 'bg-white text-[#1062eb] hover:bg-white/90 hover:shadow-lg hover:shadow-white/20'
          }
        `}
        style={{ animationDelay: '350ms' }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Bezig met verwerken...
          </span>
        ) : priceBreakdown.isFree ? (
          'Boeken'
        ) : (
          `Betalen (${priceBreakdown.deposit})`
        )}
      </button>

      <p className="text-xs text-white/50 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        Door te boeken gaat u akkoord met onze algemene voorwaarden
      </p>
    </form>
  );
}
