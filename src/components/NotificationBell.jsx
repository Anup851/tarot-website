import { Bell, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { loading, markRead, notifications, unreadCount } = useNotifications(8)

  return (
    <div className="relative">
      <button aria-label="Open notifications" className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-900 hover:border-violet-400 dark:border-white/15 dark:bg-white/10 dark:text-white" onClick={() => setOpen((value) => !value)} type="button">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-1/2 top-16 z-50 mt-3 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/30 md:absolute md:left-auto md:right-0 md:top-auto md:w-[min(22rem,calc(100vw-2rem))] md:translate-x-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-black">Notifications</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
          </div>

          {loading ? (
            <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-400">Loading...</p>
          ) : notifications.length > 0 ? (
            <div className="max-h-96 overflow-y-auto pr-1">
              {notifications.map((item) => (
                <div key={item.id} className={`mb-2 rounded-2xl border p-3 ${item.read_at ? 'border-slate-200 bg-stone-50 dark:border-white/10 dark:bg-white/5' : 'border-violet-300 bg-violet-50 dark:border-amber-200/40 dark:bg-amber-200/10'}`}>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.message}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    {item.action_url ? (
                      <Link className="text-xs font-bold text-violet-700 dark:text-amber-200" to={item.action_url} onClick={() => setOpen(false)}>
                        Open
                      </Link>
                    ) : <span />}
                    {!item.read_at && (
                      <button className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-violet-700 dark:text-slate-300 dark:hover:text-amber-200" onClick={() => markRead(item.id)} type="button">
                        <CheckCircle2 size={14} />
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-400">No notifications yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
