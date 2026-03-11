
-- DiscountZAR DATABASE SCHEMA UPDATES
-- Target: Supabase / PostgreSQL

-- 1. UPDATE PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS merchant_rating DECIMAL(3,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

-- 2. UPDATE MASTER ACCOUNTS
ALTER TABLE public.master_accounts 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS original_price DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS domain TEXT; -- Added domain to persist platform metadata

-- 3. CUSTOM PLATFORMS TABLE (For persistent custom items)
CREATE TABLE IF NOT EXISTS public.custom_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT,
    category TEXT DEFAULT 'Streaming',
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.custom_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage custom platforms" ON public.custom_platforms
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
);
CREATE POLICY "Everyone can see custom platforms" ON public.custom_platforms
FOR SELECT USING (true);

-- 4. ENHANCED PURCHASE FUNCTION
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
    SELECT balance INTO v_buyer_balance FROM public.profiles WHERE id = p_buyer_id FOR UPDATE;
    SELECT owner_id, available_slots INTO v_merchant_id, v_slots 
    FROM public.master_accounts 
    WHERE id = p_account_id FOR UPDATE;

    IF v_buyer_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance. You need ₦% to join this group.', p_amount;
    END IF;

    IF v_slots <= 0 THEN
        RAISE EXCEPTION 'This group is already full.';
    END IF;

    UPDATE public.profiles 
    SET balance = balance - p_amount,
        total_saved = total_saved + (p_amount * 0.5)
    WHERE id = p_buyer_id;

    IF v_merchant_id IS NOT NULL THEN
        UPDATE public.profiles 
        SET balance = balance + p_amount 
        WHERE id = v_merchant_id;
        
        INSERT INTO public.transactions (user_id, amount, type, description)
        VALUES (v_merchant_id, p_amount, 'Referral', 'Income from slot purchase in account ' || p_account_id);
    END IF;

    UPDATE public.master_accounts 
    SET available_slots = available_slots - 1 
    WHERE id = p_account_id;

    INSERT INTO public.user_subscriptions (user_id, account_id, assigned_profile_name)
    VALUES (p_buyer_id, p_account_id, p_profile_name);

    INSERT INTO public.transactions (user_id, amount, type, description)
    VALUES (p_buyer_id, -p_amount, 'Purchase', 'Joined premium group: ' || p_account_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. REFRESH RLS POLICIES
DROP POLICY IF EXISTS "Owners can manage their own master accounts" ON public.master_accounts;
CREATE POLICY "Owners can manage their own master accounts" ON public.master_accounts
FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
);

-- 6. FIXED HANDLE NEW USER TRIGGER (Supports Social Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Generate a fallback username if metadata is missing (Social Auth)
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username', 
    split_part(NEW.email, '@', 1) || '_' || substring(NEW.id::text, 1, 4)
  );

  INSERT INTO public.profiles (id, email, name, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_username,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(public.profiles.name, EXCLUDED.name);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
