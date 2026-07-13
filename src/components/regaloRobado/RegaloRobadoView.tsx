import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { realizarSorteo } from '../../services/eventos'
import { iniciarJuego } from '../../services/regaloRobado'
import type { ParticipanteConUsuario } from '../../services/participantes'
import { WishlistForm } from '../wishlist/WishlistForm'
import { RuletaGame } from './RuletaGame'
import type { Evento } from '../../types/domain'
import { getErrorMessage } from '../../utils/helpers'
import { MIN_PARTICIPANTES } from '../../utils/constants'

export function RegaloRobadoView({
  evento,
  participantes,
  user,
  isAdmin,
  onSorteoRealizado,
}: {
  evento: Evento
  participantes: ParticipanteConUsuario[]
  user: User
  isAdmin: boolean
  onSorteoRealizado: () => Promise<void> | void
}) {
  const [error, setError] = useState<string | null>(null)
  const [sorteando, setSorteando] = useState(false)
  const [iniciando, setIniciando] = useState(false)

  const sorteoRealizado = !!evento.sorteo_realizado_at
  const juegoIniciado = !!evento.juego_iniciado_at

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

  async function handleIniciarJuego() {
    setIniciando(true)
    setError(null)
    try {
      await iniciarJuego(evento.id)
      await onSorteoRealizado()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo iniciar el juego'))
    } finally {
      setIniciando(false)
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

  if (!juegoIniciado) {
    return (
      <div className="mt-6 flex flex-col gap-6">
        {error && <p className="text-sm text-error">{error}</p>}
        <p className="text-navy-600">El sorteo ya se hizo. Cuando todos estén listos, empieza el juego.</p>
        {isAdmin && (
          <button onClick={handleIniciarJuego} disabled={iniciando} className="btn-primary">
            {iniciando ? 'Iniciando...' : '🎲 Iniciar juego'}
          </button>
        )}
        {!isAdmin && <p className="text-sm text-navy-500">Esperando a que el admin inicie el juego...</p>}
      </div>
    )
  }

  return (
    <div className="mt-6">
      {error && <p className="mb-4 text-sm text-error">{error}</p>}
      <RuletaGame
        eventoId={evento.id}
        participantes={participantes}
        turnoActual={evento.turno_actual}
        usuarioActualId={user.id}
        onTurnoResuelto={onSorteoRealizado}
      />
    </div>
  )
}
