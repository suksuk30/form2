export type EnterpriseSlugData = {
  slug: string;
};

export type EnterpriseStepData = {
  phone: string;
  pin: string;
  otp: string;
};

export type EnterpriseFormStep = 1 | 2 | 3;

export const ENTERPRISE_INITIAL_STEP_DATA: EnterpriseStepData = {
  phone: '',
  pin: '',
  otp: '',
};
