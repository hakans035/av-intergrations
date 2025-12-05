import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock email functions
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  isResendConfigured: vi.fn().mockReturnValue(true),
  renderEmailTemplate: vi.fn().mockResolvedValue({
    html: '<html><body>Calculator Report Email</body></html>',
    subject: 'Uw Rapport - Ambition Valley',
  }),
  CalculatorReportEmail: () => null,
  getEmailSubject: vi.fn().mockReturnValue('Uw Rapport - Ambition Valley'),
}))

// Mock PDF generation
vi.mock('@/integrations/calculators/lib/pdf', () => ({
  generateSparenVsBeleggenReport: vi.fn().mockResolvedValue(Buffer.from('PDF content')),
  generatePensioenbeleggenReport: vi.fn().mockResolvedValue(Buffer.from('PDF content')),
}))

// Import after mocks
import { POST } from '@/app/api/report/send/route'
import * as email from '@/lib/email'
import * as pdf from '@/integrations/calculators/lib/pdf'

describe('Calculator Report Send API', () => {
  // Use unique emails per test to avoid rate limiting
  let testCounter = 0

  const getUniqueEmail = () => `test${Date.now()}${testCounter++}@resend.dev`

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mocks to default behavior
    vi.mocked(email.isResendConfigured).mockReturnValue(true)
    vi.mocked(email.sendEmail).mockResolvedValue({ success: true, messageId: 'test-message-id' })
    vi.mocked(pdf.generateSparenVsBeleggenReport).mockResolvedValue(Buffer.from('PDF content'))
    vi.mocked(pdf.generatePensioenbeleggenReport).mockResolvedValue(Buffer.from('PDF content'))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (body: unknown): NextRequest => {
    return {
      json: () => Promise.resolve(body),
      headers: new Headers({
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        referer: 'http://localhost:3000/calculators/sparen-vs-beleggen',
      }),
    } as unknown as NextRequest
  }

  const createValidSparenVsBeleggenRequest = (emailOverride?: string) => ({
    email: emailOverride || getUniqueEmail(),
    calculator: 'sparen-vs-beleggen',
    inputs: {
      startkapitaal: 10000,
      maandelijkseInleg: 500,
      looptijdJaren: 20,
      rentePercentageSparen: 2,
      verwachtRendement: 7,
    },
    results: {
      eindkapitaalBeleggen: 250000,
      eindkapitaalSparen: 180000,
      verschil: 70000,
    },
  })

  const createValidPensioenbeleggenRequest = (emailOverride?: string) => ({
    email: emailOverride || getUniqueEmail(),
    calculator: 'pensioenbeleggen',
    inputs: {
      huidigeWaarde: 50000,
      verwachtRendement: 6,
      looptijdJaren: 30,
    },
    results: {
      eindkapitaalNaDoorgroei: 300000,
      totaleLooptijdJaar: 30,
      eindkapitaalSparen: 100000,
      verschil: 200000,
    },
  })

  describe('POST /api/report/send', () => {
    it('should successfully send a sparen-vs-beleggen report', async () => {
      const requestData = createValidSparenVsBeleggenRequest('delivered@resend.dev')
      const request = createMockRequest(requestData)
      const response = await POST(request)
      const body = await response.json()

      expect(body.success).toBe(true)
      expect(body.message).toBe('Report sent successfully')
      expect(response.status).toBe(200)
    })

    it('should successfully send a pensioenbeleggen report', async () => {
      const requestData = createValidPensioenbeleggenRequest()
      const request = createMockRequest(requestData)
      const response = await POST(request)
      const body = await response.json()

      expect(body.success).toBe(true)
      expect(body.message).toBe('Report sent successfully')
    })

    it('should generate PDF with correct data', async () => {
      const requestData = createValidSparenVsBeleggenRequest()
      const request = createMockRequest(requestData)
      await POST(request)

      expect(pdf.generateSparenVsBeleggenReport).toHaveBeenCalledWith(
        expect.objectContaining({
          inputs: requestData.inputs,
          results: requestData.results,
        })
      )
    })

    it('should send email with PDF attachment', async () => {
      const testEmail = getUniqueEmail()
      const requestData = createValidSparenVsBeleggenRequest(testEmail)
      const request = createMockRequest(requestData)
      await POST(request)

      expect(email.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: expect.stringContaining('sparen-vs-beleggen-rapport'),
              content: expect.any(Buffer),
            }),
          ]),
        })
      )
    })

    it('should return 400 for missing required fields', async () => {
      const invalidRequest = {
        email: getUniqueEmail(),
        // Missing calculator, inputs, results
      }
      const request = createMockRequest(invalidRequest)
      const response = await POST(request)
      const body = await response.json()

      expect(body.success).toBe(false)
      expect(body.error).toBe('Missing required fields')
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid email format', async () => {
      const invalidEmailRequest = {
        ...createValidSparenVsBeleggenRequest(),
        email: 'invalid-email',
      }
      const request = createMockRequest(invalidEmailRequest)
      const response = await POST(request)
      const body = await response.json()

      expect(body.success).toBe(false)
      expect(body.error).toBe('Invalid email address')
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid calculator type', async () => {
      const invalidCalculatorRequest = {
        ...createValidSparenVsBeleggenRequest(),
        calculator: 'invalid-calculator',
      }
      const request = createMockRequest(invalidCalculatorRequest)
      const response = await POST(request)
      const body = await response.json()

      expect(body.success).toBe(false)
      expect(body.error).toBe('Invalid calculator type')
      expect(response.status).toBe(400)
    })

    it('should return 503 when Resend is not configured', async () => {
      vi.mocked(email.isResendConfigured).mockReturnValue(false)

      const request = createMockRequest(createValidSparenVsBeleggenRequest())
      const response = await POST(request)
      const body = await response.json()

      expect(body.success).toBe(false)
      expect(body.error).toBe('Email service not configured')
      expect(response.status).toBe(503)
    })

    it('should return 500 when PDF generation fails', async () => {
      vi.mocked(pdf.generateSparenVsBeleggenReport).mockRejectedValue(new Error('PDF error'))

      const request = createMockRequest(createValidSparenVsBeleggenRequest())
      const response = await POST(request)
      const body = await response.json()

      expect(body.success).toBe(false)
      expect(body.error).toBe('Failed to generate PDF report')
      expect(response.status).toBe(500)
    })

    it('should return 500 when email sending fails', async () => {
      vi.mocked(email.sendEmail).mockResolvedValue({ success: false, error: 'Email service error' })

      const request = createMockRequest(createValidSparenVsBeleggenRequest())
      const response = await POST(request)
      const body = await response.json()

      expect(body.success).toBe(false)
      expect(body.error).toBe('Email service error')
      expect(response.status).toBe(500)
    })

    it('should return 400 for vastgoedbelegging calculator (not implemented)', async () => {
      const vastgoedRequest = {
        ...createValidSparenVsBeleggenRequest(),
        calculator: 'vastgoedbelegging',
      }
      const request = createMockRequest(vastgoedRequest)
      const response = await POST(request)
      const body = await response.json()

      expect(body.success).toBe(false)
      expect(body.error).toBe('This calculator report is not yet available')
      expect(response.status).toBe(400)
    })

    it('should sanitize inputs to prevent XSS', async () => {
      const requestData = createValidSparenVsBeleggenRequest()
      const xssRequest = {
        ...requestData,
        inputs: {
          ...requestData.inputs,
          maliciousField: '<script>alert("xss")</script>',
        },
      }
      const request = createMockRequest(xssRequest)
      await POST(request)

      expect(pdf.generateSparenVsBeleggenReport).toHaveBeenCalledWith(
        expect.objectContaining({
          inputs: expect.objectContaining({
            maliciousField: 'alert("xss")', // Script tags should be removed
          }),
        })
      )
    })
  })
})
