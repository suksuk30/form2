import { GRAB_GREEN, GRAB_GREEN_DARK } from './constants';

import type { WalletMethodId } from '../wallet/wallet-methods';

export type WalletThemeId = WalletMethodId;

/** Warna brand / background khas tiap wallet (area notch & theme-color browser). */
export const WALLET_THEME = {
  ovo: '#5b3db8',
  gopay: '#000000',
  dana: '#108EE9',
  shopeepay: '#EE4D2D',
  bank: '#ffffff',
} as const;

export type EnterpriseScreenThemeKey =
  | 'home'
  | 'wallet-select'
  | 'wallet-ovo'
  | 'wallet-gopay'
  | 'wallet-dana'
  | 'wallet-shopeepay'
  | 'wallet-bank'
  | 'form-reimbursement'
  | 'form-pendapat'
  | 'form-lainnya'
  | 'promo-transport'
  | 'promo-food'
  | 'promo-security'
  | 'splash'
  | 'form';

const SCREEN_THEME: Record<EnterpriseScreenThemeKey, string> = {
  home: GRAB_GREEN,
  'wallet-select': '#ffffff',
  'wallet-ovo': '#ffffff',
  'wallet-gopay': WALLET_THEME.gopay,
  'wallet-dana': '#ffffff',
  'wallet-shopeepay': WALLET_THEME.shopeepay,
  'wallet-bank': '#ffffff',
  'form-reimbursement': GRAB_GREEN_DARK,
  'form-pendapat': GRAB_GREEN_DARK,
  'form-lainnya': GRAB_GREEN_DARK,
  'promo-transport': GRAB_GREEN_DARK,
  'promo-food': GRAB_GREEN_DARK,
  'promo-security': GRAB_GREEN_DARK,
  splash: GRAB_GREEN_DARK,
  form: GRAB_GREEN_DARK,
};

export function getEnterpriseScreenThemeColor(screen: EnterpriseScreenThemeKey): string {
  return SCREEN_THEME[screen];
}

type WalletThemeContext = {
  step?: number;
  splash?: boolean;
  phase?: 'splash' | 'form';
};

/** Warna notch/bawah HP mengikuti layar wallet aktif (bukan biru DANA global). */
export function getWalletFormThemeColor(wallet: WalletThemeId, ctx: WalletThemeContext = {}): string {
  const step = ctx.step ?? 1;

  switch (wallet) {
    case 'ovo':
      return ctx.phase === 'splash' ? WALLET_THEME.ovo : '#ffffff';
    case 'gopay':
      return WALLET_THEME.gopay;
    case 'dana':
      return ctx.splash || step === 1 ? WALLET_THEME.dana : '#ffffff';
    case 'shopeepay':
      return WALLET_THEME.shopeepay;
    case 'bank':
      return '#ffffff';
    default:
      return '#ffffff';
  }
}

/** Hitung apakah warna gelap (status bar iOS pakai teks terang). */
export function isThemeColorDark(hex: string): boolean {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return false;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.55;
}
