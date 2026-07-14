import { useState } from 'react'
import type { DashboardEventoData } from '../../services/dashboard'
import type { Universo } from '../../types/domain'
import { UNIVERSO_LABELS } from '../../utils/aliasData'
import { WishlistColumn } from './WishlistColumn'
import { SorteoPendienteBlock } from './SorteoPendienteBlock'
import { MissionDetailsModal } from './MissionDetailsModal'

export function UltraSecretoModeBlock({ data }: { data: DashboardEventoData }) {
  const { evento, miAsignacion, miAliasPropio, aliasDestino, wishlistDestino, perfilDestino } = data
  const universoLabel = evento.universo ? UNIVERSO_LABELS[evento.universo as Universo] : null
  const [verDetalles, setVerDetalles] = useState(false)

  if (!miAsignacion) {
    return (
      <SorteoPendienteBlock
        eventoId={evento.id}
        mensaje="El sorteo todavía no se ha realizado. Cuando el admin lo haga, aquí verás tu misión secreta."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="card flex flex-col items-center gap-2 text-center">
        <h3 className="text-xs font-bold tracking-wide text-navy-600 uppercase">Quién eres</h3>
        <span className="text-3xl">🕵️</span>
        <p className="font-display text-navy-900">{miAliasPropio?.alias ?? '???'}</p>
        {universoLabel && <p className="text-xs text-navy-500">{universoLabel}</p>}
      </div>
      <button
        type="button"
        onClick={() => setVerDetalles(true)}
        className="card flex cursor-pointer flex-col items-center gap-2 text-center"
      >
        <h3 className="text-xs font-bold tracking-wide text-navy-600 uppercase">Tu misión</h3>
        <span className="text-3xl">🎯</span>
        <p className="font-display text-navy-900">{aliasDestino?.alias ?? '???'}</p>
        <p className="text-xs text-navy-500">Toca para ver detalles</p>
      </button>
      <div className="card flex flex-col gap-2">
        <h3 className="text-center text-xs font-bold tracking-wide text-navy-600 uppercase">Lista de deseos</h3>
        <WishlistColumn wishlist={wishlistDestino} />
      </div>

      {verDetalles && (
        <MissionDetailsModal
          campos={perfilDestino?.campos}
          descripcion={perfilDestino?.descripcion}
          onClose={() => setVerDetalles(false)}
        />
      )}
    </div>
  )
}
