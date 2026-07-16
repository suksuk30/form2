export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    const adminId = request.cookies.get('user_id')?.value;

    if (!adminId || !sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, activate } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('admin_set_user_status', {
      p_admin_id: adminId,
      p_session_token: sessionToken,
      p_user_id: userId,
      p_activate: activate,
    });

    if (error) {
      console.error('Activate error:', error);
      return NextResponse.json({ error: 'Gagal mengubah status' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Activate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
