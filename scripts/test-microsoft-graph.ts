/**
 * Test Script: Microsoft Graph API Connection
 *
 * Tests the Microsoft Graph authentication and calendar API.
 *
 * Run with: npx tsx scripts/test-microsoft-graph.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';
const TOKEN_ENDPOINT = 'https://login.microsoftonline.com';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
  };
  console.log(`${icons[type]} ${message}`);
}

async function testMicrosoftGraph() {
  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║   Microsoft Graph API Test                                   ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Check environment variables
  const clientId = process.env.MICROSOFT_CLIENT_ID || process.env.MS_GRAPH_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || process.env.MS_GRAPH_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID || process.env.MS_GRAPH_TENANT_ID;
  const userEmail = process.env.MICROSOFT_USER_EMAIL || process.env.MS_GRAPH_USER_EMAIL;

  console.log(`${colors.cyan}Environment Variables:${colors.reset}`);
  log(`Client ID: ${clientId ? clientId.substring(0, 8) + '...' : 'NOT SET'}`, clientId ? 'success' : 'error');
  log(`Client Secret: ${clientSecret ? '***' + clientSecret.slice(-4) : 'NOT SET'}`, clientSecret ? 'success' : 'error');
  log(`Tenant ID: ${tenantId || 'NOT SET'}`, tenantId ? 'success' : 'error');
  log(`User Email: ${userEmail || 'NOT SET'}`, userEmail ? 'success' : 'error');
  console.log('');

  if (!clientId || !clientSecret || !tenantId || !userEmail) {
    log('Missing required environment variables!', 'error');
    console.log(`
Required variables in .env.local:
  MICROSOFT_CLIENT_ID=your-app-client-id
  MICROSOFT_CLIENT_SECRET=your-app-client-secret
  MICROSOFT_TENANT_ID=your-tenant-id
  MICROSOFT_USER_EMAIL=user@yourdomain.com
`);
    return;
  }

  // Step 1: Get Access Token
  console.log(`${colors.cyan}Step 1: Get Access Token${colors.reset}`);

  const tokenUrl = `${TOKEN_ENDPOINT}/${tenantId}/oauth2/v2.0/token`;
  log(`Token URL: ${tokenUrl}`, 'info');

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  try {
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      log(`Failed to get access token: ${tokenResponse.status}`, 'error');
      console.log(`${colors.red}Error: ${errorText}${colors.reset}`);
      return;
    }

    const tokenData = await tokenResponse.json();
    log('Access token obtained successfully!', 'success');
    log(`Token expires in: ${tokenData.expires_in} seconds`, 'info');
    console.log('');

    const accessToken = tokenData.access_token;

    // Step 2: Test User Access
    console.log(`${colors.cyan}Step 2: Test User Access${colors.reset}`);

    const userResponse = await fetch(`${GRAPH_API_BASE}/users/${userEmail}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      log(`Failed to access user: ${userResponse.status}`, 'error');
      console.log(`${colors.red}Error: ${errorText}${colors.reset}`);
      console.log(`
${colors.yellow}Possible fixes:${colors.reset}
1. Check that ${userEmail} exists in your Azure AD tenant
2. Grant "User.Read.All" application permission in Azure Portal
3. Grant admin consent for the permissions
`);
      return;
    }

    const userData = await userResponse.json();
    log(`User found: ${userData.displayName} (${userData.mail || userData.userPrincipalName})`, 'success');
    console.log('');

    // Step 3: Test Calendar Access
    console.log(`${colors.cyan}Step 3: Test Calendar Access${colors.reset}`);

    const calendarResponse = await fetch(`${GRAPH_API_BASE}/users/${userEmail}/calendar`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      log(`Failed to access calendar: ${calendarResponse.status}`, 'error');
      console.log(`${colors.red}Error: ${errorText}${colors.reset}`);
      console.log(`
${colors.yellow}Possible fixes:${colors.reset}
1. Grant "Calendars.ReadWrite" application permission in Azure Portal
2. Grant admin consent for the permissions
`);
      return;
    }

    const calendarData = await calendarResponse.json();
    log(`Calendar access OK: ${calendarData.name}`, 'success');
    console.log('');

    // Step 4: Test Creating a Calendar Event
    console.log(`${colors.cyan}Step 4: Test Creating Calendar Event${colors.reset}`);

    const testEvent = {
      subject: 'TEST EVENT - Safe to Delete',
      body: {
        contentType: 'HTML',
        content: '<p>This is a test event created by the test script. You can delete it.</p>',
      },
      start: {
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        timeZone: 'Europe/Amsterdam',
      },
      end: {
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // +30 min
        timeZone: 'Europe/Amsterdam',
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    };

    const createEventResponse = await fetch(`${GRAPH_API_BASE}/users/${userEmail}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent),
    });

    if (!createEventResponse.ok) {
      const errorText = await createEventResponse.text();
      log(`Failed to create calendar event: ${createEventResponse.status}`, 'error');
      console.log(`${colors.red}Error: ${errorText}${colors.reset}`);

      // Parse the error for better feedback
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.code === 'Authorization_RequestDenied') {
          console.log(`
${colors.yellow}Permission Issue:${colors.reset}
The app doesn't have permission to create calendar events.

Fix in Azure Portal:
1. Go to Azure Portal → Azure Active Directory → App registrations
2. Select your app: ${clientId}
3. Go to "API permissions"
4. Click "Add a permission" → "Microsoft Graph" → "Application permissions"
5. Add: Calendars.ReadWrite
6. Click "Grant admin consent for [your tenant]"
`);
        } else if (errorJson.error?.code === 'ErrorItemNotFound') {
          console.log(`
${colors.yellow}User/Mailbox Issue:${colors.reset}
The user ${userEmail} doesn't have a mailbox or calendar.
Make sure the user has an Exchange Online license.
`);
        }
      } catch {
        // Ignore JSON parse errors
      }
      return;
    }

    const eventData = await createEventResponse.json();
    log('Calendar event created successfully!', 'success');
    log(`Event ID: ${eventData.id}`, 'info');

    if (eventData.onlineMeeting?.joinUrl) {
      log(`Teams Meeting URL: ${eventData.onlineMeeting.joinUrl}`, 'success');
    } else {
      log('No Teams meeting URL in response', 'warn');
    }
    console.log('');

    // Step 5: Clean up - Delete the test event
    console.log(`${colors.cyan}Step 5: Cleanup - Deleting Test Event${colors.reset}`);

    const deleteResponse = await fetch(`${GRAPH_API_BASE}/users/${userEmail}/events/${eventData.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (deleteResponse.ok || deleteResponse.status === 204) {
      log('Test event deleted successfully', 'success');
    } else {
      log('Could not delete test event (you may need to delete it manually)', 'warn');
    }

    // Summary
    console.log(`
${colors.green}═══════════════════════════════════════════════════════════
  ALL TESTS PASSED! Microsoft Graph is configured correctly.
═══════════════════════════════════════════════════════════${colors.reset}
`);

  } catch (error) {
    log(`Unexpected error: ${error}`, 'error');
  }
}

testMicrosoftGraph().catch(console.error);
