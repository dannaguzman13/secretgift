import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getEventPreviewByCode, joinEventByCode } from '../services/eventos'
import { getErrorMessage } from '../utils/helpers'
import { MAX_PARTICIPANTES_ULTRA_SECRETO } from '../utils/constants'
import { formatearPresupuesto } from '../utils/presupuesto'
import { formatFechaIntercambio } from '../utils/fechaIntercambio'

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
    if (!codigo || !user) return
    setLoadingPreview(true)
    getEventPreviewByCode(codigo)
      .then(setPreview)
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el evento')))
      .finally(() => setLoadingPreview(false))
  }, [codigo, user])

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

  if (authLoading) {
    return <div className="flex h-64 items-center justify-center text-navy-500">Cargando...</div>
  }

  const redirectPath = `/join/${codigo}`

  if (!user) {
    return (
      <div className="mx-auto mt-16 max-w-sm px-4 text-center">
        <h1 className="mb-2 font-display text-2xl text-navy-900">Te invitaron a un amigo secreto</h1>
        <p className="mb-6 text-navy-600">
          Inicia sesión o crea una cuenta para ver los detalles del evento y unirte.
        </p>
        <div className="flex flex-col gap-2">
          <Link to={`/signup?redirect=${encodeURIComponent(redirectPath)}`} className="btn-primary">
            Crear cuenta para unirme
          </Link>
          <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="btn-ghost">
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    )
  }

  if (loadingPreview) {
    return <div className="flex h-64 items-center justify-center text-navy-500">Cargando...</div>
  }

  if (!preview) {
    return (
      <div className="mx-auto mt-16 max-w-sm px-4 text-center">
        <p className="text-navy-600">Este código de invitación no es válido.</p>
      </div>
    )
  }

  const eventoLleno = preview.modo === 'ultra_secreto' && preview.participantes_count >= MAX_PARTICIPANTES_ULTRA_SECRETO

  return (
    <div className="mx-auto mt-16 max-w-sm px-4 text-center">
      <h1 className="mb-2 font-display text-2xl text-navy-900">{preview.nombre}</h1>
      <p className="mb-6 text-navy-600">
        Presupuesto sugerido: {formatearPresupuesto(preview.presupuesto_monto, preview.presupuesto_moneda)} · Comprar
        antes de {preview.fecha_compra} · Intercambio: {formatFechaIntercambio(preview.fecha_intercambio)}
      </p>
      {preview.sorteo_realizado_at ? (
        <p className="text-sm text-navy-500">El sorteo ya se realizó, no puedes unirte a este evento.</p>
      ) : preview.estado !== 'activo' ? (
        <p className="text-sm text-navy-500">Este evento ya no está aceptando participantes.</p>
      ) : eventoLleno ? (
        <p className="text-sm text-navy-500">
          Este evento ya alcanzó el máximo de {MAX_PARTICIPANTES_ULTRA_SECRETO} participantes.
        </p>
      ) : (
        <>
          {error && <p className="mb-4 text-sm text-error">{error}</p>}
          <button onClick={handleJoin} disabled={joining} className="btn-primary w-full">
            {joining ? 'Uniéndote...' : 'Unirme'}
          </button>
        </>
      )}
    </div>
  )
}
