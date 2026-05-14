import { Quote, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ScrollReveal from './ScrollReveal'

export default function ReviewsSection({ compact = false }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    let isMounted = true

    const fetchReviews = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('public_reviews')
          .select('id, author, rating, comment, service_name')
          .order('created_at', { ascending: false })
          .limit(compact ? 3 : 9)

        if (error) throw error
        if (isMounted) {
          setReviews((data || []).map((review) => ({ ...review, service: review.service_name || 'Tarot Reading' })))
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchReviews()

    if (!supabase) return () => {
      isMounted = false
    }

    const channel = supabase
      .channel(`reviews-feed-${compact ? 'compact' : 'full'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, fetchReviews)
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [compact])

  return (
    <section className={compact ? '' : 'py-16'}>
      <div className="section-shell">
        {!compact && (
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-amber-200">Client Notes</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Reviews from people who wanted clarity, not theatre.</h2>
          </div>
        )}

        {loading ? (
          <div className="card text-center text-slate-500 dark:text-slate-400">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review, index) => (
              <ScrollReveal as="article" key={review.id} delay={index * 90} className="card depth-hover">
                <div className="mb-5 flex items-center justify-between">
                  <Quote className="text-violet-600 dark:text-amber-200" size={24} />
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={16} className={index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'} />
                    ))}
                  </div>
                </div>
                <p className="min-h-[7rem] leading-7 text-slate-700 dark:text-slate-300">"{review.comment}"</p>
                <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
                  <p className="font-bold">{review.author}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{review.service}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="card text-center text-slate-500 dark:text-slate-400">No reviews yet.</div>
        )}
      </div>
    </section>
  )
}
