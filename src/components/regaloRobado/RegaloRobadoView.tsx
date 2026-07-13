import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { activarIntercambioRegaloRobado } from '../../services/regaloRobado'
import type { ParticipanteConUsuario } from '../../services/participantes'
import { RuletaModal } from './RuletaModal'
import type { Evento } from '../../types/domain'
import { getErrorMessage } from '../../utils/helpers'
import { MIN_PARTICIPANTES } from '../../utils/constants'

export function RegaloRobadoView({
  evento,
  participantes,
  user,
  isAdmin,
  onEventoActualizado,
}: {
  evento: Evento
  participantes: ParticipanteConUsuario[]
  user: User
  isAdmin: boolean
  onEventoActualizado: () => Promise<void> | void
}) {
  const [error, setError] = useState<string | null>(null)
  const [activando, setActivando] = useState(false)
  const [ruletaOpen, setRuletaOpen] = useState(evento.status === 'ruleta_activa')
  const ruletaActiva = evento.status === 'ruleta_activa'

  async function handleActivar() {
    setActivando(true)
    setError(null)
    try {
      await activarIntercambioRegaloRobado(evento.id)
      await onEventoActualizado()
      setRuletaOpen(true)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo activar el intercambio'))
    } finally {
      setActivando(false)
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="card flex flex-col gap-3">
        <h2 className="font-display text-lg text-navy-900">Intercambio Regalo Robado</h2>
        <p className="text-sm text-navy-600">
          {participantes.length} participante{participantes.length === 1 ? '' : 's'} unido
          {participantes.length === 1 ? '' : 's'}.
        </p>
        <p className="text-sm text-navy-500">
          La app coordina compras, turnos y ruleta. Los regalos físicos se mueven durante la reunión.
        </p>

        {!ruletaActiva && isAdmin && (
          <div>
            {participantes.length >= MIN_PARTICIPANTES ? (
              <button type="button" onClick={handleActivar} disabled={activando} className="btn-primary">
                {activando ? 'Activando...' : '¡Vamos!'}
              </button>
            ) : (
              <p className="text-sm text-navy-500">
                Necesitas al menos {MIN_PARTICIPANTES} participantes para activar la ruleta (van {participantes.length}).
              </p>
            )}
          </div>
        )}

        {!ruletaActiva && !isAdmin && (
          <p className="text-sm text-navy-500">Esperando a que el admin active el intercambio...</p>
        )}

        {ruletaActiva && (
          <button type="button" className="btn-secondary self-start" onClick={() => setRuletaOpen(true)}>
            Abrir ruleta
          </button>
        )}
      </div>

      {ruletaOpen && ruletaActiva && (
        <RuletaModal
          evento={evento}
          participantes={participantes}
          usuarioActualId={user.id}
          onClose={() => setRuletaOpen(false)}
          onTurnoResuelto={onEventoActualizado}
        />
      )}
    </div>
  )
}
