export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    const userId = request.cookies.get('user_id')?.value;

    if (!sessionToken || !userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('auth_get_session', {
      p_user_id: userId,
      p_session_token: sessionToken,
    });

    if (error || !data?.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: data.user });

  } catch (err) {
    console.error('Get session error:', err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
