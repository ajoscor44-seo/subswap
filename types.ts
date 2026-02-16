
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar: string;
  balance: number;
  isAdmin: boolean;
  isVerified: boolean; // New
  hasDeposited: boolean;
  totalSaved: number;
  merchantRating?: number; // New
}

export interface MasterAccount {
  id: string;
  service_name: string;
  master_email: string;
  master_password: string;
  total_slots: number;
  available_slots: number;
  price: number;
  original_price?: number; // New
  description: string;
  icon_url: string;
  category: string;
  owner_id?: string; // New
  features?: string[]; // New
  // Added owner property to match Supabase join results
  owner?: {
    username: string;
    is_verified: boolean;
    avatar: string;
    merchant_rating?: number;
  };
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  description: string;
  image: string;
  totalSlots: number;
  takenSlots: number;
  features: string[];
  owner?: {
    username: string;
    is_verified: boolean;
    avatar: string;
    rating?: number;
  };
}

export enum ProductCategory {
  STREAMING = 'Streaming',
  MUSIC = 'Music',
  VPN = 'VPN',
  SOCIAL = 'Social',
  SOFTWARE = 'Software',
  EDUCATION = 'Education'
}

export interface UserSubscription {
  id: string;
  user_id: string;
  account_id: string;
  assigned_profile_name: string;
  status: 'Active' | 'Pending' | 'Expired' | 'Cancelled';
  purchased_at: string;
  master_accounts?: MasterAccount;
  product_id?: string;
  name?: string;
  price?: number;
  created_at?: string;
  fulfillment_data?: {
    username?: string;
    password?: string;
    link?: string;
  };
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'Deposit' | 'Purchase' | 'Refund' | 'Withdrawal' | 'Referral';
  description: string;
  created_at: string;
}