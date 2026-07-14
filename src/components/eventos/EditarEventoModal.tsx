import { useState } from 'react'
import { actualizarEvento, eliminarEvento } from '../../services/eventos'
import { validarPresupuesto } from '../../utils/presupuesto'
import { validarFechaIntercambio } from '../../utils/fechaIntercambio'
import { getErrorMessage } from '../../utils/helpers'
import type { Evento } from '../../types/domain'
import { PresupuestoInput } from './PresupuestoInput'
import { InviteLinkBox } from './InviteLinkBox'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
function toDateInput(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function toTimeInput(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EditarEventoModal({
  evento,
  onClose,
  onGuardado,
  onEliminado,
}: {
  evento: Evento
  onClose: () => void
  onGuardado: (evento: Evento) => void
  onEliminado?: () => void
}) {
  const [nombre, setNombre] = useState(evento.nombre)
  const [descripcion, setDescripcion] = useState(evento.descripcion ?? '')
  const [presupuestoMonto, setPresupuestoMonto] = useState(String(evento.presupuesto_monto))
  const [presupuestoMoneda, setPresupuestoMoneda] = useState(evento.presupuesto_moneda)
  const [fechaCompra, setFechaCompra] = useState(evento.fecha_compra)
  const [intercambioFecha, setIntercambioFecha] = useState(toDateInput(evento.fecha_intercambio))
  const [intercambioHora, setIntercambioHora] = useState(toTimeInput(evento.fecha_intercambio))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  async function handleGuardar() {
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    const presupuestoMontoNum = Number(presupuestoMonto)
    const errorPresupuesto = validarPresupuesto(presupuestoMontoNum, presupuestoMoneda)
    if (errorPresupuesto) {
      setError(errorPresupuesto)
      return
    }
    const fechaIntercambio = new Date(`${intercambioFecha}T${intercambioHora}:00`).toISOString()
    const errorFecha = validarFechaIntercambio(fechaIntercambio, fechaCompra)
    if (errorFecha) {
      setError(errorFecha)
      return
    }

    setError(null)
    setGuardando(true)
    try {
      const eventoActualizado = await actualizarEvento(evento.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        presupuestoMonto: presupuestoMontoNum,
        presupuestoMoneda,
        fechaCompra,
        fechaIntercambio,
      })
      onGuardado(eventoActualizado)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar() {
    setError(null)
    setEliminando(true)
    try {
      await eliminarEvento(evento.id)
      onEliminado?.()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo eliminar el evento'))
      setEliminando(false)
    }
  }

  if (confirmandoEliminar) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4">
        <div className="card flex w-full max-w-md flex-col">
          <h3 className="mb-4 font-display text-lg text-navy-900">Eliminar evento</h3>
          <p className="text-sm text-navy-600">
            ¿Seguro que quieres eliminar <strong>{evento.nombre}</strong>? Esta acción no se puede deshacer y
            eliminará toda la información del evento (participantes, listas de deseos, asignaciones).
          </p>
          {error && <p className="mt-3 text-sm text-error">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="btn-ghost flex-1"
              disabled={eliminando}
              onClick={() => {
                setConfirmandoEliminar(false)
                setError(null)
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary flex-1 !bg-error"
              disabled={eliminando}
              onClick={handleEliminar}
            >
              {eliminando ? 'Eliminando...' : 'Sí, eliminar evento'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4">
      <div className="card flex max-h-[90vh] w-full max-w-md flex-col">
        <h3 className="mb-4 font-display text-lg text-navy-900">Editar evento</h3>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
                Nombre del evento
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
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                className="input-field"
              />
            </div>
            <PresupuestoInput
              monto={presupuestoMonto}
              moneda={presupuestoMoneda}
              onMontoChange={setPresupuestoMonto}
              onMonedaChange={setPresupuestoMoneda}
            />
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
                  Fecha límite de compra
                </label>
                <input
                  type="date"
                  required
                  value={fechaCompra}
                  onChange={(e) => setFechaCompra(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">
                    Intercambio
                  </label>
                  <input
                    type="date"
                    required
                    value={intercambioFecha}
                    onChange={(e) => setIntercambioFecha(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold tracking-wide text-navy-600 uppercase">Hora</label>
                  <input
                    type="time"
                    required
                    value={intercambioHora}
                    onChange={(e) => setIntercambioHora(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
            {!evento.juego_iniciado_at && (
              <div className="border-t border-pale-sky-200 pt-4">
                <h4 className="mb-3 text-xs font-bold tracking-wide text-navy-600 uppercase">Compartir evento</h4>
                <InviteLinkBox
                  label="Enlace de invitación"
                  url={`${window.location.origin}/join/${evento.codigo_acceso}`}
                />
              </div>
            )}
            <div className="border-t border-pale-sky-200 pt-4">
              <h4 className="mb-3 text-xs font-bold tracking-wide text-error uppercase">Zona de peligro</h4>
              <button
                type="button"
                className="btn-ghost w-full border border-error text-error"
                onClick={() => setConfirmandoEliminar(true)}
              >
                Eliminar evento
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-primary flex-1" disabled={guardando} onClick={handleGuardar}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
