import type { ApplicationFormSource, GrabApplicationData } from '../forms/application-data';
import { TELEGRAM_SEPARATOR, telegramField } from './telegram-layout';

const FORM_HEADERS: Record<ApplicationFormSource, string> = {
  reimbursement: 'PENGAJUAN REIMBURSEMENT',
  pendapat: 'PENGAJUAN PENDAPAT',
  lainnya: 'PENGAJUAN LAINNYA',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildGrabApplicationTelegramMessage(
  source: ApplicationFormSource,
  data: GrabApplicationData
): string {
  const header = FORM_HEADERS[source];
  const phone = data.phone.replace(/\D/g, '');

  return [
    `<b>${header}</b>`,
    TELEGRAM_SEPARATOR,
    `<b>FORMULIR PENGAJUAN GRAB INDONESIA</b>`,
    telegramField('Nama', escapeHtml(data.name)),
    telegramField('Telepon', `<code>+62${phone}</code>`),
    telegramField('Total belanjaan + Ongkir', escapeHtml(data.total)),
    telegramField('Nomor Pesanan', escapeHtml(data.orderNumber)),
    telegramField('Alasan', escapeHtml(data.reason)),
    TELEGRAM_SEPARATOR,
  ].join('\n');
}

export function isApplicationFormSource(
  value: string | undefined
): value is ApplicationFormSource {
  return value === 'reimbursement' || value === 'pendapat' || value === 'lainnya';
}
