// Resend email sending
export { sendEmail, isResendConfigured, getEmailMetadata } from './resend'
export type { SendEmailParams, SendEmailResult } from './resend'

// Email rendering
export { renderEmailTemplate } from './renderEmail'
export type { EmailRenderResult } from './renderEmail'

// Calculator report email template
export { CalculatorReportEmail, getEmailSubject } from './templates/calculatorReport'
export type { CalculatorReportEmailProps, EmailSummaryData, CalculatorType } from './templates/calculatorReport'

// Form submission email template
export { FormSubmissionEmail, getFormEmailSubject } from './templates/formSubmission'
export type { FormSubmissionEmailProps } from './templates/formSubmission'

// Booking confirmation email template
export { BookingConfirmationEmail, getBookingConfirmationSubject } from './templates/bookingConfirmation'
export type { BookingConfirmationEmailProps } from './templates/bookingConfirmation'

// Booking cancellation email template
export { BookingCancellationEmail, getBookingCancellationSubject } from './templates/bookingCancellation'
export type { BookingCancellationEmailProps } from './templates/bookingCancellation'

// Booking reminder email template
export { BookingReminderEmail, getBookingReminderSubject } from './templates/bookingReminder'
export type { BookingReminderEmailProps } from './templates/bookingReminder'

// Intake follow-up email template
export { IntakeFollowUpEmail, getIntakeFollowUpSubject } from './templates/intakeFollowUp'
export type { IntakeFollowUpEmailProps } from './templates/intakeFollowUp'

// Team notification email template
export { TeamNotificationEmail, getTeamNotificationSubject } from './templates/teamNotification'
export type { TeamNotificationEmailProps, NotificationType } from './templates/teamNotification'

// Lead follow-up email template
export { LeadFollowUpEmail, getLeadFollowUpSubject } from './templates/leadFollowUp'
export type { LeadFollowUpEmailProps } from './templates/leadFollowUp'
