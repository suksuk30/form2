export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { clearMemoryRateLimitsForSlug } from '@/lib/landing/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

function getAdminSession(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  const adminId = request.cookies.get('user_id')?.value;
  if (!adminId || !sessionToken) return null;
  return { adminId, sessionToken };
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const session = getAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, enabled, landingSlugs } = body;

    if (!userId || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'User ID dan status anti-spam wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('admin_set_user_anti_spam', {
      p_admin_id: session.adminId,
      p_session_token: session.sessionToken,
      p_user_id: userId,
      p_enabled: enabled,
    });

    if (error) {
      console.error('Admin set anti-spam error:', error);
      return NextResponse.json({ error: 'Gagal menyimpan anti-spam' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 403 });
    }

    if (!enabled && Array.isArray(landingSlugs)) {
      for (const slug of landingSlugs) {
        if (typeof slug === 'string' && slug.length > 0) {
          clearMemoryRateLimitsForSlug(slug);
        }
      }
    }

    return NextResponse.json({
      success: true,
      anti_spam_enabled: Boolean(data?.anti_spam_enabled),
    });
  } catch (err) {
    console.error('Admin anti-spam error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
