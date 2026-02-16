// Availability Calculation for Booking System
// Combines recurring schedules, one-time slots, blocked times, and calendar conflicts

import type {
  EventType,
  AvailabilitySchedule,
  EventSlot,
  BlockedTime,
  Booking,
  TimeSlot,
  OutlookFreeBusy,
} from '../types';
import { getAvailability as getOutlookAvailability } from './microsoft-graph';

// ============================================
// Types
// ============================================

interface AvailabilityContext {
  eventType: EventType;
  schedules: AvailabilitySchedule[];
  slots: EventSlot[];
  blockedTimes: BlockedTime[];
  existingBookings: Booking[];
  outlookBusy?: OutlookFreeBusy[];
}

// ============================================
// Time Slot Generation
// ============================================

/**
 * Get day of week in Europe/Amsterdam timezone
 * JavaScript's getDay() uses local timezone which can cause issues on servers running in UTC
 */
function getDayOfWeekInAmsterdam(date: Date): number {
  // Format the date in Amsterdam timezone and extract the day
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'short',
  });
  const dayName = formatter.format(date);
  const dayMap: Record<string, number> = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6,
  };
  return dayMap[dayName] ?? 0;
}

/**
 * Get Amsterdam timezone offset for a given date (handles CET/CEST)
 */
function getAmsterdamTimezoneOffset(dateStr: string): string {
  // Create a date at noon to safely determine the offset
  const testDate = new Date(`${dateStr}T12:00:00Z`);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Amsterdam',
    timeZoneName: 'longOffset',
  });
  const parts = formatter.formatToParts(testDate);
  const tzName = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+1';

  // Parse "GMT+1" or "GMT+2" to "+01:00" or "+02:00"
  const match = tzName.match(/GMT([+-])(\d+)/);
  if (match) {
    const sign = match[1];
    const hours = match[2].padStart(2, '0');
    return `${sign}${hours}:00`;
  }
  return '+01:00'; // Default to CET
}

/**
 * Generate time slots from recurring weekly schedules
 */
export function generateSlotsFromSchedule(
  schedule: AvailabilitySchedule,
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  bufferBefore: number = 0,
  bufferAfter: number = 0
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Get the date string in Amsterdam timezone
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Start from the Amsterdam date
  let currentDateStr = dateFormatter.format(startDate);
  const endDateStr = dateFormatter.format(endDate);

  while (currentDateStr <= endDateStr) {
    // Check if this day matches the schedule's day of week
    // Create a noon date to safely check the day of week
    const noonDate = new Date(`${currentDateStr}T12:00:00Z`);
    const currentDayOfWeek = getDayOfWeekInAmsterdam(noonDate);

    if (currentDayOfWeek === schedule.day_of_week && schedule.is_active) {
      // Parse start and end times from schedule
      const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
      const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

      // Determine Amsterdam timezone offset for this date (CET or CEST)
      const tzOffset = getAmsterdamTimezoneOffset(currentDateStr);

      // Create slot times with explicit timezone
      const dayStartISO = `${currentDateStr}T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00${tzOffset}`;
      const dayEndISO = `${currentDateStr}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00${tzOffset}`;

      const dayStart = new Date(dayStartISO);
      const dayEnd = new Date(dayEndISO);

      // Generate slots with buffer consideration
      const slotDuration = durationMinutes + bufferBefore + bufferAfter;
      let slotStart = new Date(dayStart);

      while (slotStart.getTime() + durationMinutes * 60 * 1000 <= dayEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

        slots.push({
          start: new Date(slotStart),
          end: slotEnd,
          available: true,
        });

        // Move to next slot (including buffer after current slot)
        slotStart = new Date(slotStart.getTime() + slotDuration * 60 * 1000);
      }
    }

    // Move to next day by parsing and incrementing the date string
    const [year, month, day] = currentDateStr.split('-').map(Number);
    const nextDate = new Date(year, month - 1, day + 1);
    currentDateStr = dateFormatter.format(nextDate);
  }

  return slots;
}

/**
 * Convert one-time event slots to TimeSlots
 */
export function convertEventSlots(
  eventSlots: EventSlot[],
  maxAttendees: number
): TimeSlot[] {
  return eventSlots
    .filter((slot) => slot.is_active)
    .map((slot) => ({
      start: new Date(slot.start_time),
      end: new Date(slot.end_time),
      available: true,
      remainingSeats: slot.max_attendees ?? maxAttendees,
    }));
}

