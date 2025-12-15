/**
 * Full Flow Test Script for Production
 * Tests the complete journey from form submission to booking for ALL event types
 *
 * Run with: npx tsx scripts/test-full-flow.ts
 */

const PROD_URL = 'https://check.ambitionvalley.nl';

// Test users
const TEST_USERS = [
  {
    name: 'Hakan Sahingoz',
    email: 'hakan@ambitionvalley.nl',
    phone: '+31612345678',
  },
  {
    name: 'Ramin Ahmadi',
    email: 'ramin@ambitionvalley.nl',
    phone: '+31687654321',
  },
];

// Form field refs from ambition-valley-form.ts
const FORM_FIELDS = {
  woonInNederland: 'd8d36ddb-cc2b-4bd4-9b5e-0498f3032e02',
  situatie: '8003f762-172c-4610-85ec-ffc22ec4403a',
  inkomen: 'd07662a1-2637-457c-b071-c64637e6bf2c',
  vermogen: '6c970c5c-7d7e-474f-88b6-e40bac8b8755',
  heeftOnderneming: '21a7380c-895e-44d3-ac04-0ddad29cff1f',
  rechtsvorm: 'c6a7dbed-1bd3-4fc0-b4da-764af31ecf92',
  beleggingen: '40cbcff5-a413-4486-a660-52c7020a091a',
  doel: '45f84f09-09b1-46c9-8b79-5a2c56532cce',
  wanneerStarten: '101edde3-d76e-4091-9ceb-955ea5fd7413',
  naam: 'e4c76d43-32ad-4524-b1c2-006908648e60',
  email: 'a24de67e-afa1-440f-8bb5-3ca5e82902ad',
  telefoon: '6f2eaa42-cd82-49b5-9c06-ad8d940023f7',
  notities: '6a6fd8a9-bd6a-4b89-ba43-b0d137ec8db4',
  akkoord: '05467da5-ab32-47ad-a77d-522ed2d6b0b2',
};

// Choice refs
const CHOICES = {
  ja: '32ba348e-bffb-498f-9145-4231df734365',
  nee: '494872f3-87ff-4052-9f73-c1ab6c98a72e',
  loondienst: '6516d91e-3eba-46fb-b3cb-10a9751d3c51',
  zzp: '4ffcf7f4-4084-4cd3-8c89-3081db8c0a7d',
  dga: '0f631b08-8aa5-4f98-972f-400cf0521cc7',
  inkomen50k: 'e69a1170-f738-4fa6-ad5d-27354a085c0b',
  inkomen100k: '0a8d5656-c244-454e-8009-fa29ef88e5db',
  inkomen200k: '08668935-59aa-42b8-9552-4244571be788',
  vermogen25k: '9bb18e4c-9412-4193-a3f1-ab5b804e2087',
  vermogen100k: 'b26f975d-3fc4-4c93-9ff4-cac80d3d3732',
  vermogen250k: 'f3282690-16bf-48f7-beb6-4c9fc8f58281',
  bv: '36d30107-b1eb-4834-8d55-dbe0a5d2c48b',
  holding: '767cb412-b2f5-4cdc-9d13-7ffa3f6270cc',
  aandelen: '5bbd0d9e-4c74-4e0c-8f2b-67914e7dac3f',
  crypto: '0f3afe4e-5e62-4317-b197-93f04c636391',
  belastingBesparen: '6c0dd0b1-1f3c-4c9a-85ca-8dcd97bec2e3',
  vermogenGroeien: '57d27a8a-2c90-4a35-8cd4-958c801a4886',
  binnen2Weken: 'ed7c3df3-d6d2-4768-b137-7a2d562af855',
  binnen1Maand: 'd8dcbce7-adea-4487-9135-626a58640870',
  akkoordVerzenden: 'f38e041b-19c6-4c69-9ea5-b492996ca4d0',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' | 'header' = 'info') {
  const icons = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    header: `${colors.cyan}🚀${colors.reset}`,
  };
  console.log(`${icons[type]} ${message}`);
}

function logSection(title: string) {
  console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
}

