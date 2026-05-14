import { CreditCard, MapPin, Video } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import SessionBooking from '../components/SessionBooking'

const details = [
  { icon: Video, title: 'Online sessions', text: 'Meet by video, phone, or written exchange depending on the reading you choose.' },
  { icon: MapPin, title: 'Clear scheduling', text: 'Send your preferred date and time, then receive confirmation after the request is reviewed.' },
  { icon: CreditCard, title: 'Simple next steps', text: 'After approval, you will receive session details, preparation notes, and any payment instructions.' },
]

export default function BookingsPage() {
  return (
    <div className="section-shell py-16">
      <ScrollReveal className="mb-12 max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-amber-200">Book A Reading</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Reserve time for a private session.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Share your preferred time, session type, and what you want the reading to focus on. You will receive a confirmation once the request is reviewed.
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