// ============================================
// Conflict Detection
// ============================================

/**
 * Check if two time ranges overlap
 */
export function hasOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Filter out slots that overlap with blocked times
 */
export function filterBlockedTimes(
  slots: TimeSlot[],
  blockedTimes: BlockedTime[]
): TimeSlot[] {
  return slots.map((slot) => {
    const isBlocked = blockedTimes.some((blocked) =>
      hasOverlap(
        slot.start,
        slot.end,
        new Date(blocked.start_time),
        new Date(blocked.end_time)
      )
    );

    return {
      ...slot,
      available: slot.available && !isBlocked,
    };
  });
}

/**
 * Filter out slots that overlap with existing bookings
 */
export function filterExistingBookings(
  slots: TimeSlot[],
  bookings: Booking[],
  maxAttendees: number
): TimeSlot[] {
  // Group bookings by time slot
  const bookingsBySlot = new Map<string, number>();

  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue;

    const key = `${booking.start_time}-${booking.end_time}`;
    bookingsBySlot.set(key, (bookingsBySlot.get(key) || 0) + 1);
  }

  return slots.map((slot) => {
    const key = `${slot.start.toISOString()}-${slot.end.toISOString()}`;
    const existingCount = bookingsBySlot.get(key) || 0;
    const remainingSeats = (slot.remainingSeats ?? maxAttendees) - existingCount;

    // For 1:1 bookings, check for any overlap
    if (maxAttendees === 1) {
      const hasConflict = bookings.some(
        (booking) =>
          booking.status !== 'cancelled' &&
          hasOverlap(slot.start, slot.end, new Date(booking.start_time), new Date(booking.end_time))
      );

      return {
        ...slot,
        available: slot.available && !hasConflict,
        remainingSeats: hasConflict ? 0 : 1,
      };
    }

    // For group bookings
    return {
      ...slot,
      available: slot.available && remainingSeats > 0,
      remainingSeats: Math.max(0, remainingSeats),
    };
  });
}

/**
 * Filter out slots that conflict with Outlook calendar
 */
export function filterOutlookConflicts(
  slots: TimeSlot[],
  busySlots: OutlookFreeBusy[]
): TimeSlot[] {
  return slots.map((slot) => {
    const hasConflict = busySlots.some(
      (busy) =>
        busy.status !== 'free' &&
        hasOverlap(slot.start, slot.end, new Date(busy.start), new Date(busy.end))
    );

    return {
      ...slot,
      available: slot.available && !hasConflict,
    };
  });
}

// ============================================
// Main Availability Calculation
// ============================================

/**
 * Calculate available time slots for an event type
 * Combines all sources and filters out conflicts
 */
export async function calculateAvailability(
  context: AvailabilityContext,
  startDate: Date,
  endDate: Date,
  checkOutlook: boolean = true
): Promise<TimeSlot[]> {
  const { eventType, schedules, slots, blockedTimes, existingBookings } = context;

  // Use booking_duration_minutes for slot generation if set, otherwise fall back to duration_minutes
  const slotDuration = eventType.booking_duration_minutes ?? eventType.duration_minutes;

  let availableSlots: TimeSlot[] = [];

  // 1. Generate slots from recurring schedules
  for (const schedule of schedules) {
    const scheduledSlots = generateSlotsFromSchedule(
      schedule,
      startDate,
      endDate,
      slotDuration,
      eventType.buffer_before_minutes,
      eventType.buffer_after_minutes
    );
    availableSlots = [...availableSlots, ...scheduledSlots];
  }

  // 2. Add one-time event slots
  const eventSlots = convertEventSlots(
    slots.filter(
      (s) =>
        new Date(s.start_time) >= startDate &&
        new Date(s.start_time) <= endDate
    ),
    eventType.max_attendees
  );
  availableSlots = [...availableSlots, ...eventSlots];

  // 3. Filter out blocked times
  availableSlots = filterBlockedTimes(availableSlots, blockedTimes);

  // 4. Filter out existing bookings
  availableSlots = filterExistingBookings(
    availableSlots,
    existingBookings,
    eventType.max_attendees
  );

  // 5. Filter out Outlook calendar conflicts (if enabled)
  if (checkOutlook && process.env.MS_GRAPH_CLIENT_ID) {
    try {
      const outlookBusy = context.outlookBusy || await getOutlookAvailability(startDate, endDate);
      availableSlots = filterOutlookConflicts(availableSlots, outlookBusy);
    } catch (error) {
      console.error('Failed to check Outlook availability:', error);
      // Continue without Outlook filtering if it fails
    }
  }

  // 6. Filter out past slots
  const now = new Date();
  availableSlots = availableSlots.filter((slot) => slot.start > now);

  // 7. Sort by start time
  availableSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

  return availableSlots;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Group slots by date for calendar display
 */
export function groupSlotsByDate(slots: TimeSlot[]): Map<string, TimeSlot[]> {
  const grouped = new Map<string, TimeSlot[]>();

  for (const slot of slots) {
    const dateKey = slot.start.toISOString().split('T')[0];
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, slot]);
  }

  return grouped;
}

