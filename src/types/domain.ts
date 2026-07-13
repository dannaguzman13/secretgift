import type { Tables } from './database.types'
import type { CampoPerfilId } from '../utils/perfilCampos'

export type Usuario = Tables<'usuarios'>

export type PerfilCompleto = {
  campos_activos: CampoPerfilId[]
} & Partial<Record<CampoPerfilId, string>>

export type PerfilPublico = {
  nombre: string
  apodo: string | null
  descripcion: string | null
  campos: Partial<Record<CampoPerfilId, string>>
}
export type Evento = Tables<'eventos'>
export type Participante = Tables<'participantes'>
export type Preferencias = Tables<'preferencias'>
export type Asignacion = Tables<'asignaciones'>
export type Alias = Tables<'aliases'>
export type EstadoRegalo = Tables<'estado_regalos'>
export type TurnoRuleta = Tables<'turnos_ruleta'>
export type RegaloRobadoCompra = Tables<'regalo_robado_compras'>
export type RegaloRobadoTurno = Tables<'regalo_robado_turnos'>

export type ModoEvento = 'amigo_secreto' | 'ultra_secreto' | 'regalo_robado'
export type EventoStatus = 'registro_abierto' | 'ruleta_activa'
export type EstadoCompraRegaloRobado = 'pendiente' | 'comprado'

export type Universo =
  | 'marvel'
  | 'disney'
  | 'pokemon'
  | 'star_wars'
  | 'harry_potter'
  | 'mitologia'
  | 'animales'
  | 'flores'
  | 'planetas'
  | 'piedras_preciosas'
