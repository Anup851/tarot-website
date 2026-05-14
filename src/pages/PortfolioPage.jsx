import { Award, Lock, MessageCircle, Timer } from 'lucide-react'
import Portfolio from '../components/Portfolio'
import ScrollReveal from '../components/ScrollReveal'

const benefits = [
  { icon: Award, title: 'Thoughtful Guidance', text: 'A warm, direct style that keeps the reading focused on your question and lived context.' },
  { icon: Lock, title: 'Private By Default', text: 'Your booking details, questions, and follow-up notes are treated with care and discretion.' },
  { icon: Timer, title: 'Clear Timing', text: 'Each package has a defined length, price, and purpose before you request a session.' },
  { icon: MessageCircle, title: 'Follow-Up Support', text: 'Use chat for simple questions, clarification, or next-step notes after your reading.' },
]

export default function PortfolioPage() {
  return (
    <div>
      <section className="section-shell py-16">
        <ScrollReveal className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-amber-200">Reading Menu</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Sessions for different kinds of questions.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Choose a focused reading for one decision, a deeper spread for a layered situation, or a longer forecast for the season ahead.
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
