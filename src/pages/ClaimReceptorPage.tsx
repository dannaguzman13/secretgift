import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { claimReceptor, getEventPreviewByToken } from '../services/eventos'
import { getErrorMessage } from '../utils/helpers'

type Preview = Awaited<ReturnType<typeof getEventPreviewByToken>>

export function ClaimReceptorPage() {
  const { token } = useParams<{ token: string }>()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(true)

  useEffect(() => {
    if (!token) return
    getEventPreviewByToken(token)
      .then(setPreview)
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el evento')))
      .finally(() => setLoadingPreview(false))
  }, [token])

  async function handleClaim() {
    if (!token) return
    setClaiming(true)
    setError(null)
    try {
      const eventoId = await claimReceptor(token)
      navigate(`/eventos/${eventoId}`, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo reclamar la invitación'))
    } finally {
      setClaiming(false)
    }
  }

  if (loadingPreview || authLoading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Cargando...</div>
  }

  if (!preview) {
    return (
      <div className="mx-auto mt-16 max-w-sm px-4 text-center">
        <p className="text-slate-600">
          Este enlace no es válido o el receptor ya fue confirmado para este evento.
        </p>
      </div>
    )
  }

  const redirectPath = `/claim/${token}`

  return (
    <div className="mx-auto mt-16 max-w-sm px-4 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">{preview.nombre}</h1>
      <p className="mb-6 text-slate-500">
        Te invitaron como el receptor de este intercambio de regalos. Presupuesto sugerido: $
        {preview.presupuesto}.
      </p>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {user ? (
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {claiming ? 'Confirmando...' : 'Confirmar que soy yo'}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <Link
            to={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
            className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            Crear cuenta para confirmar
          </Link>
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Ya tengo cuenta
          </Link>
        </div>
      )}
    </div>
  )
}
