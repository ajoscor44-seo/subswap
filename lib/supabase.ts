import { createClient } from '@supabase/supabase-js';

// Updated with provided user credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jbryrfpebapkkncyufov.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicnlyZnBlYmFwa2tuY3l1Zm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjQyNDcsImV4cCI6MjA4Njg0MDI0N30.pRll7OWHPXbAvcQZV7eILhxKiHu-BayiW0YHCaNSnPk';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  }
});