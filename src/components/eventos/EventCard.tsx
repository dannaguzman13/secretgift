import { Link } from 'react-router-dom'
import type { Evento } from '../../types/domain'

export function EventCard({ evento }: { evento: Evento }) {
  return (
    <Link
      to={`/eventos/${evento.id}`}
      className="block rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-900">{evento.nombre}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            evento.estado === 'completado'
              ? 'bg-slate-100 text-slate-600'
              : evento.estado === 'cancelado'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
          }`}
        >
          {evento.estado}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Para {evento.receptor_nombre} · ${evento.presupuesto} · Comprar antes de {evento.fecha_compra}
      </p>
    </Link>
  )
}
