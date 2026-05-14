import { LogOut, Menu, Moon, Sparkles, Sun, User, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from './NotificationBell'

const links = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/bookings', label: 'Book Session' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/chat', label: 'Chat' },
]

export default function Header({ isDark, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { profile, role, signOut, user } = useAuth()
  const isOwner = role === 'owner'
  const visibleLinks = isOwner ? [{ to: '/', label: 'Home' }, { to: '/chats', label: 'Chats' }] : links

  const navClass = ({ isActive }) =>
    `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'}`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-stone-50/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
      <nav className="section-shell flex min-h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Sparkles size={19} />
          </span>
          <span>
            <span className="block text-base font-black leading-none tracking-tight">Arcana Studio</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{isOwner ? 'Owner home' : 'Tarot readings'}</span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <div className="relative hidden md:block">
                <button aria-label="Open profile menu" className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-900 hover:border-violet-400 dark:border-white/15 dark:bg-white/10 dark:text-white" onClick={() => setIsProfileOpen((value) => !value)} type="button">
                  <User size={18} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/30">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Logged in as</p>
                    <p className="mt-2 break-all text-sm font-bold text-slate-950 dark:text-white">{user.email}</p>
                    <p className="mt-1 text-xs font-semibold capitalize text-violet-700 dark:text-amber-200">{role}</p>
                    <button className="btn-secondary mt-4 w-full" onClick={() => { signOut(); setIsProfileOpen(false) }} type="button">
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <NavLink aria-label="Login" className="hidden h-10 items-center gap-2 rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 hover:border-violet-400 dark:border-white/15 dark:bg-white/10 dark:text-white md:inline-flex" to="/auth">
              <User size={16} />
              Login
            </NavLink>
          )}
          <button aria-label="Toggle color theme" className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-900 hover:border-violet-400 dark:border-white/15 dark:bg-white/10 dark:text-white" onClick={toggleTheme} type="button">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button aria-label="Toggle navigation" className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-900 dark:border-white/15 dark:bg-white/10 dark:text-white md:hidden" onClick={() => setIsOpen((value) => !value)} type="button">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="section-shell pb-4 md:hidden">
          <div className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-slate-900">
            {visibleLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass} onClick={() => setIsOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <div className="rounded-3xl bg-slate-100 p-3 dark:bg-white/10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Logged in as</p>
                <p className="mt-2 break-all text-sm font-bold text-slate-950 dark:text-white">{user.email}</p>
                <button className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10" onClick={() => { signOut(); setIsOpen(false) }} type="button">
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            ) : (
              <NavLink to="/auth" className={navClass} onClick={() => setIsOpen(false)}>
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
