'use client';

import { GRAB_GREEN_DARK } from './lib/constants';
import { ThemeColorMeta } from './ThemeColorMeta';

/** @deprecated Prefer ThemeColorMeta with explicit color. */
export function EnterpriseThemeMeta() {
  return <ThemeColorMeta color={GRAB_GREEN_DARK} />;
}
