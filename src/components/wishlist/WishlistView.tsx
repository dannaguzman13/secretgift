import { useEffect, useState } from 'react'
import { obtenerPreferencias } from '../../services/preferencias'
import type { Preferencias } from '../../types/domain'

export function WishlistView({ eventoId }: { eventoId: string }) {
  const [pref, setPref] = useState<Preferencias | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obtenerPreferencias(eventoId)
      .then(setPref)
      .finally(() => setLoading(false))
  }, [eventoId])

  if (loading) return <p className="text-slate-500">Cargando lista de deseos...</p>
  if (!pref || pref.deseos.length === 0) {
    return <p className="text-slate-500">El receptor todavía no registró su lista de deseos.</p>
  }

  return (
    <div>
      <ul className="list-disc pl-5 text-slate-700">
        {pref.deseos.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
      {pref.restricciones && (
        <p className="mt-3 text-sm text-slate-500">
          <span className="font-medium">Restricciones:</span> {pref.restricciones}
        </p>
      )}
    </div>
  )
}
