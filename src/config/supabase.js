import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// Get the base URL for OAuth redirects
// Handle both local development and production
const getRedirectUrl = () => {
  // Use window.location.origin in browser context
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:5173'
}

export const REDIRECT_URL = getRedirectUrl()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security with SPAs
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'custom-resume-auth'
  }
})
