import type { DashboardEventoData } from '../../services/dashboard'
import { AmigoSecretoModeBlock } from './AmigoSecretoModeBlock'
import { UltraSecretoModeBlock } from './UltraSecretoModeBlock'
import { RegaloRobadoModeBlock } from './RegaloRobadoModeBlock'
import type { Evento } from '../../types/domain'

export function ModeBlock({
  data,
  currentUserId,
  onRegaloRobadoActivado,
  onOpenRuleta,
}: {
  data: DashboardEventoData
  currentUserId: string
  onRegaloRobadoActivado: (evento: Evento) => void
  onOpenRuleta: () => void
}) {
  switch (data.evento.modo) {
    case 'ultra_secreto':
      return <UltraSecretoModeBlock data={data} />
    case 'regalo_robado':
      return (
        <RegaloRobadoModeBlock
          data={data}
          currentUserId={currentUserId}
          onActivado={onRegaloRobadoActivado}
          onOpenRuleta={onOpenRuleta}
        />
      )
    default:
      return <AmigoSecretoModeBlock data={data} />
  }
}
