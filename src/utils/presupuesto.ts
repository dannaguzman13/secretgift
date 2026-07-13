export const MONEDAS_VALIDAS = ['COP', 'USD', 'EUR', 'MXN', 'ARS', 'BRL', 'CAD', 'GBP', 'JPY', 'CHF'] as const
export type Moneda = (typeof MONEDAS_VALIDAS)[number]

export function validarPresupuesto(monto: number, moneda: string): string | null {
  if (!(monto > 0)) return 'El presupuesto debe ser mayor a 0'
  if (!MONEDAS_VALIDAS.includes(moneda as Moneda)) return 'Selecciona una moneda válida'
  return null
}

export function formatearPresupuesto(monto: number, moneda: string): string {
  return `${moneda} ${new Intl.NumberFormat('es-CO').format(monto)}`
}
