import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { obtenerMisEventos } from '../services/eventos'
import { obtenerDashboardEvento } from '../services/dashboard'
import type { DashboardEventoData } from '../services/dashboard'
import { actualizarMiEstadoCompra, listarEstadoComprasRegaloRobado } from '../services/regaloRobado'
import { supabase } from '../services/supabase'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { EventInfoCard } from '../components/dashboard/EventInfoCard'
import { ModeBlock } from '../components/dashboard/ModeBlock'
import { ParticipantsBlock } from '../components/dashboard/ParticipantsBlock'
import { RuletaModal } from '../components/regaloRobado/RuletaModal'
import type { ParticipanteConUsuario } from '../services/participantes'
import type { Evento } from '../types/domain'
import { getErrorMessage } from '../utils/helpers'

export function DashboardPage() {
  const { user } = useAuth()
  const { eventoId } = useParams<{ eventoId?: string }>()
  const navigate = useNavigate()

  const [eventos, setEventos] = useState<Evento[]>([])
  const [loadingEventos, setLoadingEventos] = useState(true)
  const [eventosError, setEventosError] = useState<string | null>(null)

  const [data, setData] = useState<DashboardEventoData | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [ruletaModalOpen, setRuletaModalOpen] = useState(false)
  const [actualizandoCompraUsuarioId, setActualizandoCompraUsuarioId] = useState<string | null>(null)
  const eventoStatusRef = useRef<string | null>(null)

  useEffect(() => {
    obtenerMisEventos()
      .then(setEventos)
      .catch((err) => setEventosError(getErrorMessage(err, 'No se pudieron cargar tus eventos')))
      .finally(() => setLoadingEventos(false))
  }, [])

  useEffect(() => {
    if (loadingEventos || eventos.length === 0) return
    if (!eventoId) {
      const primero = eventos.find((e) => e.estado === 'activo') ?? eventos[0]
      navigate(`/dashboard/${primero.id}`, { replace: true })
    }
  }, [loadingEventos, eventos, eventoId, navigate])

  useEffect(() => {
    if (!eventoId || !user) return
    setLoadingData(true)
    setDataError(null)
    obtenerDashboardEvento(eventoId, user.id)
      .then(setData)
      .catch((err) => setDataError(getErrorMessage(err, 'No se pudo cargar este evento')))
      .finally(() => setLoadingData(false))
  }, [eventoId, user])

  useEffect(() => {
    setRuletaModalOpen(false)
    eventoStatusRef.current = null
  }, [eventoId])

  useEffect(() => {
    eventoStatusRef.current = data?.evento.status ?? null
  }, [data?.evento.status])

  useEffect(() => {
    if (!eventoId || !user) return

    const channel = supabase
      .channel(`evento-${eventoId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'eventos', filter: `id=eq.${eventoId}` },
        (payload) => {
          const eventoActualizado = payload.new as Evento
          const debeAbrirRuleta =
            eventoActualizado.modo === 'regalo_robado' &&
            eventoActualizado.status === 'ruleta_activa' &&
            eventoStatusRef.current !== 'ruleta_activa'

          eventoStatusRef.current = eventoActualizado.status
          setData((prev) => (prev ? { ...prev, evento: eventoActualizado } : prev))
          setEventos((prev) => prev.map((evento) => (evento.id === eventoActualizado.id ? eventoActualizado : evento)))

          if (debeAbrirRuleta) {
            setRuletaModalOpen(true)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventoId, user])

  async function handleActualizarEstadoCompra(usuarioId: string, estado: 'pendiente' | 'comprado') {
    if (!eventoId || !data) return
    setActualizandoCompraUsuarioId(usuarioId)
    setDataError(null)
    try {
      await actualizarMiEstadoCompra(eventoId, estado)
      const estadoComprasRegaloRobado = await listarEstadoComprasRegaloRobado(eventoId)
      setData((prev) => (prev ? { ...prev, estadoComprasRegaloRobado } : prev))
    } catch (err) {
      setDataError(getErrorMessage(err, 'No se pudo actualizar tu estado de compra'))
    } finally {
      setActualizandoCompraUsuarioId(null)
    }
  }

  function handleRegaloRobadoActivado(evento: Evento) {
    setData((prev) => (prev ? { ...prev, evento } : prev))
    setEventos((prev) => prev.map((item) => (item.id === evento.id ? evento : item)))
    setRuletaModalOpen(true)
  }

  if (loadingEventos) {
    return <div className="flex h-64 items-center justify-center text-navy-500">Cargando...</div>
  }

  if (eventosError) {
    return <p className="p-8 text-error">{eventosError}</p>
  }

  if (eventos.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-navy-600">Todavía no tienes eventos.</p>
        <Link to="/crear-evento" className="btn-primary">
          + Crear evento
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:h-[calc(100vh-64px)] sm:flex-row">
      <DashboardSidebar
        eventos={eventos}
        selectedId={eventoId ?? null}
        onSelect={(id) => navigate(`/dashboard/${id}`, { replace: true })}
      />
      <div className="flex-1 sm:overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
          {loadingData && <p className="text-navy-500">Cargando evento...</p>}
          {dataError && <p className="text-error">{dataError}</p>}
          {data && !loadingData && (
            <>
              <EventInfoCard
                evento={data.evento}
                participantesCount={data.participantesCount}
                onEventoActualizado={(evento) => setData((prev) => (prev ? { ...prev, evento } : prev))}
              />
              <ModeBlock
                data={data}
                currentUserId={user?.id ?? ''}
                onRegaloRobadoActivado={handleRegaloRobadoActivado}
                onOpenRuleta={() => setRuletaModalOpen(true)}
              />
              <ParticipantsBlock
                modo={data.evento.modo}
                sorteoRealizado={data.sorteoRealizado}
                userId={user?.id ?? ''}
                estadoCompras={data.estadoCompras}
                estadoComprasRegaloRobado={data.estadoComprasRegaloRobado}
                participantes={data.participantes}
                actualizandoCompraUsuarioId={actualizandoCompraUsuarioId}
                onActualizarEstadoCompra={handleActualizarEstadoCompra}
              />
              {data.evento.modo === 'regalo_robado' && data.evento.status === 'ruleta_activa' && ruletaModalOpen && (
                <RuletaModal
                  evento={data.evento}
                  participantes={data.participantes as ParticipanteConUsuario[]}
                  usuarioActualId={user?.id ?? ''}
                  onClose={() => setRuletaModalOpen(false)}
                  onTurnoResuelto={async () => {
                    if (!eventoId || !user) return
                    const updated = await obtenerDashboardEvento(eventoId, user.id)
                    setData(updated)
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
