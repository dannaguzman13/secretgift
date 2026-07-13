import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { obtenerMisEventos } from '../services/eventos'
import { obtenerDashboardEvento } from '../services/dashboard'
import type { DashboardEventoData } from '../services/dashboard'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { EventInfoCard } from '../components/dashboard/EventInfoCard'
import { ModeBlock } from '../components/dashboard/ModeBlock'
import { ParticipantsBlock } from '../components/dashboard/ParticipantsBlock'
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
              <EventInfoCard evento={data.evento} participantesCount={data.participantesCount} />
              <ModeBlock data={data} />
              <ParticipantsBlock
                sorteoRealizado={data.sorteoRealizado}
                estadoCompras={data.estadoCompras}
                participantes={data.participantes}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
