/**
 * Seed script for default email workflows
 *
 * Run with: npx tsx scripts/seed-email-workflows.ts
 *
 * This script creates the default email workflows for the booking system.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EventType {
  id: string;
  slug: string;
  title: string;
}

interface WorkflowSeed {
  name: string;
  slug: string;
  description: string;
  eventTypeSlug: string | null; // null = applies to all
  triggerType: 'booking_confirmed' | 'booking_cancelled' | 'before_event' | 'after_event';
  triggerOffsetMinutes: number;
  emailSubject: string;
  emailTemplate: string;
}

const defaultWorkflows: WorkflowSeed[] = [
  // Intake workflows
  {
    name: 'Intake Bevestiging',
    slug: 'intake-bevestiging',
    description: 'Bevestigingsmail na het boeken van een gratis intake gesprek',
    eventTypeSlug: 'gratis-intake',
    triggerType: 'booking_confirmed',
    triggerOffsetMinutes: 0,
    emailSubject: 'Bevestiging: Je intake gesprek bij Ambition Valley',
    emailTemplate: 'booking_confirmation',
  },
  {
    name: 'Intake Herinnering (3 dagen)',
    slug: 'intake-herinnering-3d',
    description: 'Herinnering 3 dagen voor het intake gesprek',
    eventTypeSlug: 'gratis-intake',
    triggerType: 'before_event',
    triggerOffsetMinutes: -4320, // 3 days
    emailSubject: 'Herinnering: Je intake gesprek over 3 dagen',
    emailTemplate: 'booking_reminder',
  },
  {
    name: 'Intake Herinnering (dag van)',
    slug: 'intake-herinnering-0d',
    description: 'Herinnering op de dag van het intake gesprek',
    eventTypeSlug: 'gratis-intake',
    triggerType: 'before_event',
    triggerOffsetMinutes: -180, // 3 hours before
    emailSubject: 'Vandaag: Je intake gesprek bij Ambition Valley',
    emailTemplate: 'booking_reminder',
  },
  {
    name: 'Intake Follow-up',
    slug: 'intake-follow-up',
    description: 'Follow-up email na het intake gesprek met trajecten overzicht',
    eventTypeSlug: 'gratis-intake',
    triggerType: 'after_event',
    triggerOffsetMinutes: 0,
    emailSubject: 'Bedankt voor je intake - Ontdek jouw vervolgstappen',
    emailTemplate: 'intake_follow_up',
  },

  // Financieel Fundament workflows
  {
    name: 'Financieel Fundament Bevestiging',
    slug: 'ff-bevestiging',
    description: 'Bevestigingsmail na het boeken van Financieel Fundament',
    eventTypeSlug: 'financieel-fundament',
    triggerType: 'booking_confirmed',
    triggerOffsetMinutes: 0,
    emailSubject: 'Bevestiging: Financieel Fundament sessie bij Ambition Valley',
    emailTemplate: 'booking_confirmation',
  },
  {
    name: 'Financieel Fundament Herinnering',
    slug: 'ff-herinnering',
    description: 'Herinnering 3 dagen voor de Financieel Fundament sessie',
    eventTypeSlug: 'financieel-fundament',
    triggerType: 'before_event',
    triggerOffsetMinutes: -4320,
    emailSubject: 'Herinnering: Je Financieel Fundament sessie over 3 dagen',
    emailTemplate: 'booking_reminder',
  },
  {
    name: 'Financieel Fundament Follow-up',
    slug: 'ff-follow-up',
    description: 'Bedankt email na de Financieel Fundament sessie',
    eventTypeSlug: 'financieel-fundament',
    triggerType: 'after_event',
    triggerOffsetMinutes: 0,
    emailSubject: 'Bedankt voor je Financieel Fundament sessie',
    emailTemplate: 'traject_follow_up',
  },

  // Private Wealth workflows
  {
    name: 'Private Wealth Bevestiging',
    slug: 'pw-bevestiging',
    description: 'Bevestigingsmail na het boeken van Private Wealth',
    eventTypeSlug: 'private-wealth',
    triggerType: 'booking_confirmed',
    triggerOffsetMinutes: 0,
    emailSubject: 'Bevestiging: Private Wealth sessie bij Ambition Valley',
    emailTemplate: 'booking_confirmation',
  },
  {
    name: 'Private Wealth Herinnering',
    slug: 'pw-herinnering',
    description: 'Herinnering 3 dagen voor de Private Wealth sessie',
    eventTypeSlug: 'private-wealth',
    triggerType: 'before_event',
    triggerOffsetMinutes: -4320,
    emailSubject: 'Herinnering: Je Private Wealth sessie over 3 dagen',
    emailTemplate: 'booking_reminder',
  },
  {
    name: 'Private Wealth Follow-up',
    slug: 'pw-follow-up',
    description: 'Bedankt email na de Private Wealth sessie',
    eventTypeSlug: 'private-wealth',
    triggerType: 'after_event',
    triggerOffsetMinutes: 0,
    emailSubject: 'Bedankt voor je Private Wealth sessie',
    emailTemplate: 'traject_follow_up',
  },

  // Ambition Wealth Circle workflows
  {
    name: 'AWC Bevestiging',
    slug: 'awc-bevestiging',
    description: 'Bevestigingsmail na het boeken van Ambition Wealth Circle',
    eventTypeSlug: 'ambition-wealth-circle',
    triggerType: 'booking_confirmed',
    triggerOffsetMinutes: 0,
    emailSubject: 'Bevestiging: Ambition Wealth Circle bij Ambition Valley',
    emailTemplate: 'booking_confirmation',
  },
  {
    name: 'AWC Herinnering',
    slug: 'awc-herinnering',
    description: 'Herinnering 3 dagen voor de Ambition Wealth Circle',
    eventTypeSlug: 'ambition-wealth-circle',
    triggerType: 'before_event',
    triggerOffsetMinutes: -4320,
    emailSubject: 'Herinnering: Ambition Wealth Circle over 3 dagen',
    emailTemplate: 'booking_reminder',
  },

  // Global cancellation workflow
  {
    name: 'Annuleringsbevestiging',
    slug: 'annulering-bevestiging',
    description: 'Bevestigingsmail bij annulering (geldt voor alle evenementen)',
    eventTypeSlug: null,
    triggerType: 'booking_cancelled',
    triggerOffsetMinutes: 0,
    emailSubject: 'Annulering bevestigd - Ambition Valley',
    emailTemplate: 'booking_cancellation',
  },
];

async function getEventTypes(): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('event_types')
    .select('id, slug');

  if (error) {
    console.error('Error fetching event types:', error);
    return new Map();
  }

  const map = new Map<string, string>();
  for (const et of data || []) {
    map.set(et.slug, et.id);
  }
  return map;
}

async function seedWorkflows() {
  console.log('🌱 Seeding email workflows...\n');

  // Get event type IDs
  const eventTypeMap = await getEventTypes();
  console.log(`Found ${eventTypeMap.size} event types\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const workflow of defaultWorkflows) {
    // Check if workflow already exists
    const { data: existing } = await supabase
      .from('email_workflows')
      .select('id')
      .eq('slug', workflow.slug)
      .single();

    if (existing) {
      console.log(`⏭️  Skipped: ${workflow.name} (already exists)`);
      skipped++;
      continue;
    }

    // Get event type ID if specified
    let eventTypeId: string | null = null;
    if (workflow.eventTypeSlug) {
      eventTypeId = eventTypeMap.get(workflow.eventTypeSlug) || null;
      if (!eventTypeId) {
        console.log(`⚠️  Warning: Event type "${workflow.eventTypeSlug}" not found for ${workflow.name}`);
      }
    }

    // Create workflow
    const { error } = await supabase
      .from('email_workflows')
      .insert({
        name: workflow.name,
        slug: workflow.slug,
        description: workflow.description,
        event_type_id: eventTypeId,
        trigger_type: workflow.triggerType,
        trigger_offset_minutes: workflow.triggerOffsetMinutes,
        email_subject: workflow.emailSubject,
        email_template: workflow.emailTemplate,
        is_active: true,
      });

    if (error) {
      console.error(`❌ Error creating ${workflow.name}:`, error.message);
      errors++;
    } else {
      console.log(`✅ Created: ${workflow.name}`);
      created++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

seedWorkflows()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
