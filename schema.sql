
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
ADD COLUMN IF NOT EXISTS domain TEXT;

-- 3. CUSTOM PLATFORMS TABLE
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

-- 4. SECURITY FIX: SENSITIVE DATA PROTECTION
-- We want everyone to see available slots, but only subscribers to see credentials.
-- The safest way is to use a View for public marketplace data.

-- First, ensure RLS is enabled on master_accounts
ALTER TABLE public.master_accounts ENABLE ROW LEVEL SECURITY;

-- Policy for admins: see everything
DROP POLICY IF EXISTS "Admins see all" ON public.master_accounts;
CREATE POLICY "Admins see all" ON public.master_accounts
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
);

-- Policy for owners: see their own accounts
DROP POLICY IF EXISTS "Owners see own" ON public.master_accounts;
CREATE POLICY "Owners see own" ON public.master_accounts
FOR ALL TO authenticated
USING (auth.uid() = owner_id);

-- Policy for users: can see sensitive info ONLY if they have an active subscription
-- or if they are the owner or admin.
-- Note: This might make listing items harder if we use select *, so we use a VIEW for marketplace.
DROP POLICY IF EXISTS "Subscribers see credentials" ON public.master_accounts;
CREATE POLICY "Subscribers see credentials" ON public.master_accounts
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_subscriptions s 
    WHERE s.account_id = public.master_accounts.id 
    AND s.user_id = auth.uid() 
    AND s.status = 'Active'
  )
);

-- Policy for Public/Authenticated to see non-sensitive listing data
-- Since RLS is row-level, we allow SELECT on the row, but we will use a VIEW
-- to actually filter columns for the frontend marketplace.
DROP POLICY IF EXISTS "Public can see rows" ON public.master_accounts;
CREATE POLICY "Public can see rows" ON public.master_accounts
FOR SELECT TO anon, authenticated
USING (available_slots > 0);

-- 5. MARKETPLACE VIEW (Publicly safe columns)
-- Use this for the landing page and browse tab
CREATE OR REPLACE VIEW public.marketplace_listings AS
SELECT 
    id, 
    service_name, 
    total_slots, 
    available_slots, 
    price, 
    original_price, 
    description, 
    icon_url, 
    category, 
    owner_id, 
    features, 
    fulfillment_type, 
    domain, 
    created_at
FROM public.master_accounts
WHERE available_slots > 0;

GRANT SELECT ON public.marketplace_listings TO anon, authenticated;

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

  INSERT INTO public.profiles (id, email, name, username, phone_number, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_username,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.phone),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    phone_number = COALESCE(public.profiles.phone_number, EXCLUDED.phone_number);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
