import { supabase } from './supabase'
import type { Alias } from '../types/domain'

export async function obtenerMiAlias(eventoId: string): Promise<Alias | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('aliases')
    .select('*')
    .eq('evento_id', eventoId)
    .eq('usuario_id', user.id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function obtenerAliasDeUsuario(eventoId: string, usuarioId: string): Promise<Alias | null> {
  const { data, error } = await supabase
    .from('aliases')
    .select('*')
    .eq('evento_id', eventoId)
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function listarAliases(eventoId: string): Promise<Alias[]> {
  const { data, error } = await supabase.from('aliases').select('*').eq('evento_id', eventoId)
  if (error) throw error
  return data ?? []
}
