import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const configuredSiteUrl = import.meta.env.VITE_SITE_URL

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
export const hasSupabaseConfig = isConfigured
export const siteUrl = configuredSiteUrl?.replace(/\/$/, '') || window.location.origin
