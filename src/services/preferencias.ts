import { supabase } from './supabase'
import type { Preferencias } from '../types/domain'

export async function obtenerPreferencias(eventoId: string, usuarioId: string): Promise<Preferencias | null> {
  const { data, error } = await supabase
    .from('preferencias')
    .select('*')
    .eq('evento_id', eventoId)
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertPreferencias(
  eventoId: string,
  usuarioId: string,
  deseos: string[],
  restricciones: string,
) {
  const { error } = await supabase.from('preferencias').upsert(
    {
      evento_id: eventoId,
      usuario_id: usuarioId,
      deseos: deseos.map((d) => d.trim()).filter(Boolean),
      restricciones: restricciones.trim() || null,
    },
    { onConflict: 'evento_id,usuario_id' },
  )
  if (error) throw error
}
