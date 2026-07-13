import { useEffect, useState } from 'react'
import { listarEstadoCompras } from '../../services/asignaciones'
import type { AsignacionConComprador } from '../../services/asignaciones'

export function BuyerStatusTable({ eventoId }: { eventoId: string }) {
  const [rows, setRows] = useState<AsignacionConComprador[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listarEstadoCompras(eventoId)
      .then(setRows)
      .finally(() => setLoading(false))
  }, [eventoId])

  if (loading) return <p className="text-navy-500">Cargando compradores...</p>
  if (rows.length === 0) return <p className="text-navy-500">Todavía no se unió ningún comprador.</p>

  return (
    <table className="card w-full text-left text-sm">
      <thead>
        <tr className="border-b border-pale-sky-200 text-xs font-bold tracking-wide text-navy-600 uppercase">
          <th className="pb-2">Comprador</th>
          <th className="pb-2">Estado</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b border-pale-sky-100 last:border-0">
            <td className="py-2 text-navy-900">{r.comprador?.nombre ?? r.comprador_id}</td>
            <td className="py-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  r.estado === 'comprado' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                }`}
              >
                {r.estado === 'comprado' ? 'Compró' : 'Pendiente'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
