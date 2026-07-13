import { useEffect, useState } from 'react'

const UPDATE_INTERVAL_MS = 30_000

export interface Countdown {
  dias: number
  horas: number
  minutos: number
  vencido: boolean
}

function calcularCountdown(targetDateIso: string): Countdown {
  const targetMs = /^\d{4}-\d{2}-\d{2}$/.test(targetDateIso)
    ? new Date(`${targetDateIso}T23:59:59`).getTime()
    : new Date(targetDateIso).getTime()
  const diffMs = targetMs - Date.now()
  if (diffMs <= 0) return { dias: 0, horas: 0, minutos: 0, vencido: true }

  const totalMinutos = Math.floor(diffMs / 60_000)
  return {
    dias: Math.floor(totalMinutos / (60 * 24)),
    horas: Math.floor((totalMinutos / 60) % 24),
    minutos: totalMinutos % 60,
    vencido: false,
  }
}

export function useCountdown(targetDateIso: string): Countdown {
  const [countdown, setCountdown] = useState(() => calcularCountdown(targetDateIso))

  useEffect(() => {
    setCountdown(calcularCountdown(targetDateIso))
    const interval = setInterval(() => setCountdown(calcularCountdown(targetDateIso)), UPDATE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [targetDateIso])

  return countdown
}

export function formatFechaLarga(fechaIso: string): string {
  return new Date(`${fechaIso}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
