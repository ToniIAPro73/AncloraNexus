// src/types/User.ts

export interface User {
  id?: string;
  name?: string;
  full_name?: string;
  email: string;
  credits?: number;
  total_conversions?: number;
  plan_info?: {
    name: string;
    [key: string]: any;
  };
  avatar?: string;
}
