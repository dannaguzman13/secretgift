import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthChange, updatePassword } from '../services/auth'
import { supabase } from '../services/supabase'
import { getErrorMessage } from '../utils/helpers'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) setStatus('ready')
    })

    const subscription = onAuthChange((session) => {
      if (cancelled) return
      if (session) setStatus('ready')
    })

    const timeout = setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === 'checking' ? 'invalid' : s))
    }, 3000)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setSubmitting(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'checking') {
    return (
      <div className="mx-auto mt-16 w-full max-w-sm px-4 text-center">
        <p className="text-navy-600">Verificando enlace...</p>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="mx-auto mt-16 w-full max-w-sm px-4 text-center">
        <h1 className="mb-4 font-display text-3xl text-navy-900">Enlace inválido</h1>
        <p className="text-navy-600">
          Este enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.
        </p>
        <p className="mt-4 text-sm text-navy-600">
          <Link to="/forgot-password" className="font-bold text-sky-600 hover:text-sky-700">
            Recuperar contraseña
          </Link>
        </p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mx-auto mt-16 w-full max-w-sm px-4 text-center">
        <h1 className="mb-4 font-display text-3xl text-navy-900">Contraseña actualizada</h1>
        <p className="text-navy-600">Tu contraseña se actualizó correctamente.</p>
        <button onClick={() => navigate('/dashboard', { replace: true })} className="btn-primary mt-6 w-full">
          Ir al dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-sm px-4">
      <h1 className="mb-6 text-center font-display text-3xl text-navy-900">Nueva contraseña</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-navy-600"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
              Confirmar contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
