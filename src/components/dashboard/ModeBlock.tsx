import type { DashboardEventoData } from '../../services/dashboard'
import { AmigoSecretoModeBlock } from './AmigoSecretoModeBlock'
import { UltraSecretoModeBlock } from './UltraSecretoModeBlock'
import { RegaloRobadoModeBlock } from './RegaloRobadoModeBlock'

export function ModeBlock({ data }: { data: DashboardEventoData }) {
  switch (data.evento.modo) {
    case 'ultra_secreto':
      return <UltraSecretoModeBlock data={data} />
    case 'regalo_robado':
      return <RegaloRobadoModeBlock data={data} />
    default:
      return <AmigoSecretoModeBlock data={data} />
  }
}
