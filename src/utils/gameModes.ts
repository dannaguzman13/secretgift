import type { ModoEvento } from '../types/domain'

export const MODOS: { value: ModoEvento; emoji: string; label: string; descripcion: string }[] = [
  { value: 'amigo_secreto', emoji: '🎁', label: 'Amigo Secreto', descripcion: 'El sorteo clásico, 1 a 1.' },
  {
    value: 'ultra_secreto',
    emoji: '🕵️',
    label: 'Ultra Secreto',
    descripcion: 'Identidades ocultas con alias. Máx. 20 personas.',
  },
  {
    value: 'regalo_robado',
    emoji: '🎲',
    label: 'Regalo Robado',
    descripcion: 'Juego por turnos: gira la ruleta y roba regalos.',
  },
]