// ============================================
// Step 1: Submit Form
// ============================================
async function submitForm(user: typeof TEST_USERS[0]): Promise<{ success: boolean; id?: string }> {
  log(`Submitting form for ${user.name}...`, 'info');

  const sessionId = `test_session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const answers: Record<string, unknown> = {
    [FORM_FIELDS.woonInNederland]: CHOICES.ja,
    [FORM_FIELDS.situatie]: [CHOICES.dga],
    [FORM_FIELDS.inkomen]: CHOICES.inkomen200k,
    [FORM_FIELDS.vermogen]: CHOICES.vermogen250k,
    [FORM_FIELDS.heeftOnderneming]: 'yes',
    [FORM_FIELDS.rechtsvorm]: [CHOICES.holding, CHOICES.bv],
    [FORM_FIELDS.beleggingen]: [CHOICES.aandelen, CHOICES.crypto],
    [FORM_FIELDS.doel]: [CHOICES.belastingBesparen, CHOICES.vermogenGroeien],
    [FORM_FIELDS.wanneerStarten]: CHOICES.binnen2Weken,
    [FORM_FIELDS.naam]: user.name,
    [FORM_FIELDS.email]: user.email,
    [FORM_FIELDS.telefoon]: user.phone,
    [FORM_FIELDS.notities]: `Test from full flow script - ${new Date().toISOString()}`,
    [FORM_FIELDS.akkoord]: [CHOICES.akkoordVerzenden],
  };

  try {
    const response = await fetch(`${PROD_URL}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId: 'tIKMPvBf',
        sessionId,
        answers,
      }),
    });

    const result = await response.json();

    if (result.success) {
      log(`  ✓ Form submitted - ID: ${result.data?.id}, Status: ${result.data?.qualificationResult}`, 'success');
      return { success: true, id: result.data?.id };
    } else {
      log(`  ✗ Form failed: ${result.message}`, 'error');
      return { success: false };
    }
  } catch (error) {
    log(`  ✗ Form error: ${error}`, 'error');
    return { success: false };
  }
}

// ============================================
// Step 2: Get All Event Types
// ============================================
interface EventType {
  id: string;
  slug: string;
  title: string;
  duration_minutes: number;
  price_cents: number;
}

async function getEventTypes(): Promise<EventType[]> {
  log('Fetching all event types...', 'info');

  try {
    const response = await fetch(`${PROD_URL}/api/booking/event-types`);
    const result = await response.json();

    if (result.success && result.data) {
      log(`  ✓ Found ${result.data.length} event types:`, 'success');
      result.data.forEach((et: EventType) => {
        const price = et.price_cents === 0 ? 'Gratis' : `€${(et.price_cents / 100).toFixed(2)}`;
        console.log(`     - ${et.title} (${et.slug}) - ${et.duration_minutes}min - ${price}`);
      });
      return result.data;
    } else {
      log(`  ✗ Failed to fetch event types`, 'error');
      return [];
    }
  } catch (error) {
    log(`  ✗ Error: ${error}`, 'error');
    return [];
  }
}

// ============================================
// Step 3: Get Availability
// ============================================
interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

