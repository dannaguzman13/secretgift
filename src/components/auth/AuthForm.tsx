import { useState } from 'react'
import type { FormEvent } from 'react'
import { getErrorMessage } from '../../utils/helpers'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (fields: { email: string; password: string; nombre?: string }) => Promise<void>
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({ email, password, nombre: mode === 'signup' ? nombre : undefined })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === 'signup' && (
        <div>
          <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
            Nombre
          </label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input-field"
          />
        </div>
      )}
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
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
          Contraseña
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
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </button>
    </form>
  )
}
