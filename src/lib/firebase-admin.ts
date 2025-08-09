
import { createClient } from '@supabase/supabase-js'

// Note: These should be stored securely in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is not defined in environment variables.');
}

// Create a single supabase admin client for use in server-side logic
const adminDb = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const adminAuth = adminDb.auth.admin;

export { adminDb, adminAuth };
