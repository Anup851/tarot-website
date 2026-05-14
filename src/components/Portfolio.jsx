import { ArrowRight, Clock, Gem } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { services } from '../data/siteData'
import { supabase } from '../lib/supabase'
import ScrollReveal from './ScrollReveal'

export default function Portfolio() {
  const [items, setItems] = useState(services)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!supabase) return

      try {
        const { data, error } = await supabase.from('services').select('*').eq('active', true).order('sort_order')
        if (error) throw error
        if (data?.length) {
          setItems(data.map((item) => ({
            id: item.slug || item.id,
            title: item.name,
            description: item.description,
            price: `$${Number(item.price).toFixed(0)}`,
            duration: `${item.duration_minutes} min`,
            accent: item.accent || 'from-violet-500 to-fuchsia-500',
          })))
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [])

  if (loading) {
    return <div className="card text-center text-slate-500 dark:text-slate-400">Loading services...</div>
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item, index) => (
        <ScrollReveal as="article" key={item.id} delay={index * 110} className="card depth-hover group flex min-h-[24rem] flex-col justify-between overflow-hidden">
          <div>
            <div className={`mb-6 flex h-36 items-end rounded-3xl bg-gradient-to-br ${item.accent} p-5 text-white shadow-lg`}>
              <Gem size={34} />
            </div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900 dark:bg-white/10 dark:text-white">
                {item.price}
              </span>
            </div>
            <p className="leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Clock size={16} />
              {item.duration}
            </span>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-violet-700 dark:text-amber-200" to="/bookings">
              Book
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>
      ))}
    </div>
  )
}
