export function validarFechaIntercambio(fechaIntercambioIso: string, fechaCompra: string): string | null {
  const ahora = new Date()
  const intercambio = new Date(fechaIntercambioIso)

  if (intercambio <= ahora) return 'La fecha del intercambio debe ser en el futuro'
  if (fechaCompra && fechaCompra > fechaIntercambioIso.slice(0, 10)) {
    return 'La fecha límite de compra debe ser antes o igual al intercambio'
  }
  return null
}

export function formatFechaIntercambio(fechaIntercambioIso: string): string {
  const fecha = new Date(fechaIntercambioIso)
  const fechaTexto = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const horaTexto = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${fechaTexto.charAt(0).toUpperCase()}${fechaTexto.slice(1)} - ${horaTexto} hrs`
}
