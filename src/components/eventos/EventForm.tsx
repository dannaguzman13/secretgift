import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CrearEventoInput } from '../../services/eventos'
import { getErrorMessage } from '../../utils/helpers'
import type { ModoEvento, Universo } from '../../types/domain'
import { UniversoSelector } from '../ultraSecreto/UniversoSelector'
import { MODOS } from '../../utils/gameModes'

export function EventForm({
  onSubmit,
  initial,
}: {
  onSubmit: (input: CrearEventoInput) => Promise<void>
  initial?: { nombre?: string; presupuesto?: number }
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [emoji, setEmoji] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [presupuesto, setPresupuesto] = useState(initial?.presupuesto ? String(initial.presupuesto) : '')
  const [fechaCompra, setFechaCompra] = useState('')
  const [fechaRevelacion, setFechaRevelacion] = useState('')
  const [modo, setModo] = useState<ModoEvento>('amigo_secreto')
  const [universo, setUniverso] = useState<Universo | null>(null)
  const [tematica, setTematica] = useState('')
  const [restricciones, setRestricciones] = useState('')
  const [requisitos, setRequisitos] = useState('')
  const [recomendacion, setRecomendacion] = useState('')
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
    if (modo === 'ultra_secreto' && !universo) {
      setError('Elige un universo de aliases para Ultra Secreto')
      return
    }
    if (modo === 'regalo_robado' && (!tematica.trim() || !restricciones.trim())) {
      setError('Temática y Restricciones son obligatorias para Regalo Robado')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        nombre,
        presupuesto: presupuestoNum,
        fechaCompra,
        fechaRevelacion,
        modo,
        universo: modo === 'ultra_secreto' ? (universo ?? undefined) : undefined,
        emoji: emoji.trim() || undefined,
        descripcion: descripcion.trim() || undefined,
        tematica: modo === 'regalo_robado' ? tematica.trim() : undefined,
        restricciones: modo === 'regalo_robado' ? restricciones.trim() : undefined,
        requisitos: modo === 'regalo_robado' ? requisitos.trim() || undefined : undefined,
        recomendacion: modo === 'regalo_robado' ? recomendacion.trim() || undefined : undefined,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[80px_1fr]">
        <div>
          <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">Emoji</label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🎄"
            maxLength={4}
            className="input-field text-center text-xl"
          />
        </div>
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
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
          Descripción (opcional)
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Intercambio de regalos del equipo de Marketing"
          rows={2}
          className="input-field"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
          ¿Qué modo de juego?
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {MODOS.map((m) => {
            const selected = modo === m.value
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setModo(m.value)}
                className={`rounded-md border-2 p-3 text-left transition-colors ${
                  selected ? 'border-coral-400 bg-coral-50' : 'border-pale-sky-300 bg-white hover:border-coral-200'
                }`}
              >
                <p className="font-bold text-navy-900">
                  {m.emoji} {m.label}
                </p>
                <p className="text-xs text-navy-500">{m.descripcion}</p>
              </button>
            )
          })}
        </div>
      </div>
      {modo === 'ultra_secreto' && (
        <div>
          <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
            Elige el universo de aliases
          </label>
          <UniversoSelector value={universo} onChange={setUniverso} />
        </div>
      )}
      {modo === 'regalo_robado' && (
        <div className="flex flex-col gap-4 rounded-md border-2 border-pale-sky-300 p-3">
          <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">
            Características del regalo (para todo el grupo)
          </p>
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
              🎯 Temática
            </label>
            <input
              type="text"
              required
              value={tematica}
              onChange={(e) => setTematica(e.target.value)}
              placeholder="Tecnología"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
              🚫 Restricciones
            </label>
            <input
              type="text"
              required
              value={restricciones}
              onChange={(e) => setRestricciones(e.target.value)}
              placeholder="No comida, no tarjetas regalo"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
              📦 Requisitos (opcional)
            </label>
            <input
              type="text"
              value={requisitos}
              onChange={(e) => setRequisitos(e.target.value)}
              placeholder="Nuevo • Máximo 1 kg"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
              💡 Recomendación (opcional)
            </label>
            <input
              type="text"
              value={recomendacion}
              onChange={(e) => setRecomendacion(e.target.value)}
              placeholder="Debe servir para cualquier participante"
              className="input-field"
            />
          </div>
        </div>
      )}
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
