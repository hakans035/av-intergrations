// Resend email sending
export { sendEmail, isResendConfigured, getEmailMetadata } from './resend'
export type { SendEmailParams, SendEmailResult } from './resend'

// Email rendering
export { renderEmailTemplate } from './renderEmail'
export type { EmailRenderResult } from './renderEmail'

// Calculator report email template
export { CalculatorReportEmail, getEmailSubject } from './templates/calculatorReport'
export type { CalculatorReportEmailProps, EmailSummaryData, CalculatorType } from './templates/calculatorReport'
