export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase.rpc('public_get_landing_templates');

    if (error) {
      console.error('Get landing templates error:', error);
      return NextResponse.json({ error: 'Gagal memuat template' }, { status: 500 });
    }

    const templates = typeof data === 'string' ? JSON.parse(data) : data;
    return NextResponse.json({ templates: templates || [] });
  } catch (err) {
    console.error('Get landing templates error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    const adminId = request.cookies.get('user_id')?.value;

    if (!adminId || !sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, landings } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!Array.isArray(landings)) {
      return NextResponse.json({ error: 'Format landing tidak valid' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('admin_set_user_landings', {
      p_admin_id: adminId,
      p_session_token: sessionToken,
      p_user_id: userId,
      p_landings: landings,
    });

    if (error) {
      console.error('Set user landings error:', error);
      return NextResponse.json({ error: 'Gagal menyimpan landing page' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      landing_pages: data.landing_pages || [],
    });
  } catch (err) {
    console.error('Set user landings error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
