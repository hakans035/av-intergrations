/**
 * Test Script: Full Flow - Form Submission → Intake Booking
 *
 * This script tests the complete user journey:
 * 1. Form submission (simulating a qualified user)
 * 2. Booking an intake appointment
 * 3. Email workflow trigger
 * 4. Calendar event creation
 *
 * Run with: npx tsx scripts/test-full-flow.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test user data
const TEST_USER = {
  name: 'Test Gebruiker',
  email: process.env.TEST_EMAIL || 'test@example.com',
  phone: '+31612345678',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' | 'step' = 'info') {
  const icons = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    step: `${colors.cyan}→${colors.reset}`,
  };
  console.log(`${icons[type]} ${message}`);
}

function logSection(title: string) {
  console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Step 1: Test Form Submission
// ============================================
async function testFormSubmission(): Promise<string | null> {
  logSection('STEP 1: Form Submission');

  // Simulate form answers for a qualified user
  const formData = {
    form_id: 'tIKMPvBf',
    name: TEST_USER.name,
    email: TEST_USER.email,
    phone: TEST_USER.phone,
    qualification_result: 'qualified',
    answers: {
      // Woon je in Nederland?
      'd8d36ddb-cc2b-4bd4-9b5e-0498f3032e02': 'Ja',
      // Wat is je huidige situatie?
      '8003f762-172c-4610-85ec-ffc22ec4403a': ['DGA (BV)'],
      // Wat is je totaal bruto-inkomen per jaar?
      'd07662a1-2637-457c-b071-c64637e6bf2c': '€100.000 – €200.000',
      // Wat is je vrij belegbaar vermogen?
      '6c970c5c-7d7e-474f-88b6-e40bac8b8755': '€100.000 – €250.000',
      // Heb je nu al een onderneming of vennootschap?
      '21a7380c-895e-44d3-ac04-0ddad29cff1f': true,
      // Welke rechtsvorm(en)?
      'c6a7dbed-1bd3-4fc0-b4da-764af31ecf92': ['Holding + werk-BV'],
      // Heb je momenteel beleggingen?
      '40cbcff5-a413-4486-a660-52c7020a091a': ['Aandelen / ETF\'s', 'Crypto'],
      // Wat is je belangrijkste doel?
      '45f84f09-09b1-46c9-8b79-5a2c56532cce': ['Belasting besparen', 'Vermogen laten groeien'],
      // Wanneer wil je starten?
      '101edde3-d76e-4091-9ceb-955ea5fd7413': 'Binnen 2 weken',
      // Naam
      'e4c76d43-32ad-4524-b1c2-006908648e60': TEST_USER.name,
      // Email
      'a24de67e-afa1-440f-8bb5-3ca5e82902ad': TEST_USER.email,
      // Phone
      '6f2eaa42-cd82-49b5-9c06-ad8d940023f7': TEST_USER.phone,
    },
    redirected_to: '/booking',
    session_id: `test-session-${Date.now()}`,
    started_at: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    completed_at: new Date().toISOString(),
  };

  log('Submitting form data...', 'step');
  log(`  Name: ${TEST_USER.name}`, 'info');
  log(`  Email: ${TEST_USER.email}`, 'info');
  log(`  Qualification: ${formData.qualification_result}`, 'info');

  try {
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      log(`Form submission created: ${result.data?.id || 'OK'}`, 'success');
      return result.data?.id || 'success';
    } else {
      log(`Form submission failed: ${result.message}`, 'error');
      return null;
    }
  } catch (error) {
    log(`Form submission error: ${error}`, 'error');
    return null;
  }
}

// ============================================
// Step 2: Get Intake Event Type
// ============================================
async function getIntakeEventType(): Promise<{ id: string; slug: string; title: string } | null> {
  logSection('STEP 2: Get Intake Event Type');

  log('Fetching gratis-intake event type...', 'step');

  try {
    const response = await fetch(`${BASE_URL}/api/booking/event-types/gratis-intake`);
    const result = await response.json();

    if (result.success && result.data?.eventType) {
      const eventType = result.data.eventType;
      log(`Found event type: ${eventType.title}`, 'success');
      log(`  ID: ${eventType.id}`, 'info');
      log(`  Duration: ${eventType.duration_minutes} minutes`, 'info');
      log(`  Price: ${eventType.price_cents === 0 ? 'Gratis' : `€${eventType.price_cents / 100}`}`, 'info');
      return eventType;
    } else {
      log(`Event type not found: ${result.message}`, 'error');
      return null;
    }
  } catch (error) {
    log(`Error fetching event type: ${error}`, 'error');
    return null;
  }
}

// ============================================
// Step 3: Get Available Slots
// ============================================
async function getAvailableSlots(eventTypeId: string): Promise<{ start: string; end: string } | null> {
  logSection('STEP 3: Get Available Time Slots');

  // Get slots for the next 7 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  log(`Fetching availability from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}...`, 'step');

  try {
    const params = new URLSearchParams({
      eventTypeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(`${BASE_URL}/api/booking/availability?${params}`);
    const result = await response.json();

    if (result.success && result.data?.slots?.length > 0) {
      const availableSlots = result.data.slots.filter((s: { available: boolean }) => s.available);
      log(`Found ${availableSlots.length} available slots`, 'success');

      if (availableSlots.length > 0) {
        // Pick a slot (preferably tomorrow or later)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const futureSlots = availableSlots.filter((s: { start: string }) => new Date(s.start) >= tomorrow);
        const selectedSlot = futureSlots.length > 0 ? futureSlots[0] : availableSlots[0];

        const slotDate = new Date(selectedSlot.start);
        log(`Selected slot: ${slotDate.toLocaleString('nl-NL')}`, 'info');

        return selectedSlot;
      }
    }

    log('No available slots found', 'warn');
    log('Make sure you have seeded the event types and availability schedules:', 'info');
    log('  npx tsx scripts/seed-events.ts', 'info');
    return null;
  } catch (error) {
    log(`Error fetching availability: ${error}`, 'error');
    return null;
  }
}

// ============================================
// Step 4: Create Booking
// ============================================
async function createBooking(
  eventTypeId: string,
  slot: { start: string; end: string }
): Promise<{ id: string; status: string } | null> {
  logSection('STEP 4: Create Booking');

  const bookingData = {
    eventTypeId,
    startTime: slot.start,
    customerName: TEST_USER.name,
    customerEmail: TEST_USER.email,
    customerPhone: TEST_USER.phone,
    customerNotes: 'Test booking via script',
    timezone: 'Europe/Amsterdam',
  };

  log('Creating booking...', 'step');
  log(`  Customer: ${bookingData.customerName}`, 'info');
  log(`  Email: ${bookingData.customerEmail}`, 'info');
  log(`  Time: ${new Date(bookingData.startTime).toLocaleString('nl-NL')}`, 'info');

  try {
    const response = await fetch(`${BASE_URL}/api/booking/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();

    if (result.success && result.data?.booking) {
      const booking = result.data.booking;
      log(`Booking created successfully!`, 'success');
      log(`  Booking ID: ${booking.id}`, 'info');
      log(`  Status: ${booking.status}`, 'info');
      log(`  Payment Status: ${booking.payment_status}`, 'info');

      if (booking.meeting_url) {
        log(`  Meeting URL: ${booking.meeting_url}`, 'success');
      } else {
        log(`  Meeting URL: Not created (check Microsoft Graph config)`, 'warn');
      }

      if (result.data.requiresPayment) {
        log(`  Checkout URL: ${result.data.checkoutUrl}`, 'info');
      }

      return booking;
    } else {
      log(`Booking failed: ${result.message}`, 'error');
      if (result.errors) {
        result.errors.forEach((e: { field: string; message: string }) => {
          log(`  - ${e.field}: ${e.message}`, 'error');
        });
      }
      return null;
    }
  } catch (error) {
    log(`Error creating booking: ${error}`, 'error');
    return null;
  }
}

// ============================================
// Step 5: Verify Email Was Sent
// ============================================
async function verifyEmailSent(bookingId: string): Promise<boolean> {
  logSection('STEP 5: Verify Email Workflow');

  log('Waiting 2 seconds for email to be processed...', 'step');
  await sleep(2000);

  log('Checking email logs...', 'step');

  // We need to use the service client to check email logs
  // For this script, we'll check via a simple database query
  try {
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      log('Supabase credentials not configured, skipping email verification', 'warn');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: logs, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) {
      log(`Error fetching email logs: ${error.message}`, 'error');
      return false;
    }

    if (logs && logs.length > 0) {
      log(`Found ${logs.length} email(s) for this booking:`, 'success');
      logs.forEach((emailLog: { email_subject: string; status: string; recipient_email: string; sent_at: string }) => {
        const statusIcon = emailLog.status === 'sent' ? '✓' : emailLog.status === 'failed' ? '✗' : '⏳';
        log(`  ${statusIcon} ${emailLog.email_subject}`, emailLog.status === 'sent' ? 'success' : 'warn');
        log(`    To: ${emailLog.recipient_email}`, 'info');
        log(`    Status: ${emailLog.status}`, 'info');
        if (emailLog.sent_at) {
          log(`    Sent at: ${new Date(emailLog.sent_at).toLocaleString('nl-NL')}`, 'info');
        }
      });
      return logs.some((l: { status: string }) => l.status === 'sent');
    } else {
      log('No emails found for this booking', 'warn');
      log('This could mean:', 'info');
      log('  - Email workflows are not seeded (run: npx tsx scripts/seed-email-workflows.ts)', 'info');
      log('  - Resend API key is not configured', 'info');
      return false;
    }
  } catch (error) {
    log(`Error verifying email: ${error}`, 'error');
    return false;
  }
}

// ============================================
// Step 6: Check Calendar Event
// ============================================
async function checkCalendarEvent(bookingId: string): Promise<boolean> {
  logSection('STEP 6: Verify Calendar Event');

  try {
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      log('Supabase credentials not configured', 'warn');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('meeting_url, meeting_id')
      .eq('id', bookingId)
      .single();

    if (error) {
      log(`Error fetching booking: ${error.message}`, 'error');
      return false;
    }

    if (booking?.meeting_url) {
      log('Calendar event with Teams meeting created!', 'success');
      log(`  Meeting ID: ${booking.meeting_id}`, 'info');
      log(`  Meeting URL: ${booking.meeting_url}`, 'info');
      return true;
    } else {
      log('No calendar event/meeting URL found', 'warn');
      log('This could mean:', 'info');
      log('  - Microsoft Graph credentials are not configured', 'info');
      log('  - Azure AD app is missing required permissions', 'info');
      log('  - The calendar event creation failed (check server logs)', 'info');
      return false;
    }
  } catch (error) {
    log(`Error checking calendar event: ${error}`, 'error');
    return false;
  }
}

// ============================================
// Main Test Runner
// ============================================
async function runTests() {
  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║                                                                ║
║   AMBITION VALLEY - Full Flow Test                            ║
║   Form Submission → Intake Booking                            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  log(`Base URL: ${BASE_URL}`, 'info');
  log(`Test Email: ${TEST_USER.email}`, 'info');
  console.log('');

  const results = {
    formSubmission: false,
    eventType: false,
    availability: false,
    booking: false,
    email: false,
    calendar: false,
  };

  // Step 1: Form Submission
  const submissionId = await testFormSubmission();
  results.formSubmission = !!submissionId;

  // Step 2: Get Event Type
  const eventType = await getIntakeEventType();
  results.eventType = !!eventType;

  if (!eventType) {
    log('Cannot continue without event type. Run: npx tsx scripts/seed-events.ts', 'error');
    printSummary(results);
    return;
  }

  // Step 3: Get Available Slots
  const slot = await getAvailableSlots(eventType.id);
  results.availability = !!slot;

  if (!slot) {
    log('Cannot continue without available slots', 'error');
    printSummary(results);
    return;
  }

  // Step 4: Create Booking
  const booking = await createBooking(eventType.id, slot);
  results.booking = !!booking;

  if (!booking) {
    log('Cannot continue without booking', 'error');
    printSummary(results);
    return;
  }

  // Step 5: Verify Email
  results.email = await verifyEmailSent(booking.id);

  // Step 6: Check Calendar
  results.calendar = await checkCalendarEvent(booking.id);

  // Print Summary
  printSummary(results);
}

function printSummary(results: Record<string, boolean>) {
  logSection('TEST SUMMARY');

  const tests = [
    { name: 'Form Submission', key: 'formSubmission' },
    { name: 'Event Type Lookup', key: 'eventType' },
    { name: 'Availability Check', key: 'availability' },
    { name: 'Booking Creation', key: 'booking' },
    { name: 'Email Workflow', key: 'email' },
    { name: 'Calendar Event', key: 'calendar' },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const status = results[test.key];
    if (status) {
      log(`${test.name}: PASSED`, 'success');
      passed++;
    } else {
      log(`${test.name}: FAILED`, 'error');
      failed++;
    }
  });

  console.log('');
  console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${passed}${colors.reset}  |  ${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}`);

  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed! The full flow is working correctly.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Check the output above for details.${colors.reset}\n`);
  }
}

// Run the tests
runTests().catch(console.error);
