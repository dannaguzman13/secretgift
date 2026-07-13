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
    return <div className="flex h-64 items-center justify-center text-navy-500">Cargando...</div>
  }

  if (!preview) {
    return (
      <div className="mx-auto mt-16 max-w-sm px-4 text-center">
        <p className="text-navy-600">Este código de invitación no es válido.</p>
      </div>
    )
  }

  const redirectPath = `/join/${codigo}`

  return (
    <div className="mx-auto mt-16 max-w-sm px-4 text-center">
      <h1 className="mb-2 font-display text-2xl text-navy-900">{preview.nombre}</h1>
      <p className="mb-6 text-navy-600">
        Presupuesto sugerido: ${preview.presupuesto} · Comprar antes de {preview.fecha_compra}
      </p>
      {preview.sorteo_realizado_at ? (
        <p className="text-sm text-navy-500">El sorteo ya se realizó, no puedes unirte a este evento.</p>
      ) : preview.estado !== 'activo' ? (
        <p className="text-sm text-navy-500">Este evento ya no está aceptando participantes.</p>
      ) : (
        <>
          {error && <p className="mb-4 text-sm text-error">{error}</p>}
          {user ? (
            <button onClick={handleJoin} disabled={joining} className="btn-primary w-full">
              {joining ? 'Uniéndote...' : 'Unirme'}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
                className="btn-primary"
              >
                Crear cuenta para unirme
              </Link>
              <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="btn-ghost">
                Ya tengo cuenta
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
