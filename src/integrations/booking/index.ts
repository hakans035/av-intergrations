// Booking System Integration
// Main exports for the booking system

// Types
export * from './types';

// Library functions
export * from './lib/availability';
export * from './lib/microsoft-graph';
export * from './lib/stripe';

// Components - explicitly export to avoid naming conflicts with types
export {
  EventTypeCard,
  BookingCalendar,
  BookingForm,
  BookingConfirmation as BookingConfirmationComponent,
} from './components';
