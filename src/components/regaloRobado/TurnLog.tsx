import type { TurnoRuleta } from '../../types/domain'
import type { ParticipanteConUsuario } from '../../services/participantes'

const ACCION_LABELS: Record<string, string> = {
  girar_derecha: 'giró la ruleta y todos los regalos rotaron a la derecha',
  girar_izquierda: 'giró la ruleta y todos los regalos rotaron a la izquierda',
  intercambiar: 'intercambió su regalo con otra persona',
  elegir_2: 'eligió a 2 personas para intercambiar sus regalos',
  cambios_multiples: 'hizo rotar los regalos entre 3 o más personas',
  pendiente: 'está decidiendo su jugada...',
}

export function TurnLog({
  turnos,
  participantes,
}: {
  turnos: TurnoRuleta[]
  participantes: ParticipanteConUsuario[]
}) {
  function nombreDe(usuarioId: string): string {
    return participantes.find((p) => p.usuario_id === usuarioId)?.usuario?.nombre ?? usuarioId
  }

  if (turnos.length === 0) {
    return <p className="text-navy-500">Todavía no hay turnos jugados.</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {[...turnos].reverse().map((t) => (
        <li key={t.id} className="card p-3 text-sm">
          <span className="font-bold">
            Turno {t.numero_turno} · {nombreDe(t.participante_id)}
          </span>{' '}
          (salió {t.numero_ruleta}) {ACCION_LABELS[t.accion] ?? t.accion}
        </li>
      ))}
    </ul>
  )
}
