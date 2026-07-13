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
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </button>
    </form>
  )
}
