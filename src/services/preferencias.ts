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

export async function agregarDeseo(eventoId: string, usuarioId: string, nuevoDeseo: string): Promise<Preferencias> {
  const deseo = nuevoDeseo.trim()
  if (!deseo) throw new Error('El deseo no puede estar vacío')

  const actual = await obtenerPreferencias(eventoId, usuarioId)
  const deseos = [...(actual?.deseos ?? []), deseo]

  const { data, error } = await supabase
    .from('preferencias')
    .upsert(
      {
        evento_id: eventoId,
        usuario_id: usuarioId,
        deseos,
        restricciones: actual?.restricciones ?? null,
      },
      { onConflict: 'evento_id,usuario_id' },
    )
    .select()
    .single()
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
