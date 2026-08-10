export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

function getAdminSession(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  const adminId = request.cookies.get('user_id')?.value;
  if (!adminId || !sessionToken) return null;
  return { adminId, sessionToken };
}

export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const session = getAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('admin_get_users', {
      p_admin_id: session.adminId,
      p_session_token: session.sessionToken,
    });

    if (error) {
      console.error('Admin get users error:', error);
      return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 403 });
    }

    return NextResponse.json({ users: data.users || [] });
  } catch (err) {
    console.error('Admin users error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const session = getAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, phone, password } = body;

    if (!username || !phone || !password) {
      return NextResponse.json({ error: 'Username, no HP, dan password wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('admin_create_user', {
      p_admin_id: session.adminId,
      p_session_token: session.sessionToken,
      p_username: String(username).trim(),
      p_phone: String(phone).replace(/\D/g, ''),
      p_password: String(password),
    });

    if (error) {
      console.error('Admin create user error:', error);
      return NextResponse.json({ error: 'Gagal mendaftarkan user' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err) {
    console.error('Admin create user error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const session = getAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, username, phone, password } = body;

    if (!userId || !username || !phone) {
      return NextResponse.json({ error: 'User ID, username, dan no HP wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('admin_update_user', {
      p_admin_id: session.adminId,
      p_session_token: session.sessionToken,
      p_user_id: userId,
      p_username: String(username).trim(),
      p_phone: String(phone).replace(/\D/g, ''),
      p_password: password ? String(password) : null,
    });

    if (error) {
      console.error('Admin update user error:', error);
      return NextResponse.json({ error: 'Gagal memperbarui user' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err) {
    console.error('Admin update user error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

