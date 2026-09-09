import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'

export function ConfirmModal({ solicitud, resolver }) {
  const [procesando, setProcesando] = useState(false)
  const cancelarRef = useRef(null)

  useEffect(() => {
    setProcesando(false)
  }, [solicitud])

  useEffect(() => {
    if (!solicitud) return undefined

    cancelarRef.current?.focus()

    const manejarTecla = (event) => {
      if (event.key === 'Escape' && !procesando) {
        resolver(false)
      }
    }

    document.addEventListener('keydown', manejarTecla)
    return () => document.removeEventListener('keydown', manejarTecla)
  }, [solicitud, procesando, resolver])

  if (!solicitud) return null

  const aceptar = async () => {
    if (procesando) return

    setProcesando(true)
    resolver(true)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacion-titulo"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2 id="confirmacion-titulo" className="text-lg font-semibold text-gray-900">
              {solicitud.titulo || 'Confirmar acción'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {solicitud.mensaje}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelarRef}
            type="button"
            disabled={procesando}
            onClick={() => resolver(false)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={aceptar}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${solicitud.peligrosa ? 'bg-red-600 hover:bg-red-700' : 'bg-baby-primary hover:brightness-95'}`}
          >
            <Check size={16} />
            {procesando ? 'Procesando...' : solicitud.confirmarTexto || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

