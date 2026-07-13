import { useState } from 'react'
import { marcarComprado } from '../../services/asignaciones'
import { getErrorMessage } from '../../utils/helpers'

export function MarkBoughtButton({
  asignacionId,
  onDone,
}: {
  asignacionId: string
  onDone: () => void
}) {
  const [nota, setNota] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setSaving(true)
    setError(null)
    try {
      await marcarComprado(asignacionId, nota.trim() || undefined)
      onDone()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Nota opcional (ej. talla, color, dónde lo compraste)"
        className="input-field text-sm"
      />
      <button onClick={handleClick} disabled={saving} className="btn-success self-start">
        {saving ? 'Guardando...' : '✓ Ya compré'}
      </button>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
