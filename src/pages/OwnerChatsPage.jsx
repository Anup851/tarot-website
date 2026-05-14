import { MessageCircle, Send, ShieldAlert, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function OwnerChatsPage() {
  const { loading: authLoading, role, user } = useAuth()

  if (authLoading) {
    return <div className="section-shell py-16"><div className="card text-center text-slate-500 dark:text-slate-400">Opening client conversations...</div></div>
  }

  if (!user || role !== 'owner') {
    return (
      <div className="section-shell py-16">
        <div className="card mx-auto max-w-2xl text-center">
          <ShieldAlert className="mx-auto mb-5 text-rose-600" size={36} />
          <h1 className="text-3xl font-black tracking-tight">Studio access required.</h1>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Sign in with an approved studio account to view and reply to client conversations.</p>
          <Link className="btn-primary mt-7" to="/auth">Go to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section-shell py-10 sm:py-14">
      <ScrollReveal className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:p-8">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-violet-700 dark:text-amber-200">
          <Sparkles size={16} />
          Client Conversations
        </p>
        <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">A dedicated space for client messages.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Review incoming questions, continue follow-ups, and close conversations once the client has what they need.
        </p>
      </ScrollReveal>

      <ScrollReveal className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:p-6">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-black">
          <MessageCircle className="text-violet-700 dark:text-amber-200" size={20} />
          Conversation Threads
        </h2>
        <OwnerChatPanel user={user} />
      </ScrollReveal>
    </div>
  )
}

function OwnerChatPanel({ user }) {
  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState('')
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const channelId = useMemo(() => globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2), [])

  const activeThread = threads.find((thread) => thread.id === activeThreadId)

  const loadThreads = useCallback(async () => {
    if (!supabase) return

    const { data, error: threadsError } = await supabase
      .from('chat_threads')
      .select('id, user_email, status, last_message_at, created_at')
      .order('last_message_at', { ascending: false })
      .limit(30)

    if (threadsError) {
      setError(threadsError.message)
      setLoading(false)
      return
    }

    setThreads(data || [])
    setActiveThreadId((current) => current || data?.[0]?.id || '')
    setLoading(false)
  }, [])

  const loadMessages = useCallback(async (threadId) => {
    if (!supabase || !threadId) {
      setMessages([])
      return
    }

    const { data, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, sender_role, sender_email, body, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      setError(messagesError.message)
      return
    }

    setMessages(data || [])
  }, [])

  useEffect(() => {
    loadThreads()

    if (!supabase) return undefined

    const channel = supabase
      .channel(`owner-chat-page-${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_threads' }, loadThreads)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        loadThreads()
        if (activeThreadId) loadMessages(activeThreadId)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeThreadId, channelId, loadMessages, loadThreads])

  useEffect(() => {
    loadMessages(activeThreadId)
  }, [activeThreadId, loadMessages])

  const sendReply = async (event) => {
    event.preventDefault()
    if (!body.trim() || !activeThreadId || !user) return

    setSaving(true)
    setError('')

    const { error: sendError } = await supabase.from('chat_messages').insert([{
      thread_id: activeThreadId,
      sender_user_id: user.id,
      sender_role: 'owner',
      sender_email: user.email,
      body: body.trim(),
    }])

    if (sendError) {
      setError(sendError.message)
    } else {
      setBody('')
      await loadMessages(activeThreadId)
      await loadThreads()
    }

    setSaving(false)
  }

  const toggleStatus = async () => {
    if (!activeThread) return
    setSaving(true)

    const { error: updateError } = await supabase
      .from('chat_threads')
      .update({ status: activeThread.status === 'closed' ? 'open' : 'closed' })
      .eq('id', activeThread.id)

    if (updateError) setError(updateError.message)
    await loadThreads()
    setSaving(false)
  }

  if (loading) return <p className="text-sm text-slate-500 dark:text-slate-400">Opening conversations...</p>

  return (
    <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
      {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200 lg:col-span-2">{error}</p>}

      <div className="grid max-h-[38rem] gap-2 overflow-y-auto pr-1">
        {threads.length > 0 ? threads.map((thread) => (
          <button key={thread.id} className={`rounded-[1.25rem] border p-4 text-left ${activeThreadId === thread.id ? 'border-violet-400 bg-violet-50 dark:border-amber-200 dark:bg-amber-200/10' : 'border-slate-200 bg-stone-50 dark:border-white/10 dark:bg-slate-950/50'}`} onClick={() => setActiveThreadId(thread.id)} type="button">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="line-clamp-1 font-black">{thread.user_email}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{new Date(thread.last_message_at).toLocaleString()}</p>
              </div>
              <Badge>{thread.status}</Badge>
            </div>
          </button>
        )) : <EmptyState text="No client conversations have started yet." />}
      </div>

      <div className="rounded-[1.25rem] border border-slate-200 bg-stone-50 dark:border-white/10 dark:bg-slate-950/50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/10">
          <div>
            <p className="font-black">{activeThread?.user_email || 'Select a conversation'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{messages.length} message{messages.length === 1 ? '' : 's'} in this thread</p>
          </div>
          {activeThread && (
            <button className="btn-secondary min-h-9 px-3 py-1.5 text-xs" disabled={saving} onClick={toggleStatus} type="button">
              {activeThread.status === 'closed' ? 'Reopen' : 'Close'}
            </button>
          )}
        </div>

        <div className="grid min-h-[28rem] content-end gap-3 p-4">
          {messages.length > 0 ? messages.map((message) => (
            <OwnerChatBubble key={message.id} message={message} mine={message.sender_role === 'owner'} />
          )) : <p className="text-sm text-slate-500 dark:text-slate-400">Choose a conversation to read and reply.</p>}
        </div>

        <form className="flex gap-2 border-t border-slate-200 p-4 dark:border-white/10" onSubmit={sendReply}>
          <input className="input-field" disabled={!activeThread || saving} onChange={(event) => setBody(event.target.value)} placeholder="Reply to user..." value={body} />
          <button className="btn-primary shrink-0" disabled={!body.trim() || !activeThread || saving} type="submit">
            <Send size={16} />
            Reply
          </button>
        </form>
      </div>
    </div>
  )
}

function OwnerChatBubble({ message, mine }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[82%] rounded-[1.1rem] px-4 py-3 ${mine ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white text-slate-900 dark:bg-white/10 dark:text-white'}`}>
        <p className="text-sm leading-6">{message.body}</p>
        <p className={`mt-2 text-[10px] font-black uppercase ${mine ? 'text-white/60 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>{message.sender_role}</p>
      </div>
    </div>
  )
}

function Badge({ children }) {
  return <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase text-white dark:bg-white dark:text-slate-950">{children}</span>
}

function EmptyState({ text }) {
  return <p className="rounded-[1.25rem] border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500 dark:border-white/15 dark:text-slate-400">{text}</p>
}
