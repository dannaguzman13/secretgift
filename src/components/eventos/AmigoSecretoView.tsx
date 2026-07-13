import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { realizarSorteo, marcarEventoCompletado } from '../../services/eventos'
import type { ParticipanteConUsuario } from '../../services/participantes'
import { WishlistForm } from '../wishlist/WishlistForm'
import { AssignmentRevealCard } from '../asignaciones/AssignmentRevealCard'
import { BuyerStatusTable } from '../asignaciones/BuyerStatusTable'
import { MarkBoughtButton } from '../asignaciones/MarkBoughtButton'
import type { Evento, Asignacion } from '../../types/domain'
import { getErrorMessage } from '../../utils/helpers'
import { MIN_PARTICIPANTES } from '../../utils/constants'

export function AmigoSecretoView({
  evento,
  participantes,
  user,
  isAdmin,
  isCompletado,
  miAsignacion,
  onMiAsignacionChange,
  onSorteoRealizado,
}: {
  evento: Evento
  participantes: ParticipanteConUsuario[]
  user: User
  isAdmin: boolean
  isCompletado: boolean
  miAsignacion: Asignacion | null
  onMiAsignacionChange: (a: Asignacion) => void
  onSorteoRealizado: () => Promise<void> | void
}) {
  const [error, setError] = useState<string | null>(null)
  const [revealing, setRevealing] = useState(false)
  const [sorteando, setSorteando] = useState(false)

  const sorteoRealizado = !!evento.sorteo_realizado_at

  async function handleSortear() {
    setSorteando(true)
    setError(null)
    try {
      await realizarSorteo(evento.id)
      await onSorteoRealizado()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo realizar el sorteo'))
    } finally {
      setSorteando(false)
    }
  }

  async function handleRevelar() {
    setRevealing(true)
    try {
      await marcarEventoCompletado(evento.id)
      await onSorteoRealizado()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo revelar el evento'))
    } finally {
      setRevealing(false)
    }
  }

  if (!sorteoRealizado) {
    return (
      <div className="mt-6 flex flex-col gap-6">
        {error && <p className="text-sm text-error">{error}</p>}
        <div>
          <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">Tu lista de deseos</h2>
          <WishlistForm eventoId={evento.id} usuarioId={user.id} />
        </div>
        <p className="text-sm text-navy-600">
          {participantes.length} participante{participantes.length === 1 ? '' : 's'} unido
          {participantes.length === 1 ? '' : 's'}.
        </p>
        {isAdmin && (
          <div>
            {participantes.length >= MIN_PARTICIPANTES ? (
              <button onClick={handleSortear} disabled={sorteando} className="btn-primary">
                {sorteando ? 'Sorteando...' : 'Realizar sorteo'}
              </button>
            ) : (
              <p className="text-sm text-navy-500">
                Necesitas al menos {MIN_PARTICIPANTES} participantes para sortear (van {participantes.length}).
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {error && <p className="text-sm text-error">{error}</p>}
      {miAsignacion && (
        <div>
          <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">Le regalas a</h2>
          <AssignmentRevealCard eventoId={evento.id} receptorId={miAsignacion.receptor_id} />
          {!isCompletado &&
            (miAsignacion.estado === 'comprado' ? (
              <p className="mt-3 font-bold text-success">✓ Ya marcaste que compraste el regalo.</p>
            ) : (
              <div className="mt-3">
                <MarkBoughtButton
                  asignacionId={miAsignacion.id}
                  onDone={() => onMiAsignacionChange({ ...miAsignacion, estado: 'comprado' })}
                />
              </div>
            ))}
        </div>
      )}
      <div>
        <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">Estado de compras</h2>
        <BuyerStatusTable eventoId={evento.id} />
      </div>
      {isAdmin && !isCompletado && (
        <div>
          <button onClick={handleRevelar} disabled={revealing} className="btn-primary">
            {revealing ? 'Revelando...' : 'Revelar evento'}
          </button>
          <p className="mt-1 text-xs text-navy-500">
            Marca el evento como completado y comparte el estado de compras con todo el grupo.
          </p>
        </div>
      )}
    </div>
  )
}
