import { useState } from 'react'
import type { DashboardEventoData } from '../../services/dashboard'
import { WishlistColumn } from './WishlistColumn'
import { SorteoPendienteBlock } from './SorteoPendienteBlock'
import { MissionDetailsModal } from './MissionDetailsModal'
import { MyWishlistModal } from './MyWishlistModal'

export function AmigoSecretoModeBlock({ data }: { data: DashboardEventoData }) {
  const { evento, miPerfil, miAsignacion, perfilDestino, wishlistDestino } = data
  const [verDetalles, setVerDetalles] = useState(false)
  const [verMiLista, setVerMiLista] = useState(false)

  if (!miAsignacion) {
    return (
      <SorteoPendienteBlock
        eventoId={evento.id}
        mensaje="El sorteo todavía no se ha realizado. Cuando el admin lo haga, aquí verás a quién le regalas."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <button
        type="button"
        onClick={() => setVerMiLista(true)}
        className="card flex cursor-pointer flex-col items-center gap-2 text-center"
      >
        <h3 className="text-xs font-bold tracking-wide text-navy-600 uppercase">Tú</h3>
        <span className="text-3xl">👤</span>
        <p className="font-display text-navy-900">{miPerfil.apodo || miPerfil.nombre}</p>
        <p className="text-xs text-navy-500">Toca para agregar a tu lista</p>
      </button>
      <button
        type="button"
        onClick={() => setVerDetalles(true)}
        className="card flex cursor-pointer flex-col items-center gap-2 text-center"
      >
        <h3 className="text-xs font-bold tracking-wide text-navy-600 uppercase">Tu misión</h3>
        <span className="text-3xl">👤</span>
        <p className="font-display text-navy-900">{perfilDestino?.apodo || perfilDestino?.nombre || '???'}</p>
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

      {verMiLista && (
        <MyWishlistModal eventoId={evento.id} usuarioId={miPerfil.id} onClose={() => setVerMiLista(false)} />
      )}
    </div>
  )
}
