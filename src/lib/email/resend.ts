import { Resend } from 'resend'

// Email configuration - domain verified in Resend
// Two sender addresses for different purposes:
// - rapport: for calculator reports only
// - notifications: for booking confirmations and all other emails
const FROM_EMAIL_RAPPORT = 'Ambition Valley <rapport@ambitionvalley.nl>'
const FROM_EMAIL_NOTIFICATIONS = 'Ambition Valley <notifications@ambitionvalley.nl>'
const REPLY_TO_EMAIL = 'info@ambitionvalley.nl'

export type EmailType = 'rapport' | 'notification'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
  }>
  type?: EmailType // defaults to 'notification'
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email via Resend
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, attachments, type = 'notification' } = params

  // Select sender based on email type
  const fromEmail = type === 'rapport' ? FROM_EMAIL_RAPPORT : FROM_EMAIL_NOTIFICATIONS

  // Initialize Resend client inside function to ensure env var is loaded
  const apiKey = process.env.RESEND_API_KEY
  console.log('[Resend] API Key present:', !!apiKey, apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING')
  console.log('[Resend] FROM_EMAIL:', fromEmail, '(type:', type, ')')

  if (!apiKey) {
    return {
      success: false,
      error: 'Resend API key not configured',
    }
  }

  const resend = new Resend(apiKey)

  try {
    // Log the attempt
    console.log('[Resend] Sending email:', {
      to,
      from: fromEmail,
      type,
      subject,
      hasAttachments: !!attachments?.length,
      timestamp: new Date().toISOString(),
    })

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      replyTo: REPLY_TO_EMAIL,
      subject,
      html,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      })),
    })

    if (error) {
      console.error('[Resend] Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    // Log success
    console.log('[Resend] Email sent successfully:', {
      messageId: data?.id,
      to,
      timestamp: new Date().toISOString(),
    })

    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error) {
    console.error('[Resend] Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Check if Resend is configured
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Get email metadata
 */
export function getEmailMetadata(type: EmailType = 'notification') {
  return {
    from: type === 'rapport' ? FROM_EMAIL_RAPPORT : FROM_EMAIL_NOTIFICATIONS,
    replyTo: REPLY_TO_EMAIL,
  }
}
