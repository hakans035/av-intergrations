import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// GET: List all active event types for public display
export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: eventTypes, error } = await supabase
      .from('event_types')
      .select('*')
      .eq('is_active', true)
      .order('title');

    if (error) {
      console.error('[API] Failed to fetch event types:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: eventTypes,
    });
  } catch (error) {
    console.error('[API] Event types error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
