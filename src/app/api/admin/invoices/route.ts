import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET: List all invoices with optional filters
export async function GET(request: Request) {
  try {
    // Check authentication
    const supabaseAuth = await createClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();
    const url = new URL(request.url);

    // Parse query params
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Build query
    let query = supabase
      .from('invoices')
      .select(`
        *,
        bookings (
          id,
          start_time,
          event_types (
            title,
            slug
          )
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    if (startDate) {
      query = query.gte('invoice_date', startDate);
    }

    if (endDate) {
      query = query.lte('invoice_date', endDate);
    }

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    // Get stats
    const { data: statsData } = await supabase
      .from('invoices')
      .select('total_cents, btw_amount_cents, status, invoice_date');

    const stats = {
      total: count || 0,
      totalRevenue: 0,
      totalBTW: 0,
      thisMonth: 0,
      thisMonthRevenue: 0,
    };

    if (statsData) {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      for (const inv of statsData) {
        if (inv.status === 'paid') {
          stats.totalRevenue += inv.total_cents || 0;
          stats.totalBTW += inv.btw_amount_cents || 0;

          const invoiceDate = new Date(inv.invoice_date);
          if (invoiceDate >= thisMonthStart) {
            stats.thisMonth++;
            stats.thisMonthRevenue += inv.total_cents || 0;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: invoices,
      stats,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Invoices API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
