import { supabase } from './supabase'

export interface ParticipanteConUsuario {
  id: string
  evento_id: string
  usuario_id: string
  rol: string
  estado: string
  usuario: { nombre: string; email: string } | null
}

export async function listarParticipantes(eventoId: string): Promise<ParticipanteConUsuario[]> {
  const { data, error } = await supabase
    .from('participantes')
    .select('id, evento_id, usuario_id, rol, estado, usuario:usuarios(nombre, email)')
    .eq('evento_id', eventoId)
  if (error) throw error
  return (data ?? []) as unknown as ParticipanteConUsuario[]
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