/**
 * Get available dates (for calendar month view)
 */
export function getAvailableDates(slots: TimeSlot[]): Date[] {
  const dateSet = new Set<string>();
  const dates: Date[] = [];

  for (const slot of slots) {
    if (!slot.available) continue;

    const dateKey = slot.start.toISOString().split('T')[0];
    if (!dateSet.has(dateKey)) {
      dateSet.add(dateKey);
      const date = new Date(slot.start);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Get available slots for a specific date
 */
export function getSlotsForDate(slots: TimeSlot[], date: Date): TimeSlot[] {
  const dateKey = date.toISOString().split('T')[0];

  return slots.filter((slot) => {
    const slotDateKey = slot.start.toISOString().split('T')[0];
    return slotDateKey === dateKey && slot.available;
  });
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(slot: TimeSlot, locale: string = 'nl-NL'): string {
  const startTime = slot.start.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = slot.end.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${startTime} - ${endTime}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date, locale: string = 'nl-NL'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if a specific slot is still available (real-time check)
 */
export async function isSlotAvailable(
  eventType: EventType,
  slotStart: Date,
  slotEnd: Date,
  existingBookings: Booking[],
  blockedTimes: BlockedTime[]
): Promise<{ available: boolean; reason?: string }> {
  // Check if slot is in the past
  if (slotStart <= new Date()) {
    return { available: false, reason: 'Dit tijdslot is al verstreken' };
  }

  // Check blocked times
  const isBlocked = blockedTimes.some((blocked) =>
    hasOverlap(slotStart, slotEnd, new Date(blocked.start_time), new Date(blocked.end_time))
  );
  if (isBlocked) {
    return { available: false, reason: 'Dit tijdslot is niet beschikbaar' };
  }

  // Check existing bookings
  const conflictingBookings = existingBookings.filter(
    (booking) =>
      booking.status !== 'cancelled' &&
      hasOverlap(slotStart, slotEnd, new Date(booking.start_time), new Date(booking.end_time))
  );

  if (eventType.max_attendees === 1 && conflictingBookings.length > 0) {
    return { available: false, reason: 'Dit tijdslot is al geboekt' };
  }

  if (conflictingBookings.length >= eventType.max_attendees) {
    return { available: false, reason: 'Er zijn geen plaatsen meer beschikbaar' };
  }

  // Check Outlook calendar
  if (process.env.MS_GRAPH_CLIENT_ID) {
    try {
      const outlookBusy = await getOutlookAvailability(slotStart, slotEnd);
      const hasOutlookConflict = outlookBusy.some(
        (busy) =>
          busy.status !== 'free' &&
          hasOverlap(slotStart, slotEnd, new Date(busy.start), new Date(busy.end))
      );
      if (hasOutlookConflict) {
        return { available: false, reason: 'Dit tijdslot is niet beschikbaar in de agenda' };
      }
    } catch {
      // Continue if Outlook check fails
    }
  }

  return {
    available: true,
    reason: undefined,
  };
}

/**
 * Get the next available slot for an event type
 */
export function getNextAvailableSlot(slots: TimeSlot[]): TimeSlot | null {
  const now = new Date();
  const availableSlots = slots
    .filter((slot) => slot.available && slot.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return availableSlots[0] || null;
}
