import { useEffect, useState } from 'react'
import { obtenerPreferencias } from '../../services/preferencias'
import type { Preferencias } from '../../types/domain'

export function WishlistView({ eventoId, usuarioId }: { eventoId: string; usuarioId: string }) {
  const [pref, setPref] = useState<Preferencias | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obtenerPreferencias(eventoId, usuarioId)
      .then(setPref)
      .finally(() => setLoading(false))
  }, [eventoId, usuarioId])

  if (loading) return <p className="text-navy-500">Cargando lista de deseos...</p>
  if (!pref || pref.deseos.length === 0) {
    return <p className="text-navy-500">Todavía no registró su lista de deseos.</p>
  }

  return (
    <div>
      <ul className="list-disc pl-5 text-navy-700">
        {pref.deseos.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
      {pref.restricciones && (
        <p className="mt-3 text-sm text-navy-500">
          <span className="font-bold">Restricciones:</span> {pref.restricciones}
        </p>
      )}
    </div>
  )
}
