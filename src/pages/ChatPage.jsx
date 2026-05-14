import { AlertCircle, MessageCircle, Send, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'
import { useAuth } from '../hooks/useAuth'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

export default function ChatPage() {
  const { loading: authLoading, user } = useAuth()
  const [thread, setThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(Boolean(supabase))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const channelId = useRef(globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))

  const loadThread = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false)
      return
    }

    const { data, error: threadError } = await supabase
      .from('chat_threads')
      .select('id, status, last_message_at, created_at')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (threadError) {
      setError(threadError.message)
      setLoading(false)
      return
    }

    setThread(data || null)
    setLoading(false)
  }, [user])

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
    if (authLoading) return
    loadThread()
  }, [authLoading, loadThread])

  useEffect(() => {
    if (!thread?.id) {
      setMessages([])
      return undefined
    }

    loadMessages(thread.id)

    const channel = supabase
      .channel(`user-chat-${thread.id}-${channelId.current}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `thread_id=eq.${thread.id}` }, () => loadMessages(thread.id))
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadMessages, thread])

  const ensureThread = async () => {
    if (thread?.id) return thread

    const { data, error: createError } = await supabase
      .from('chat_threads')
      .insert([{ user_id: user.id, user_email: user.email, status: 'open' }])
      .select('id, status, last_message_at, created_at')
      .single()

    if (createError) throw createError

    setThread(data)
    return data
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    if (!body.trim() || !supabase || !user) return

    setSending(true)
    setError('')

    try {
      const activeThread = await ensureThread()
      const { error: sendError } = await supabase.from('chat_messages').insert([{
        thread_id: activeThread.id,
        sender_user_id: user.id,
        sender_role: 'user',
        sender_email: user.email,
        body: body.trim(),
      }])

      if (sendError) throw sendError
      setBody('')
      await loadMessages(activeThread.id)
    } catch (sendError) {
      setError(sendError.message)
    } finally {
      setSending(false)
    }
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="section-shell py-16">
        <div className="card mx-auto max-w-2xl text-center">
          <Sparkles className="mx-auto mb-5 text-violet-700 dark:text-amber-200" size={34} />
          <h1 className="text-3xl font-black tracking-tight">Chat is not available yet.</h1>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Once messaging is enabled, you will be able to contact the studio directly from here.</p>
        </div>
      </div>
    )
  }

  if (!authLoading && !user) {
    return (
      <div className="section-shell py-16">
        <div className="card mx-auto max-w-2xl text-center">
          <MessageCircle className="mx-auto mb-5 text-violet-700 dark:text-amber-200" size={34} />
          <h1 className="text-3xl font-black tracking-tight">Sign in to message the studio.</h1>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Your conversation is private to your account and can be continued later.</p>
          <Link className="btn-primary mt-7" to="/auth">Go to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section-shell py-12">
      <ScrollReveal className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-violet-700 dark:text-amber-200">
            <MessageCircle size={16} />
            Client Support
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Ask a question before or after your reading.</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Use this space for booking questions, preparation notes, payment details, or follow-up support.</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
            <div>
              <p className="font-black">Arcana Studio</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{thread?.status === 'closed' ? 'Conversation closed' : 'Private conversation'}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-100">private</span>
          </div>

          {error && (
            <div className="m-4 flex gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <div className="grid min-h-[26rem] content-end gap-3 p-4">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading chat...</p>
            ) : messages.length > 0 ? messages.map((message) => (
              <ChatBubble key={message.id} message={message} mine={message.sender_role === 'user'} />
            )) : (
              <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500 dark:border-white/15 dark:text-slate-400">No messages yet. Send your first question below.</p>
            )}
          </div>

          <form className="flex gap-3 border-t border-slate-200 p-4 dark:border-white/10" onSubmit={sendMessage}>
            <input className="input-field" disabled={sending || authLoading || !user} onChange={(event) => setBody(event.target.value)} placeholder="Type your message..." value={body} />
            <button className="btn-primary shrink-0" disabled={sending || !body.trim()} type="submit">
              <Send size={16} />
              Send
            </button>
          </form>
        </div>
      </ScrollReveal>
    </div>
  )
}

function ChatBubble({ message, mine }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[82%] rounded-[1.25rem] px-4 py-3 ${mine ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-stone-100 text-slate-900 dark:bg-slate-900 dark:text-white'}`}>
        <p className="text-sm leading-6">{message.body}</p>
        <p className={`mt-2 text-[11px] font-bold uppercase ${mine ? 'text-white/60 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>{message.sender_role}</p>
      </div>
    </div>
  )
}
