import { supabase } from './supabase'
import type {
  EstadoCompraRegaloRobado,
  Evento,
  RegaloRobadoCompra,
  RegaloRobadoTurno,
  TurnoRuleta,
} from '../types/domain'

export interface EstadoCompraRegaloRobadoConUsuario {
  id: string
  evento_id: string
  usuario_id: string
  usuario_nombre: string
  estado: EstadoCompraRegaloRobado
  comprado_at: string | null
  created_at: string
  updated_at: string
}

export interface TurnoRegaloRobadoConUsuario extends RegaloRobadoTurno {
  usuario: { nombre: string } | null
}

export async function activarIntercambioRegaloRobado(eventoId: string): Promise<Evento> {
  const { data, error } = await supabase.rpc('activar_intercambio_regalo_robado', {
    p_evento_id: eventoId,
  })
  if (error) throw error
  return data
}

export async function listarEstadoComprasRegaloRobado(
  eventoId: string,
): Promise<EstadoCompraRegaloRobadoConUsuario[]> {
  const { data, error } = await supabase.rpc('listar_estado_compras_regalo_robado', {
    p_evento_id: eventoId,
  })
  if (error) throw error
  return (data ?? []).map((row) => ({
    ...row,
    estado: row.estado as EstadoCompraRegaloRobado,
  }))
}

export async function actualizarMiEstadoCompra(
  eventoId: string,
  estado: EstadoCompraRegaloRobado,
): Promise<RegaloRobadoCompra> {
  const { data, error } = await supabase.rpc('actualizar_mi_estado_compra_regalo_robado', {
    p_evento_id: eventoId,
    p_estado: estado,
  })
  if (error) throw error
  return data
}

export async function obtenerOrdenTurnosRegaloRobado(eventoId: string): Promise<TurnoRegaloRobadoConUsuario[]> {
  const { data, error } = await supabase
    .from('regalo_robado_turnos')
    .select('id, evento_id, usuario_id, orden, created_at, usuario:usuarios(nombre)')
    .eq('evento_id', eventoId)
    .order('orden')
  if (error) throw error
  return (data ?? []) as unknown as TurnoRegaloRobadoConUsuario[]
}

export async function obtenerTurnosRegaloRobado(eventoId: string): Promise<TurnoRuleta[]> {
  const { data, error } = await supabase
    .from('turnos_ruleta')
    .select('*')
    .eq('evento_id', eventoId)
    .order('numero_turno')
  if (error) throw error
  return data ?? []
}

export async function girarRuleta(eventoId: string): Promise<{ numeroTurno: number; numeroRuleta: number }> {
  const { data, error } = await supabase.rpc('girar_ruleta', { p_evento_id: eventoId })
  if (error) throw error
  const row = data?.[0]
  if (!row) throw new Error('No se pudo girar la ruleta')
  return { numeroTurno: row.numero_turno, numeroRuleta: row.numero_ruleta }
}

export async function resolverTurno(
  eventoId: string,
  numeroTurno: number,
  objetivoIds: string[] | null,
): Promise<TurnoRuleta> {
  const { data, error } = await supabase.rpc('resolver_turno_ruleta', {
    p_evento_id: eventoId,
    p_numero_turno: numeroTurno,
    p_objetivo_ids: objetivoIds ?? undefined,
  })
  if (error) throw error
  return data
}

export function calcularTurnoActual(
  ordenTurnos: TurnoRegaloRobadoConUsuario[],
  turnoActual: number,
): TurnoRegaloRobadoConUsuario | null {
  if (ordenTurnos.length === 0) return null
  return ordenTurnos[turnoActual % ordenTurnos.length] ?? null
}
