import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { sendEmail, isResendConfigured, renderEmailTemplate, CalculatorReportEmail, getEmailSubject } from '@/lib/email'
import type { EmailSummaryData, CalculatorType } from '@/lib/email'
import {
  generateSparenVsBeleggenReport,
  generatePensioenbeleggenReport,
} from '@/integrations/calculators/lib/pdf'
import type {
  SparenVsBeleggenReportData,
  PensioenbeleggenReportData,
} from '@/integrations/calculators/lib/pdf'

// Types
interface ReportRequest {
  email: string
  calculator: CalculatorType
  inputs: Record<string, unknown>
  results: Record<string, unknown>
}

interface SuccessResponse {
  success: true
  message: string
}

interface ErrorResponse {
  success: false
  error: string
}

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Valid calculator types
const VALID_CALCULATORS: CalculatorType[] = [
  'sparen-vs-beleggen',
  'pensioenbeleggen',
  'vastgoedbelegging',
]

/**
 * Check rate limit for an email address
 */
function checkRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const normalizedEmail = email.toLowerCase()
  const record = rateLimitStore.get(normalizedEmail)

  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(normalizedEmail, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  // Increment count
  record.count++
  rateLimitStore.set(normalizedEmail, record)
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Validate calculator type
 */
function isValidCalculator(calculator: string): calculator is CalculatorType {
  return VALID_CALCULATORS.includes(calculator as CalculatorType)
}

/**
 * Sanitize input data
 */
function sanitizeInputs(inputs: unknown): Record<string, unknown> | null {
  if (typeof inputs !== 'object' || inputs === null) {
    return null
  }
  // Basic sanitization - remove any potential XSS
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string') {
      sanitized[key] = value.replace(/<[^>]*>/g, '')
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value
    } else if (Array.isArray(value)) {
      sanitized[key] = value
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInputs(value)
    }
  }
  return sanitized
}

