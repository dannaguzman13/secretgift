import type { AsignacionConComprador } from '../../services/asignaciones'
import type { ParticipanteConUsuario, ParticipanteUltraSecreto } from '../../services/participantes'

export function ParticipantsBlock({
  modo,
  sorteoRealizado,
  juego_iniciado_at,
  estadoCompras,
  participantes,
}: {
  modo: string
  sorteoRealizado: boolean
  juego_iniciado_at: string | null
  estadoCompras: AsignacionConComprador[]
  participantes: ParticipanteConUsuario[] | ParticipanteUltraSecreto[]
}) {
  const debeVisualizar =
    modo === 'regalo_robado' ? !!juego_iniciado_at : sorteoRealizado

  return (
    <div className="card flex flex-col gap-3">
      <h2 className="text-xs font-bold tracking-wide text-navy-600 uppercase">Participantes</h2>

      {!debeVisualizar ? (
        <p className="text-navy-600">
          {participantes.length} participante{participantes.length === 1 ? '' : 's'} unido
          {participantes.length === 1 ? '' : 's'}.
        </p>
      ) : estadoCompras.length === 0 ? (
        <p className="text-navy-500">Todavía no hay compradores registrados.</p>
      ) : (
        <div className="flex flex-col divide-y divide-pale-sky-200">
          {estadoCompras.map((row) => (
            <div key={row.id} className="flex items-center justify-between py-2">
              <span className="text-navy-900">{row.comprador?.nombre ?? '???'}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  row.estado === 'comprado' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                }`}
              >
                {row.estado === 'comprado' ? '🟢 Compró regalo' : '🟡 Pendiente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
