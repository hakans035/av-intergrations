import { NextResponse } from 'next/server';
import { createServiceClient, type Json } from '@/lib/supabase';
import { formSubmissionSchema } from '@/lib/validation/schemas';
import { validateCsrfToken } from '@/lib/security/csrf';
import { rateLimit, getClientIp, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { sendEmail, renderEmailTemplate, FormSubmissionEmail, getFormEmailSubject } from '@/lib/email';
import { ambitionValleyForm } from '@/integrations/form/data/ambition-valley-form';

export async function POST(request: Request) {
  const requestId = `form_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const startTime = Date.now();

  console.log(`[${requestId}] ====== Form Submission Started ======`);
  console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
  console.log(`[${requestId}] Origin: ${request.headers.get('origin') || 'unknown'}`);
  console.log(`[${requestId}] User-Agent: ${request.headers.get('user-agent')?.substring(0, 100) || 'unknown'}`);

  try {
    // Rate limiting
    console.log(`[${requestId}] Step 1: Checking rate limit...`);
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult.limited) {
      console.warn(`[${requestId}] BLOCKED: Rate limit exceeded. Retry after: ${rateLimitResult.retryAfter}s`);
      return NextResponse.json(
        {
          success: false,
          message: 'Te veel verzoeken. Probeer het later opnieuw.',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
          },
        }
      );
    }
    console.log(`[${requestId}] Rate limit OK. Remaining: ${rateLimitResult.remaining}`);

    // CSRF validation
    console.log(`[${requestId}] Step 2: Validating CSRF token...`);
    const isValidCsrf = await validateCsrfToken(request);
    if (!isValidCsrf) {
      console.warn(`[${requestId}] BLOCKED: Invalid CSRF token`);
      return NextResponse.json(
        {
          success: false,
          message: 'Ongeldige beveiligingstoken. Vernieuw de pagina en probeer opnieuw.',
        },
        { status: 403 }
      );
    }
    console.log(`[${requestId}] CSRF validation OK`);

    // Parse and validate request body
    console.log(`[${requestId}] Step 3: Parsing request body...`);
    const body = await request.json();
    console.log(`[${requestId}] Form ID: ${body.formId || 'missing'}`);
    console.log(`[${requestId}] Session ID: ${body.sessionId || 'missing'}`);
    console.log(`[${requestId}] Answer count: ${Object.keys(body.answers || {}).length}`);

    const validationResult = formSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      console.warn(`[${requestId}] VALIDATION ERROR: ${JSON.stringify(errors)}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Ongeldige invoer',
          errors,
        },
        { status: 400 }
      );
    }
    console.log(`[${requestId}] Validation OK`);

    const data = validationResult.data;

    // Extract contact info from answers (using field types from form definition)
    console.log(`[${requestId}] Step 4: Extracting contact info...`);
    const name = extractContactField(data.answers, ['name', 'naam', 'voornaam']);
    const email = extractContactField(data.answers, ['email', 'e-mail', 'emailadres'], 'email');
    const phone = extractContactField(data.answers, ['phone', 'telefoon', 'telefoonnummer', 'mobiel'], 'phone_number');
    console.log(`[${requestId}] Contact: name=${name ? 'present' : 'missing'}, email=${email ? email.substring(0, 3) + '***' : 'missing'}, phone=${phone ? 'present' : 'missing'}`);

    // Determine qualification result based on thankyou screen or other logic
    const qualificationResult = determineQualificationResult(data.answers);
    console.log(`[${requestId}] Qualification result: ${qualificationResult}`);

    // Get tracking info
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = getClientIp(request);
    console.log(`[${requestId}] IP: ${ipAddress}`);
    console.log(`[${requestId}] UTM: source=${data.utmSource || 'none'}, medium=${data.utmMedium || 'none'}, campaign=${data.utmCampaign || 'none'}`);


    // Create Supabase client with service role
    console.log(`[${requestId}] Step 5: Saving to database...`);
    const supabase = createServiceClient();

    // Create submission record
    const { data: submission, error } = await supabase
      .from('form_submissions')
      .insert({
        form_id: data.formId,
        name: name ?? null,
        email: email ?? null,
        phone: phone ?? null,
        answers: data.answers as Json,
        qualification_result: qualificationResult,
        user_agent: userAgent ?? null,
        ip_address: ipAddress !== 'unknown' ? ipAddress : null,
        session_id: data.sessionId ?? null,
        utm_source: data.utmSource ?? null,
        utm_medium: data.utmMedium ?? null,
        utm_campaign: data.utmCampaign ?? null,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`[${requestId}] DATABASE ERROR:`, error.message, error.code, error.details);
      throw error;
    }
    console.log(`[${requestId}] Database insert OK. Submission ID: ${submission.id}`);

    // Send confirmation email if email is present
    if (email) {
      console.log(`[${requestId}] Step 6: Preparing confirmation email...`);
      try {
        // Build answers summary with question titles
        const answersForEmail = buildAnswersSummary(data.answers, data.formId);
        console.log(`[${requestId}] Email answers prepared: ${Object.keys(answersForEmail).length} items`);

        // Render email template
        const emailProps = {
          name: name || '',
          email,
          qualificationResult,
          formId: data.formId,
          answers: answersForEmail,
        };
        const { html, subject } = await renderEmailTemplate(
          FormSubmissionEmail,
          emailProps,
          getFormEmailSubject()
        );
        console.log(`[${requestId}] Email template rendered. Subject: ${subject}`);

        // Send email (don't await to not block response)
        sendEmail({
          to: email,
          subject,
          html,
        }).then((result) => {
          if (result.success) {
            console.log(`[${requestId}] EMAIL SENT OK. MessageId: ${result.messageId}`);
          } else {
            console.error(`[${requestId}] EMAIL FAILED: ${result.error}`);
          }
        }).catch((err) => {
          console.error(`[${requestId}] EMAIL ERROR:`, err);
        });
      } catch (emailError) {
        // Log but don't fail the submission
        console.error(`[${requestId}] EMAIL PREPARATION ERROR:`, emailError);
      }
    } else {
      console.log(`[${requestId}] Step 6: Skipping email (no email address)`);
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ====== Form Submission Complete ======`);
    console.log(`[${requestId}] Duration: ${duration}ms`);
    console.log(`[${requestId}] Result: SUCCESS`);

    // Return success response with rate limit headers
    return NextResponse.json(
      {
        success: true,
        message: 'Formulier succesvol verzonden',
        data: {
          id: submission.id,
          qualificationResult,
        },
      },
      {
        status: 201,
        headers: getRateLimitHeaders(
          rateLimitResult.remaining ?? 0,
          Date.now() + 60 * 60 * 1000
        ),
      }
    );
  } catch (error) {
    console.error('[API] Form submission error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Er is een fout opgetreden. Probeer het later opnieuw.',
      },
      { status: 500 }
    );
  }
}

/**
 * Extract a contact field value from answers by checking field type and possible field names
 */
function extractContactField(
  answers: Record<string, unknown>,
  possibleKeys: string[],
  fieldType?: string
): string | undefined {
  // First, try to find by field type from form definition
  if (fieldType) {
    const field = ambitionValleyForm.fields.find(f => f.type === fieldType);
    if (field && answers[field.ref] && typeof answers[field.ref] === 'string') {
      return answers[field.ref] as string;
    }
  }

  // Fallback: check for human-readable keys
  for (const key of possibleKeys) {
    // Check exact key match
    if (answers[key] && typeof answers[key] === 'string') {
      return answers[key] as string;
    }

    // Check for keys containing the search term
    for (const answerKey of Object.keys(answers)) {
      if (
        answerKey.toLowerCase().includes(key.toLowerCase()) &&
        typeof answers[answerKey] === 'string'
      ) {
        return answers[answerKey] as string;
      }
    }
  }
  return undefined;
}

/**
 * Determine qualification result based on answers
 * This is a simplified version - in practice, you might want to
 * match against the form's logic rules
 */
function determineQualificationResult(
  answers: Record<string, unknown>
): 'qualified' | 'disqualified' | 'partial' {
  // Check for disqualifying answers by looking up field titles
  const disqualifyingPatterns = [
    { titlePattern: 'eigenaar', value: 'no' },
    { titlePattern: 'bouwjaar', value: 'Na 2020' },
  ];

  for (const { titlePattern, value } of disqualifyingPatterns) {
    // Find field by title pattern
    const field = ambitionValleyForm.fields.find(f =>
      f.title.toLowerCase().includes(titlePattern.toLowerCase())
    );
    if (field && answers[field.ref] === value) {
      return 'disqualified';
    }
  }

  // Check if form was completed (has email field with valid email)
  const emailField = ambitionValleyForm.fields.find(f => f.type === 'email');
  if (emailField) {
    const emailValue = answers[emailField.ref];
    if (typeof emailValue === 'string' && emailValue.includes('@')) {
      return 'qualified';
    }
  }

  return 'partial';
}

/**
 * Build a summary of answers with question titles for the email
 */
function buildAnswersSummary(
  answers: Record<string, unknown>,
  formId: string
): Record<string, { question: string; answer: string | string[] }> {
  const result: Record<string, { question: string; answer: string | string[] }> = {};

  // Get form definition based on formId
  const formDefinition = formId === ambitionValleyForm.id ? ambitionValleyForm : null;

  for (const [key, value] of Object.entries(answers)) {
    if (value === undefined || value === null || value === '') continue;

    // Find the field in the form definition to get the question title
    let questionTitle = key;
    let displayValue: string | string[] = '';

    if (formDefinition) {
      const field = formDefinition.fields.find(
        (f) => f.ref === key || f.id === key
      );

      if (field) {
        questionTitle = field.title;

        // Convert answer to display value
        if (typeof value === 'boolean') {
          displayValue = value ? 'Ja' : 'Nee';
        } else if (Array.isArray(value)) {
          // For multiple choice with multiple selections, map refs to labels
          displayValue = value.map((v) => {
            if (field.properties.choices) {
              const choice = field.properties.choices.find(
                (c) => c.ref === v || c.label === v
              );
              return choice?.label || v;
            }
            return v;
          });
        } else if (typeof value === 'string') {
          // For single choice, map ref to label
          if (field.properties.choices) {
            const choice = field.properties.choices.find(
              (c) => c.ref === value || c.label === value
            );
            displayValue = choice?.label || value;
          } else if (value === 'yes') {
            displayValue = 'Ja';
          } else if (value === 'no') {
            displayValue = 'Nee';
          } else {
            displayValue = value;
          }
        }
      } else {
        // Field not found in definition, use raw value
        displayValue = typeof value === 'string' ? value : String(value);
      }
    } else {
      // No form definition, use raw value
      displayValue = typeof value === 'string' ? value : String(value);
    }

    result[key] = {
      question: questionTitle,
      answer: displayValue,
    };
  }

  return result;
}

// GET endpoint to retrieve submissions (protected, for admin use)
export async function GET(request: Request) {
  // In production, add proper authentication here
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Simple token check - in production, use proper JWT validation
  const token = authHeader.split(' ')[1];
  if (token !== process.env.ADMIN_API_TOKEN) {
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const formId = searchParams.get('formId');

    // Create Supabase client with service role
    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from('form_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (formId) {
      query = query.eq('form_id', formId);
    }

    const { data: submissions, count, error } = await query;

    if (error) {
      console.error('[API] Supabase query error:', error);
      throw error;
    }

    const total = count || 0;

    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[API] Get submissions error:', error);

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
