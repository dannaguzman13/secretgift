import { Link } from 'react-router-dom'
import type { Evento } from '../../types/domain'
import { formatearPresupuesto } from '../../utils/presupuesto'

export function EventCard({ evento, showReplicar }: { evento: Evento; showReplicar?: boolean }) {
  return (
    <div className="card px-4 py-3 transition-shadow hover:shadow-md">
      <Link to={`/eventos/${evento.id}`} className="block">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-navy-900">{evento.nombre}</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              evento.estado === 'completado'
                ? 'bg-navy-100 text-navy-600'
                : evento.estado === 'cancelado'
                  ? 'bg-error-bg text-error'
                  : 'bg-info-bg text-info'
            }`}
          >
            {evento.estado}
          </span>
        </div>
        <p className="mt-1 text-sm text-navy-500">
          {formatearPresupuesto(evento.presupuesto_monto, evento.presupuesto_moneda)} · Comprar antes de{' '}
          {evento.fecha_compra}
        </p>
      </Link>
      {showReplicar && (
        <Link
          to={`/crear-evento?from=${evento.id}`}
          className="mt-2 inline-block text-sm font-bold text-sky-600 hover:text-sky-700"
        >
          ↻ Replicar evento
        </Link>
      )}
    </div>
  )
}
