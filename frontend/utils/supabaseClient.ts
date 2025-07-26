import { createClient } from '@supabase/supabase-js';

// Client side supabase instance. The anon key allows public, row‑level
// operations that the user is authorized to perform. DO NOT expose your
// service role key here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
