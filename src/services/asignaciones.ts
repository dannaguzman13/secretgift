import { supabase } from './supabase'
import { obtenerPreferencias } from './preferencias'
import type { Asignacion } from '../types/domain'

export type EstadoCompra = 'pendiente' | 'comprado'

export async function obtenerMiAsignacion(eventoId: string): Promise<Asignacion | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('asignaciones')
    .select('*')
    .eq('evento_id', eventoId)
    .eq('comprador_id', user.id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function obtenerWishlistDeMiAsignado(eventoId: string, receptorId: string) {
  return obtenerPreferencias(eventoId, receptorId)
}

export interface AsignacionConComprador {
  id: string
  comprador_id: string
  estado: EstadoCompra
  comprado_at: string | null
  comprador: { nombre: string } | null
}

export async function listarEstadoCompras(eventoId: string): Promise<AsignacionConComprador[]> {
  const { data, error } = await supabase.rpc('listar_estado_compras', { p_evento_id: eventoId })
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    comprador_id: row.comprador_id,
    estado: row.estado as EstadoCompra,
    comprado_at: row.comprado_at,
    comprador: { nombre: row.comprador_nombre },
  }))
}

export async function actualizarMiEstadoCompraAsignacion(
  eventoId: string,
  estado: EstadoCompra,
): Promise<Asignacion> {
  const { data, error } = await supabase.rpc('actualizar_mi_estado_compra', {
    p_evento_id: eventoId,
    p_estado: estado,
  })
  if (error) throw error
  return data
}

export async function marcarComprado(asignacionId: string, nota?: string) {
  const { error } = await supabase
    .from('asignaciones')
    .update({ estado: 'comprado', comprado_at: new Date().toISOString(), nota_comprador: nota ?? null })
    .eq('id', asignacionId)
  if (error) throw error
}
