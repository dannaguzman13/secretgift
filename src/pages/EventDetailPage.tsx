import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { obtenerEventoDetalle } from '../services/eventos'
import { obtenerMiAsignacion } from '../services/asignaciones'
import { listarParticipantes, listarParticipantesUltraSecreto } from '../services/participantes'
import type { ParticipanteConUsuario, ParticipanteUltraSecreto } from '../services/participantes'
import { InviteLinkBox } from '../components/eventos/InviteLinkBox'
import { formatearPresupuesto } from '../utils/presupuesto'
import { formatFechaIntercambio } from '../utils/fechaIntercambio'
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
  const [participantes, setParticipantes] = useState<ParticipanteConUsuario[] | ParticipanteUltraSecreto[]>([])
  const [miAsignacion, setMiAsignacion] = useState<Asignacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    obtenerEventoDetalle(id)
      .then(async (eventoData) => {
        setEvento(eventoData)
        const participantesData =
          eventoData.modo === 'ultra_secreto'
            ? await listarParticipantesUltraSecreto(id)
            : await listarParticipantes(id)
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
    const eventoData = await obtenerEventoDetalle(id)
    const participantesData =
      eventoData.modo === 'ultra_secreto'
        ? await listarParticipantesUltraSecreto(id)
        : await listarParticipantes(id)
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
        Presupuesto: {formatearPresupuesto(evento.presupuesto_monto, evento.presupuesto_moneda)} · Comprar antes de{' '}
        {evento.fecha_compra} · Intercambio: {formatFechaIntercambio(evento.fecha_intercambio)}
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
          participantes={participantes as ParticipanteConUsuario[]}
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
          participantes={participantes as ParticipanteUltraSecreto[]}
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
          participantes={participantes as ParticipanteConUsuario[]}
          user={user}
          isAdmin={isAdmin}
          onSorteoRealizado={refetchEvento}
        />
      )}
    </div>
  )
}
