import type { Tables } from './database.types'

export type Usuario = Tables<'usuarios'>
export type Evento = Tables<'eventos'>
export type Participante = Tables<'participantes'>
export type Preferencias = Tables<'preferencias'>
export type Asignacion = Tables<'asignaciones'>
export type Alias = Tables<'aliases'>
export type EstadoRegalo = Tables<'estado_regalos'>
export type TurnoRuleta = Tables<'turnos_ruleta'>

export type ModoEvento = 'amigo_secreto' | 'ultra_secreto' | 'regalo_robado'

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
