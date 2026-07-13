import { supabase } from './supabase'
import type { PerfilCompleto, PerfilPublico, Usuario } from '../types/domain'
import type { CampoPerfilId } from '../utils/perfilCampos'

export async function obtenerMiPerfil(usuarioId: string): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', usuarioId)
    .single()
  if (error) throw error
  return data
}

export async function actualizarPerfil(
  usuarioId: string,
  perfil: { nombre: string; apodo: string | null; descripcion: string | null; perfil_completo: PerfilCompleto },
) {
  const { error } = await supabase.from('usuarios').update(perfil).eq('id', usuarioId)
  if (error) throw error
}

export async function obtenerPerfilUsuario(usuarioId: string): Promise<PerfilPublico | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('nombre, apodo, descripcion, perfil_completo')
    .eq('id', usuarioId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const perfilCompleto = data.perfil_completo as PerfilCompleto
  const camposActivos = perfilCompleto?.campos_activos ?? []
  const campos: Partial<Record<CampoPerfilId, string>> = {}
  for (const campoId of camposActivos) {
    const valor = perfilCompleto[campoId]
    if (valor) campos[campoId] = valor
  }

  return { nombre: data.nombre, apodo: data.apodo, descripcion: data.descripcion, campos }
}
