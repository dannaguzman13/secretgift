import { useState } from 'react'
import type { Evento } from '../../types/domain'
import { MODOS } from '../../utils/gameModes'
import { formatearPresupuesto } from '../../utils/presupuesto'
import { formatFechaIntercambio } from '../../utils/fechaIntercambio'
import { formatFechaLarga } from '../../utils/countdown'
import { useAuth } from '../../hooks/useAuth'
import { StatCard } from './StatCard'
import { CountdownBlock } from './CountdownBlock'
import { EditarEventoModal } from '../eventos/EditarEventoModal'

export function EventInfoCard({
  evento,
  participantesCount,
  onEventoActualizado,
  onEventoEliminado,
}: {
  evento: Evento
  participantesCount: number
  onEventoActualizado?: (evento: Evento) => void
  onEventoEliminado?: (eventoId: string) => void
}) {
  const { user } = useAuth()
  const [editando, setEditando] = useState(false)
  const emoji = evento.emoji || MODOS.find((m) => m.value === evento.modo)?.emoji || '🎁'
  const modo = MODOS.find((m) => m.value === evento.modo)
  const esAdmin = !!user && user.id === evento.admin_id

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1 text-center">
        {esAdmin && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="self-end text-xl leading-none"
            aria-label="Editar evento"
            title="Editar evento"
          >
            ⚙️
          </button>
        )}
        <h1 className="font-display text-2xl text-navy-900">
          {emoji} {evento.nombre}
        </h1>
        {evento.descripcion && <p className="text-navy-600">{evento.descripcion}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-pale-sky-200 pt-4 sm:grid-cols-3">
        <StatCard
          emoji="💰"
          label="Presupuesto"
          value={formatearPresupuesto(evento.presupuesto_monto, evento.presupuesto_moneda)}
        />
        <StatCard emoji="🎭" label="Modalidad" value={modo?.label ?? evento.modo} />
        <StatCard emoji="👥" label="Jugadores" value={String(participantesCount)} />
      </div>

      <div className="flex flex-col items-center gap-1 border-t border-pale-sky-200 pt-4 text-center">
        <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">Fecha del intercambio</p>
        <p className="text-navy-900">{formatFechaIntercambio(evento.fecha_intercambio)}</p>
      </div>

      <CountdownBlock fechaIntercambio={evento.fecha_intercambio} />

      <p className="text-center text-sm text-navy-600">
        Fecha límite de compra: {formatFechaLarga(evento.fecha_compra)}
      </p>

      {editando && (
        <EditarEventoModal
          evento={evento}
          onClose={() => setEditando(false)}
          onGuardado={(actualizado) => onEventoActualizado?.(actualizado)}
          onEliminado={() => onEventoEliminado?.(evento.id)}
        />
      )}
    </div>
  )
}
