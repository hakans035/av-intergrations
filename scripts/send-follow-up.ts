import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sendEmail } from '../src/lib/email/resend';
import { IntakeFollowUpEmail, getIntakeFollowUpSubject } from '../src/lib/email/templates/intakeFollowUp';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

async function sendFollowUpEmail() {
  const props = {
    customerName: 'Hakan',
    eventTitle: 'Gratis Intake',
    trajectenUrl: 'https://check.ambitionvalley.nl/booking/trajecten',
  };

  const html = `<!DOCTYPE html>${renderToStaticMarkup(React.createElement(IntakeFollowUpEmail, props))}`;

  const result = await sendEmail({
    to: 'hakansahingoz66@gmail.com',
    subject: getIntakeFollowUpSubject(),
    html,
    type: 'notification',
  });

  console.log('Result:', result);
}

sendFollowUpEmail().catch(console.error);
