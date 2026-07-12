import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getEventPreviewByCode, joinEventByCode } from '../services/eventos'
import { getErrorMessage } from '../utils/helpers'

type Preview = Awaited<ReturnType<typeof getEventPreviewByCode>>

export function JoinBuyerPage() {
  const { codigo } = useParams<{ codigo: string }>()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(true)

  useEffect(() => {
    if (!codigo) return
    getEventPreviewByCode(codigo)
      .then(setPreview)
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el evento')))
      .finally(() => setLoadingPreview(false))
  }, [codigo])

  async function handleJoin() {
    if (!codigo) return
    setJoining(true)
    setError(null)
    try {
      const eventoId = await joinEventByCode(codigo)
      navigate(`/eventos/${eventoId}`, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo unir al evento'))
    } finally {
      setJoining(false)
    }
  }

  if (loadingPreview || authLoading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Cargando...</div>
  }

  if (!preview) {
    return (
      <div className="mx-auto mt-16 max-w-sm px-4 text-center">
        <p className="text-slate-600">Este código de invitación no es válido.</p>
      </div>
    )
  }

  const redirectPath = `/join/${codigo}`

  return (
    <div className="mx-auto mt-16 max-w-sm px-4 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">{preview.nombre}</h1>
      <p className="mb-6 text-slate-500">
        Presupuesto sugerido: ${preview.presupuesto} · Comprar antes de {preview.fecha_compra}
      </p>
      {preview.estado !== 'activo' ? (
        <p className="text-sm text-slate-500">Este evento ya no está aceptando participantes.</p>
      ) : (
        <>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {user ? (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {joining ? 'Uniéndote...' : 'Unirme como comprador'}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
                className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
              >
                Crear cuenta para unirme
              </Link>
              <Link
                to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                Ya tengo cuenta
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
