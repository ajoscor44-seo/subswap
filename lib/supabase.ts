
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Updated with provided user credentials
const supabaseUrl = 'https://jbryrfpebapkkncyufov.supabase.co';
const supabaseKey = 'sb_publishable_WIyvb9_aC6bmjQ5_CL4Jfg_KDhXO9K9';

export const supabase = createClient(supabaseUrl, supabaseKey);
