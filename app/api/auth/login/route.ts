export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password harus diisi' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('auth_login', {
      p_username: username,
      p_password: password,
    });

    if (error) {
      console.error('Login RPC error:', error);
      return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 401 });
    }

    const sessionToken: string = data.session_token;
    const user = data.user;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isProduction = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({ user });
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
