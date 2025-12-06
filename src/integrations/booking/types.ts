// Booking System Types

// ============================================
// Database Types
// ============================================

export type LocationType = 'online' | 'on_location' | 'hybrid';
export type PaymentStatus = 'pending' | 'deposit_paid' | 'fully_paid' | 'refunded' | 'failed';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface EventType {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  location_type: LocationType;
  location_address: string | null;
  price_cents: number;
  deposit_percent: number;
  max_attendees: number;
  is_active: boolean;
  requires_approval: boolean;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySchedule {
  id: string;
  event_type_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // TIME format: "09:00:00"
  end_time: string;   // TIME format: "17:00:00"
  is_active: boolean;
  created_at: string;
}

export interface EventSlot {
  id: string;
  event_type_id: string;
  start_time: string;
  end_time: string;
  max_attendees: number | null;
  is_recurring: boolean;
  is_active: boolean;
  created_at: string;
}

export interface BlockedTime {
  id: string;
  event_type_id: string | null;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  event_type_id: string;
  event_slot_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_notes: string | null;
  start_time: string;
  end_time: string;
  timezone: string;
  meeting_url: string | null;
  meeting_id: string | null;
  location_address: string | null;
  total_price_cents: number;
  deposit_cents: number;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  status: BookingStatus;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingAttendee {
  id: string;
  booking_id: string;
  name: string;
  email: string;
  created_at: string;
}

// ============================================
// Insert Types (for creating new records)
// ============================================

export interface EventTypeInsert {
  slug: string;
  title: string;
  description?: string | null;
  duration_minutes?: number;
  location_type: LocationType;
  location_address?: string | null;
  price_cents?: number;
  deposit_percent?: number;
  max_attendees?: number;
  is_active?: boolean;
  requires_approval?: boolean;
  buffer_before_minutes?: number;
  buffer_after_minutes?: number;
}

export interface AvailabilityScheduleInsert {
  event_type_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export interface EventSlotInsert {
  event_type_id: string;
  start_time: string;
  end_time: string;
  max_attendees?: number | null;
  is_recurring?: boolean;
  is_active?: boolean;
}

export interface BlockedTimeInsert {
  event_type_id?: string | null;
  start_time: string;
  end_time: string;
  reason?: string | null;
}

export interface BookingInsert {
  event_type_id: string;
  event_slot_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_notes?: string | null;
  start_time: string;
  end_time: string;
  timezone?: string;
  meeting_url?: string | null;
  meeting_id?: string | null;
  location_address?: string | null;
  total_price_cents?: number;
  deposit_cents?: number;
  payment_status?: PaymentStatus;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
  status?: BookingStatus;
}

export interface BookingAttendeeInsert {
  booking_id: string;
  name: string;
  email: string;
}

// ============================================
// API Types
// ============================================

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  remainingSeats?: number;
}

export interface AvailabilityRequest {
  eventTypeId: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  timezone?: string;
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
  eventType: EventType;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  eventSlotId?: string;
  startTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerNotes?: string;
  attendees?: Array<{ name: string; email: string }>;
  timezone?: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  checkoutUrl?: string; // Stripe checkout URL for paid events
  requiresPayment: boolean;
}

export interface BookingConfirmation {
  booking: Booking;
  eventType: EventType;
  meetingUrl?: string;
  calendarLink?: string;
}

// ============================================
// Microsoft Graph Types
// ============================================

export interface OutlookFreeBusy {
  start: string;
  end: string;
  status: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown';
}

export interface TeamsOnlineMeeting {
  id: string;
  joinUrl: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
}

export interface CalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  onlineMeeting?: { joinUrl: string };
  attendees?: Array<{ emailAddress: { address: string; name: string } }>;
}

// ============================================
// Stripe Types
// ============================================

export interface StripeCheckoutSession {
  id: string;
  url: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      metadata?: Record<string, string>;
      amount?: number;
      status?: string;
    };
  };
}

// ============================================
// UI Component Props
// ============================================

export interface BookingCalendarProps {
  eventType: EventType;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}

export interface BookingFormProps {
  eventType: EventType;
  selectedSlot: TimeSlot;
  onSubmit: (data: CreateBookingRequest) => Promise<void>;
  isLoading?: boolean;
}

export interface EventTypeCardProps {
  eventType: EventType;
  onClick?: () => void;
}

export interface PaymentFormProps {
  booking: Booking;
  eventType: EventType;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// ============================================
// Admin Types
// ============================================

export interface EventTypeFormData {
  slug: string;
  title: string;
  description: string;
  duration_minutes: number;
  location_type: LocationType;
  location_address: string;
  price_cents: number;
  deposit_percent: number;
  max_attendees: number;
  is_active: boolean;
  requires_approval: boolean;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  availability: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
  }>;
}

export interface BookingFilters {
  status?: BookingStatus;
  eventTypeId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  revenue: number;
}
