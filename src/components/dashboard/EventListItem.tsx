import type { Evento } from '../../types/domain'
import { MODOS } from '../../utils/gameModes'

export function EventListItem({
  evento,
  selected,
  onClick,
}: {
  evento: Evento
  selected: boolean
  onClick: () => void
}) {
  const emoji = evento.emoji || MODOS.find((m) => m.value === evento.modo)?.emoji || '🎁'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-selected={selected}
      className={`flex w-full items-center gap-2 rounded-md border-2 px-3 py-2 text-left transition-colors ${
        selected ? 'border-coral-400 bg-coral-50' : 'border-transparent bg-white hover:border-coral-200'
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm text-navy-900">{evento.nombre}</span>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
            evento.estado === 'completado'
              ? 'bg-navy-100 text-navy-600'
              : evento.estado === 'cancelado'
                ? 'bg-error-bg text-error'
                : 'bg-info-bg text-info'
          }`}
        >
          {evento.estado}
        </span>
      </span>
    </button>
  )
}
