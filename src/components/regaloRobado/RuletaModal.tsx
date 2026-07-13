import type { Evento } from '../../types/domain'
import type { ParticipanteConUsuario } from '../../services/participantes'
import { RuletaGame } from './RuletaGame'

export function RuletaModal({
  evento,
  participantes,
  usuarioActualId,
  onClose,
  onTurnoResuelto,
}: {
  evento: Evento
  participantes: ParticipanteConUsuario[]
  usuarioActualId: string
  onClose: () => void
  onTurnoResuelto: () => Promise<void> | void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-cream shadow-xl">
        <div className="flex items-center justify-between border-b border-pale-sky-200 px-4 py-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-navy-500 uppercase">Regalo Robado</p>
            <h2 className="font-display text-xl text-navy-900">Ruleta del intercambio</h2>
          </div>
          <button type="button" className="btn-ghost px-3 py-1 text-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <RuletaGame
            eventoId={evento.id}
            participantes={participantes}
            turnoActual={evento.turno_actual}
            usuarioActualId={usuarioActualId}
            onTurnoResuelto={onTurnoResuelto}
          />
        </div>
      </div>
    </div>
  )
}
