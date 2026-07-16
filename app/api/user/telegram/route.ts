export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    const userId = request.cookies.get('user_id')?.value;

    if (!userId || !sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { botToken, chatId } = body;

    const { data, error } = await supabase.rpc('user_save_telegram', {
      p_user_id: userId,
      p_session_token: sessionToken,
      p_bot_token: botToken || '',
      p_chat_id: chatId || '',
    });

    if (error) {
      console.error('Save telegram error:', error);
      return NextResponse.json({ error: 'Gagal menyimpan' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 403 });
    }

    const sessionResult = await supabase.rpc('auth_get_session', {
      p_user_id: userId,
      p_session_token: sessionToken,
    });

    if (sessionResult.error || !sessionResult.data?.user) {
      return NextResponse.json({
        success: true,
        saved_bot_token: botToken || '',
        saved_chat_id: chatId || '',
      });
    }

    return NextResponse.json({
      success: true,
      user: sessionResult.data.user,
      saved_bot_token: botToken || '',
      saved_chat_id: chatId || '',
    });

  } catch (err) {
    console.error('Telegram save error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
