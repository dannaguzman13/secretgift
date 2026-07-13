interface SupabaseErrorLike {
  code?: string
  message?: string
}

// Exact matches for exceptions raised by our own RPCs (supabase/migrations/*.sql).
const KNOWN_MESSAGES: Record<string, string> = {
  'not authenticated': 'Debes iniciar sesión para continuar.',
  'invalid or inactive code': 'Este código de invitación no es válido o el evento ya no está activo.',
  'sorteo ya realizado': 'El sorteo ya se realizó, no puedes unirte a este evento.',
  'solo el admin puede realizar el sorteo': 'Solo quien creó el evento puede realizar el sorteo.',
  'el evento no está en estado válido para sortear': 'Este evento no está en un estado válido para sortear.',
  'se necesitan al menos 3 participantes': 'Se necesitan al menos 3 participantes para poder sortear.',
  'no se pudo generar un sorteo válido, intenta de nuevo': 'No se pudo generar el sorteo, inténtalo de nuevo.',
  'no se pudo generar un código de acceso único': 'No se pudo generar un código de invitación único, inténtalo de nuevo.',
  'tu cuenta no completó el registro correctamente, cierra sesión y vuelve a iniciarla':
    'Tu cuenta no completó el registro correctamente. Cierra sesión y vuelve a iniciarla.',
}

// Pattern matches for Supabase Auth errors, which come back in English.
const AUTH_MESSAGE_PATTERNS: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Email o contraseña incorrectos.'],
  [/user already registered/i, 'Ya existe una cuenta con este email.'],
  [/email not confirmed/i, 'Debes confirmar tu email antes de iniciar sesión.'],
  [/password should be at least/i, 'La contraseña debe tener al menos 6 caracteres.'],
  [/failed to fetch/i, 'No se pudo conectar. Revisa tu conexión a internet.'],
  [/rate limit/i, 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'],
]

// Generic Postgres/PostgREST error codes, for anything not already caught above.
const PG_CODE_MESSAGES: Record<string, string> = {
  '23505': 'Ya existe un registro con esos datos.',
  '23503': 'No se pudo completar la acción porque falta información relacionada.',
  '23502': 'Falta completar un campo obligatorio.',
  '22P02': 'Uno de los valores ingresados no tiene un formato válido.',
  '42501': 'No tienes permiso para realizar esta acción.',
  PGRST116: 'No se encontró la información solicitada.',
}

// If a message contains raw Postgres/Postgrest jargon and we don't have a translation
// for it, hide it entirely rather than leaking it to the user.
function looksTechnical(message: string): boolean {
  return /violates|constraint|column|relation|syntax|duplicate key|null value|permission denied|jwt|row-level security|policy for table/i.test(
    message,
  )
}

/**
 * Translates a Supabase/Postgres error into a plain Spanish message.
 * Returns null when no safe translation exists, so the caller can fall back
 * to a generic message instead of ever showing raw technical text.
 */
export function translateError(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null
  const e = err as SupabaseErrorLike
  const rawMessage = typeof e.message === 'string' ? e.message.trim() : ''

  if (rawMessage && KNOWN_MESSAGES[rawMessage]) return KNOWN_MESSAGES[rawMessage]

  for (const [pattern, translated] of AUTH_MESSAGE_PATTERNS) {
    if (pattern.test(rawMessage)) return translated
  }

  if (e.code && PG_CODE_MESSAGES[e.code]) return PG_CODE_MESSAGES[e.code]

  if (rawMessage && !looksTechnical(rawMessage)) return rawMessage

  return null
}
