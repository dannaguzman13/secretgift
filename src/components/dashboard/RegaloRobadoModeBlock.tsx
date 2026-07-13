import { useState } from 'react'
import type { DashboardEventoData } from '../../services/dashboard'
import { activarIntercambioRegaloRobado } from '../../services/regaloRobado'
import type { Evento } from '../../types/domain'
import { getErrorMessage } from '../../utils/helpers'
import { formatearPresupuesto } from '../../utils/presupuesto'

export function RegaloRobadoModeBlock({
  data,
  currentUserId,
  onActivado,
  onOpenRuleta,
}: {
  data: DashboardEventoData
  currentUserId: string
  onActivado: (evento: Evento) => void
  onOpenRuleta: () => void
}) {
  const { evento } = data
  const [activando, setActivando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isAdmin = evento.admin_id === currentUserId
  const ruletaActiva = evento.status === 'ruleta_activa'

  async function handleActivar() {
    setActivando(true)
    setError(null)
    try {
      const eventoActualizado = await activarIntercambioRegaloRobado(evento.id)
      onActivado(eventoActualizado)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo activar el intercambio'))
    } finally {
      setActivando(false)
    }
  }

  return (
    <div className="card flex flex-col gap-4">
      <div className={`grid gap-5 ${isAdmin && !ruletaActiva ? 'md:grid-cols-[1fr_220px]' : ''}`}>
        <div className="flex flex-col gap-4">
          <h2 className="text-center font-display text-lg text-navy-900">Características del regalo</h2>
          <dl className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <dt className="w-40 shrink-0 text-sm font-bold text-navy-600">💰 Presupuesto:</dt>
              <dd className="text-navy-900">
                {formatearPresupuesto(evento.presupuesto_monto, evento.presupuesto_moneda)}
              </dd>
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
        </div>

        {isAdmin && !ruletaActiva && (
          <div className="flex items-baseline gap-2">
            <div className="flex w-full flex-col justify-center gap-3 rounded-lg border-2 border-pale-sky-200 bg-pale-sky-50 p-4 text-center">
              <h3 className="font-display text-base text-navy-900">Activar el intercambio</h3>
              <p className="text-xs text-navy-500">Cuando todos estén listos, abre la ruleta para el grupo.</p>
              <button type="button" className="btn-primary w-full" disabled={activando} onClick={handleActivar}>
                {activando ? 'Activando...' : '¡Vamos!'}
              </button>
              {error && <p className="text-xs text-error">{error}</p>}
            </div>
          </div>
        )}
      </div>

      {ruletaActiva && (
        <button type="button" className="btn-secondary self-center text-sm" onClick={onOpenRuleta}>
          Abrir ruleta
        </button>
      )}
    </div>
  )
}
