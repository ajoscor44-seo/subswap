
-- ELEVATE SPECIFIC USER TO ADMIN
-- This targets the user provided by the owner
UPDATE public.profiles 
SET role = 'admin', is_verified = TRUE
WHERE email = 'joscor@wsv.com.ng';

-- SUBSWAP DEMO DATA SEED
-- These accounts are created as "Official" entries (owner_id is NULL)
-- This avoids foreign key constraint errors with auth.users.

INSERT INTO public.master_accounts (
    service_name, 
    master_email, 
    master_password, 
    total_slots, 
    available_slots, 
    price, 
    original_price, 
    description, 
    icon_url, 
    category, 
    owner_id, 
    features
) VALUES 
(
    'Netflix Premium 4K', 
    'netflix@subswap.com', 
    'password123', 
    5, 
    5, 
    3500, 
    7000, 
    'Ultra HD streaming on any device. Includes your own private profile.', 
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=400', 
    'Streaming', 
    NULL, 
    ARRAY['4K Ultra HD', 'Private Profile', 'Renewable', 'Download Offline']
),
(
    'Spotify Premium', 
    'spotify@subswap.com', 
    'musicpass', 
    6, 
    6, 
    1200, 
    3500, 
    'Ad-free music listening with high-quality audio and offline downloads.', 
    'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400', 
    'Music', 
    NULL, 
    ARRAY['No Ads', 'High Fidelity', 'Unlimited Skips', 'Offline Mode']
),
(
    'Canva Pro Yearly', 
    'canva@subswap.com', 
    'designlife', 
    10, 
    8, 
    2500, 
    15000, 
    'Complete access to Canva Pro assets, magic resize, and brand kits.', 
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400', 
    'Software', 
    NULL, 
    ARRAY['100M+ Photos', 'Brand Kits', 'Magic Resize', 'Background Remover']
),
(
    'ChatGPT Plus', 
    'openai@subswap.com', 
    'gpt4pass', 
    3, 
    2, 
    5500, 
    25000, 
    'Access to GPT-4o, DALL-E 3, and advanced data analysis tools.', 
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400', 
    'Software', 
    NULL, 
    ARRAY['GPT-4o Access', 'DALL-E 3', 'Faster Response', 'Early Access']
);
