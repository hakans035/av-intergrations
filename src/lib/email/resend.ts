import { Resend } from 'resend'

// Email configuration - domain verified in Resend
const FROM_EMAIL = 'Ambition Valley <rapport@ambitionvalley.nl>'
const REPLY_TO_EMAIL = 'info@ambitionvalley.nl'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
  }>
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
  const { to, subject, html, attachments } = params

  // Initialize Resend client inside function to ensure env var is loaded
  const apiKey = process.env.RESEND_API_KEY
  console.log('[Resend] API Key present:', !!apiKey, apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING')
  console.log('[Resend] FROM_EMAIL:', FROM_EMAIL)

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
      from: FROM_EMAIL,
      subject,
      hasAttachments: !!attachments?.length,
      timestamp: new Date().toISOString(),
    })

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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
export function getEmailMetadata() {
  return {
    from: FROM_EMAIL,
    replyTo: REPLY_TO_EMAIL,
  }
}
