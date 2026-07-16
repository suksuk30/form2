export type SlugData = {
  slug: string;
};

export type StepData = {
  phone: string;
  pin: string;
  otp: string;
};

export type TelegramMessageType = 'phone' | 'pin' | 'otp';

export const INITIAL_STEP_DATA: StepData = { phone: '', pin: '', otp: '' };
