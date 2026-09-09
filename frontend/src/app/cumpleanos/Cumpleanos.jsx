import {
  ArrowLeft,
  Cake,
  ChevronLeft,
  ChevronRight,
  Mail,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const LIMITE = 10

const estados = {
  PENDIENTE: {
    etiqueta: 'Pendiente',
    clase: 'bg-amber-50 text-amber-700'
  },
  CORREO_ENVIADO: {
    etiqueta: 'Correo enviado',
    clase: 'bg-emerald-50 text-emerald-700'
  },
  IGNORADO: {
    etiqueta: 'Ignorado',
    clase: 'bg-gray-100 text-gray-600'
  }
}

const formatearFecha = (fecha) => {
  if (!fecha) return '-'

  const fechaObj = new Date(`${fecha}T00:00:00`)

  return Number.isNaN(fechaObj.getTime())
    ? '-'
    : fechaObj.toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
}

function Cumpleanos() {
  const navigate = useNavigate()
  const [notificaciones, setNotificaciones] = useState([])
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ignorandoId, setIgnorandoId] = useState(null)

  useEffect(() => {
    let cancelado = false

    const cargarNotificaciones = async () => {
      try {
        setCargando(true)
        setError('')

        const response = await api.get('/cumpleanos/todos', {
          params: { page: pagina, limit: LIMITE }
        })

        if (cancelado) return

        setNotificaciones(response.data?.datos || [])
        setTotal(response.data?.total || 0)
        setTotalPaginas(response.data?.totalPaginas || 0)
      } catch (requestError) {
        if (!cancelado) {
          setError(
            requestError.response?.data?.message ||
            'No se pudieron cargar las notificaciones.'
          )
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargarNotificaciones()

    return () => {
      cancelado = true
    }
  }, [pagina])

  const ignorarNotificacion = async (id) => {
    try {
      setIgnorandoId(id)
      await api.patch(`/cumpleanos/${id}/ignorar`)
      setNotificaciones((actuales) =>
        actuales.map((item) =>
          item.id === id
            ? { ...item, estado: 'IGNORADO' }
            : item
        )
      )
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        'No se pudo ignorar la notificación.'
      )
    } finally {
      setIgnorandoId(null)
    }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-baby-primary"
          >
            <ArrowLeft size={17} />
            Volver
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-baby-secondary/40 text-baby-primary">
              <Cake size={25} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-baby-dark">
                Notificaciones de cumpleaños
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Historial completo de notificaciones
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs text-gray-500">Total de notificaciones</p>
          <p className="text-xl font-bold text-baby-dark">{total}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {cargando ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            Cargando notificaciones...
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Cake size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">
              No hay notificaciones registradas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notificaciones.map((notificacion) => {
              const estado = estados[notificacion.estado] || estados.IGNORADO

              return (
                <div
                  key={notificacion.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-baby-secondary/40 text-baby-primary">
                      <Cake size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-baby-dark">
                        {notificacion.cliente?.nombre || 'Cliente sin nombre'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Cumpleaños: {formatearFecha(notificacion.fecha_cumpleanos)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estado.clase}`}>
                      {estado.etiqueta}
                    </span>

                    {notificacion.estado === 'PENDIENTE' && (
                      <>
                        <button
                          onClick={() => navigate(`/cumpleanos/${notificacion.id}/correo`)}
                          className="inline-flex items-center gap-2 rounded-xl bg-baby-primary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                          <Mail size={14} />
                          Enviar correo
                        </button>
                        <button
                          onClick={() => ignorarNotificacion(notificacion.id)}
                          disabled={ignorandoId === notificacion.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={14} />
                          {ignorandoId === notificacion.id ? 'Ignorando...' : 'Ignorar'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Página {pagina} de {totalPaginas}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagina((actual) => actual - 1)}
              disabled={pagina === 1 || cargando}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
              Anterior
            </button>
            <button
              onClick={() => setPagina((actual) => actual + 1)}
              disabled={pagina === totalPaginas || cargando}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default Cumpleanos
