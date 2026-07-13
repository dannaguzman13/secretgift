import { useCountdown } from '../../utils/countdown'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

const URGENCIA_ESTILOS = {
  normal: 'border-pale-sky-200 bg-white',
  alerta: 'border-warning bg-warning-bg',
  urgente: 'border-error bg-error-bg',
} as const

function urgencia(dias: number): keyof typeof URGENCIA_ESTILOS {
  if (dias > 3) return 'normal'
  if (dias >= 1) return 'alerta'
  return 'urgente'
}

export function CountdownBlock({ fechaIntercambio }: { fechaIntercambio: string }) {
  const { dias, horas, minutos, vencido } = useCountdown(fechaIntercambio)

  if (vencido) {
    return (
      <div className="flex flex-col items-center gap-2 border-t border-pale-sky-200 pt-4">
        <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">Cuenta regresiva</p>
        <p className="text-sm font-bold text-navy-500">🎁 Intercambio en progreso</p>
      </div>
    )
  }

  const nivel = urgencia(dias)

  return (
    <div className="flex flex-col items-center gap-3 border-t border-pale-sky-200 pt-4">
      <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">
        Cuenta regresiva para el intercambio
      </p>
      <div className={`grid w-full max-w-sm grid-cols-3 gap-3 rounded-md border-2 p-2 ${URGENCIA_ESTILOS[nivel]}`}>
        {[
          { value: dias, label: 'DÍAS' },
          { value: horas, label: 'HORAS' },
          { value: minutos, label: 'MINUTOS' },
        ].map(({ value, label }) => (
          <div key={label} className="card flex flex-col items-center gap-1 py-4">
            <span className="font-display text-4xl text-coral-400">{pad(value)}</span>
            <span className="text-xs font-bold tracking-wide text-navy-500 uppercase">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
