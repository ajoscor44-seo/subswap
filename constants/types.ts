import { ReactNode } from "react";

export type TViewState =
  | "home"
  | "dashboard"
  | "admin"
  | "settings"
  | "about"
  | "contact"
  | "marketplace"
  | "transactions";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar: string;
  balance: number;
  isAdmin: boolean;
  isVerified: boolean;
  hasDeposited: boolean;
  totalSaved: number;
  is_banned?: boolean;
  merchantRating?: number;
}

export type FulfillmentType = "Password" | "Invite Link" | "OTP / Instruction";

export interface MasterAccount {
  id: string;
  service_name: string;
  master_email: string;
  master_password: string;
  total_slots: number;
  available_slots: number;
  price: number;
  original_price?: number;
  description: string;
  icon_url: string;
  category: string;
  owner_id?: string;
  features?: string[];
  fulfillment_type?: FulfillmentType;
  owner?: {
    username: string;
    is_verified: boolean;
    avatar: string;
    merchant_rating?: number;
  };
}

export enum ProductCategory {
  STREAMING = "Streaming",
  MUSIC = "Music",
  VPN = "VPN",
  SOCIAL = "Social",
  SOFTWARE = "Software",
  EDUCATION = "Education",
}

export interface UserSubscription {
  id: string;
  user_id: string;
  account_id: string;
  assigned_profile_name: string;
  status: "Active" | "Pending" | "Expired" | "Cancelled";
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
  type: "Deposit" | "Purchase" | "Refund" | "Withdrawal" | "Referral";
  description: string;
  created_at: string;
}

export type AdminTab = "stats" | "inventory" | "users" | "transactions";

export interface Feedback {
  message: string;
  type: "success" | "error";
}

export interface AdminStats {
  totalEscrow: number;
  totalUsers: number;
  activeAccounts: number;
  totalSlots: number;
  availableSlots: number;
  totalRevenue: number;
  purchaseCount: number;
  depositCount: number;
  bannedUsers: number;
  verifiedUsers: number;
  recentTransactions: Transaction[];
  topServices: { name: string; purchases: number; revenue: number }[];
}

export interface AdminDashboardProps {
  user: User;
  onRefreshUser?: () => void;
}

export const PRESET_ICONS = [
  {
    name: "Netflix",
    url: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Spotify",
    url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Canva",
    url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "ChatGPT",
    url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "YouTube",
    url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Apple",
    url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=400",
  },
];

export const INITIAL_FORM: Partial<MasterAccount> = {
  service_name: "",
  master_email: "",
  master_password: "",
  total_slots: 5,
  available_slots: 5,
  price: 0,
  original_price: 0,
  description: "",
  icon_url: PRESET_ICONS[0].url,
  category: "Streaming" as any,
  fulfillment_type: "Password" as any,
  features: [],
};

export interface FormState {
  email: string;
  name: string;
  username: string;
  password: string;
}

export interface OnboardingState {
  useCase: string;
  role: string;
  referralSource: string;
}

export interface OnboardingStep {
  title: string;
  subtitle: string;
  field: keyof OnboardingState;
  options: { icon: ReactNode; label: string }[];
}

export const DEFAULT_FORM: FormState = {
  email: "",
  name: "",
  username: "",
  password: "",
};

export const DEFAULT_ONBOARDING: OnboardingState = {
  useCase: "",
  role: "",
  referralSource: "",
};
