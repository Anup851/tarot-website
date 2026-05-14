import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Inbox,
  Mail,
  ShieldAlert,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { supabase } from '../lib/supabase'

const emptyData = {
  bookings: [],
  messages: [],
  reviews: [],
  sessions: [],
}

const bookingStatuses = ['pending', 'confirmed', 'completed', 'cancelled']

export default function OwnerDashboard() {
  const { loading: authLoading, role, user } = useAuth()
  const { markHandled, markRead, notifications } = useNotifications(1)
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')

  const fetchOwnerData = useCallback(async () => {
    if (!supabase || role !== 'owner') return

    setError('')

    try {
      const [bookingsResult, reviewsResult, messagesResult, sessionsResult] = await Promise.all([
        supabase.from('bookings').select('id, client_name, client_email, client_phone, service_name, requested_date, requested_time, status, message, created_at').order('created_at', { ascending: false }).limit(6),
        supabase.from('reviews').select('id, author, rating, service_name, comment, verified, featured, created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('contact_messages').select('id, name, email, subject, message, status, created_at').order('created_at', { ascending: false }).limit(6),
        supabase.from('reading_sessions').select('id, client_email, spread_type, question, interpretation, created_at').order('created_at', { ascending: false }).limit(5),
      ])

      const firstError = [bookingsResult, reviewsResult, messagesResult, sessionsResult].find((result) => result.error)?.error
      if (firstError) throw firstError

      setData({
        bookings: bookingsResult.data || [],
        reviews: reviewsResult.data || [],
        messages: messagesResult.data || [],
        sessions: sessionsResult.data || [],
      })
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    if (authLoading) return

    if (!supabase || role !== 'owner') {
      setLoading(false)
      return
    }

    fetchOwnerData()

    const channel = supabase
      .channel(`owner-home-${user?.id || 'session'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchOwnerData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, fetchOwnerData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetchOwnerData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reading_sessions' }, fetchOwnerData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authLoading, fetchOwnerData, role, user])

  const updateRow = async ({ id, table, values }) => {
    if (!supabase) return
    setSavingId(`${table}-${id}`)

    const { error: updateError } = await supabase.from(table).update(values).eq('id', id)
    if (updateError) {
      setError(updateError.message)
    } else {
      await fetchOwnerData()
    }

    setSavingId('')
  }

  const priorityNotification = notifications[0]
  const latestBooking = data.bookings[0]
  const pendingBookings = data.bookings.filter((booking) => booking.status === 'pending').length
  const unreadMessages = data.messages.filter((message) => message.status === 'new').length
  const featuredReviews = data.reviews.filter((review) => review.featured).length

  const managementServices = useMemo(() => [
    {
      label: 'Booking desk',
      value: pendingBookings,
      detail: 'pending',
      icon: CalendarDays,
      tone: 'bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-100',
    },
    {
      label: 'Review studio',
      value: data.reviews.length,
      detail: `${featuredReviews} featured`,
      icon: Star,
      tone: 'bg-amber-50 text-amber-900 dark:bg-amber-300/10 dark:text-amber-100',
    },
    {
      label: 'Client inbox',
      value: unreadMessages,
      detail: 'new messages',
      icon: Inbox,
      tone: 'bg-emerald-50 text-emerald-900 dark:bg-emerald-300/10 dark:text-emerald-100',
    },
    {
      label: 'Reading archive',
      value: data.sessions.length,
      detail: 'recent sessions',
      icon: Users,
      tone: 'bg-rose-50 text-rose-900 dark:bg-rose-300/10 dark:text-rose-100',
    },
  ], [data, featuredReviews, pendingBookings, unreadMessages])

  if (authLoading || loading) {
    return <div className="section-shell py-16"><div className="card text-center text-slate-500 dark:text-slate-400">Loading owner home...</div></div>
  }

  if (!user || role !== 'owner') {
    return (
      <div className="section-shell py-16">
        <div className="card mx-auto max-w-2xl text-center">
          <ShieldAlert className="mx-auto mb-5 text-rose-600" size={36} />
          <h1 className="text-3xl font-black tracking-tight">Owner access required.</h1>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Sign in with an owner-approved account to view bookings, reviews, and private business data.</p>
          <Link className="btn-primary mt-7" to="/auth">Go to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section-shell py-10 sm:py-14">
      <ScrollReveal className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:p-8">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-violet-700 dark:text-amber-200">
            <Sparkles size={16} />
            Owner Home
          </p>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Manage the studio from one place.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Bookings, reviews, client messages, and reading history are split into clear service lanes so daily work feels less cramped.
          </p>
        </div>
      </ScrollReveal>

      {error && <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">{error}</div>}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {managementServices.map(({ detail, icon: Icon, label, tone, value }, index) => (
          <ScrollReveal key={label} delay={index * 70} className={`${tone} rounded-[1.5rem] p-5 shadow-sm`}>
            <div className="flex items-center justify-between gap-4">
              <Icon size={24} />
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase text-slate-800 dark:bg-white/10 dark:text-white">{detail}</span>
            </div>
            <p className="mt-6 text-4xl font-black">{value}</p>
            <p className="mt-1 text-sm font-bold">{label}</p>
          </ScrollReveal>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <ServicePanel title="Priority" icon={priorityNotification ? Bell : Clock3} subtitle="One thing to handle first">
          {priorityNotification ? (
            <NotificationRow notification={priorityNotification} onHandled={markHandled} onRead={markRead} />
          ) : latestBooking ? (
            <BookingCard booking={latestBooking} compact isSaving={savingId === `bookings-${latestBooking.id}`} onStatus={(status) => updateRow({ id: latestBooking.id, table: 'bookings', values: { status } })} />
          ) : (
            <EmptyState text="No priority work yet." />
          )}
        </ServicePanel>

        <ServicePanel title="Quick Actions" icon={CheckCircle2} subtitle="Small tools for daily admin">
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickAction icon={CalendarDays} label="Confirm next" text={latestBooking ? latestBooking.client_name : 'No booking'} />
            <QuickAction icon={Star} label="Feature review" text={`${featuredReviews} featured`} />
            <QuickAction icon={Mail} label="Inbox sweep" text={`${unreadMessages} new`} />
          </div>
        </ServicePanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ServicePanel title="Booking Desk" icon={CalendarDays} subtitle="Confirm, complete, or cancel incoming requests">
          <div className="grid gap-4">
            {data.bookings.length > 0 ? data.bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isSaving={savingId === `bookings-${booking.id}`} onStatus={(status) => updateRow({ id: booking.id, table: 'bookings', values: { status } })} />
            )) : <EmptyState text="No bookings yet." />}
          </div>
        </ServicePanel>

        <ServicePanel title="Review Studio" icon={Star} subtitle="Moderate visibility and choose featured praise">
          <div className="grid gap-4">
            {data.reviews.length > 0 ? data.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                isSaving={savingId === `reviews-${review.id}`}
                onFeature={() => updateRow({ id: review.id, table: 'reviews', values: { featured: !review.featured } })}
                onVerify={() => updateRow({ id: review.id, table: 'reviews', values: { verified: !review.verified } })}
                review={review}
              />
            )) : <EmptyState text="No reviews yet." />}
          </div>
        </ServicePanel>

        <ServicePanel title="Client Inbox" icon={Inbox} subtitle="Track messages without leaving the owner home">
          <div className="grid gap-4">
            {data.messages.length > 0 ? data.messages.map((message) => (
              <MessageCard
                key={message.id}
                isSaving={savingId === `contact_messages-${message.id}`}
                message={message}
                onArchive={() => updateRow({ id: message.id, table: 'contact_messages', values: { status: message.status === 'archived' ? 'read' : 'archived' } })}
                onRead={() => updateRow({ id: message.id, table: 'contact_messages', values: { status: 'read' } })}
              />
            )) : <EmptyState text="No messages yet." />}
          </div>
        </ServicePanel>

        <ServicePanel title="Reading Archive" icon={Users} subtitle="Recent client reading records">
          <div className="grid gap-4">
            {data.sessions.length > 0 ? data.sessions.map((session) => (
              <DataRow key={session.id} badge={session.spread_type} meta={session.question || session.interpretation || 'No notes saved yet.'} title={session.client_email} />
            )) : <EmptyState text="No reading sessions yet." />}
          </div>
        </ServicePanel>
      </div>
    </div>
  )
}

function ServicePanel({ children, icon: Icon, subtitle, title }) {
  return (
    <ScrollReveal className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black">
            <Icon className="text-violet-700 dark:text-amber-200" size={20} />
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </ScrollReveal>
  )
}

function BookingCard({ booking, compact = false, isSaving, onStatus }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-slate-950/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-black">{booking.client_name}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{booking.service_name}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Clock3 size={15} />
            {booking.requested_date} at {booking.requested_time}
          </p>
          {!compact && booking.message && <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{booking.message}</p>}
        </div>
        <Badge>{booking.status}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {bookingStatuses.map((status) => (
          <button key={status} className={booking.status === status ? 'btn-primary min-h-9 px-3 py-1.5 text-xs' : 'btn-secondary min-h-9 px-3 py-1.5 text-xs'} disabled={isSaving} onClick={() => onStatus(status)} type="button">
            {status}
          </button>
        ))}
      </div>
    </div>
  )
}

function ReviewCard({ isSaving, onFeature, onVerify, review }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-slate-950/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black">{review.author}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{review.rating}/5 - {review.service_name || 'Tarot Reading'}</p>
        </div>
        <div className="flex gap-2">
          {review.verified && <Badge>live</Badge>}
          {review.featured && <Badge>featured</Badge>}
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.comment}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-secondary min-h-9 px-3 py-1.5 text-xs" disabled={isSaving} onClick={onVerify} type="button">
          {review.verified ? 'Hide' : 'Publish'}
        </button>
        <button className="btn-primary min-h-9 px-3 py-1.5 text-xs" disabled={isSaving} onClick={onFeature} type="button">
          {review.featured ? 'Unfeature' : 'Feature'}
        </button>
      </div>
    </div>
  )
}

function MessageCard({ isSaving, message, onArchive, onRead }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-slate-950/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black">{message.name}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message.email}</p>
        </div>
        <Badge>{message.status}</Badge>
      </div>
      <p className="mt-3 text-sm font-bold">{message.subject || 'Contact message'}</p>
      <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{message.message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {message.status === 'new' && (
          <button className="btn-secondary min-h-9 px-3 py-1.5 text-xs" disabled={isSaving} onClick={onRead} type="button">
            Mark read
          </button>
        )}
        <button className="btn-primary min-h-9 px-3 py-1.5 text-xs" disabled={isSaving} onClick={onArchive} type="button">
          {message.status === 'archived' ? 'Restore' : 'Archive'}
        </button>
      </div>
    </div>
  )
}

function NotificationRow({ notification, onHandled, onRead }) {
  return (
    <div className={`rounded-[1.25rem] border p-4 ${notification.handled_at ? 'border-slate-200 bg-stone-50 opacity-75 dark:border-white/10 dark:bg-slate-950/50' : 'border-violet-200 bg-violet-50 dark:border-amber-200/30 dark:bg-amber-200/10'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black">{notification.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{notification.message}</p>
        </div>
        {!notification.read_at && <Badge>new</Badge>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!notification.read_at && <button className="btn-secondary min-h-9 px-3 py-1.5 text-xs" onClick={() => onRead(notification.id)} type="button">Mark read</button>}
        {!notification.handled_at && <button className="btn-primary min-h-9 px-3 py-1.5 text-xs" onClick={() => onHandled(notification.id)} type="button">Mark handled</button>}
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, text }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-slate-950/50">
      <Icon className="text-violet-700 dark:text-amber-200" size={20} />
      <p className="mt-4 text-sm font-black">{label}</p>
      <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  )
}

function DataRow({ badge, meta, title }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-slate-950/50">
      <div className="flex items-start justify-between gap-3">
        <p className="font-black">{title}</p>
        {badge && <Badge>{badge}</Badge>}
      </div>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{meta}</p>
    </div>
  )
}

function Badge({ children }) {
  return <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase text-white dark:bg-white dark:text-slate-950">{children}</span>
}

function EmptyState({ text }) {
  return <p className="rounded-[1.25rem] border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500 dark:border-white/15 dark:text-slate-400">{text}</p>
}
