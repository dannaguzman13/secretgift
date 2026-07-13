import type { DashboardEventoData } from '../../services/dashboard'
import { WishlistColumn } from './WishlistColumn'
import { SorteoPendienteBlock } from './SorteoPendienteBlock'

export function AmigoSecretoModeBlock({ data }: { data: DashboardEventoData }) {
  const { evento, miPerfil, miAsignacion, perfilDestino, wishlistDestino } = data

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
      <div className="card flex flex-col items-center gap-2 text-center">
        <h3 className="text-xs font-bold tracking-wide text-navy-600 uppercase">Tú</h3>
        <span className="text-3xl">👤</span>
        <p className="font-display text-navy-900">{miPerfil.apodo || miPerfil.nombre}</p>
      </div>
      <div className="card flex flex-col items-center gap-2 text-center">
        <h3 className="text-xs font-bold tracking-wide text-navy-600 uppercase">Tu misión</h3>
        <span className="text-3xl">👤</span>
        <p className="font-display text-navy-900">{perfilDestino?.apodo || perfilDestino?.nombre || '???'}</p>
      </div>
      <div className="card flex flex-col gap-2">
        <h3 className="text-center text-xs font-bold tracking-wide text-navy-600 uppercase">Lista de deseos</h3>
        <WishlistColumn wishlist={wishlistDestino} />
      </div>
    </div>
  )
}
