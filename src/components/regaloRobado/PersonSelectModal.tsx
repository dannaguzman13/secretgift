import { useState } from 'react'
import type { ParticipanteConUsuario } from '../../services/participantes'

export function PersonSelectModal({
  participantes,
  excluirUsuarioId,
  minSelect,
  maxSelect,
  title,
  onConfirm,
  onCancel,
}: {
  participantes: ParticipanteConUsuario[]
  excluirUsuarioId?: string
  minSelect: number
  maxSelect?: number
  title: string
  onConfirm: (usuarioIds: string[]) => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const opciones = participantes.filter((p) => p.usuario_id !== excluirUsuarioId)

  function toggle(usuarioId: string) {
    setSelected((prev) => {
      if (prev.includes(usuarioId)) return prev.filter((id) => id !== usuarioId)
      if (maxSelect && prev.length >= maxSelect) return prev
      return [...prev, usuarioId]
    })
  }

  const puedeConfirmar = selected.length >= minSelect && (!maxSelect || selected.length <= maxSelect)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4">
      <div className="card w-full max-w-sm">
        <h3 className="mb-1 font-display text-lg text-navy-900">{title}</h3>
        <p className="mb-4 text-xs text-navy-500">
          {maxSelect ? `Elige ${minSelect === maxSelect ? minSelect : `${minSelect}-${maxSelect}`}` : `Elige ${minSelect} o más`}
        </p>
        <div className="mb-4 flex max-h-64 flex-col gap-2 overflow-y-auto">
          {opciones.map((p) => {
            const isSelected = selected.includes(p.usuario_id)
            return (
              <button
                key={p.usuario_id}
                type="button"
                onClick={() => toggle(p.usuario_id)}
                className={`rounded-md border-2 px-3 py-2 text-left transition-colors ${
                  isSelected ? 'border-coral-400 bg-coral-50' : 'border-pale-sky-300 bg-white'
                }`}
              >
                {p.usuario?.nombre ?? p.usuario_id}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={!puedeConfirmar}
            onClick={() => onConfirm(selected)}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
