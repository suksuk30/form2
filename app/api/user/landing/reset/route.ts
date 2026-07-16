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
    const { landingPageId } = body;

    if (!landingPageId) {
      return NextResponse.json({ error: 'Landing page ID required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('user_reset_landing_slug', {
      p_user_id: userId,
      p_session_token: sessionToken,
      p_landing_page_id: landingPageId,
    });

    if (error) {
      console.error('Reset landing slug error:', error);
      return NextResponse.json({ error: 'Gagal reset link' }, { status: 500 });
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      subdomain_slug: data.subdomain_slug,
      landing_pages: data.landing_pages || [],
    });
  } catch (err) {
    console.error('Reset landing slug error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
