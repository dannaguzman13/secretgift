import { useEffect, useState } from 'react'
import { listarAsignacionesAdmin } from '../../services/asignaciones'
import type { AsignacionConComprador } from '../../services/asignaciones'

export function BuyerStatusTable({ eventoId }: { eventoId: string }) {
  const [rows, setRows] = useState<AsignacionConComprador[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listarAsignacionesAdmin(eventoId)
      .then(setRows)
      .finally(() => setLoading(false))
  }, [eventoId])

  if (loading) return <p className="text-slate-500">Cargando compradores...</p>
  if (rows.length === 0) return <p className="text-slate-500">Todavía no se unió ningún comprador.</p>

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="py-2">Comprador</th>
          <th className="py-2">Estado</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b border-slate-100">
            <td className="py-2 text-slate-800">{r.comprador?.nombre ?? r.comprador_id}</td>
            <td className="py-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  r.estado === 'comprado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
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
