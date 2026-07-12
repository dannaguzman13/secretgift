import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CrearEventoInput } from '../../services/eventos'
import { getErrorMessage } from '../../utils/helpers'

export function EventForm({ onSubmit }: { onSubmit: (input: CrearEventoInput) => Promise<void> }) {
  const [nombre, setNombre] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [receptorNombre, setReceptorNombre] = useState('')
  const [receptorEmail, setReceptorEmail] = useState('')
  const [fechaCompra, setFechaCompra] = useState('')
  const [fechaRevelacion, setFechaRevelacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const presupuestoNum = Number(presupuesto)
    if (!(presupuestoNum > 0)) {
      setError('El presupuesto debe ser mayor a 0')
      return
    }
    if (fechaRevelacion < fechaCompra) {
      setError('La fecha de revelación debe ser igual o posterior a la fecha de compra')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        nombre,
        presupuesto: presupuestoNum,
        receptorNombre,
        receptorEmail,
        fechaCompra,
        fechaRevelacion,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Nombre del evento</label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Cumpleaños de Marta"
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Presupuesto sugerido</label>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          value={presupuesto}
          onChange={(e) => setPresupuesto(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nombre del receptor</label>
          <input
            type="text"
            required
            value={receptorNombre}
            onChange={(e) => setReceptorNombre(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email del receptor</label>
          <input
            type="email"
            required
            value={receptorEmail}
            onChange={(e) => setReceptorEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fecha límite de compra</label>
          <input
            type="date"
            required
            value={fechaCompra}
            onChange={(e) => setFechaCompra(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fecha de revelación</label>
          <input
            type="date"
            required
            value={fechaRevelacion}
            onChange={(e) => setFechaRevelacion(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {submitting ? 'Creando...' : 'Crear evento'}
      </button>
    </form>
  )
}
