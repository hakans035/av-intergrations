import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Define mocks at module level (hoisted)
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      body,
      status: init?.status || 200,
      headers: init?.headers || {},
    }),
  },
}))

// Mock Supabase with factory function
vi.mock('@/lib/supabase', () => {
  const mockSingle = vi.fn()
  const mockSelect = vi.fn(() => ({ single: mockSingle }))
  const mockInsert = vi.fn(() => ({ select: mockSelect }))

  return {
    createServiceClient: () => ({
      from: () => ({
        insert: mockInsert,
      }),
    }),
    Json: {},
    __mocks: { mockInsert, mockSelect, mockSingle },
  }
})

// Mock rate limiting
vi.mock('@/lib/security/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ limited: false, remaining: 10 }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  getRateLimitHeaders: vi.fn().mockReturnValue({}),
}))

// Mock CSRF validation
vi.mock('@/lib/security/csrf', () => ({
  validateCsrfToken: vi.fn().mockResolvedValue(true),
}))

// Mock email
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' }),
  renderEmailTemplate: vi.fn().mockResolvedValue({
    html: '<html><body>Test Email</body></html>',
    subject: 'Test Subject',
  }),
  FormSubmissionEmail: () => null,
  getFormEmailSubject: vi.fn().mockReturnValue('Test Subject'),
}))

// Import after mocks
import { POST } from '@/app/api/submissions/route'
import * as supabase from '@/lib/supabase'
import * as email from '@/lib/email'

describe('Form Submissions API', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSingle: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Get access to the mock functions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mocks = (supabase as any).__mocks
    mockSingle = mocks.mockSingle
    mockSingle.mockResolvedValue({
      data: { id: 'test-submission-id' },
      error: null,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (body: unknown, headers: Record<string, string> = {}) => {
    return {
      json: () => Promise.resolve(body),
      headers: new Headers({
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        'user-agent': 'test-agent',
        ...headers,
      }),
    } as unknown as Request
  }

  const validSubmission = {
    formId: 'ambition-valley-form',
    answers: {
      name: 'Test User',
      email: 'delivered@resend.dev', // Resend dev address
      phone: '0612345678',
      eigenaar: 'yes',
      bouwjaar: 'Voor 2020',
    },
    sessionId: 'test-session-123',
    utmSource: 'test',
    utmMedium: 'email',
    utmCampaign: 'test-campaign',
  }

  describe('POST /api/submissions', () => {
    it('should successfully submit a form with valid data', async () => {
      const request = createMockRequest(validSubmission)
      const response = await POST(request)

      expect(response.body).toEqual({
        success: true,
        message: 'Formulier succesvol verzonden',
        data: {
          id: 'test-submission-id',
          qualificationResult: 'qualified',
        },
      })
      expect(response.status).toBe(201)
    })

    it('should send confirmation email when email is provided', async () => {
      const request = createMockRequest(validSubmission)
      await POST(request)

      // Email is sent asynchronously, so we need to wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(email.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'delivered@resend.dev',
        })
      )
    })

    it('should not send email when email is missing', async () => {
      const submissionWithoutEmail = {
        ...validSubmission,
        answers: {
          name: 'Test User',
          eigenaar: 'yes',
        },
      }
      const request = createMockRequest(submissionWithoutEmail)
      await POST(request)

      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(email.sendEmail).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid submission data', async () => {
      const invalidSubmission = {
        // Missing required formId
        answers: {},
      }
      const request = createMockRequest(invalidSubmission)
      const response = await POST(request)

      expect(response.body.success).toBe(false)
      expect(response.status).toBe(400)
    })

    it('should handle database errors gracefully', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB001', details: '' },
      })

      const request = createMockRequest(validSubmission)
      const response = await POST(request)

      expect(response.body.success).toBe(false)
      expect(response.status).toBe(500)
    })

    it('should return qualified status for complete submissions', async () => {
      const request = createMockRequest(validSubmission)
      const response = await POST(request)

      expect(response.body.data.qualificationResult).toBe('qualified')
    })

    it('should return disqualified status for disqualifying answers', async () => {
      const disqualifyingSubmission = {
        ...validSubmission,
        answers: {
          ...validSubmission.answers,
          eigenaar: 'no', // Disqualifying answer
        },
      }
      const request = createMockRequest(disqualifyingSubmission)
      const response = await POST(request)

      expect(response.body.data.qualificationResult).toBe('disqualified')
    })
  })
})
