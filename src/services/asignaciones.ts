import { supabase } from './supabase'
import { obtenerPreferencias } from './preferencias'
import type { Asignacion } from '../types/domain'

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
  estado: string
  comprado_at: string | null
  comprador: { nombre: string; email: string } | null
}

export async function listarAsignacionesAdmin(eventoId: string): Promise<AsignacionConComprador[]> {
  const { data, error } = await supabase
    .from('asignaciones')
    .select('id, comprador_id, estado, comprado_at, comprador:usuarios!asignaciones_comprador_id_fkey(nombre, email)')
    .eq('evento_id', eventoId)
  if (error) throw error
  return (data ?? []) as unknown as AsignacionConComprador[]
}

export async function marcarComprado(asignacionId: string, nota?: string) {
  const { error } = await supabase
    .from('asignaciones')
    .update({ estado: 'comprado', comprado_at: new Date().toISOString(), nota_comprador: nota ?? null })
    .eq('id', asignacionId)
  if (error) throw error
}
