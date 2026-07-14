import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { obtenerPreferencias, agregarDeseo } from '../../services/preferencias'
import { getErrorMessage } from '../../utils/helpers'

export function MyWishlistModal({
  eventoId,
  usuarioId,
  onClose,
}: {
  eventoId: string
  usuarioId: string
  onClose: () => void
}) {
  const [deseos, setDeseos] = useState<string[]>([])
  const [nuevoDeseo, setNuevoDeseo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    obtenerPreferencias(eventoId, usuarioId)
      .then((pref) => setDeseos(pref?.deseos ?? []))
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar tu lista')))
      .finally(() => setLoading(false))
  }, [eventoId, usuarioId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nuevoDeseo.trim()) return
    setSaving(true)
    setError(null)
    try {
      const actualizado = await agregarDeseo(eventoId, usuarioId, nuevoDeseo)
      setDeseos(actualizado.deseos)
      setNuevoDeseo('')
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo agregar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-lg bg-navy-900 p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-center font-display text-lg">Tu lista de deseos</h3>

        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-sm text-pale-sky-300">Cargando...</p>
          ) : deseos.length === 0 ? (
            <p className="text-sm text-pale-sky-300">Todavía no tienes ideas en tu lista.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {deseos.map((deseo, i) => (
                <li key={i} className="flex items-start gap-2 rounded-md bg-white/10 px-3 py-2 text-sm">
                  <span className="text-success">✔</span> {deseo}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoDeseo}
              onChange={(e) => setNuevoDeseo(e.target.value)}
              placeholder="Nueva idea de regalo"
              className="input-field flex-1"
            />
            <button type="submit" disabled={saving || !nuevoDeseo.trim()} className="btn-primary shrink-0">
              {saving ? '...' : '+ Agregar'}
            </button>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
        </form>

        <button type="button" className="btn-ghost mt-4 text-white" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
