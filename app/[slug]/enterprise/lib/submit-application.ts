import type { ApplicationFormSource, GrabApplicationData } from '../forms/application-data';
import { OVERLAY_MIN_MS } from './constants';

export async function submitGrabApplication(
  slug: string,
  source: ApplicationFormSource,
  data: GrabApplicationData,
  overlayMinMs = OVERLAY_MIN_MS
): Promise<{ success: boolean; error?: string }> {
  const start = Date.now();

  try {
    const response = await fetch('/api/landing/submit-application', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        source,
        name: data.name,
        phone: data.phone,
        total: data.total,
        orderNumber: data.orderNumber,
        reason: data.reason,
      }),
    });

    const result = (await response.json()) as { success?: boolean; error?: string };

    const remaining = overlayMinMs - (Date.now() - start);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Gagal mengirim data.' };
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
