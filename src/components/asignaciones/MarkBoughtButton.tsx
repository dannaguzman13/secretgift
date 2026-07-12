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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setSaving(true)
    setError(null)
    try {
      await marcarComprado(asignacionId)
      onDone()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={saving}
        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : '✓ Ya compré'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
