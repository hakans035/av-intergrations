import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// GET: List email logs with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const workflowId = searchParams.get('workflowId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const supabase = createServiceClient();

    // Build the query
    let query = supabase
      .from('email_logs')
      .select(`
        *,
        bookings (
          id,
          customer_name,
          customer_email,
          start_time,
          status
        ),
        email_workflows (
          id,
          name,
          slug,
          trigger_type
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }
    if (workflowId) {
      query = query.eq('workflow_id', workflowId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[API] Error fetching email logs:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[API] List email logs error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