async function getAvailability(eventTypeId: string, eventTitle: string): Promise<TimeSlot[]> {
  log(`Fetching availability for "${eventTitle}"...`, 'info');

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // Next 30 days

  try {
    const params = new URLSearchParams({
      eventTypeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(`${PROD_URL}/api/booking/availability?${params}`);
    const result = await response.json();

    if (result.success && result.data) {
      const slots = result.data.slots || result.data;
      const availableSlots = slots.filter((s: TimeSlot) => s.available);
      log(`  ✓ Found ${availableSlots.length} available slots`, 'success');
      return availableSlots;
    } else {
      log(`  ✗ Failed to fetch availability`, 'error');
      return [];
    }
  } catch (error) {
    log(`  ✗ Error: ${error}`, 'error');
    return [];
  }
}

// ============================================
// Step 4: Create Booking
// ============================================
async function createBooking(
  eventTypeId: string,
  startTime: string,
  user: typeof TEST_USERS[0],
  eventTitle: string
): Promise<{ success: boolean; bookingId?: string; meetingUrl?: string }> {
  log(`Creating booking for ${user.name} - "${eventTitle}"...`, 'info');

  try {
    const response = await fetch(`${PROD_URL}/api/booking/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventTypeId,
        startTime,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        customerNotes: `Test booking - ${eventTitle} - ${new Date().toISOString()}`,
        timezone: 'Europe/Amsterdam',
      }),
    });

    const result = await response.json();

    if (result.success && result.data?.booking) {
      const booking = result.data.booking;
      const startDate = new Date(booking.start_time);
      log(`  ✓ Booking created!`, 'success');
      console.log(`     - ID: ${booking.id}`);
      console.log(`     - Status: ${booking.status}`);
      console.log(`     - Date: ${startDate.toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Amsterdam' })}`);
      console.log(`     - Time: ${startDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' })}`);
      if (booking.meeting_url) {
        console.log(`     - Teams: ${booking.meeting_url}`);
      }
      return { success: true, bookingId: booking.id, meetingUrl: booking.meeting_url };
    } else {
      log(`  ✗ Booking failed: ${result.message}`, 'error');
      return { success: false };
    }
  } catch (error) {
    log(`  ✗ Error: ${error}`, 'error');
    return { success: false };
  }
}

// ============================================
// Main Test Runner
// ============================================
async function runFullTest() {
  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║                                                              ║
║   AMBITION VALLEY - Full Flow Production Test                ║
║   Testing: Form → Booking for ALL Event Types                ║
║                                                              ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  console.log(`🌐 Target: ${PROD_URL}`);
  console.log(`👥 Test Users: ${TEST_USERS.map(u => u.name).join(', ')}`);
  console.log('');

  const results = {
    formSubmissions: { success: 0, failed: 0 },
    eventTypes: 0,
    bookings: { success: 0, failed: 0 },
  };

  // ============================================
  // STEP 1: Form Submissions
  // ============================================
  logSection('STEP 1: FORM SUBMISSIONS');

  for (const user of TEST_USERS) {
    const result = await submitForm(user);
    if (result.success) {
      results.formSubmissions.success++;
    } else {
      results.formSubmissions.failed++;
    }
    await sleep(1000);
  }

  // ============================================
  // STEP 2: Get Event Types
  // ============================================
  logSection('STEP 2: EVENT TYPES');

  const eventTypes = await getEventTypes();
  results.eventTypes = eventTypes.length;

  if (eventTypes.length === 0) {
    log('No event types found! Cannot test bookings.', 'error');
    printSummary(results);
    return;
  }

  // ============================================
  // STEP 3 & 4: Availability & Bookings
  // ============================================
  logSection('STEP 3 & 4: AVAILABILITY & BOOKINGS');

  let userIndex = 0;

  for (const eventType of eventTypes) {
    console.log(`\n${colors.yellow}━━━ ${eventType.title} ━━━${colors.reset}\n`);

    // Get availability
    const slots = await getAvailability(eventType.id, eventType.title);

    if (slots.length === 0) {
      log(`  ⚠ No available slots for ${eventType.title}`, 'warn');
      results.bookings.failed++;
      continue;
    }

    // Pick a slot (prefer future slots)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const futureSlots = slots.filter(s => new Date(s.start) >= tomorrow);
    const selectedSlot = futureSlots.length > 0 ? futureSlots[Math.floor(Math.random() * Math.min(5, futureSlots.length))] : slots[0];

    // Alternate between users
    const user = TEST_USERS[userIndex % TEST_USERS.length];
    userIndex++;

    // Create booking
    const bookingResult = await createBooking(
      eventType.id,
      selectedSlot.start,
      user,
      eventType.title
    );

    if (bookingResult.success) {
      results.bookings.success++;
    } else {
      results.bookings.failed++;
    }

    await sleep(2000); // Wait between bookings
  }

  // ============================================
  // Summary
  // ============================================
  printSummary(results);
}

function printSummary(results: {
  formSubmissions: { success: number; failed: number };
  eventTypes: number;
  bookings: { success: number; failed: number };
}) {
  logSection('TEST SUMMARY');

  console.log(`📋 Form Submissions: ${colors.green}${results.formSubmissions.success} passed${colors.reset}, ${colors.red}${results.formSubmissions.failed} failed${colors.reset}`);
  console.log(`📅 Event Types Found: ${results.eventTypes}`);
  console.log(`🎫 Bookings Created: ${colors.green}${results.bookings.success} passed${colors.reset}, ${colors.red}${results.bookings.failed} failed${colors.reset}`);

  const totalTests = results.formSubmissions.success + results.formSubmissions.failed + results.bookings.success + results.bookings.failed;
  const passedTests = results.formSubmissions.success + results.bookings.success;

  console.log(`\n${colors.cyan}────────────────────────────────────────${colors.reset}`);
  console.log(`  Total: ${passedTests}/${totalTests} tests passed`);
  console.log(`${colors.cyan}────────────────────────────────────────${colors.reset}`);

  if (results.formSubmissions.failed === 0 && results.bookings.failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed - check output above${colors.reset}\n`);
  }

  console.log('📧 Check team notification emails at:');
  TEST_USERS.forEach(u => console.log(`   - ${u.email}`));

  console.log('\n📋 Check admin panels:');
  console.log(`   - ${PROD_URL}/admin/submissions`);
  console.log(`   - ${PROD_URL}/admin/booking`);
  console.log('');
}

// Run the test
runFullTest().catch(console.error);
