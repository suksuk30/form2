export const dynamic = 'force-dynamic';

import { createServerClient } from '@/lib/supabase-server';
import { isValidSubdomainSlug, normalizeSubdomainSlug } from '@/lib/subdomain';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const searchParams = request.nextUrl.searchParams;
  const rawSlug = searchParams.get('slug');
  const slug = normalizeSubdomainSlug(rawSlug ?? '');

  if (!slug || !isValidSubdomainSlug(slug)) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.rpc('public_get_user_by_slug', {
      p_slug: slug,
    });

    if (error || !data?.valid) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true });

  } catch (err) {
    console.error('Validate slug error:', err);
    return NextResponse.json({ valid: false });
  }
}
