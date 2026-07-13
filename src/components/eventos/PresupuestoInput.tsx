import { MONEDAS_VALIDAS } from '../../utils/presupuesto'

export function PresupuestoInput({
  monto,
  moneda,
  onMontoChange,
  onMonedaChange,
}: {
  monto: string
  moneda: string
  onMontoChange: (valor: string) => void
  onMonedaChange: (valor: string) => void
}) {
  return (
    <div className="grid grid-cols-[2fr_1fr] gap-3">
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
          Presupuesto sugerido
        </label>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          value={monto}
          onChange={(e) => onMontoChange(e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">Moneda</label>
        <select value={moneda} onChange={(e) => onMonedaChange(e.target.value)} className="input-field">
          {MONEDAS_VALIDAS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
