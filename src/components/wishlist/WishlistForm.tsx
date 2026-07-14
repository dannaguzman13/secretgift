import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { obtenerPreferencias, upsertPreferencias } from '../../services/preferencias'
import { getErrorMessage } from '../../utils/helpers'

export function WishlistForm({ eventoId, usuarioId }: { eventoId: string; usuarioId: string }) {
  const [deseos, setDeseos] = useState<string[]>(['', '', '', '', ''])
  const [restricciones, setRestricciones] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    obtenerPreferencias(eventoId, usuarioId)
      .then((pref) => {
        if (pref && pref.deseos.length > 0) {
          const filled = [...pref.deseos]
          while (filled.length < 5) filled.push('')
          setDeseos(filled)
          setRestricciones(pref.restricciones ?? '')
        }
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar')))
      .finally(() => setLoading(false))
  }, [eventoId, usuarioId])

  function updateDeseo(index: number, value: string) {
    setDeseos((prev) => prev.map((d, i) => (i === index ? value : d)))
    setSaved(false)
  }

  function addDeseo() {
    setDeseos((prev) => [...prev, ''])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await upsertPreferencias(eventoId, usuarioId, deseos, restricciones)
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-navy-500">Cargando...</p>

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
          Ideas de regalos
        </label>
        <div className="flex flex-col gap-2">
          {deseos.map((deseo, i) => (
            <input
              key={i}
              type="text"
              value={deseo}
              onChange={(e) => updateDeseo(i, e.target.value)}
              placeholder={`Idea ${i + 1}`}
              className="input-field"
            />
          ))}
        </div>
        <button type="button" onClick={addDeseo} className="mt-2 text-sm font-bold text-sky-600 hover:text-sky-700">
          + Agregar otra idea
        </button>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
          Restricciones (tallas, colores, alergias...)
        </label>
        <textarea
          value={restricciones}
          onChange={(e) => {
            setRestricciones(e.target.value)
            setSaved(false)
          }}
          rows={3}
          className="input-field"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
      </button>
      {saved && (
        <Link to="/dashboard" className="btn-ghost text-center">
          Ir al Dashboard
        </Link>
      )}
    </form>
  )
}
