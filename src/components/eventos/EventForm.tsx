import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CrearEventoInput } from '../../services/eventos'
import { getErrorMessage } from '../../utils/helpers'

export function EventForm({
  onSubmit,
  initial,
}: {
  onSubmit: (input: CrearEventoInput) => Promise<void>
  initial?: { nombre?: string; presupuesto?: number }
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [presupuesto, setPresupuesto] = useState(initial?.presupuesto ? String(initial.presupuesto) : '')
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
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
          Nombre del evento
        </label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Amigo secreto de fin de año"
          className="input-field"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
          Presupuesto sugerido
        </label>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          value={presupuesto}
          onChange={(e) => setPresupuesto(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
            Fecha límite de compra
          </label>
          <input
            type="date"
            required
            value={fechaCompra}
            onChange={(e) => setFechaCompra(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
            Fecha de revelación
          </label>
          <input
            type="date"
            required
            value={fechaRevelacion}
            onChange={(e) => setFechaRevelacion(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Creando...' : 'Crear evento'}
      </button>
    </form>
  )
}
