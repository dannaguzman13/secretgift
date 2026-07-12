import { supabase } from './supabase'

export async function enviarInvitacionReceptor(params: {
  email: string
  eventoNombre: string
  token: string
}) {
  const { error } = await supabase.functions.invoke('send-receptor-invite', {
    body: {
      email: params.email,
      eventoNombre: params.eventoNombre,
      claimUrl: `${import.meta.env.VITE_APP_URL}/claim/${params.token}`,
    },
  })
  if (error) throw error
}

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
