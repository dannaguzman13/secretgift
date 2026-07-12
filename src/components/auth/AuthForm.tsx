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
          <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {submitting ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </button>
    </form>
  )
}
