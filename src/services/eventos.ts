import { supabase } from './supabase'
import type { Evento, ModoEvento, Universo } from '../types/domain'

function generateCodigo(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export interface CrearEventoInput {
  nombre: string
  presupuestoMonto: number
  presupuestoMoneda: string
  fechaCompra: string
  fechaIntercambio: string
  modo: ModoEvento
  universo?: Universo
  emoji?: string
  descripcion?: string
  tematica?: string
  restricciones?: string
  requisitos?: string
  recomendacion?: string
}

export async function crearEvento(input: CrearEventoInput) {
  let evento: Evento | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.rpc('crear_evento_con_admin', {
      p_nombre: input.nombre,
      p_presupuesto_monto: input.presupuestoMonto,
      p_presupuesto_moneda: input.presupuestoMoneda,
      p_fecha_compra: input.fechaCompra,
      p_fecha_intercambio: input.fechaIntercambio,
      p_codigo_acceso: generateCodigo(),
      p_modo: input.modo,
      p_universo: input.universo,
      p_emoji: input.emoji,
      p_descripcion: input.descripcion,
      p_tematica: input.tematica,
      p_restricciones: input.restricciones,
      p_requisitos: input.requisitos,
      p_recomendacion: input.recomendacion,
    })

    if (!error) {
      evento = data
      break
    }
    if (error.code !== '23505') throw error
  }
  if (!evento) throw new Error('No se pudo generar un código de acceso único')

  return { evento }
}

export async function obtenerMisEventos(): Promise<Evento[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const [{ data: adminEventos, error: adminError }, { data: participantRows, error: partError }] =
    await Promise.all([
      supabase.from('eventos').select('*').eq('admin_id', user.id),
      supabase.from('participantes').select('eventos(*)').eq('usuario_id', user.id),
    ])

  if (adminError) throw adminError
  if (partError) throw partError

  const participantEventos = (participantRows ?? [])
    .map((row) => row.eventos as unknown as Evento)
    .filter(Boolean)

  const merged = new Map<string, Evento>()
  for (const e of [...(adminEventos ?? []), ...participantEventos]) {
    merged.set(e.id, e)
  }

  return Array.from(merged.values()).sort((a, b) => a.fecha_compra.localeCompare(b.fecha_compra))
}

export async function getEventPreviewByCode(codigo: string) {
  const { data, error } = await supabase.rpc('get_event_preview_by_code', { p_codigo: codigo })
  if (error) throw error
  return data?.[0] ?? null
}

export async function joinEventByCode(codigo: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_event_by_code', { p_codigo: codigo })
  if (error) throw error
  return data
}

export async function realizarSorteo(eventoId: string): Promise<void> {
  const { error } = await supabase.rpc('realizar_sorteo', { p_evento_id: eventoId })
  if (error) throw error
}

export async function realizarSorteoUltraSecreto(eventoId: string, aliases: string[]): Promise<void> {
  const { error } = await supabase.rpc('realizar_sorteo_ultra_secreto', {
    p_evento_id: eventoId,
    p_aliases: aliases,
  })
  if (error) throw error
}

export async function obtenerEventoDetalle(eventoId: string): Promise<Evento> {
  const { data, error } = await supabase.from('eventos').select('*').eq('id', eventoId).single()
  if (error) throw error
  return data
}

export async function marcarEventoCompletado(eventoId: string) {
  const { error } = await supabase.from('eventos').update({ estado: 'completado' }).eq('id', eventoId)
  if (error) throw error
}

export interface ActualizarEventoInput {
  nombre?: string
  descripcion?: string | null
  presupuestoMonto?: number
  presupuestoMoneda?: string
  fechaCompra?: string
  fechaIntercambio?: string
}

export async function actualizarEvento(eventoId: string, input: ActualizarEventoInput): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .update({
      nombre: input.nombre,
      descripcion: input.descripcion,
      presupuesto_monto: input.presupuestoMonto,
      presupuesto_moneda: input.presupuestoMoneda,
      fecha_compra: input.fechaCompra,
      fecha_intercambio: input.fechaIntercambio,
    })
    .eq('id', eventoId)
    .select()
    .single()
  if (error) throw error
  return data
}
