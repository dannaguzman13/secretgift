import { UNIVERSOS, UNIVERSO_LABELS } from '../../utils/aliasData'
import type { Universo } from '../../types/domain'

const UNIVERSO_KEYS = Object.keys(UNIVERSO_LABELS) as Universo[]

export function UniversoSelector({
  value,
  onChange,
}: {
  value: Universo | null
  onChange: (universo: Universo) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {UNIVERSO_KEYS.map((universo) => {
        const selected = value === universo
        const preview = UNIVERSOS[universo].slice(0, 2).join(', ')
        return (
          <button
            key={universo}
            type="button"
            onClick={() => onChange(universo)}
            className={`rounded-md border-2 p-3 text-left transition-colors ${
              selected
                ? 'border-sky-500 bg-sky-50'
                : 'border-pale-sky-300 bg-white hover:border-sky-300'
            }`}
          >
            <p className="font-bold text-navy-900">{UNIVERSO_LABELS[universo]}</p>
            <p className="text-xs text-navy-500">{preview}...</p>
          </button>
        )
      })}
    </div>
  )
}
