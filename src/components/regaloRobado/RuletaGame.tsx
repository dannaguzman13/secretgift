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

const SLICE_COLORS = [
  'var(--color-coral-400)',
  'var(--color-sky-400)',
  'var(--color-peach-300)',
  'var(--color-warning)',
  'var(--color-success)',
]

const WHEEL_CX = 100
const WHEEL_CY = 100
const WHEEL_R = 90
const LABEL_R = 58
const DURACION_GIRO_MS = 3200

function puntoPolar(angoDeg: number, radio: number) {
  const rad = (angoDeg * Math.PI) / 180
  return { x: WHEEL_CX + radio * Math.sin(rad), y: WHEEL_CY - radio * Math.cos(rad) }
}

function anguloCentroGajo(numero: number) {
  return (numero - 1) * 72 + 36
}

const GAJOS = SLICE_COLORS.map((color, idx) => {
  const numero = idx + 1
  const inicio = idx * 72
  const fin = inicio + 72
  const p1 = puntoPolar(inicio, WHEEL_R)
  const p2 = puntoPolar(fin, WHEEL_R)
  const label = puntoPolar(inicio + 36, LABEL_R)
  return {
    numero,
    color,
    path: `M ${WHEEL_CX} ${WHEEL_CY} L ${p1.x} ${p1.y} A ${WHEEL_R} ${WHEEL_R} 0 0 1 ${p2.x} ${p2.y} Z`,
    labelX: label.x,
    labelY: label.y,
  }
})

function calcularRotacionFinal(rotacionActual: number, numeroFinal: number) {
  const vueltasMin = rotacionActual + 5 * 360
  const deseado = ((360 - anguloCentroGajo(numeroFinal)) % 360 + 360) % 360
  const restante = ((vueltasMin % 360) + 360) % 360
  let diff = deseado - restante
  if (diff < 0) diff += 360
  return vueltasMin + diff
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
  const [rotacion, setRotacion] = useState(0)
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

  async function handleGirar() {
    setGirando(true)
    setError(null)
    try {
      const resultado = await girarRuleta(eventoId)
      setRotacion((actual) => calcularRotacionFinal(actual, resultado.numeroRuleta))
      await new Promise((resolve) => setTimeout(resolve, DURACION_GIRO_MS))
      await resolverTurno(eventoId, resultado.numeroTurno, null)
      setResultadoReciente(resultado.numeroRuleta)
      await cargar()
      await onTurnoResuelto()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo girar la ruleta'))
    } finally {
      setGirando(false)
    }
  }

  if (loading) return <p className="text-navy-500">Cargando ruleta...</p>

  return (
    <div className="flex flex-col gap-5">
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="rounded-lg border-2 border-pale-sky-200 bg-white p-4 text-center">
        <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">Turno de</p>
        <p className="font-display text-xl text-navy-900">{jugadorEnTurno?.usuario?.nombre ?? '—'}</p>

        <div className="relative mx-auto mt-4 w-52 max-w-full">
          <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 -translate-y-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-navy-800" />
          <div
            className="drop-shadow-md"
            style={{
              transform: `rotate(${rotacion}deg)`,
              transition: `transform ${DURACION_GIRO_MS}ms var(--ease-wheel)`,
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full">
              {GAJOS.map((gajo) => (
                <path key={gajo.numero} d={gajo.path} fill={gajo.color} stroke="white" strokeWidth={2} />
              ))}
              {GAJOS.map((gajo) => (
                <text
                  key={`label-${gajo.numero}`}
                  x={gajo.labelX}
                  y={gajo.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-display)"
                  fontSize={22}
                  fill="var(--color-navy-900)"
                >
                  {gajo.numero}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {girando && <p className="mt-4 text-sm text-navy-500">Girando...</p>}

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
