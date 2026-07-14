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
  const { data, error } = await supabase.rpc('listar_participantes_convencional', {
    p_evento_id: eventoId,
  })
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    evento_id: row.evento_id,
    usuario_id: row.usuario_id,
    rol: row.rol,
    estado: row.estado,
    created_at: row.created_at,
    usuario: { nombre: row.usuario_nombre },
  }))
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
