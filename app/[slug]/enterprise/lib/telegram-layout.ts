export const TELEGRAM_SEPARATOR = '━━━━━━━━━━━━━━━━━━━━';

export function telegramField(label: string, value: string): string {
  return `<b>${label}</b> : ${value}`;
}
