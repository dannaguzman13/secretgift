import { useCountdown, formatFechaLarga } from '../../utils/countdown'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function CountdownBlock({ fechaCompra }: { fechaCompra: string }) {
  const { dias, horas, minutos, vencido } = useCountdown(fechaCompra)

  return (
    <div className="flex flex-col items-center gap-3 border-t border-pale-sky-200 pt-4">
      <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">
        Cuenta regresiva para el intercambio de regalos
      </p>
      <div className="grid w-full max-w-sm grid-cols-3 gap-3">
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
      <p className="text-sm text-navy-600">
        {vencido ? 'La fecha límite ya pasó' : `Compra tu regalo antes del ${formatFechaLarga(fechaCompra)}`}
      </p>
    </div>
  )
}
