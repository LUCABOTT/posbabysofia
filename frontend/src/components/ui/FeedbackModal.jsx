import { AlertCircle, CheckCircle2, X } from 'lucide-react'

function FeedbackModal({ tipo, titulo, mensaje, onClose }) {
  if (!tipo) return null

  const exitoso = tipo === 'exito'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 px-4 py-6 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="resultado-titulo"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${exitoso ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {exitoso ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <h2 id="resultado-titulo" className="text-lg font-semibold text-gray-900">
              {titulo}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {mensaje}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${exitoso ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {exitoso ? 'Continuar' : 'Cerrar'}
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
