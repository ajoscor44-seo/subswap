
-- 1. Create Secrets table for sensitive credentials
CREATE TABLE IF NOT EXISTS public.master_account_secrets (
    account_id UUID PRIMARY KEY REFERENCES public.master_accounts(id) ON DELETE CASCADE,
    master_email TEXT NOT NULL,
    master_password TEXT NOT NULL
);

-- 2. Migrate existing data if columns exist in master_accounts
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='master_accounts' AND column_name='master_email') THEN
        INSERT INTO public.master_account_secrets (account_id, master_email, master_password)
        SELECT id, master_email, master_password FROM public.master_accounts
        ON CONFLICT (account_id) DO NOTHING;
        
        -- We won't drop the columns yet to avoid breaking current code before it's updated
        -- But we will use RLS to hide them or create a view.
    END IF;
END $$;

-- 3. Enable RLS on secrets
ALTER TABLE public.master_account_secrets ENABLE ROW LEVEL SECURITY;

-- 4. Policy for secrets: Admin, Owner, or Active Subscriber
CREATE POLICY "Admins can manage secrets" ON public.master_account_secrets
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.is_admin = true))
);

CREATE POLICY "Owners can see their own secrets" ON public.master_account_secrets
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.master_accounts ma WHERE ma.id = account_id AND ma.owner_id = auth.uid())
);

CREATE POLICY "Subscribers can see secrets" ON public.master_account_secrets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_subscriptions s 
    WHERE s.account_id = public.master_account_secrets.account_id 
    AND s.user_id = auth.uid() 
    AND s.status = 'Active'
  )
);

-- 5. Updated Marketplace View (Ensures no credentials leak)
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
WHERE available_slots > 0 AND is_active = true;

GRANT SELECT ON public.marketplace_listings TO anon, authenticated;
