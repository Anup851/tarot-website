import { Award, Lock, MessageCircle, Timer } from 'lucide-react'
import Portfolio from '../components/Portfolio'
import ScrollReveal from '../components/ScrollReveal'

const benefits = [
  { icon: Award, title: 'Experienced Reader', text: 'A warm, direct style built around questions, context, and practical next steps.' },
  { icon: Lock, title: 'Private by Default', text: 'Booking details and reading notes are structured for protected client workflows.' },
  { icon: Timer, title: 'Clear Timing', text: 'Every package has defined duration, price, and expectation before the session starts.' },
  { icon: MessageCircle, title: 'Follow-up Notes', text: 'Sessions can scale into written summaries, reading history, and client dashboards.' },
]

export default function PortfolioPage() {
  return (
    <div>
      <section className="section-shell py-16">
        <ScrollReveal className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-amber-200">Portfolio</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Tarot services, packaged for clarity.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Use these cards as your public service catalog. Supabase can manage availability, pricing, active packages, and display order without changing React code.
          </p>
        </ScrollReveal>
        <Portfolio />
      </section>

      <section className="section-shell pb-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }, index) => (
            <ScrollReveal as="article" key={title} delay={index * 90} className="card depth-hover">
              <Icon className="mb-5 text-violet-700 dark:text-amber-200" size={28} />
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  )
}
