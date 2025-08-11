
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
  throw new Error("Supabase URL is not defined or is still a placeholder. Please check your .env file for NEXT_PUBLIC_SUPABASE_URL. You can find this in your Supabase project's Settings > API section.");
}
if (!supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  throw new Error("Supabase Anon Key is not defined or is still a placeholder. Please check your .env file for NEXT_PUBLIC_SUPABASE_ANON_KEY. You can find this in your Supabase project's Settings > API section.");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey)
