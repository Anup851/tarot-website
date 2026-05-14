import { Mail, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-white/10 dark:bg-slate-950">
      <div className="section-shell grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Sparkles size={19} />
            </span>
            <span className="font-black">Arcana Studio</span>
          </div>
          <p className="max-w-md leading-7 text-slate-600 dark:text-slate-300">
            A modern tarot prediction website with booking, reviews, portfolio services, theme switching, and Supabase-ready data.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Explore</h2>
          <div className="grid gap-2 text-sm font-semibold">
            <Link to="/" className="hover:text-violet-700 dark:hover:text-amber-200">Home</Link>
            <Link to="/portfolio" className="hover:text-violet-700 dark:hover:text-amber-200">Portfolio</Link>
            <Link to="/bookings" className="hover:text-violet-700 dark:hover:text-amber-200">Book Session</Link>
            <Link to="/reviews" className="hover:text-violet-700 dark:hover:text-amber-200">Reviews</Link>
            <Link to="/auth" className="hover:text-violet-700 dark:hover:text-amber-200">Login</Link>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Contact</h2>
          <a className="inline-flex items-center gap-2 font-semibold hover:text-violet-700 dark:hover:text-amber-200" href="mailto:hello@arcanastudio.com">
            <Mail size={17} />
            hello@arcanastudio.com
          </a>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Copyright {new Date().getFullYear()} Arcana Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
