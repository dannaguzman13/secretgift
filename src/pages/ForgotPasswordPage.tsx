import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../services/auth'
import { getErrorMessage } from '../utils/helpers'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto mt-16 w-full max-w-sm px-4 text-center">
        <h1 className="mb-4 font-display text-3xl text-navy-900">Revisa tu correo</h1>
        <p className="text-navy-600">
          Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.
        </p>
        <p className="mt-4 text-sm text-navy-600">
          <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-sm px-4">
      <h1 className="mb-6 text-center font-display text-3xl text-navy-900">Recuperar contraseña</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-navy-600">
        <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  )
}