/**
 * POST /api/report/send
 * Send a PDF report via email
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  console.log(`\n[${requestId}] ========== NEW REPORT REQUEST ==========`)
  console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`)
  console.log(`[${requestId}] Origin: ${request.headers.get('origin') || 'unknown'}`)
  console.log(`[${requestId}] Referer: ${request.headers.get('referer') || 'unknown'}`)

  try {
    // Parse request body
    console.log(`[${requestId}] Step 1: Parsing request body...`)
    const body = await request.json() as ReportRequest
    console.log(`[${requestId}] Body received:`, {
      email: body.email,
      calculator: body.calculator,
      hasInputs: !!body.inputs,
      hasResults: !!body.results,
      inputKeys: body.inputs ? Object.keys(body.inputs) : [],
      resultKeys: body.results ? Object.keys(body.results) : [],
    })

    // Validate required fields
    console.log(`[${requestId}] Step 2: Validating required fields...`)
    if (!body.email || !body.calculator || !body.inputs || !body.results) {
      console.log(`[${requestId}] FAILED: Missing required fields`, {
        hasEmail: !!body.email,
        hasCalculator: !!body.calculator,
        hasInputs: !!body.inputs,
        hasResults: !!body.results,
      })
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    console.log(`[${requestId}] Step 3: Validating email format...`)
    if (!isValidEmail(body.email)) {
      console.log(`[${requestId}] FAILED: Invalid email format: ${body.email}`)
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate calculator type
    console.log(`[${requestId}] Step 4: Validating calculator type...`)
    if (!isValidCalculator(body.calculator)) {
      console.log(`[${requestId}] FAILED: Invalid calculator type: ${body.calculator}`)
      return NextResponse.json(
        { success: false, error: 'Invalid calculator type' },
        { status: 400 }
      )
    }

    // Check rate limit
    console.log(`[${requestId}] Step 5: Checking rate limit...`)
    const { allowed, remaining } = checkRateLimit(body.email)
    if (!allowed) {
      console.log(`[${requestId}] FAILED: Rate limit exceeded for ${body.email}`)
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Maximum 5 requests per hour.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      )
    }
    console.log(`[${requestId}] Rate limit OK, remaining: ${remaining}`)

    // Sanitize inputs
    console.log(`[${requestId}] Step 6: Sanitizing inputs...`)
    const sanitizedInputs = sanitizeInputs(body.inputs)
    const sanitizedResults = sanitizeInputs(body.results)

    if (!sanitizedInputs || !sanitizedResults) {
      console.log(`[${requestId}] FAILED: Invalid input data after sanitization`)
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      )
    }
    console.log(`[${requestId}] Sanitization complete`)

    // Log the request
    console.log(`[${requestId}] Step 7: Request validated successfully`, {
      email: body.email,
      calculator: body.calculator,
    })

    // Check if Resend is configured
    console.log(`[${requestId}] Step 8: Checking Resend configuration...`)
    if (!isResendConfigured()) {
      console.error(`[${requestId}] FAILED: Resend API key not configured`)
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 503 }
      )
    }
    console.log(`[${requestId}] Resend is configured`)

    // Generate PDF based on calculator type
    console.log(`[${requestId}] Step 9: Generating PDF for ${body.calculator}...`)
    let pdfBuffer: Buffer
    let pdfFilename: string
    let emailSummary: EmailSummaryData

    try {
      switch (body.calculator) {
        case 'sparen-vs-beleggen': {
          // Combine inputs and results for PDF generation
          const pdfData = {
            inputs: sanitizedInputs,
            results: sanitizedResults,
          } as unknown as Omit<SparenVsBeleggenReportData, 'generatedDate'>
          pdfBuffer = await generateSparenVsBeleggenReport(pdfData)
          pdfFilename = `sparen-vs-beleggen-rapport-${Date.now()}.pdf`

          // Extract results for email summary
          const results = sanitizedResults as Record<string, unknown>
          emailSummary = {
            calculatorType: 'sparen-vs-beleggen',
            eindkapitaalBeleggen: results.eindkapitaalBeleggen as number,
            eindkapitaalSparen: results.eindkapitaalSparen as number,
            verschil: results.verschil as number,
          }
          break
        }
        case 'pensioenbeleggen': {
          // Combine inputs and results for PDF generation
          const pdfData = {
            inputs: sanitizedInputs,
            results: sanitizedResults,
          } as unknown as Omit<PensioenbeleggenReportData, 'generatedDate'>
          pdfBuffer = await generatePensioenbeleggenReport(pdfData)
          pdfFilename = `pensioenbeleggen-rapport-${Date.now()}.pdf`

          // Extract results for email summary
          const results = sanitizedResults as Record<string, unknown>
          emailSummary = {
            calculatorType: 'pensioenbeleggen',
            eindkapitaalNaDoorgroei: results.eindkapitaalNaDoorgroei as number,
            totaleLooptijdJaar: results.totaleLooptijdJaar as number,
            eindkapitaalSparen: results.eindkapitaalSparen as number,
            verschil: results.verschil as number,
          }
          break
        }
        case 'vastgoedbelegging': {
          // Vastgoedbelegging not yet implemented
          console.log(`[${requestId}] FAILED: Vastgoedbelegging not yet implemented`)
          return NextResponse.json(
            { success: false, error: 'This calculator report is not yet available' },
            { status: 400 }
          )
        }
        default:
          return NextResponse.json(
            { success: false, error: 'Unsupported calculator type' },
            { status: 400 }
          )
      }
    } catch (pdfError) {
      console.error(`[${requestId}] FAILED: PDF generation error:`, pdfError)
      return NextResponse.json(
        { success: false, error: 'Failed to generate PDF report' },
        { status: 500 }
      )
    }

    console.log(`[${requestId}] PDF generated: ${pdfFilename} (${pdfBuffer.length} bytes)`)

    // Render email HTML
    console.log(`[${requestId}] Step 10: Rendering email template...`)
    const { html } = await renderEmailTemplate(
      CalculatorReportEmail,
      { summary: emailSummary },
      getEmailSubject(body.calculator)
    )

    // Send email via Resend (using 'rapport' sender for calculator reports)
    console.log(`[${requestId}] Step 11: Sending email via Resend...`)
    const emailResult = await sendEmail({
      to: body.email,
      subject: getEmailSubject(body.calculator),
      html,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
        },
      ],
      type: 'rapport', // Use rapport@ambitionvalley.nl for calculator reports
    })

    if (!emailResult.success) {
      console.error(`[${requestId}] FAILED: Email sending error:`, emailResult.error)
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    console.log(`[${requestId}] SUCCESS! Email sent, messageId: ${emailResult.messageId}`)
    console.log(`[${requestId}] ========== REQUEST COMPLETE ==========\n`)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Report sent successfully',
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    )
  } catch (error) {
    console.error(`[${requestId}] UNEXPECTED ERROR:`, error)

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      console.error(`[${requestId}] JSON parse error`)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Generic server error
    console.error(`[${requestId}] Generic server error`)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
