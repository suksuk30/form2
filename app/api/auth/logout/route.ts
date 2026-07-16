export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    const userId = request.cookies.get('user_id')?.value;

    if (userId && sessionToken) {
      await supabase.rpc('auth_logout', {
        p_user_id: userId,
        p_session_token: sessionToken,
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('session_token');
    response.cookies.delete('user_id');

    return response;

  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session_token');
    response.cookies.delete('user_id');
    return response;
  }
}
