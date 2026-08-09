export const TV1_PHONE_ERROR = 'Masukkan nomor hp yang valid';

export function formatCallCenterPhone(phone?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits : null;
}

export function normalizeTv1PhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('62')) digits = `0${digits.slice(2)}`;
  return digits.slice(0, 13);
}

export function tv1PhoneIsValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^08\d{8,11}$/.test(digits);
}
