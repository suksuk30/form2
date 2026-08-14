import { createAdminClient } from '@/lib/supabase-admin';

export async function isSlugAntiSpamEnabled(slug: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('internal_slug_anti_spam_enabled', {
      p_slug: slug,
    });

    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}
