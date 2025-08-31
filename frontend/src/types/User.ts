// src/types/User.ts

export interface User {
  id?: string;
  name?: string;
  full_name?: string;
  email: string;
  credits?: number;
  total_conversions?: number;
  credits_used_today?: number;
  credits_used_this_month?: number;
  plan?: 'free' | 'premium' | 'business' | string;
  plan_info?: {
    name: string;
    [key: string]: any;
  };
  avatar?: string;
}



