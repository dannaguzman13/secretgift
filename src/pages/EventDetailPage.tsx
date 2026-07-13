import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { obtenerEventoDetalle } from '../services/eventos'
import { obtenerMiAsignacion } from '../services/asignaciones'
import { listarParticipantes } from '../services/participantes'
import type { ParticipanteConUsuario } from '../services/participantes'
import { InviteLinkBox } from '../components/eventos/InviteLinkBox'
import { AmigoSecretoView } from '../components/eventos/AmigoSecretoView'
import { UltraSecretoView } from '../components/ultraSecreto/UltraSecretoView'
import { RegaloRobadoView } from '../components/regaloRobado/RegaloRobadoView'
import type { Evento, Asignacion } from '../types/domain'

const MODO_LABELS: Record<string, string> = {
  amigo_secreto: '🎁 Amigo Secreto',
  ultra_secreto: '🕵️ Amigo Ultra Secreto',
  regalo_robado: '🎲 Regalo Robado',
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [participantes, setParticipantes] = useState<ParticipanteConUsuario[]>([])
  const [miAsignacion, setMiAsignacion] = useState<Asignacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-navy-500">Cargando...</div>
  }

  if (error || !evento || !user) {
    return (
      <div className="mx-auto mt-16 max-w-sm px-4 text-center text-navy-600">
        {error ?? 'Evento no encontrado.'}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="text-xs font-bold tracking-wide text-navy-500 uppercase">{MODO_LABELS[evento.modo]}</p>
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

      {evento.modo === 'amigo_secreto' && (
        <AmigoSecretoView
          evento={evento}
          participantes={participantes}
          user={user}
          isAdmin={isAdmin}
          isCompletado={isCompletado}
          miAsignacion={miAsignacion}
          onMiAsignacionChange={setMiAsignacion}
          onSorteoRealizado={refetchEvento}
        />
      )}
      {evento.modo === 'ultra_secreto' && (
        <UltraSecretoView
          evento={evento}
          participantes={participantes}
          user={user}
          isAdmin={isAdmin}
          isCompletado={isCompletado}
          miAsignacion={miAsignacion}
          onMiAsignacionChange={setMiAsignacion}
          onSorteoRealizado={refetchEvento}
        />
      )}
      {evento.modo === 'regalo_robado' && (
        <RegaloRobadoView
          evento={evento}
          participantes={participantes}
          user={user}
          isAdmin={isAdmin}
          onSorteoRealizado={refetchEvento}
        />
      )}
    </div>
  )
}
