import type { User, UserLandingPage } from '@/lib/supabase';

export type AdminUserDisplayStatus = 'active' | 'inactive' | 'expired';

export function landingIsVisuallyExpired(lp: UserLandingPage): boolean {
  return lp.is_expired;
}

/** Exp badge in admin — derived from landing expiry, not users.status. */
export function userHasVisualExpiredLanding(user: Pick<User, 'landing_pages'>): boolean {
  const landings = user.landing_pages ?? [];
  if (landings.length === 0) return false;

  const hasExpired = landings.some((lp) => lp.is_expired);
  const hasActiveValid = landings.some((lp) => lp.is_enabled && !lp.is_expired);

  return hasExpired && !hasActiveValid;
}

export function getAdminUserDisplayStatus(user: User): AdminUserDisplayStatus {
  if (user.status === 'inactive') return 'inactive';
  if (userHasVisualExpiredLanding(user)) return 'expired';
  if (user.status === 'active') return 'active';
  return user.status === 'expired' ? 'expired' : 'inactive';
}
