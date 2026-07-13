import { Link } from 'react-router-dom'
import type { Evento } from '../../types/domain'
import { EventListItem } from './EventListItem'

export function DashboardSidebar({
  eventos,
  selectedId,
  onSelect,
}: {
  eventos: Evento[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <aside className="flex shrink-0 flex-col border-b border-pale-sky-200 bg-pale-sky-50 sm:w-[280px] sm:border-r sm:border-b-0">
      <h2 className="px-4 pt-4 text-xs font-bold tracking-wide text-navy-600 uppercase">Eventos</h2>
      <div className="mt-3 overflow-x-auto px-3 sm:flex-1 sm:overflow-x-visible sm:overflow-y-auto">
        {eventos.length === 0 ? (
          <p className="px-1 text-sm text-navy-500">Todavía no tienes eventos.</p>
        ) : (
          <div className="flex gap-2 pb-3 sm:flex-col sm:gap-1">
            {eventos.map((evento) => (
              <div key={evento.id} className="w-[200px] shrink-0 sm:w-auto">
                <EventListItem
                  evento={evento}
                  selected={evento.id === selectedId}
                  onClick={() => onSelect(evento.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-pale-sky-200 p-3">
        <Link to="/crear-evento" className="btn-primary block text-center text-sm">
          + Crear evento
        </Link>
      </div>
    </aside>
  )
}
