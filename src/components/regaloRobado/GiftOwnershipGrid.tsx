import type { EstadoRegalo } from '../../types/domain'
import type { ParticipanteConUsuario } from '../../services/participantes'

export function GiftOwnershipGrid({
  estadoRegalos,
  participantes,
}: {
  estadoRegalos: EstadoRegalo[]
  participantes: ParticipanteConUsuario[]
}) {
  function nombreDe(usuarioId: string): string {
    return participantes.find((p) => p.usuario_id === usuarioId)?.usuario?.nombre ?? usuarioId
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {estadoRegalos.map((r) => (
        <div key={r.id} className="card p-3">
          <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">Regalo #{r.regalo_numero}</p>
          <p className="text-sm text-navy-900">
            Comprado por <span className="font-bold">{nombreDe(r.comprador_original_id)}</span>
          </p>
          <p className="text-sm text-navy-900">
            En manos de <span className="font-bold">{nombreDe(r.dueno_actual_id)}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
