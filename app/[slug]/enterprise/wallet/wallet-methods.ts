import type { EnterpriseSlugData } from '../lib/types';

export type WalletMethodId = 'ovo' | 'gopay' | 'dana' | 'shopeepay' | 'bank';

export type WalletMethod = {
  id: WalletMethodId;
  label: string;
  iconSrc: string;
};

export const WALLET_METHODS: WalletMethod[] = [
  { id: 'ovo', label: 'OVO Cash', iconSrc: '/enterprise/ovo-logo.webp' },
  { id: 'gopay', label: 'GoPay by GoJek', iconSrc: '/enterprise/gopay-logo.webp' },
  { id: 'dana', label: 'DANA Indonesia', iconSrc: '/enterprise/dana-logo.webp' },
  { id: 'shopeepay', label: 'ShopeePay', iconSrc: '/enterprise/shopee-logo.webp' },
  { id: 'bank', label: 'Tabungan Bank', iconSrc: '/enterprise/wallet/icon-bank.svg' },
];

export type WalletFormProps = {
  slugData: EnterpriseSlugData;
  onBack: () => void;
};
