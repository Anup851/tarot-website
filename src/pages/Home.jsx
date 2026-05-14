import { ArrowRight, CalendarDays, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Portfolio from '../components/Portfolio'
import ReviewsSection from '../components/ReviewsSection'
import ScrollReveal from '../components/ScrollReveal'
import TarotCardSpread from '../components/TarotCardSpread'
import { readerHighlights } from '../data/siteData'

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="soft-grid relative">
        <div className="section-shell grid min-h-[calc(100vh-4rem)] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <ScrollReveal>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-bold text-violet-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-amber-100">
              <Sparkles size={16} />
              Modern tarot studio for clear decisions
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              Tarot prediction with a grounded, modern ritual.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Book intuitive readings, explore services, pull a daily spread, and collect client reviews in a Supabase-backed experience built to scale into a real booking platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" to="/bookings">
                Book a session
                <CalendarDays size={18} />
              </Link>
              <Link className="btn-secondary" to="/portfolio">
                View services
                <ArrowRight size={18} />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal className="relative mx-auto w-full max-w-lg" delay={140}>
            <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/30">
              <div className="grid grid-cols-3 gap-3">
                {['Past', 'Now', 'Next'].map((label, index) => (
                  <div key={label} className={`depth-hover h-64 rounded-[1.5rem] border border-white/20 bg-gradient-to-br ${index === 0 ? 'from-slate-950 to-violet-800' : index === 1 ? 'from-fuchsia-700 to-rose-500' : 'from-cyan-600 to-slate-950'} p-4 text-white shadow-xl`}>
                    <div className="flex h-full flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.22em]">{label}</span>
                      <span className="mx-auto h-16 w-16 rounded-full border border-white/30 bg-white/10" />
                      <span className="h-16 rounded-2xl border border-white/10 bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <ScrollReveal as="section" className="section-shell py-16">
        <TarotCardSpread />
      </ScrollReveal>

      <ScrollReveal as="section" className="section-shell py-16">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-amber-200">Portfolio</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Session packages designed for real questions.</h2>
        </div>
        <Portfolio />
      </ScrollReveal>

      <section className="bg-slate-950 py-16 text-white dark:bg-white dark:text-slate-950">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <ScrollReveal>
            <ShieldCheck className="mb-5 text-amber-200 dark:text-violet-600" size={36} />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built like a real service business.</h2>
            <p className="mt-4 leading-7 text-slate-300 dark:text-slate-600">
              The app includes booking requests, service records, reviews, reading history, and public content tables so it can grow past a landing page.
            </p>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {readerHighlights.map((item, index) => (
              <ScrollReveal key={item} delay={index * 90} className="depth-hover rounded-3xl border border-white/10 bg-white/10 p-5 dark:border-slate-200 dark:bg-slate-100">
                <CheckCircle2 className="mb-4 text-emerald-300 dark:text-emerald-600" size={22} />
                <p className="font-semibold leading-7">{item}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <ScrollReveal as="section" className="py-16">
        <ReviewsSection compact />
      </ScrollReveal>
    </div>
  )
}
