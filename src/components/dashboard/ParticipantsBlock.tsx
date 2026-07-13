import type { AsignacionConComprador } from '../../services/asignaciones'
import type { ParticipanteConUsuario, ParticipanteUltraSecreto } from '../../services/participantes'
import type { EstadoCompraRegaloRobadoConUsuario } from '../../services/regaloRobado'

export function ParticipantsBlock({
  modo,
  sorteoRealizado,
  userId,
  estadoCompras,
  estadoComprasRegaloRobado,
  participantes,
  actualizandoCompraUsuarioId,
  onActualizarEstadoCompra,
}: {
  modo: string
  sorteoRealizado: boolean
  userId: string
  estadoCompras: AsignacionConComprador[]
  estadoComprasRegaloRobado: EstadoCompraRegaloRobadoConUsuario[]
  participantes: ParticipanteConUsuario[] | ParticipanteUltraSecreto[]
  actualizandoCompraUsuarioId?: string | null
  onActualizarEstadoCompra?: (usuarioId: string, estado: 'pendiente' | 'comprado') => Promise<void> | void
}) {
  if (modo === 'regalo_robado') {
    return (
      <div className="card flex flex-col gap-3">
        <h2 className="text-xs font-bold tracking-wide text-navy-600 uppercase">Participantes</h2>

        {estadoComprasRegaloRobado.length === 0 ? (
          <p className="text-navy-600">
            {participantes.length} participante{participantes.length === 1 ? '' : 's'} unido
            {participantes.length === 1 ? '' : 's'}.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-pale-sky-200">
            {estadoComprasRegaloRobado.map((row) => {
              const esMio = row.usuario_id === userId
              const siguienteEstado = row.estado === 'comprado' ? 'pendiente' : 'comprado'
              const actualizando = actualizandoCompraUsuarioId === row.usuario_id

              return (
                <div key={row.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-navy-900">{row.usuario_nombre}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                        row.estado === 'comprado' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                      }`}
                    >
                      {row.estado === 'comprado' ? 'Ya compró el regalo' : 'Pendiente de compra'}
                    </span>
                    {esMio && onActualizarEstadoCompra && (
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1 text-xs"
                        disabled={actualizando}
                        onClick={() => onActualizarEstadoCompra(row.usuario_id, siguienteEstado)}
                      >
                        {actualizando
                          ? 'Guardando...'
                          : row.estado === 'comprado'
                            ? 'Marcar pendiente'
                            : 'Marcar comprado'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const debeVisualizar = sorteoRealizado

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
