import { supabase } from './supabase'
import { enviarInvitacionReceptor } from './email'
import type { Evento } from '../types/domain'

function generateCodigo(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export interface CrearEventoInput {
  nombre: string
  presupuesto: number
  receptorNombre: string
  receptorEmail: string
  fechaCompra: string
  fechaRevelacion: string
}

export async function crearEvento(input: CrearEventoInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  let evento: Evento | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from('eventos')
      .insert({
        admin_id: user.id,
        nombre: input.nombre,
        presupuesto: input.presupuesto,
        receptor_nombre: input.receptorNombre,
        receptor_email: input.receptorEmail,
        fecha_compra: input.fechaCompra,
        fecha_revelacion: input.fechaRevelacion,
        codigo_acceso: generateCodigo(),
      })
      .select()
      .single()

    if (!error) {
      evento = data
      break
    }
    if (error.code !== '23505') throw error
  }
  if (!evento) throw new Error('No se pudo generar un código de acceso único')

  const { data: tokenRow, error: tokenError } = await supabase
    .from('eventos_receptor_tokens')
    .insert({ evento_id: evento.id })
    .select('token')
    .single()
  if (tokenError) throw tokenError

  try {
    await enviarInvitacionReceptor({
      email: input.receptorEmail,
      eventoNombre: input.nombre,
      token: tokenRow.token,
    })
  } catch (err) {
    console.warn('No se pudo enviar el email de invitación al receptor', err)
  }

  return { evento, receptorToken: tokenRow.token }
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

export async function getEventPreviewByToken(token: string) {
  const { data, error } = await supabase.rpc('get_event_preview_by_token', { p_token: token })
  if (error) throw error
  return data?.[0] ?? null
}

export async function joinEventByCode(codigo: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_event_by_code', { p_codigo: codigo })
  if (error) throw error
  return data
}

export async function claimReceptor(token: string): Promise<string> {
  const { data, error } = await supabase.rpc('claim_receptor', { p_token: token })
  if (error) throw error
  return data
}

export async function obtenerEventoDetalle(eventoId: string): Promise<Evento> {
  const { data, error } = await supabase.from('eventos').select('*').eq('id', eventoId).single()
  if (error) throw error
  return data
}

export async function obtenerReceptorToken(eventoId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('eventos_receptor_tokens')
    .select('token')
    .eq('evento_id', eventoId)
    .maybeSingle()
  if (error) throw error
  return data?.token ?? null
}

export async function marcarEventoCompletado(eventoId: string) {
  const { error } = await supabase.from('eventos').update({ estado: 'completado' }).eq('id', eventoId)
  if (error) throw error
}
