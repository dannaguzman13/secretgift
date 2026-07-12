import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerMisEventos } from '../services/eventos'
import { EventCard } from '../components/eventos/EventCard'
import type { Evento } from '../types/domain'
import { getErrorMessage } from '../utils/helpers'

export function DashboardPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    obtenerMisEventos()
      .then(setEventos)
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar tus eventos')))
      .finally(() => setLoading(false))
  }, [])

  const proximos = eventos.filter((e) => e.estado === 'activo')
  const historial = eventos.filter((e) => e.estado !== 'activo')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Mis eventos</h1>
        <Link
          to="/crear-evento"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          + Crear evento
        </Link>
      </div>

      {loading && <p className="text-slate-500">Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">Próximos</h2>
            {proximos.length === 0 ? (
              <p className="text-slate-500">No tienes eventos activos todavía.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {proximos.map((e) => (
                  <EventCard key={e.id} evento={e} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">Historial</h2>
            {historial.length === 0 ? (
              <p className="text-slate-500">Todavía no hay eventos completados.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {historial.map((e) => (
                  <EventCard key={e.id} evento={e} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
