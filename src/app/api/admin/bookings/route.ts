import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// Check admin authorization
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  return token === process.env.ADMIN_API_TOKEN;
}

// GET: List all bookings with filters
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'Niet geautoriseerd' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const eventTypeId = searchParams.get('eventTypeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from('bookings')
      .select('*, event_types(id, slug, title)', { count: 'exact' })
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (eventTypeId) {
      query = query.eq('event_type_id', eventTypeId);
    }

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    const { data: bookings, count, error } = await query;

    if (error) throw error;

    // Calculate stats
    const { data: statsData } = await supabase
      .from('bookings')
      .select('status, total_price_cents, payment_status');

    const stats = {
      total: statsData?.length || 0,
      pending: statsData?.filter((b) => b.status === 'pending').length || 0,
      confirmed: statsData?.filter((b) => b.status === 'confirmed').length || 0,
      cancelled: statsData?.filter((b) => b.status === 'cancelled').length || 0,
      completed: statsData?.filter((b) => b.status === 'completed').length || 0,
      revenue: statsData
        ?.filter((b) => b.payment_status === 'fully_paid' || b.payment_status === 'deposit_paid')
        .reduce((sum, b) => sum + (b.total_price_cents || 0), 0) || 0,
    };

    return NextResponse.json({
      success: true,
      data: bookings,
      stats,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (error) {
    console.error('[Admin API] Get bookings error:', error);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
