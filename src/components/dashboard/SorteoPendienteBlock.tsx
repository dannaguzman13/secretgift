import { Link } from 'react-router-dom'

export function SorteoPendienteBlock({ eventoId, mensaje }: { eventoId: string; mensaje: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-8 text-center">
      <span className="text-4xl">⏳</span>
      <p className="text-navy-700">{mensaje}</p>
      <Link to={`/eventos/${eventoId}`} className="btn-secondary text-sm">
        Gestionar evento
      </Link>
    </div>
  )
}
