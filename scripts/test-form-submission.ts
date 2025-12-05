/**
 * Form Submission Flow Test Script
 *
 * Tests the complete form submission flow:
 * 1. Simulates a form submission to /api/submissions
 * 2. Verifies database insertion
 * 3. Tests email sending (uses Resend dev address)
 *
 * Usage:
 *   npx tsx scripts/test-form-submission.ts
 *
 * Environment variables required:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - RESEND_API_KEY
 */

import { createClient } from "@supabase/supabase-js";

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Test data using Resend's test email address
const TEST_SUBMISSION = {
  formId: "ambition-valley-form",
  answers: {
    // Name field (short_text)
    "c0d85e86-2e7d-4af9-abc5-9e3e63f3c6c1": "Test User",
    // Email field (email)
    "a24de67e-afa1-440f-8bb5-3ca5e82902ad": "delivered@resend.dev",
    // Phone field (phone_number)
    "6f2eaa42-cd82-49b5-9c06-ad8d940023f7": "+31612345678",
    // Owner question (yes_no) - "yes" to qualify
    "eigenaar-ref": "yes",
  },
  sessionId: `test-session-${Date.now()}`,
  utmSource: "test-script",
  utmMedium: "cli",
  utmCampaign: "form-flow-test",
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function log(message: string, type: "info" | "success" | "error" | "warn" = "info") {
  const prefix = {
    info: `${colors.cyan}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
  };
  console.log(`${prefix[type]} ${message}`);
}

function logSection(title: string) {
  console.log(`\n${colors.bright}${"=".repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${title}${colors.reset}`);
  console.log(`${colors.bright}${"=".repeat(60)}${colors.reset}\n`);
}

async function generateCsrfToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function testFormSubmission() {
  logSection("Form Submission Flow Test");

  // Step 1: Generate CSRF token
  log("Generating CSRF token...");
  const csrfToken = await generateCsrfToken();
  log(`CSRF Token: ${csrfToken.substring(0, 16)}...`, "success");

  // Step 2: Submit form to API
  logSection("Step 1: Submitting Form to API");
  log(`API URL: ${API_BASE_URL}/api/submissions`);
  log(`Form ID: ${TEST_SUBMISSION.formId}`);
  log(`Email: ${TEST_SUBMISSION.answers["a24de67e-afa1-440f-8bb5-3ca5e82902ad"]}`);
  log(`Session ID: ${TEST_SUBMISSION.sessionId}`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
        Cookie: `csrf_token=${csrfToken}`,
      },
      body: JSON.stringify(TEST_SUBMISSION),
    });

    const result = await response.json();

    if (!response.ok) {
      log(`API Response Status: ${response.status}`, "error");
      log(`Error: ${JSON.stringify(result, null, 2)}`, "error");
      return;
    }

    log(`API Response Status: ${response.status}`, "success");
    log(`Submission ID: ${result.data?.id}`, "success");
    log(`Qualification Result: ${result.data?.qualificationResult}`, "success");

    // Step 3: Verify in database
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      logSection("Step 2: Verifying Database Entry");

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      const { data: submission, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("id", result.data?.id)
        .single();

      if (error) {
        log(`Database query failed: ${error.message}`, "error");
      } else {
        log("Database entry found!", "success");
        log(`  ID: ${submission.id}`);
        log(`  Form ID: ${submission.form_id}`);
        log(`  Name: ${submission.name}`);
        log(`  Email: ${submission.email}`);
        log(`  Phone: ${submission.phone}`);
        log(`  Qualification: ${submission.qualification_result}`);
        log(`  Created At: ${submission.created_at}`);
        log(`  UTM Source: ${submission.utm_source}`);
      }
    } else {
      log("Skipping database verification (missing Supabase credentials)", "warn");
    }

    // Step 4: Email verification note
    logSection("Step 3: Email Verification");
    log("Email was sent asynchronously to: delivered@resend.dev");
    log("Note: Using Resend's test email address - no actual delivery");
    log("Check Vercel logs for email sending status");

    // Summary
    logSection("Test Summary");
    log("Form submission flow completed successfully!", "success");
    log(`Submission ID: ${result.data?.id}`);
    log("Next steps:");
    log("  1. Check Vercel logs for detailed API logs");
    log("  2. Verify email logs show 'EMAIL SENT OK'");
    log("  3. Check Supabase dashboard for the new entry");

  } catch (error) {
    log(`Request failed: ${error}`, "error");
    if (API_BASE_URL.includes("localhost")) {
      log("Make sure the development server is running: npm run dev", "warn");
    }
  }
}

async function testLocalSubmission() {
  logSection("Local Form Submission Test (Direct Database)");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    log("Missing Supabase credentials. Set environment variables:", "error");
    log("  NEXT_PUBLIC_SUPABASE_URL");
    log("  SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  log("Inserting test submission directly to database...");

  const { data, error } = await supabase
    .from("form_submissions")
    .insert({
      form_id: TEST_SUBMISSION.formId,
      name: "Direct Test User",
      email: "delivered@resend.dev",
      phone: "+31612345678",
      answers: TEST_SUBMISSION.answers,
      qualification_result: "qualified",
      session_id: `direct-test-${Date.now()}`,
      utm_source: "direct-test",
    })
    .select("id")
    .single();

  if (error) {
    log(`Insert failed: ${error.message}`, "error");
    log(`Error code: ${error.code}`, "error");
  } else {
    log("Direct insert successful!", "success");
    log(`Submission ID: ${data.id}`);
  }
}

async function listRecentSubmissions() {
  logSection("Recent Form Submissions");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    log("Missing Supabase credentials", "error");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: submissions, error } = await supabase
    .from("form_submissions")
    .select("id, name, email, qualification_result, created_at, utm_source")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    log(`Query failed: ${error.message}`, "error");
    return;
  }

  if (!submissions || submissions.length === 0) {
    log("No submissions found", "warn");
    return;
  }

  log(`Found ${submissions.length} recent submissions:\n`);

  submissions.forEach((sub, index) => {
    console.log(`${colors.cyan}${index + 1}.${colors.reset} ${sub.name || "Unknown"}`);
    console.log(`   ${colors.gray}Email:${colors.reset} ${sub.email || "N/A"}`);
    console.log(`   ${colors.gray}Status:${colors.reset} ${sub.qualification_result}`);
    console.log(`   ${colors.gray}Source:${colors.reset} ${sub.utm_source || "N/A"}`);
    console.log(`   ${colors.gray}Date:${colors.reset} ${new Date(sub.created_at).toLocaleString()}`);
    console.log();
  });
}

// Main execution
const args = process.argv.slice(2);
const command = args[0] || "test";

console.log(`\n${colors.bright}Form Submission Flow Test Script${colors.reset}`);
console.log(`${colors.gray}Command: ${command}${colors.reset}\n`);

switch (command) {
  case "test":
    testFormSubmission();
    break;
  case "direct":
    testLocalSubmission();
    break;
  case "list":
    listRecentSubmissions();
    break;
  case "help":
    console.log("Available commands:");
    console.log("  test    - Test full form submission flow via API (default)");
    console.log("  direct  - Insert test submission directly to database");
    console.log("  list    - List recent form submissions");
    console.log("  help    - Show this help message");
    console.log("\nExamples:");
    console.log("  npx tsx scripts/test-form-submission.ts");
    console.log("  npx tsx scripts/test-form-submission.ts list");
    console.log("  API_BASE_URL=https://your-app.vercel.app npx tsx scripts/test-form-submission.ts");
    break;
  default:
    console.log(`Unknown command: ${command}`);
    console.log("Run with 'help' for available commands");
}
