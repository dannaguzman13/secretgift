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
import { PersonSelectModal } from './PersonSelectModal'
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
  const [pendiente, setPendiente] = useState<{ numeroTurno: number; numeroRuleta: number; participanteId: string } | null>(null)

  const jugadorEnTurno = calcularTurnoActual(ordenTurnos, turnoActual)
  const esMiTurno = jugadorEnTurno?.usuario_id === usuarioActualId
  const pendienteEsMio = pendiente?.participanteId === usuarioActualId

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const [orden, historial] = await Promise.all([
        obtenerOrdenTurnosRegaloRobado(eventoId),
        obtenerTurnosRegaloRobado(eventoId),
      ])
      const turnoPendiente = historial.find((turno) => turno.accion === 'pendiente')
      setOrdenTurnos(orden)
      setTurnos(historial)
      setPendiente(
        turnoPendiente
          ? {
              numeroTurno: turnoPendiente.numero_turno,
              numeroRuleta: turnoPendiente.numero_ruleta,
              participanteId: turnoPendiente.participante_id,
            }
          : null,
      )
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cargar la ruleta'))
    } finally {
      setLoading(false)
    }
  }, [eventoId])

  useEffect(() => {
    cargar()
  }, [cargar, turnoActual])

  async function handleGirar() {
    setGirando(true)
    setError(null)
    try {
      const resultado = await girarRuleta(eventoId)
      const nuevoPendiente = {
        numeroTurno: resultado.numeroTurno,
        numeroRuleta: resultado.numeroRuleta,
        participanteId: usuarioActualId,
      }

      if (resultado.numeroRuleta === 1 || resultado.numeroRuleta === 2) {
        await resolverTurno(eventoId, resultado.numeroTurno, null)
        await cargar()
        await onTurnoResuelto()
      } else {
        setPendiente(nuevoPendiente)
        await cargar()
      }
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo girar la ruleta'))
    } finally {
      setGirando(false)
    }
  }

  async function handleConfirmarObjetivos(usuarioIds: string[]) {
    if (!pendiente) return
    setError(null)
    try {
      await resolverTurno(eventoId, pendiente.numeroTurno, usuarioIds)
      setPendiente(null)
      await cargar()
      await onTurnoResuelto()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo resolver el turno'))
    }
  }

  if (loading) return <p className="text-navy-500">Cargando ruleta...</p>

  const modalConfig =
    pendiente?.numeroRuleta === 3
      ? { min: 1, max: 1, title: 'Elige con quién intercambiar' }
      : pendiente?.numeroRuleta === 4
        ? { min: 2, max: 2, title: 'Elige 2 personas que intercambiarán regalos' }
        : pendiente?.numeroRuleta === 5
          ? { min: 3, max: undefined, title: 'Elige 3 o más personas para rotar sus regalos' }
          : null

  return (
    <div className="flex flex-col gap-5">
      {error && <p className="text-sm text-error">{error}</p>}

      <div className="rounded-lg border-2 border-pale-sky-200 bg-white p-4 text-center">
        <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">Turno de</p>
        <p className="font-display text-xl text-navy-900">{jugadorEnTurno?.usuario?.nombre ?? '—'}</p>

        {esMiTurno && !pendiente && (
          <button onClick={handleGirar} disabled={girando} className="btn-primary mt-4 w-full text-lg">
            {girando ? 'Girando...' : '🎡 Girar ruleta'}
          </button>
        )}

        {pendiente && (
          <div className="mt-4 flex flex-col gap-2 text-sm text-navy-600">
            <p>
              Salió {pendiente.numeroRuleta}: {RULETA_LABELS[pendiente.numeroRuleta]}
            </p>
            <p>Realiza esta acción con los regalos físicos en la reunión.</p>
          </div>
        )}

        {!esMiTurno && !pendiente && <p className="mt-4 text-sm text-navy-500">Esperando a que gire...</p>}
        {pendiente && !pendienteEsMio && (
          <p className="mt-4 text-sm text-navy-500">Esperando a que se confirme la acción...</p>
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

      {pendiente && modalConfig && pendienteEsMio && (
        <PersonSelectModal
          participantes={participantes}
          excluirUsuarioId={pendiente.numeroRuleta === 3 ? usuarioActualId : undefined}
          minSelect={modalConfig.min}
          maxSelect={modalConfig.max}
          title={modalConfig.title}
          onConfirm={handleConfirmarObjetivos}
          onCancel={() => setPendiente(null)}
        />
      )}
    </div>
  )
}
