import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EventForm } from '../components/eventos/EventForm'
import { InviteLinkBox } from '../components/eventos/InviteLinkBox'
import { crearEvento } from '../services/eventos'
import type { CrearEventoInput } from '../services/eventos'
import type { Evento } from '../types/domain'

export function CreateEventPage() {
  const [created, setCreated] = useState<Evento | null>(null)

  async function handleCreate(input: CrearEventoInput) {
    const { evento } = await crearEvento(input)
    setCreated(evento)
  }

  if (created) {
    const buyerJoinUrl = `${import.meta.env.VITE_APP_URL}/join/${created.codigo_acceso}`
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">¡Evento creado!</h1>
        <p className="mb-6 text-slate-500">
          Le enviamos una invitación a {created.receptor_nombre} para que registre su lista de deseos.
          Comparte este link con el resto del grupo para que se unan como compradores.
        </p>
        <InviteLinkBox label="Link para compradores" url={buyerJoinUrl} />
        <Link
          to={`/eventos/${created.id}`}
          className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          Ver evento
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Crear evento</h1>
      <EventForm onSubmit={handleCreate} />
    </div>
  )
}
