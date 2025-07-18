import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://bbocjsxsyhpryapfcfjh.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJib2Nqc3hzeWhwcnlhcGZjZmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4Mzk4MzcsImV4cCI6MjA2ODQxNTgzN30.4oU_x5zI4iSQdDx0NaROHbSfnpHBjRCkGdn6Pl71tjk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Singleton pattern for client-side usage
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// No longer in demo mode
export const isDemoMode = false
