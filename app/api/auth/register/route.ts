export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { username, phone, password } = body;

    if (!username || !phone || !password) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('auth_register', {
      p_username: username,
      p_phone: phone,
      p_password: password,
    });

    if (error) {
      console.error('Register RPC error:', error);
      return NextResponse.json({ error: 'Gagal membuat akun' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Akun berhasil dibuat. Silakan login.' });

  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
