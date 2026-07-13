import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { realizarSorteoUltraSecreto, marcarEventoCompletado } from '../../services/eventos'
import { obtenerAliasDeUsuario } from '../../services/aliases'
import type { ParticipanteUltraSecreto } from '../../services/participantes'
import { WishlistForm } from '../wishlist/WishlistForm'
import { AssignmentRevealCard } from '../asignaciones/AssignmentRevealCard'
import { BuyerStatusTable } from '../asignaciones/BuyerStatusTable'
import { MarkBoughtButton } from '../asignaciones/MarkBoughtButton'
import { AliasBadge } from './AliasBadge'
import type { Evento, Asignacion, Universo } from '../../types/domain'
import { getErrorMessage } from '../../utils/helpers'
import { MIN_PARTICIPANTES, MAX_PARTICIPANTES_ULTRA_SECRETO } from '../../utils/constants'
import { obtenerAliasesDeUniverso } from '../../utils/aliasData'

export function UltraSecretoView({
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
  participantes: ParticipanteUltraSecreto[]
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
  const [aliasReceptor, setAliasReceptor] = useState<string | null>(null)

  const sorteoRealizado = !!evento.sorteo_realizado_at
  const excedeMaximo = participantes.length > MAX_PARTICIPANTES_ULTRA_SECRETO

  useEffect(() => {
    if (miAsignacion) {
      obtenerAliasDeUsuario(evento.id, miAsignacion.receptor_id)
        .then((a) => setAliasReceptor(a?.alias ?? null))
        .catch(() => {})
    }
  }, [evento.id, miAsignacion])

  async function handleSortear() {
    setSorteando(true)
    setError(null)
    try {
      const aliases = obtenerAliasesDeUniverso(evento.universo as Universo)
      await realizarSorteoUltraSecreto(evento.id, [...aliases])
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
          {participantes.length === 1 ? '' : 's'} (máx. {MAX_PARTICIPANTES_ULTRA_SECRETO}).
        </p>
        {isAdmin && (
          <div>
            {excedeMaximo ? (
              <p className="text-sm text-error">
                Este evento superó el máximo de {MAX_PARTICIPANTES_ULTRA_SECRETO} participantes para Ultra Secreto.
              </p>
            ) : participantes.length >= MIN_PARTICIPANTES ? (
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
          {aliasReceptor && (
            <div className="mb-2">
              <AliasBadge alias={aliasReceptor} />
            </div>
          )}
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
            Marca el evento como completado y revela los nombres reales a todo el grupo.
          </p>
        </div>
      )}
    </div>
  )
}
