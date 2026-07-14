import { CAMPOS_PERFIL, type CampoPerfilId } from '../../utils/perfilCampos'

export function MissionDetailsModal({
  campos,
  descripcion,
  onClose,
}: {
  campos: Partial<Record<CampoPerfilId, string>> | undefined
  descripcion?: string | null
  onClose: () => void
}) {
  const camposLlenos = CAMPOS_PERFIL.filter(({ id }) => campos?.[id]?.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-lg bg-navy-900 p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-center font-display text-lg">Detalles de tu misión</h3>

        <div className="flex-1 overflow-y-auto pr-1">
          {descripcion?.trim() && (
            <p className="mb-4 rounded-md bg-white/10 p-3 text-sm text-pale-sky-100">{descripcion}</p>
          )}

          {camposLlenos.length === 0 && !descripcion?.trim() ? (
            <p className="text-sm text-pale-sky-300">Tu misión todavía no compartió detalles.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {camposLlenos.map(({ id, label }) => (
                <li key={id} className="rounded-md bg-white/10 px-3 py-2 text-sm">
                  <span className="text-xs font-bold tracking-wide text-pale-sky-300 uppercase">{label}</span>
                  <p className="text-white">{campos?.[id]}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="button" className="btn-ghost mt-4 text-white" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
