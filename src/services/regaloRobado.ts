import { supabase } from './supabase'
import type { EstadoRegalo, TurnoRuleta } from '../types/domain'
import type { ParticipanteConUsuario } from './participantes'

export async function iniciarJuego(eventoId: string): Promise<void> {
  const { error } = await supabase.rpc('iniciar_juego_regalo_robado', { p_evento_id: eventoId })
  if (error) throw error
}

export async function obtenerEstadoRegalos(eventoId: string): Promise<EstadoRegalo[]> {
  const { data, error } = await supabase
    .from('estado_regalos')
    .select('*')
    .eq('evento_id', eventoId)
    .order('regalo_numero')
  if (error) throw error
  return data ?? []
}

export async function obtenerTurnos(eventoId: string): Promise<TurnoRuleta[]> {
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
  participantes: ParticipanteConUsuario[],
  turnoActual: number,
): ParticipanteConUsuario | null {
  if (participantes.length === 0) return null
  const ordenados = [...participantes].sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
  return ordenados[turnoActual % ordenados.length]
}
