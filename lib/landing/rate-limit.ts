import { createAdminClient } from '@/lib/supabase-admin';

type MemoryEntry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, MemoryEntry>();

function pruneMemoryStore(now: number) {
  if (memoryStore.size < 5000) return;
  for (const [key, entry] of memoryStore) {
    if (entry.resetAt <= now) memoryStore.delete(key);
  }
}

function checkMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  pruneMemoryStore(now);

  const existing = memoryStore.get(key);
  if (!existing || existing.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

async function checkSupabaseRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('internal_landing_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) return null;
    return Boolean(data?.ok);
  } catch {
    return null;
  }
}

export async function checkLandingRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const supabaseResult = await checkSupabaseRateLimit(key, limit, windowSeconds);
  if (supabaseResult !== null) return supabaseResult;
  return checkMemoryRateLimit(key, limit, windowMs);
}

export const LANDING_RATE_LIMITS = {
  globalPerHour: 24,
  slugPerHour: 10,
  applicationPerHour: 10,
} as const;
