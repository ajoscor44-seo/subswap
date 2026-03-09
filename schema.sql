
-- DiscountZAR DATABASE SCHEMA UPDATES
-- Target: Supabase / PostgreSQL

-- 1. UPDATE PROFILES
-- Add verification status for badges and admin flag (optional; role = 'admin' also grants admin)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS merchant_rating DECIMAL(3,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. UPDATE MASTER ACCOUNTS
-- Add ownership and rich content fields
ALTER TABLE public.master_accounts 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS original_price DECIMAL(12, 2); -- To show discount % in UI

-- 3. ENHANCED PURCHASE FUNCTION (Multi-merchant support)
-- This function handles the buyer deduction AND merchant credit in one atomic step
CREATE OR REPLACE FUNCTION public.purchase_slot_v2(
    p_buyer_id UUID,
    p_account_id UUID,
    p_profile_name TEXT,
    p_amount DECIMAL
)
RETURNS VOID AS $$
DECLARE
    v_buyer_balance DECIMAL;
    v_slots INTEGER;
    v_merchant_id UUID;
BEGIN
    -- 1. Lock rows to prevent race conditions
    SELECT balance INTO v_buyer_balance FROM public.profiles WHERE id = p_buyer_id FOR UPDATE;
    SELECT owner_id, available_slots INTO v_merchant_id, v_slots 
    FROM public.master_accounts 
    WHERE id = p_account_id FOR UPDATE;

    -- 2. Validations
    IF v_buyer_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance. You need ₦% to join this group.', p_amount;
    END IF;

    IF v_slots <= 0 THEN
        RAISE EXCEPTION 'This group is already full.';
    END IF;

    -- 3. UPDATE BUYER
    UPDATE public.profiles 
    SET balance = balance - p_amount,
        total_saved = total_saved + (p_amount * 0.5) -- Estimated saving tracking
    WHERE id = p_buyer_id;

    -- 4. UPDATE MERCHANT (The owner of the account)
    -- If owner exists, credit their balance
    IF v_merchant_id IS NOT NULL THEN
        UPDATE public.profiles 
        SET balance = balance + p_amount 
        WHERE id = v_merchant_id;
        
        -- Record income for merchant
        INSERT INTO public.transactions (user_id, amount, type, description)
        VALUES (v_merchant_id, p_amount, 'Referral', 'Income from slot purchase in account ' || p_account_id);
    END IF;

    -- 5. UPDATE INVENTORY
    UPDATE public.master_accounts 
    SET available_slots = available_slots - 1 
    WHERE id = p_account_id;

    -- 6. CREATE SUBSCRIPTION
    INSERT INTO public.user_subscriptions (user_id, account_id, assigned_profile_name)
    VALUES (p_buyer_id, p_account_id, p_profile_name);

    -- 7. RECORD BUYER TRANSACTION
    INSERT INTO public.transactions (user_id, amount, type, description)
    VALUES (p_buyer_id, -p_amount, 'Purchase', 'Joined premium group: ' || p_account_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. REFRESH RLS POLICIES FOR MERCHANTS
-- Allow owners to see their own posted accounts
CREATE POLICY "Owners can manage their own master accounts" ON public.master_accounts
FOR ALL USING (auth.uid() = owner_id);

-- Ensure all profiles are visible so we can show merchant info in marketplace
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Users can update only their own profile (name, username, avatar, etc.)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile (for funding, ban, verify)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
);

-- Transactions: enable RLS and restrict read/insert to own or admin
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
CREATE POLICY "Users can read own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can read all transactions" ON public.transactions;
CREATE POLICY "Admins can read all transactions" ON public.transactions
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
);
DROP POLICY IF EXISTS "Admins can insert any transaction" ON public.transactions;
CREATE POLICY "Admins can insert any transaction" ON public.transactions
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
);

-- user_subscriptions: users can read and insert their own (purchase_slot_v2 does insert via SECURITY DEFINER)
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can read own subscriptions" ON public.user_subscriptions
FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- master_accounts: allow admins to manage all rows (insert/update/delete)
DROP POLICY IF EXISTS "Admins can manage all master accounts" ON public.master_accounts;
CREATE POLICY "Admins can manage all master accounts" ON public.master_accounts
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
);
