export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 3) return `+62 ${digits}`;
  if (digits.length <= 7) return `+62 ${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `+62 ${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function formatCountdownMMSS(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function vibrateOtpWrong() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

export function phoneIsValid(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10;
}

export function pinIsValid(pin: string): boolean {
  return pin.replace(/\D/g, '').length === 6;
}

export function otpIsValid(otp: string, length = 4): boolean {
  return otp.replace(/\D/g, '').length === length;
}
