import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { marcarEventoCompletado, obtenerEventoDetalle, realizarSorteo } from '../services/eventos'
import { obtenerMiAsignacion } from '../services/asignaciones'
import { listarParticipantes } from '../services/participantes'
import type { ParticipanteConUsuario } from '../services/participantes'
import { WishlistForm } from '../components/wishlist/WishlistForm'
import { AssignmentRevealCard } from '../components/asignaciones/AssignmentRevealCard'
import { BuyerStatusTable } from '../components/asignaciones/BuyerStatusTable'
import { MarkBoughtButton } from '../components/asignaciones/MarkBoughtButton'
import { InviteLinkBox } from '../components/eventos/InviteLinkBox'
import type { Evento, Asignacion } from '../types/domain'
import { getErrorMessage } from '../utils/helpers'

const MIN_PARTICIPANTES = 3

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [participantes, setParticipantes] = useState<ParticipanteConUsuario[]>([])
  const [miAsignacion, setMiAsignacion] = useState<Asignacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revealing, setRevealing] = useState(false)
  const [sorteando, setSorteando] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    Promise.all([obtenerEventoDetalle(id), listarParticipantes(id)])
      .then(([eventoData, participantesData]) => {
        setEvento(eventoData)
        setParticipantes(participantesData)
      })
      .catch(() => setError('No se pudo cargar este evento, o no tienes acceso a él.'))
      .finally(() => setLoading(false))
  }, [id])

  const isAdmin = !!(evento && user && evento.admin_id === user.id)
  const isCompletado = evento?.estado === 'completado'
  const sorteoRealizado = !!evento?.sorteo_realizado_at

  useEffect(() => {
    if (evento && sorteoRealizado) {
      obtenerMiAsignacion(evento.id)
        .then(setMiAsignacion)
        .catch(() => {})
    }
  }, [evento, sorteoRealizado])

  async function refetchEvento() {
    if (!id) return
    const [eventoData, participantesData] = await Promise.all([
      obtenerEventoDetalle(id),
      listarParticipantes(id),
    ])
    setEvento(eventoData)
    setParticipantes(participantesData)
  }

  async function handleSortear() {
    if (!evento) return
    setSorteando(true)
    setError(null)
    try {
      await realizarSorteo(evento.id)
      await refetchEvento()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo realizar el sorteo'))
    } finally {
      setSorteando(false)
    }
  }

  async function handleRevelar() {
    if (!evento) return
    setRevealing(true)
    try {
      await marcarEventoCompletado(evento.id)
      setEvento({ ...evento, estado: 'completado' })
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo revelar el evento'))
    } finally {
      setRevealing(false)
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-navy-500">Cargando...</div>
  }

  if (error || !evento) {
    return (
      <div className="mx-auto mt-16 max-w-sm px-4 text-center text-navy-600">
        {error ?? 'Evento no encontrado.'}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl text-navy-900">{evento.nombre}</h1>
      <p className="mt-1 text-navy-600">
        Presupuesto: ${evento.presupuesto} · Comprar antes de {evento.fecha_compra} · Revelación:{' '}
        {evento.fecha_revelacion}
      </p>
      {isCompletado && (
        <p className="mt-2 text-sm font-bold text-success">🎉 Este evento ya fue revelado.</p>
      )}

      {isAdmin && !isCompletado && (
        <div className="mt-6">
          <InviteLinkBox
            label="Link para invitar al grupo"
            url={`${import.meta.env.VITE_APP_URL}/join/${evento.codigo_acceso}`}
          />
        </div>
      )}

      {!sorteoRealizado && (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">
              Tu lista de deseos
            </h2>
            <WishlistForm eventoId={evento.id} usuarioId={user!.id} />
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
                  Necesitas al menos {MIN_PARTICIPANTES} participantes para sortear (van{' '}
                  {participantes.length}).
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {sorteoRealizado && (
        <div className="mt-6 flex flex-col gap-6">
          {miAsignacion && (
            <div>
              <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">
                Le regalas a
              </h2>
              <AssignmentRevealCard eventoId={evento.id} receptorId={miAsignacion.receptor_id} />
              {!isCompletado &&
                (miAsignacion.estado === 'comprado' ? (
                  <p className="mt-3 font-bold text-success">✓ Ya marcaste que compraste el regalo.</p>
                ) : (
                  <div className="mt-3">
                    <MarkBoughtButton
                      asignacionId={miAsignacion.id}
                      onDone={() => setMiAsignacion({ ...miAsignacion, estado: 'comprado' })}
                    />
                  </div>
                ))}
            </div>
          )}
          {(isAdmin || isCompletado) && (
            <div>
              <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">
                Estado de compras
              </h2>
              <BuyerStatusTable eventoId={evento.id} />
            </div>
          )}
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
      )}
    </div>
  )
}
