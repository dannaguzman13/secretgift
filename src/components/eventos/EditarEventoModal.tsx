import { useState } from 'react'
import { actualizarEvento } from '../../services/eventos'
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
}: {
  evento: Evento
  onClose: () => void
  onGuardado: (evento: Evento) => void
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
