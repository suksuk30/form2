import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'user' | 'super_admin';
export type UserStatus = 'inactive' | 'active' | 'expired';

export type LandingTemplateId =
  | 'basic'
  | 'basic_v2'
  | 'standard'
  | 'standard_v2'
  | 'standard_v3'
  | 'professional'
  | 'enterprise'
  | 'enterprise_v2'
  | 'tokped_v1';

export interface LandingTemplate {
  id: LandingTemplateId;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface UserLandingPage {
  id: string;
  template_id: LandingTemplateId;
  template_name: string;
  subdomain_slug: string;
  activated_at: string | null;
  duration_days: number;
  is_enabled: boolean;
  is_expired: boolean;
}

export interface User {
  id: string;
  username: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  telegram_connected: boolean;
  anti_spam_enabled: boolean;
  landing_pages: UserLandingPage[];
  created_at: string;
  updated_at: string;
}

export interface LandingFormItem {
  template_id: string;
  duration_days: number;
  enabled: boolean;
}
