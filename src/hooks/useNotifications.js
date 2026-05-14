import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export function useNotifications(limit = 12) {
  const { role, user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase && user))
  const channelId = useRef(globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))

  const fetchNotifications = useCallback(async () => {
    if (!supabase || !user) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('app_notifications')
      .select('id, type, title, message, action_url, read_at, handled_at, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!error) setNotifications(data || [])
    setLoading(false)
  }, [limit, user])

  useEffect(() => {
    fetchNotifications()

    if (!supabase || !user) return undefined

    const channel = supabase
      .channel(`notifications-${user.id}-${role}-${channelId.current}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_notifications' }, fetchNotifications)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotifications, role, user])

  const markRead = async (id) => {
    if (!supabase) return
    await supabase.from('app_notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
    fetchNotifications()
  }

  const markHandled = async (id) => {
    if (!supabase) return
    const now = new Date().toISOString()
    await supabase.from('app_notifications').update({ read_at: now, handled_at: now }).eq('id', id)
    fetchNotifications()
  }

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications])

  return { fetchNotifications, loading, markHandled, markRead, notifications, unreadCount }
}
