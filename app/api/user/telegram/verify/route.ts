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

    if (!botToken) {
      return NextResponse.json({ error: 'Bot Token required' }, { status: 400 });
    }

    // Verify bot token
    let botValid = false;
    let msgSuccess = false;

    try {
      const botRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const botData = await botRes.json();
      botValid = botData.ok === true;
    } catch {
      botValid = false;
    }

    if (!botValid) {
      await supabase.rpc('user_set_telegram_connected', {
        p_user_id: userId,
        p_session_token: sessionToken,
        p_connected: false,
      });
      return NextResponse.json({ success: false, error: 'Token bot tidak valid' });
    }

    if (chatId) {
      try {
        const msgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '✅ Koneksi berhasil! Bot Telegram Anda sudah terhubung.',
          }),
        });
        const msgData = await msgRes.json();
        msgSuccess = msgData.ok === true;
      } catch {
        msgSuccess = false;
      }

      if (!msgSuccess) {
        await supabase.rpc('user_set_telegram_connected', {
          p_user_id: userId,
          p_session_token: sessionToken,
          p_connected: false,
        });
        return NextResponse.json({ success: false, error: 'Gagal mengirim pesan. Periksa Chat ID.' });
      }
    }

    await supabase.rpc('user_set_telegram_connected', {
      p_user_id: userId,
      p_session_token: sessionToken,
      p_connected: true,
      p_bot_token: botToken,
      p_chat_id: chatId || null,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Verify telegram error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
