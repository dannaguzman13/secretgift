import type { Evento } from '../../types/domain'
import { MODOS } from '../../utils/gameModes'
import { StatCard } from './StatCard'
import { CountdownBlock } from './CountdownBlock'

export function EventInfoCard({ evento, participantesCount }: { evento: Evento; participantesCount: number }) {
  const emoji = evento.emoji || MODOS.find((m) => m.value === evento.modo)?.emoji || '🎁'
  const modo = MODOS.find((m) => m.value === evento.modo)

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-display text-2xl text-navy-900">
          {emoji} {evento.nombre}
        </h1>
        {evento.descripcion && <p className="text-navy-600">{evento.descripcion}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-pale-sky-200 pt-4 sm:grid-cols-3">
        <StatCard emoji="💰" label="Presupuesto" value={`$${evento.presupuesto} USD`} />
        <StatCard emoji="🎭" label="Modalidad" value={modo?.label ?? evento.modo} />
        <StatCard emoji="👥" label="Jugadores" value={String(participantesCount)} />
      </div>

      <CountdownBlock fechaCompra={evento.fecha_compra} />
    </div>
  )
}
