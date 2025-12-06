'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { TimeSlot } from '../types';
import { formatTimeSlot } from '../lib/availability';

interface BookingCalendarProps {
  eventTypeId: string;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}

interface ApiTimeSlot {
  start: string;
  end: string;
  available: boolean;
  remainingSeats?: number;
}

export function BookingCalendar({
  eventTypeId,
  onSelectSlot,
  selectedSlot,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch availability for the current month
  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      setError(null);

      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      try {
        const params = new URLSearchParams({
          eventTypeId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        const response = await fetch(`/api/booking/availability?${params}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch availability');
        }

        // Convert API slots to TimeSlot format
        const timeSlots: TimeSlot[] = data.data.slots.map((slot: ApiTimeSlot) => ({
          start: new Date(slot.start),
          end: new Date(slot.end),
          available: slot.available,
          remainingSeats: slot.remainingSeats,
        }));

        setSlots(timeSlots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [eventTypeId, currentMonth]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, TimeSlot[]>();
    slots.forEach((slot) => {
      if (!slot.available) return;
      const dateKey = slot.start.toISOString().split('T')[0];
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, slot]);
    });
    return grouped;
  }, [slots]);

  // Get available dates for the calendar
  const availableDates = useMemo(() => {
    return new Set(slotsByDate.keys());
  }, [slotsByDate]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay(); // 0 = Sunday

    const days: (Date | null)[] = [];

    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  // Check if a date has available slots
  const isDateAvailable = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return availableDates.has(dateKey);
  };

  // Check if a date is in the past
  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Get slots for selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split('T')[0];
    return slotsByDate.get(dateKey) || [];
  }, [selectedDate, slotsByDate]);

  const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white disabled:opacity-50"
          disabled={loading}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white disabled:opacity-50"
          disabled={loading}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 border-b border-white/10">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-white/50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {loading ? (
          <div className="col-span-7 p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-white/40 mx-auto mb-2" />
            <span className="text-white/50 text-sm">Beschikbaarheid laden...</span>
          </div>
        ) : error ? (
          <div className="col-span-7 p-8 text-center text-red-300">
            {error}
          </div>
        ) : (
          calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="p-2" />;
            }

            const isPast = isDatePast(date);
            const isAvailable = !isPast && isDateAvailable(date);
            const isSelected =
              selectedDate &&
              date.toISOString().split('T')[0] ===
                selectedDate.toISOString().split('T')[0];

            return (
              <button
                key={date.toISOString()}
                onClick={() => isAvailable && setSelectedDate(date)}
                disabled={!isAvailable}
                className={`
                  p-2 text-center transition-all relative
                  ${isPast ? 'text-white/20 cursor-not-allowed' : ''}
                  ${isAvailable && !isSelected ? 'hover:bg-white/10 cursor-pointer text-white' : ''}
                  ${isSelected ? 'bg-white text-[#1062eb] font-semibold' : ''}
                  ${!isPast && !isAvailable ? 'text-white/30' : ''}
                `}
              >
                <span className="text-sm">{date.getDate()}</span>
                {isAvailable && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-400 rounded-full" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="border-t border-white/10 p-4">
          <h3 className="text-sm font-medium text-white/70 mb-4">
            Beschikbare tijden
          </h3>
          <p className="text-xs text-white/50 mb-4">
            {selectedDate.toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          {slotsForSelectedDate.length === 0 ? (
            <p className="text-white/50 text-sm">Geen tijden beschikbaar</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slotsForSelectedDate.map((slot, index) => {
                const isSlotSelected =
                  selectedSlot &&
                  slot.start.getTime() === selectedSlot.start.getTime();

                return (
                  <button
                    key={slot.start.toISOString()}
                    onClick={() => onSelectSlot(slot)}
                    className={`
                      relative py-3 px-4 rounded-xl transition-all duration-200 text-center
                      ${isSlotSelected
                        ? 'bg-white text-[#1062eb] font-semibold shadow-lg shadow-white/20 scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/15 text-white border border-white/10 hover:border-white/30'
                      }
                    `}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <span className="text-base font-medium">{formatTimeSlot(slot)}</span>
                    {slot.remainingSeats !== undefined && slot.remainingSeats > 1 && (
                      <span className={`block text-xs mt-1 ${isSlotSelected ? 'text-[#1062eb]/70' : 'text-white/50'}`}>
                        {slot.remainingSeats} plekken beschikbaar
                      </span>
                    )}
                    {isSlotSelected && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
