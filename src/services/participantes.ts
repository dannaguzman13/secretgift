import { supabase } from './supabase'

export interface ParticipanteConUsuario {
  id: string
  evento_id: string
  usuario_id: string
  rol: string
  estado: string
  created_at: string | null
  usuario: { nombre: string } | null
}

export interface ParticipanteUltraSecreto {
  id: string
  evento_id: string
  usuario_id: string
  rol: string
  estado: string
  created_at: string | null
  alias: string | null
}

export async function listarParticipantes(eventoId: string): Promise<ParticipanteConUsuario[]> {
  const { data, error } = await supabase
    .from('participantes')
    .select('id, evento_id, usuario_id, rol, estado, created_at, usuario:usuarios(nombre)')
    .eq('evento_id', eventoId)
  if (error) throw error
  return (data ?? []) as unknown as ParticipanteConUsuario[]
}

export async function listarParticipantesUltraSecreto(eventoId: string): Promise<ParticipanteUltraSecreto[]> {
  const { data, error } = await supabase.rpc('listar_participantes_ultra_secreto', {
    p_evento_id: eventoId,
  })
  if (error) throw error
  return (data ?? []) as ParticipanteUltraSecreto[]
}

export async function obtenerMiParticipacion(eventoId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('participantes')
    .select('*')
    .eq('evento_id', eventoId)
    .eq('usuario_id', user.id)
    .maybeSingle()
  if (error) throw error
  return data
}
