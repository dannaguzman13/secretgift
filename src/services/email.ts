import { supabase } from './supabase'

export async function enviarInvitacionCompradores(params: {
  emails: string[]
  eventoNombre: string
  codigo: string
}) {
  const { error } = await supabase.functions.invoke('send-invitation', {
    body: {
      emails: params.emails,
      eventoNombre: params.eventoNombre,
      joinUrl: `${import.meta.env.VITE_APP_URL}/join/${params.codigo}`,
    },
  })
  if (error) throw error
}
