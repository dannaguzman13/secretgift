import { useEffect, useState } from 'react'
import type { EstadoRegalo, TurnoRuleta } from '../../types/domain'
import type { ParticipanteConUsuario } from '../../services/participantes'
import {
  girarRuleta,
  resolverTurno,
  obtenerEstadoRegalos,
  obtenerTurnos,
  calcularTurnoActual,
} from '../../services/regaloRobado'
import { PersonSelectModal } from './PersonSelectModal'
import { GiftOwnershipGrid } from './GiftOwnershipGrid'
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
  const [estadoRegalos, setEstadoRegalos] = useState<EstadoRegalo[]>([])
  const [turnos, setTurnos] = useState<TurnoRuleta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [girando, setGirando] = useState(false)
  const [pendiente, setPendiente] = useState<{ numeroTurno: number; numeroRuleta: number } | null>(null)

  const jugadorEnTurno = calcularTurnoActual(participantes, turnoActual)
  const esMiTurno = jugadorEnTurno?.usuario_id === usuarioActualId

  function cargar() {
    setLoading(true)
    Promise.all([obtenerEstadoRegalos(eventoId), obtenerTurnos(eventoId)])
      .then(([regalos, t]) => {
        setEstadoRegalos(regalos)
        setTurnos(t)
      })
      .finally(() => setLoading(false))
  }

  useEffect(cargar, [eventoId, turnoActual])

  async function handleGirar() {
    setGirando(true)
    setError(null)
    try {
      const resultado = await girarRuleta(eventoId)
      if (resultado.numeroRuleta === 1 || resultado.numeroRuleta === 2) {
        await resolverTurno(eventoId, resultado.numeroTurno, null)
        cargar()
        await onTurnoResuelto()
      } else {
        setPendiente(resultado)
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
      cargar()
      await onTurnoResuelto()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo resolver el turno'))
    }
  }

  if (loading) return <p className="text-navy-500">Cargando juego...</p>

  const modalConfig =
    pendiente?.numeroRuleta === 3
      ? { min: 1, max: 1, title: 'Elige con quién intercambiar' }
      : pendiente?.numeroRuleta === 4
        ? { min: 2, max: 2, title: 'Elige 2 personas que intercambiarán regalos' }
        : pendiente?.numeroRuleta === 5
          ? { min: 3, max: undefined, title: 'Elige 3 o más personas para rotar sus regalos' }
          : null

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="card text-center">
        <p className="text-xs font-bold tracking-wide text-navy-600 uppercase">Turno de</p>
        <p className="font-display text-xl text-navy-900">{jugadorEnTurno?.usuario?.nombre ?? '—'}</p>
        {esMiTurno && !pendiente && (
          <button onClick={handleGirar} disabled={girando} className="btn-primary mt-4 w-full text-lg">
            {girando ? 'Girando...' : '🎡 Girar ruleta'}
          </button>
        )}
        {pendiente && (
          <p className="mt-4 text-sm text-navy-600">
            Salió {pendiente.numeroRuleta}: {RULETA_LABELS[pendiente.numeroRuleta]}
          </p>
        )}
        {!esMiTurno && !pendiente && <p className="mt-4 text-sm text-navy-500">Esperando a que gire...</p>}
      </div>

      <div>
        <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">Estado de los regalos</h2>
        <GiftOwnershipGrid estadoRegalos={estadoRegalos} participantes={participantes} />
      </div>

      <div>
        <h2 className="mb-2 text-xs font-bold tracking-wide text-navy-600 uppercase">Historial de turnos</h2>
        <TurnLog turnos={turnos} participantes={participantes} />
      </div>

      {pendiente && modalConfig && esMiTurno && (
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
