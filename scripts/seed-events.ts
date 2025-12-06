import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedEventTypes() {
  const eventTypes = [
    {
      slug: 'gratis-intake',
      title: 'Gratis Intake Gesprek',
      description: 'Plan een gratis kennismakingsgesprek van 15 minuten om je situatie te bespreken en te ontdekken welk traject het beste bij je past.',
      duration_minutes: 15,
      location_type: 'online',
      price_cents: 0,
      deposit_percent: 0,
      max_attendees: 1,
      is_active: true,
      requires_approval: false,
      buffer_before_minutes: 5,
      buffer_after_minutes: 5,
    },
    {
      slug: 'financieel-fundament',
      title: 'Financieel Fundament (1-op-1)',
      description: 'Krijg direct grip op je geld en ontdek waar je nu al belasting kunt besparen. Diepgaand Fiscaal & Financieel consult gericht op belastingbesparing en vermogensgroei.',
      duration_minutes: 60,
      location_type: 'online',
      price_cents: 99900, // €999
      deposit_percent: 50,
      max_attendees: 1,
      is_active: true,
      requires_approval: false,
      buffer_before_minutes: 15,
      buffer_after_minutes: 15,
    },
    {
      slug: 'private-wealth',
      title: 'Private Wealth (1-op-1)',
      description: 'Voor deelnemers die Maximale Fiscale Optimalisatie en een Persoonlijk Plan willen. Inclusief 1 uur intake online en 3 uur op locatie.',
      duration_minutes: 240, // 1hr online + 3hr on location = 4 hours total
      location_type: 'hybrid',
      price_cents: 0, // Price on request / custom
      deposit_percent: 50,
      max_attendees: 1,
      is_active: true,
      requires_approval: true, // Requires approval due to custom pricing
      buffer_before_minutes: 30,
      buffer_after_minutes: 30,
    },
    {
      slug: 'ambition-wealth-circle',
      title: 'Ambition Wealth Circle',
      description: 'Livedag in groepsverband, met directe toepassing op jouw situatie. Leer slimme strategieën om direct minder belasting te betalen en netwerk met gelijkgestemde ondernemers.',
      duration_minutes: 480, // Full day (8 hours)
      location_type: 'on_location',
      location_address: 'Locatie wordt na inschrijving gedeeld',
      price_cents: 0, // Price on request / varies
      deposit_percent: 50,
      max_attendees: 20,
      is_active: true,
      requires_approval: true,
      buffer_before_minutes: 0,
      buffer_after_minutes: 0,
    },
  ];

  // Delete existing event types first (for clean seed)
  console.log('Clearing existing event types...');
  const { error: deleteError } = await supabase
    .from('event_types')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error('Error clearing event types:', deleteError);
  }

  // Insert new event types
  console.log('Inserting event types...');
  const { data, error } = await supabase
    .from('event_types')
    .insert(eventTypes)
    .select();

  if (error) {
    console.error('Error inserting event types:', error);
    process.exit(1);
  }

  console.log('Successfully created event types:');
  data.forEach((et) => {
    console.log(`  - ${et.title} (${et.slug}): ${et.price_cents === 0 ? 'Gratis / Op aanvraag' : '€' + (et.price_cents / 100).toFixed(2)}`);
  });

  // Clear existing availability schedules
  console.log('\nClearing existing availability schedules...');
  await supabase
    .from('availability_schedules')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // Add availability schedules for online events (Mon-Fri 9:00-17:00)
  console.log('Adding availability schedules...');

  const onlineEventTypes = data.filter(et => et.location_type === 'online' || et.location_type === 'hybrid');

  for (const et of onlineEventTypes) {
    const schedules = [];
    // Monday (1) to Friday (5)
    for (let day = 1; day <= 5; day++) {
      schedules.push({
        event_type_id: et.id,
        day_of_week: day,
        start_time: '09:00:00',
        end_time: '17:00:00',
        is_active: true,
      });
    }

    const { error: scheduleError } = await supabase
      .from('availability_schedules')
      .insert(schedules);

    if (scheduleError) {
      console.error(`Error adding schedule for ${et.title}:`, scheduleError);
    } else {
      console.log(`  - Added Mon-Fri 9:00-17:00 for ${et.title}`);
    }
  }

  console.log('\nDone! Event types seeded successfully.');
}

seedEventTypes();
