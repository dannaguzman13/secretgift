import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { obtenerPreferencias, upsertPreferencias } from '../../services/preferencias'
import { getErrorMessage } from '../../utils/helpers'

export function WishlistForm({ eventoId }: { eventoId: string }) {
  const [deseos, setDeseos] = useState<string[]>(['', '', '', '', ''])
  const [restricciones, setRestricciones] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    obtenerPreferencias(eventoId)
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
  }, [eventoId])

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
      await upsertPreferencias(eventoId, deseos, restricciones)
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-slate-500">Cargando...</p>

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Ideas de regalos</label>
        <div className="flex flex-col gap-2">
          {deseos.map((deseo, i) => (
            <input
              key={i}
              type="text"
              value={deseo}
              onChange={(e) => updateDeseo(i, e.target.value)}
              placeholder={`Idea ${i + 1}`}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addDeseo}
          className="mt-2 text-sm font-medium text-slate-600 underline"
        >
          + Agregar otra idea
        </button>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Restricciones (tallas, colores, alergias...)
        </label>
        <textarea
          value={restricciones}
          onChange={(e) => {
            setRestricciones(e.target.value)
            setSaved(false)
          }}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
      </button>
    </form>
  )
}
