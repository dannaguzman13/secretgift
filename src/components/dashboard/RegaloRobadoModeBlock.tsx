import { Link } from 'react-router-dom'
import type { DashboardEventoData } from '../../services/dashboard'
import { formatearPresupuesto } from '../../utils/presupuesto'

export function RegaloRobadoModeBlock({ data }: { data: DashboardEventoData }) {
  const { evento } = data
  const juegoIniciado = !!evento.juego_iniciado_at

  return (
    <div className="card flex flex-col gap-4">
      <h2 className="text-center font-display text-lg text-navy-900">Características del regalo</h2>
      <dl className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <dt className="w-40 shrink-0 text-sm font-bold text-navy-600">💰 Presupuesto:</dt>
          <dd className="text-navy-900">{formatearPresupuesto(evento.presupuesto_monto, evento.presupuesto_moneda)}</dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="w-40 shrink-0 text-sm font-bold text-navy-600">🎯 Temática:</dt>
          <dd className="text-navy-900">{evento.tematica}</dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="w-40 shrink-0 text-sm font-bold text-navy-600">🚫 Restricciones:</dt>
          <dd className="text-navy-900">{evento.restricciones}</dd>
        </div>
        {evento.requisitos && (
          <div className="flex items-baseline gap-2">
            <dt className="w-40 shrink-0 text-sm font-bold text-navy-600">📦 Requisitos:</dt>
            <dd className="text-navy-900">{evento.requisitos}</dd>
          </div>
        )}
        {evento.recomendacion && (
          <div className="flex items-baseline gap-2">
            <dt className="w-40 shrink-0 text-sm font-bold text-navy-600">💡 Recomendación:</dt>
            <dd className="text-navy-900">{evento.recomendacion}</dd>
          </div>
        )}
      </dl>
      <p className="text-center text-sm text-navy-500">¿Qué tipo de regalo debo comprar?</p>
      {juegoIniciado && (
        <Link to={`/eventos/${evento.id}`} className="btn-secondary self-center text-sm">
          Ver juego en curso
        </Link>
      )}
    </div>
  )
}
