import { ReactNode } from "react";

export type TViewState =
  | "home"
  | "dashboard"
  | "admin"
  | "settings"
  | "about"
  | "contact"
  | "marketplace"
  | "transactions"
  | "reset-password"
  | "verify-email";

export type UserRole = "admin" | "user";

export interface Step {
  number: string;
  accent: string;
  light: string;
  icon: string;
  title: string;
  description: string;
  detail: string;
  detailIcon: string;
}

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
  joinedAt?: Date | string;
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
  VPN = "Privacy & Security",
  AI = "AI & Writing",
  DESIGN = "Design",
  MARKETING = "Marketing",
  PRODUCTIVITY = "Productivity",
  GAMING = "Gaming",
  SOCIAL = "Social",
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

export interface Platform {
  name: string;
  domain: string;
  category: PlatformCategory;
  hint?: string;
}

export type PlatformCategory =
  | "Streaming"
  | "Music"
  | "AI & Writing"
  | "Design"
  | "Privacy & Security"
  | "Social"
  | "Education"
  | "SEO & Marketing"
  | "Productivity"
  | "Gaming";
