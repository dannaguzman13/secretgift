import { useCallback, useEffect, useState } from 'react'
import type { TurnoRuleta } from '../../types/domain'
import type { ParticipanteConUsuario } from '../../services/participantes'
import {
  calcularTurnoActual,
  girarRuleta,
  obtenerOrdenTurnosRegaloRobado,
  obtenerTurnosRegaloRobado,
  resolverTurno,
} from '../../services/regaloRobado'
import type { TurnoRegaloRobadoConUsuario } from '../../services/regaloRobado'
import { TurnLog } from './TurnLog'
import { getErrorMessage } from '../../utils/helpers'

const RULETA_LABELS: Record<number, string> = {
  1: 'Todos los regalos giran a la derecha',
  2: 'Todos los regalos giran a la izquierda',
  3: 'Intercambia tu regalo con 1 persona',
  4: 'Elige 2 personas para que intercambien sus regalos',
  5: 'Elige 3 o más personas para rotar sus regalos',
}

export function RuletaGame({
  eventoId,
  participantes,
  turnoActual,
  usuarioActualId,
  onTurnoResuelto,
}: {
  eventoId: string
  participantes: ParticipanteConUsuario[]
  turnoActual: number
  usuarioActualId: string
  onTurnoResuelto: () => Promise<void> | void
}) {
  const [ordenTurnos, setOrdenTurnos] = useState<TurnoRegaloRobadoConUsuario[]>([])
  const [turnos, setTurnos] = useState<TurnoRuleta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [girando, setGirando] = useState(false)
  const [numeroAnimado, setNumeroAnimado] = useState<number | null>(null)
  const [resultadoReciente, setResultadoReciente] = useState<number | null>(null)

  const jugadorEnTurno = calcularTurnoActual(ordenTurnos, turnoActual)
  const esMiTurno = jugadorEnTurno?.usuario_id === usuarioActualId

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const [orden, historial] = await Promise.all([
        obtenerOrdenTurnosRegaloRobado(eventoId),
        obtenerTurnosRegaloRobado(eventoId),
      ])
      setOrdenTurnos(orden)
      setTurnos(historial)

      const turnoPendienteMio = historial.find(
        (turno) => turno.accion === 'pendiente' && turno.participante_id === usuarioActualId,
      )
      if (turnoPendienteMio) {
        try {
          await resolverTurno(eventoId, turnoPendienteMio.numero_turno, null)
          const historialActualizado = await obtenerTurnosRegaloRobado(eventoId)
          setTurnos(historialActualizado)
        } catch {
          // se resolverá en el próximo intento de carga
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cargar la ruleta'))
    } finally {
      setLoading(false)
    }
  }, [eventoId, usuarioActualId])

  useEffect(() => {
    cargar()
  }, [cargar, turnoActual])

  async function animarRuleta(numeroFinal: number) {
    const delays = [70, 70, 80, 90, 110, 130, 160, 200, 250, 310, 380]
    let actual = Math.floor(Math.random() * 5) + 1
    for (let i = 0; i < delays.length; i++) {
      actual = i === delays.length - 1 ? numeroFinal : (actual % 5) + 1
      setNumeroAnimado(actual)
      await new Promise((resolve) => setTimeout(resolve, delays[i]))
    }
  }

  async function handleGirar() {
    setGirando(true)
    setError(null)
    try {
      const resultado = await girarRuleta(eventoId)
      await animarRuleta(resultado.numeroRuleta)
      await resolverTurno(eventoId, resultado.numeroTurno, null)
      setResultadoReciente(resultado.numeroRuleta)
      await cargar()
      await onTurnoResuelto()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo girar la ruleta'))
    } finally {
      setGirando(false)
      setNumeroAnimado(null)
    }
  }

  if (loading) return <p className="text-navy-500">Cargando ruleta...</p>

  return (
    <div className="flex flex-col gap-5">
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="rounded-lg border-2 border-pale-sky-200 bg-white p-4 text-center">
        <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">Turno de</p>
        <p className="font-display text-xl text-navy-900">{jugadorEnTurno?.usuario?.nombre ?? '—'}</p>

        {girando && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div
              key={numeroAnimado}
              className="animate-roulette-tick flex h-20 w-20 items-center justify-center rounded-full border-4 border-coral-400 bg-pale-sky-50 font-display text-4xl text-navy-900"
            >
              {numeroAnimado ?? '—'}
            </div>
            <p className="text-sm text-navy-500">Girando...</p>
          </div>
        )}

        {!girando && resultadoReciente !== null && (
          <div className="mt-4 flex flex-col gap-2 text-sm text-navy-600">
            <p>
              Salió {resultadoReciente}: {RULETA_LABELS[resultadoReciente]}
            </p>
            <p>Realiza esta acción con los regalos físicos en la reunión.</p>
            <button
              type="button"
              className="btn-secondary mt-2"
              onClick={() => setResultadoReciente(null)}
            >
              Entendido
            </button>
          </div>
        )}

        {esMiTurno && !girando && resultadoReciente === null && (
          <button onClick={handleGirar} disabled={girando} className="btn-primary mt-4 w-full text-lg">
            🎡 Girar ruleta
          </button>
        )}

        {!esMiTurno && !girando && resultadoReciente === null && (
          <p className="mt-4 text-sm text-navy-500">Esperando a que gire...</p>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">Orden de turnos</h2>
        <ol className="grid gap-2 sm:grid-cols-2">
          {ordenTurnos.map((turno) => (
            <li
              key={turno.id}
              className={`rounded-md border-2 px-3 py-2 text-sm ${
                turno.usuario_id === jugadorEnTurno?.usuario_id
                  ? 'border-coral-400 bg-coral-50 text-navy-900'
                  : 'border-pale-sky-200 bg-white text-navy-600'
              }`}
            >
              <span className="font-bold">{turno.orden + 1}.</span> {turno.usuario?.nombre ?? turno.usuario_id}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">Historial de turnos</h2>
        <TurnLog turnos={turnos} participantes={participantes} />
      </div>
    </div>
  )
}
