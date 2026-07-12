import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { marcarEventoCompletado, obtenerEventoDetalle, obtenerReceptorToken } from '../services/eventos'
import { obtenerMiAsignacion } from '../services/asignaciones'
import { WishlistForm } from '../components/wishlist/WishlistForm'
import { WishlistView } from '../components/wishlist/WishlistView'
import { BuyerStatusTable } from '../components/asignaciones/BuyerStatusTable'
import { MarkBoughtButton } from '../components/asignaciones/MarkBoughtButton'
import { InviteLinkBox } from '../components/eventos/InviteLinkBox'
import type { Evento, Asignacion } from '../types/domain'
import { getErrorMessage } from '../utils/helpers'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [receptorToken, setReceptorToken] = useState<string | null>(null)
  const [miAsignacion, setMiAsignacion] = useState<Asignacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revealing, setRevealing] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    obtenerEventoDetalle(id)
      .then(setEvento)
      .catch(() => setError('No se pudo cargar este evento, o no tienes acceso a él.'))
      .finally(() => setLoading(false))
  }, [id])

  const isAdmin = !!(evento && user && evento.admin_id === user.id)
  const isReceptor = !!(evento && user && evento.receptor_id === user.id)
  const isComprador = !!evento && !!user && !isAdmin && !isReceptor
  const isCompletado = evento?.estado === 'completado'

  useEffect(() => {
    if (evento && isAdmin && !evento.receptor_id) {
      obtenerReceptorToken(evento.id)
        .then(setReceptorToken)
        .catch(() => {})
    }
  }, [evento, isAdmin])

  useEffect(() => {
    if (evento && isComprador) {
      obtenerMiAsignacion(evento.id)
        .then(setMiAsignacion)
        .catch(() => {})
    }
  }, [evento, isComprador])

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
    return <div className="flex h-64 items-center justify-center text-slate-500">Cargando...</div>
  }

  if (error || !evento) {
    return (
      <div className="mx-auto mt-16 max-w-sm px-4 text-center text-slate-600">
        {error ?? 'Evento no encontrado.'}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{evento.nombre}</h1>
      <p className="mt-1 text-slate-500">
        Presupuesto: ${evento.presupuesto} · Comprar antes de {evento.fecha_compra} · Revelación:{' '}
        {evento.fecha_revelacion}
      </p>
      {isCompletado && (
        <p className="mt-2 text-sm font-medium text-purple-700">🎉 Este evento ya fue revelado.</p>
      )}

      {isAdmin && (
        <div className="mt-6 flex flex-col gap-6">
          {!isCompletado && (
            <InviteLinkBox
              label="Link para compradores"
              url={`${import.meta.env.VITE_APP_URL}/join/${evento.codigo_acceso}`}
            />
          )}
          {!evento.receptor_id && receptorToken && (
            <InviteLinkBox
              label={`Link para que ${evento.receptor_nombre} confirme como receptor`}
              url={`${import.meta.env.VITE_APP_URL}/claim/${receptorToken}`}
            />
          )}
          {evento.receptor_id && (
            <p className="text-sm text-green-700">✓ {evento.receptor_nombre} confirmó como receptor.</p>
          )}
          <div>
            <h2 className="mb-2 font-medium text-slate-900">Compradores</h2>
            <BuyerStatusTable eventoId={evento.id} />
          </div>
          <div>
            <h2 className="mb-2 font-medium text-slate-900">Lista de deseos</h2>
            <WishlistView eventoId={evento.id} />
          </div>
          {!isCompletado && (
            <div>
              <button
                onClick={handleRevelar}
                disabled={revealing}
                className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {revealing ? 'Revelando...' : 'Revelar evento'}
              </button>
              <p className="mt-1 text-xs text-slate-500">
                Marca el evento como completado y comparte el estado de compras con todo el grupo.
              </p>
            </div>
          )}
        </div>
      )}

      {isReceptor && (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <h2 className="mb-2 font-medium text-slate-900">Tu lista de deseos</h2>
            <WishlistForm eventoId={evento.id} />
          </div>
          {isCompletado && (
            <div>
              <h2 className="mb-2 font-medium text-slate-900">Quién compró</h2>
              <BuyerStatusTable eventoId={evento.id} />
            </div>
          )}
        </div>
      )}

      {isComprador && (
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <h2 className="mb-2 font-medium text-slate-900">Lista de deseos de {evento.receptor_nombre}</h2>
            <WishlistView eventoId={evento.id} />
          </div>
          {miAsignacion &&
            !isCompletado &&
            (miAsignacion.estado === 'comprado' ? (
              <p className="text-green-700">✓ Ya marcaste que compraste el regalo.</p>
            ) : (
              <MarkBoughtButton
                asignacionId={miAsignacion.id}
                onDone={() => setMiAsignacion({ ...miAsignacion, estado: 'comprado' })}
              />
            ))}
          {isCompletado && (
            <div>
              <h2 className="mb-2 font-medium text-slate-900">Quién compró</h2>
              <BuyerStatusTable eventoId={evento.id} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
