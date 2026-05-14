import { AlertCircle, Crown, Mail, ShieldCheck, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'
import { useAuth } from '../hooks/useAuth'
import { hasSupabaseConfig } from '../lib/supabase'

const roleOptions = [
  {
    role: 'user',
    icon: User,
    title: 'Client Access',
    text: 'Book readings, leave reviews, and continue private conversations with the studio.',
  },
  {
    role: 'owner',
    icon: Crown,
    title: 'Studio Access',
    text: 'Manage booking requests, client reviews, messages, and reading records.',
  },
]

export default function AuthPage() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('user')
  const [authMethod, setAuthMethod] = useState('google')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { loading, signInWithGoogle, signInWithPassword, user } = useAuth()

  const handleEmailLogin = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      await signInWithPassword({ ...formData, role: selectedRole })
      navigate('/', { replace: true })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="section-shell py-16">
        <div className="card mx-auto max-w-2xl text-center">
          <Sparkles className="mx-auto mb-5 text-violet-700 dark:text-amber-200" size={34} />
          <h1 className="text-3xl font-black tracking-tight">Sign-in is not available yet.</h1>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Account access will be available once the studio portal is connected.</p>
        </div>
      </div>
    )
  }

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="section-shell py-16">
      <ScrollReveal className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-amber-200">
          <ShieldCheck size={16} />
          Account Access
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Sign in to continue.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Choose the access type that matches your role, then continue with your preferred sign-in method.
        </p>
      </ScrollReveal>

      <div className="grid gap-5 md:grid-cols-2">
        {roleOptions.map(({ role: optionRole, icon: Icon, title, text }, index) => {
          const isSelected = selectedRole === optionRole

          return (
            <ScrollReveal key={optionRole} delay={index * 120} className={`card depth-hover flex cursor-pointer flex-col justify-between ${isSelected ? 'border-violet-500 ring-4 ring-violet-500/10 dark:border-amber-200 dark:ring-amber-200/10' : ''}`} onClick={() => setSelectedRole(optionRole)}>
              <div>
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Icon size={22} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
              </div>
              <button className={isSelected && authMethod === 'google' ? 'btn-primary mt-8 w-full' : 'btn-secondary mt-8 w-full'} onClick={(event) => { event.stopPropagation(); setSelectedRole(optionRole); setAuthMethod('google'); signInWithGoogle(optionRole) }} type="button">
                <Sparkles size={16} />
                Continue with Google
              </button>
              <button className={isSelected && authMethod === 'gmail' ? 'btn-primary mt-3 w-full' : 'btn-secondary mt-3 w-full'} onClick={(event) => { event.stopPropagation(); setSelectedRole(optionRole); setAuthMethod('gmail') }} type="button">
                <Mail size={16} />
                Continue with email
              </button>
            </ScrollReveal>
          )
        })}
      </div>

      <ScrollReveal as="form" className="card mx-auto mt-6 max-w-2xl p-6 sm:p-8" onSubmit={handleEmailLogin}>
        <div className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-amber-200">
            <Mail size={16} />
            Email Sign In
          </p>
          <h2 className="text-2xl font-bold">{selectedRole === 'owner' ? 'Studio sign in' : 'Client sign in'}</h2>
        </div>

        {message && (
          <div className="mb-5 flex gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">
            <AlertCircle size={20} />
            <p>{message}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input-field" onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email address" required type="email" value={formData.email} />
          <input className="input-field" onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))} placeholder="Password" required type="password" value={formData.password} />
        </div>

        <button className="btn-primary mt-6 w-full" disabled={submitting} type="submit">
          <Mail size={16} />
          {submitting ? 'Signing in...' : 'Sign in with email'}
        </button>
      </ScrollReveal>
    </div>
  )
}
