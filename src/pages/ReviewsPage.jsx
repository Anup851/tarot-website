import { AlertCircle, CheckCircle2, Send, Star } from 'lucide-react'
import { useState } from 'react'
import ReviewsSection from '../components/ReviewsSection'
import ScrollReveal from '../components/ScrollReveal'
import { useAuth } from '../hooks/useAuth'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

const initialForm = {
  author: '',
  email: '',
  rating: 5,
  service_name: '',
  comment: '',
}

export default function ReviewsPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (!supabase) {
        setMessage({ type: 'success', text: 'Demo mode: review form is ready. Add Supabase keys to store submissions.' })
        setFormData(initialForm)
        return
      }

      const { data, error } = await supabase.from('reviews').insert([{ ...formData, verified: true, featured: false }]).select('id').single()
      if (error) throw error

      const notifications = [
        {
          recipient_role: 'owner',
          actor_email: formData.email,
          type: 'review_created',
          title: 'New review posted',
          message: `${formData.author} posted a ${formData.rating}-star review.`,
          action_url: '/owner',
          related_table: 'reviews',
          related_id: data.id,
        },
      ]

      if (user) {
        notifications.push({
          recipient_user_id: user.id,
          actor_email: formData.email,
          type: 'review_created',
          title: 'Review posted',
          message: 'Your review is live on the website.',
          action_url: '/reviews',
          related_table: 'reviews',
          related_id: data.id,
        })
      }

      await supabase.from('app_notifications').insert(notifications)

      setMessage({ type: 'success', text: 'Thank you. Your review is now live.' })
      setFormData(initialForm)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section className="section-shell py-16">
        <ScrollReveal className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-amber-200">Customer Reviews</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Proof, feedback, and trust.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Reviews are pulled directly from Supabase and update on the site as new feedback arrives.
          </p>
        </ScrollReveal>
      </section>

      <ReviewsSection />

      <section className="section-shell pb-16">
        <ScrollReveal as="form" className="card depth-hover mx-auto max-w-2xl p-6 sm:p-8" onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Share your experience</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Your review is saved to Supabase and appears on the site.</p>
          </div>

          {message.text && (
            <div className={`mb-6 flex gap-3 rounded-2xl p-4 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p>{message.text}</p>
            </div>
          )}

          {!hasSupabaseConfig && (
            <div className="mb-6 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-200/30 dark:bg-amber-300/10 dark:text-amber-100">
              Supabase environment keys are not configured, so submissions run in demo mode.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input-field" name="author" onChange={handleChange} placeholder="Your name" required type="text" value={formData.author} />
            <input className="input-field" name="email" onChange={handleChange} placeholder="Email address" required type="email" value={formData.email} />
            <input className="input-field sm:col-span-2" name="service_name" onChange={handleChange} placeholder="Session type, optional" type="text" value={formData.service_name} />
          </div>

          <label className="mt-4 block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold">
              <Star className="fill-amber-400 text-amber-400" size={16} />
              Rating
            </span>
            <select className="input-field" name="rating" onChange={handleChange} value={formData.rating}>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </label>

          <textarea className="input-field mt-4 min-h-36" name="comment" onChange={handleChange} placeholder="What changed after your reading?" required value={formData.comment} />

          <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
            <Send size={16} />
            {loading ? 'Submitting...' : 'Submit review'}
          </button>
        </ScrollReveal>
      </section>
    </div>
  )
}
