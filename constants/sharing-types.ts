export interface Subscription {
  id: string;
  name: string;
  description: string;
  max_seats: number;
  monthly_price: number;
  logo_url: string;
  created_by: string;
  created_at: string;
}

export interface Group {
  id: string;
  subscription_id: string;
  host_user_id: string;
  cycle_start: string;
  cycle_end: string;
  renewal_day: number;
  created_at: string;
  subscription?: Subscription;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  seat_number: number;
  role: 'host' | 'member';
  status: 'pending' | 'active' | 'removed';
  joined_at: string;
  profiles?: {
    username: string;
    avatar: string;
  };
}

export interface Payment {
  id: string;
  user_id: string;
  group_id: string;
  amount: number;
  billing_cycle_start: string;
  billing_cycle_end: string;
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export interface Invitation {
  id: string;
  group_id: string;
  invited_by: string;
  invite_type: 'link' | 'email' | 'username';
  invite_value: string;
  invite_token: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
  groups?: Group;
}
