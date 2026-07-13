import { useEffect, useState } from 'react'
import { actualizarPerfil, obtenerMiPerfil } from '../../services/perfil'
import { CAMPOS_PERFIL } from '../../utils/perfilCampos'
import type { CampoPerfilId } from '../../utils/perfilCampos'
import { getErrorMessage } from '../../utils/helpers'

export function EditarPerfilModal({
  usuarioId,
  onClose,
}: {
  usuarioId: string
  onClose: () => void
}) {
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nombre, setNombre] = useState('')
  const [apodo, setApodo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [camposActivos, setCamposActivos] = useState<CampoPerfilId[]>([])
  const [valores, setValores] = useState<Partial<Record<CampoPerfilId, string>>>({})

  useEffect(() => {
    let cancelado = false
    obtenerMiPerfil(usuarioId)
      .then((usuario) => {
        if (cancelado) return
        setNombre(usuario.nombre)
        setApodo(usuario.apodo ?? '')
        setDescripcion(usuario.descripcion ?? '')
        const perfilCompleto = (usuario.perfil_completo ?? { campos_activos: [] }) as {
          campos_activos?: CampoPerfilId[]
        } & Partial<Record<CampoPerfilId, string>>
        setCamposActivos(perfilCompleto.campos_activos ?? [])
        const iniciales: Partial<Record<CampoPerfilId, string>> = {}
        for (const campo of CAMPOS_PERFIL) {
          const valor = perfilCompleto[campo.id]
          if (valor) iniciales[campo.id] = valor
        }
        setValores(iniciales)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [usuarioId])

  function toggleCampo(id: CampoPerfilId) {
    setCamposActivos((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  async function handleGuardar() {
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setError(null)
    setGuardando(true)
    try {
      const perfilCompleto: { campos_activos: CampoPerfilId[] } & Partial<Record<CampoPerfilId, string>> = {
        campos_activos: camposActivos,
      }
      for (const id of camposActivos) {
        const valor = valores[id]?.trim()
        if (valor) perfilCompleto[id] = valor
      }

      await actualizarPerfil(usuarioId, {
        nombre: nombre.trim(),
        apodo: apodo.trim() || null,
        descripcion: descripcion.trim() || null,
        perfil_completo: perfilCompleto,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4">
      <div className="card flex max-h-[90vh] w-full max-w-md flex-col">
        <h3 className="mb-4 font-display text-lg text-navy-900">Mi Perfil</h3>

        {cargando ? (
          <p className="text-sm text-navy-500">Cargando...</p>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
                  Apodo
                </label>
                <input
                  type="text"
                  value={apodo}
                  onChange={(e) => setApodo(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mb-2 flex flex-col gap-3">
              <h4 className="text-xs font-bold tracking-wide text-navy-600 uppercase">Personalización</h4>
              {CAMPOS_PERFIL.map((campo) => {
                const activo = camposActivos.includes(campo.id)
                return (
                  <div key={campo.id}>
                    <label className="flex items-center gap-2 text-sm text-navy-900">
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={() => toggleCampo(campo.id)}
                      />
                      {campo.label}
                    </label>
                    {activo && (
                      <input
                        type="text"
                        value={valores[campo.id] ?? ''}
                        onChange={(e) => setValores((prev) => ({ ...prev, [campo.id]: e.target.value }))}
                        className="input-field mt-1"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={cargando || guardando}
            onClick={handleGuardar}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
