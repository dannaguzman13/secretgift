import { translateError } from './errorMessages'

export function getErrorMessage(err: unknown, fallback = 'Algo salió mal, inténtalo de nuevo'): string {
  return translateError(err) ?? fallback
}
