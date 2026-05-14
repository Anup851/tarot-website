import { CreditCard, MapPin, Video } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import SessionBooking from '../components/SessionBooking'

const details = [
  { icon: Video, title: 'Online-first sessions', text: 'Video, phone, and email readings are supported by the booking schema.' },
  { icon: MapPin, title: 'Flexible location', text: 'Keep it remote, add city-based events, or extend the database for in-person availability.' },
  { icon: CreditCard, title: 'Payment-ready model', text: 'The SQL includes room for status tracking, deposits, and future payment references.' },
]

export default function BookingsPage() {
  return (
    <div className="section-shell py-16">
      <ScrollReveal className="mb-12 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-amber-200">Session Booking</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Request a tarot reading.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
          A responsive booking flow that stores requests in Supabase when configured and gracefully runs as a demo without keys.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={120}>
        <SessionBooking />
      </ScrollReveal>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {details.map(({ icon: Icon, title, text }, index) => (
          <ScrollReveal as="article" key={title} delay={index * 100} className="card depth-hover">
            <Icon className="mb-5 text-violet-700 dark:text-amber-200" size={26} />
            <h2 className="font-bold">{title}</h2>
            <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
