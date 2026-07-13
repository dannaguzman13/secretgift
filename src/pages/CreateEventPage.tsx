import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EventForm } from '../components/eventos/EventForm'
import { InviteLinkBox } from '../components/eventos/InviteLinkBox'
import { crearEvento, obtenerEventoDetalle } from '../services/eventos'
import type { CrearEventoInput } from '../services/eventos'
import type { Evento } from '../types/domain'

export function CreateEventPage() {
  const [searchParams] = useSearchParams()
  const fromId = searchParams.get('from')
  const [created, setCreated] = useState<Evento | null>(null)
  const [initial, setInitial] = useState<{ nombre?: string; presupuestoMonto?: number } | undefined>()
  const [loadingInitial, setLoadingInitial] = useState(!!fromId)

  useEffect(() => {
    if (!fromId) return
    obtenerEventoDetalle(fromId)
      .then((e) => setInitial({ nombre: `${e.nombre} (nuevo)`, presupuestoMonto: e.presupuesto_monto }))
      .catch(() => {})
      .finally(() => setLoadingInitial(false))
  }, [fromId])

  async function handleCreate(input: CrearEventoInput) {
    const { evento } = await crearEvento(input)
    setCreated(evento)
  }

  if (created) {
    const buyerJoinUrl = `${import.meta.env.VITE_APP_URL}/join/${created.codigo_acceso}`
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-2 font-display text-2xl text-navy-900">¡Evento creado!</h1>
        <p className="mb-6 text-navy-600">
          Comparte este link con todo el grupo para que se unan y registren su lista de deseos.
        </p>
        <div className="card">
          <InviteLinkBox label="Link de invitación" url={buyerJoinUrl} />
        </div>
        <Link to={`/eventos/${created.id}`} className="btn-primary mt-6 inline-block">
          Ver evento
        </Link>
      </div>
    )
  }

  if (loadingInitial) {
    return <div className="flex h-64 items-center justify-center text-navy-500">Cargando...</div>
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-2 font-display text-2xl text-navy-900">
        {fromId ? 'Replicar evento' : 'Crear evento'}
      </h1>
      {fromId && (
        <p className="mb-6 text-sm text-navy-600">
          Copiamos el nombre y presupuesto del evento anterior. Vas a compartir un link nuevo — nadie se
          une automáticamente, cada quien tiene que unirse de nuevo.
        </p>
      )}
      <EventForm onSubmit={handleCreate} initial={initial} />
    </div>
  )
}
