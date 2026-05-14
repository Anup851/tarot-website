import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { siteUrl, supabase } from '../lib/supabase'

const pendingRoleKey = 'arcana_pending_role'
const ownerEmail = 'admin123@gmail.com'
const AuthContext = createContext(null)

function localProfileForSession(currentSession) {
  const email = currentSession?.user?.email || ''
  const metadata = currentSession?.user?.user_metadata || {}

  return {
    id: currentSession?.user?.id,
    email,
    full_name: metadata.full_name || metadata.name || '',
    avatar_url: metadata.avatar_url || metadata.picture || '',
    role: email.toLowerCase() === ownerEmail ? 'owner' : 'user',
  }
}

function useAuthState() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const user = session?.user || null
  const isAdminEmail = user?.email?.toLowerCase() === ownerEmail
  const resolvedRole = isAdminEmail ? 'owner' : profile?.role || (user ? 'user' : 'guest')

  const syncProfile = useCallback(async (currentSession) => {
    if (!supabase || !currentSession?.user) {
      setProfile(null)
      return null
    }

    const requestedRole = localStorage.getItem(pendingRoleKey) || 'user'
    const { data, error } = await supabase.rpc('sync_auth_profile', { requested_role: requestedRole })

    if (error) {
      console.warn('Profile sync skipped. Run database-schema.sql in Supabase to refresh sync_auth_profile.', error.message || error)
      const fallbackProfile = localProfileForSession(currentSession)
      localStorage.removeItem(pendingRoleKey)
      setProfile(fallbackProfile)
      return fallbackProfile
    }

    localStorage.removeItem(pendingRoleKey)
    setProfile(data?.[0] || null)
    return data?.[0] || null
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      setSession(data.session)
      if (data.session) {
        try {
          await syncProfile(data.session)
        } catch (error) {
          console.error('Unexpected auth profile sync failure:', error)
        }
      }
      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) {
        syncProfile(nextSession).catch((error) => console.error('Unexpected auth profile sync failure:', error))
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [syncProfile])

  const signInWithGoogle = async (role) => {
    if (!supabase) throw new Error('Supabase is not configured.')

    localStorage.setItem(pendingRoleKey, role)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: siteUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error
  }

  const signInWithPassword = async ({ email, password, role }) => {
    if (!supabase) throw new Error('Supabase is not configured.')

    localStorage.setItem(pendingRoleKey, role)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) throw error

    if (data.session) {
      setSession(data.session)
      await syncProfile(data.session)
    }

    return data
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  return useMemo(() => ({
    loading,
    profile,
    role: resolvedRole,
    session,
    signInWithGoogle,
    signInWithPassword,
    signOut,
    user,
  }), [loading, profile, resolvedRole, session, user])
}

export function AuthProvider({ children }) {
  const auth = useAuthState()

  return createElement(AuthContext.Provider, { value: auth }, children)
}

export function useAuth() {
  const auth = useContext(AuthContext)
  return auth || useAuthState()
}
