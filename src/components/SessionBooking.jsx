import { AlertCircle, CalendarCheck, CheckCircle2, Send } from 'lucide-react'
import { useState } from 'react'
import { services } from '../data/siteData'
import { useAuth } from '../hooks/useAuth'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  reading_type: services[0].id,
  message: '',
}

export default function SessionBooking() {
  const { user } = useAuth()
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (!supabase) {
        setMessage({ type: 'success', text: 'Your booking request is ready to send once online booking is enabled.' })
        setFormData(initialForm)
        return
      }

      const selected = services.find((service) => service.id === formData.reading_type)
      const { data: bookingId, error } = await supabase.rpc('create_booking_request', {
        p_client_name: formData.name,
        p_client_email: formData.email,
        p_client_phone: formData.phone || null,
        p_requested_date: formData.date,
        p_requested_time: formData.time,
        p_service_slug: formData.reading_type,
        p_service_name: selected?.title || formData.reading_type,
        p_message: formData.message || null,
      })

      if (error) throw error

      const notifications = [
        {
          recipient_role: 'owner',
          actor_email: formData.email,
          type: 'booking_created',
          title: 'New booking request',
          message: `${formData.name} requested ${selected?.title || formData.reading_type} on ${formData.date} at ${formData.time}.`,
          action_url: '/owner',
          related_table: 'bookings',
          related_id: bookingId,
        },
      ]

      if (user) {
        notifications.push({
          recipient_user_id: user.id,
          actor_email: formData.email,
          type: 'booking_created',
          title: 'Booking request received',
          message: `Your ${selected?.title || 'reading'} request was sent successfully.`,
          action_url: '/bookings',
          related_table: 'bookings',
          related_id: bookingId,
        })
      }

      await supabase.from('app_notifications').insert(notifications)

      setMessage({ type: 'success', text: 'Your request has been received. You will get a confirmation after review.' })
      setFormData(initialForm)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="rounded-[2rem] bg-slate-950 p-8 text-white dark:bg-white dark:text-slate-950">
        <CalendarCheck className="mb-8 text-amber-200 dark:text-violet-600" size={36} />
        <h2 className="text-3xl font-bold tracking-tight">Tell us what you need clarity on.</h2>
        <p className="mt-4 leading-7 text-slate-300 dark:text-slate-600">
          Choose a reading, share your preferred time, and add a few notes about the question or situation you want to explore.
        </p>
        <div className="mt-8 grid gap-3">
          {services.map((service) => (
            <label key={service.id} className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-4 dark:border-slate-200 dark:bg-slate-100">
              <span>
                <span className="block font-bold">{service.title}</span>
                <span className="text-sm text-slate-300 dark:text-slate-500">{service.duration}</span>
              </span>
              <input className="h-4 w-4 accent-violet-600" type="radio" name="reading_type" value={service.id} checked={formData.reading_type === service.id} onChange={handleChange} />
            </label>
          ))}
        </div>
      </aside>

      <form className="card p-6 sm:p-8" onSubmit={handleSubmit}>
        {message.text && (
          <div className={`mb-6 flex gap-3 rounded-2xl p-4 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p>{message.text}</p>
          </div>
        )}

        {!hasSupabaseConfig && (
          <div className="mb-6 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-200/30 dark:bg-amber-300/10 dark:text-amber-100">
            Online booking is not connected yet. You can still preview the form layout.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input-field" name="name" onChange={handleChange} placeholder="Full name" required type="text" value={formData.name} />
          <input className="input-field" name="email" onChange={handleChange} placeholder="Email address" required type="email" value={formData.email} />
          <input className="input-field" name="phone" onChange={handleChange} placeholder="Phone or WhatsApp" type="tel" value={formData.phone} />
          <select className="input-field" name="reading_type" onChange={handleChange} value={formData.reading_type}>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.title} - {service.price}</option>
            ))}
          </select>
          <input className="input-field" name="date" onChange={handleChange} required type="date" value={formData.date} />
          <input className="input-field" name="time" onChange={handleChange} required type="time" value={formData.time} />
        </div>

        <textarea className="input-field mt-4 min-h-36" name="message" onChange={handleChange} placeholder="What question, choice, or life area should the reading focus on?" value={formData.message} />

        <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
          <Send size={16} />
            {loading ? 'Sending request...' : 'Send booking request'}
        </button>
      </form>
    </div>
  )
}
