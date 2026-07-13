import { obtenerEventoDetalle } from './eventos'
import { listarParticipantes, listarParticipantesUltraSecreto } from './participantes'
import type { ParticipanteConUsuario, ParticipanteUltraSecreto } from './participantes'
import { obtenerMiAsignacion, listarEstadoCompras } from './asignaciones'
import type { AsignacionConComprador } from './asignaciones'
import { obtenerPreferencias } from './preferencias'
import { obtenerMiAlias, obtenerAliasDeUsuario } from './aliases'
import { obtenerMiPerfil, obtenerPerfilUsuario } from './perfil'
import type { Evento, Asignacion, Alias, Preferencias, Usuario, PerfilPublico } from '../types/domain'

export interface DashboardEventoData {
  evento: Evento
  miPerfil: Usuario
  participantes: ParticipanteConUsuario[] | ParticipanteUltraSecreto[]
  participantesCount: number
  sorteoRealizado: boolean
  miAsignacion: Asignacion | null
  estadoCompras: AsignacionConComprador[]
  wishlistDestino: Preferencias | null
  perfilDestino: PerfilPublico | null
  miAliasPropio: Alias | null
  aliasDestino: Alias | null
}

export async function obtenerDashboardEvento(eventoId: string, userId: string): Promise<DashboardEventoData> {
  const evento = await obtenerEventoDetalle(eventoId)
  const sorteoRealizado = !!evento.sorteo_realizado_at

  const [participantes, miPerfil, miAsignacion, estadoCompras] = await Promise.all([
    evento.modo === 'ultra_secreto' ? listarParticipantesUltraSecreto(eventoId) : listarParticipantes(eventoId),
    obtenerMiPerfil(userId),
    sorteoRealizado ? obtenerMiAsignacion(eventoId) : Promise.resolve(null),
    sorteoRealizado ? listarEstadoCompras(eventoId) : Promise.resolve([]),
  ])

  let wishlistDestino: Preferencias | null = null
  let perfilDestino: PerfilPublico | null = null
  let miAliasPropio: Alias | null = null
  let aliasDestino: Alias | null = null

  if (miAsignacion) {
    if (evento.modo === 'ultra_secreto') {
      ;[wishlistDestino, miAliasPropio, aliasDestino] = await Promise.all([
        obtenerPreferencias(eventoId, miAsignacion.receptor_id),
        obtenerMiAlias(eventoId),
        obtenerAliasDeUsuario(eventoId, miAsignacion.receptor_id),
      ])
    } else {
      ;[wishlistDestino, perfilDestino] = await Promise.all([
        obtenerPreferencias(eventoId, miAsignacion.receptor_id),
        obtenerPerfilUsuario(miAsignacion.receptor_id),
      ])
    }
  }

  return {
    evento,
    miPerfil,
    participantes,
    participantesCount: participantes.length,
    sorteoRealizado,
    miAsignacion,
    estadoCompras,
    wishlistDestino,
    perfilDestino,
    miAliasPropio,
    aliasDestino,
  }
}
