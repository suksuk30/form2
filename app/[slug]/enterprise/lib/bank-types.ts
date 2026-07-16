export type BankFormData = {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName: string;
  isPrimary: boolean;
  code: string;
};

export const BANK_INITIAL_FORM_DATA: BankFormData = {
  cardNumber: '',
  expiry: '',
  cvv: '',
  cardName: '',
  isPrimary: true,
  code: '',
};

export function bankCardValid(data: BankFormData): boolean {
  const digits = data.cardNumber.replace(/\D/g, '');
  const expiry = data.expiry.replace(/\s/g, '');
  const cvv = data.cvv.replace(/\D/g, '');
  return (
    digits.length >= 15 &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    cvv.length === 3 &&
    data.cardName.trim().length >= 2
  );
}
