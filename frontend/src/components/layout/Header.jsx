
import {
  Menu,
  Bell,
  UserCircle,
  Cake,
  Mail,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import socket from '../../services/socket'
import { useAuth } from '../../auth/AuthContext'

function Header({ abrirMenu }) {
  const { usuario } = useAuth()
  const [cumpleanos, setCumpleanos] = useState([])
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
  const [ignorandoId, setIgnorandoId] = useState(null)

  const navigate = useNavigate()

  // ==========================================
  // NOTIFICACIONES DE CUMPLEAÑOS
  // ==========================================

  useEffect(() => {
    const cargarCumpleanos = async () => {
      try {
        const response = await api.get('/cumpleanos')

        setCumpleanos(
          Array.isArray(response.data)
            ? response.data
            : []
        )
      } catch (error) {
        console.error(
          'Error al cargar notificaciones de cumpleaños:',
          error
        )
      }
    }

    // Cargar las notificaciones existentes
    // solamente una vez al montar el componente.
    cargarCumpleanos()

    // ==========================================
    // NUEVO CUMPLEAÑOS
    // ==========================================

    const manejarNuevoCumpleanos = (notificacion) => {
      setCumpleanos((actuales) => {

        // Evitar duplicados
        const existe = actuales.some(
          (item) => item.id === notificacion.id
        )

        if (existe) {
          return actuales
        }

        return [
          notificacion,
          ...actuales
        ]
      })
    }

    // ==========================================
    // CUMPLEAÑOS ACTUALIZADO
    // ==========================================

    const manejarCumpleanosActualizado = ({
      id,
      estado
    }) => {

      if (
        estado === 'CORREO_ENVIADO' ||
        estado === 'IGNORADO'
      ) {

        setCumpleanos((actuales) =>
          actuales.filter(
            (item) => item.id !== id
          )
        )
      }
    }

    // ==========================================
    // ESCUCHAR EVENTOS SOCKET.IO
    // ==========================================

    socket.on(
      'nuevo_cumpleanos',
      manejarNuevoCumpleanos
    )

    socket.on(
      'cumpleanos_actualizado',
      manejarCumpleanosActualizado
    )

    // ==========================================
    // LIMPIAR LISTENERS
    // ==========================================

    return () => {

      socket.off(
        'nuevo_cumpleanos',
        manejarNuevoCumpleanos
      )

      socket.off(
        'cumpleanos_actualizado',
        manejarCumpleanosActualizado
      )
    }
  }, [])

  // ==========================================
  // ABRIR CUMPLEAÑOS
  // ==========================================

  const abrirCumpleanos = (id) => {
    setMostrarNotificaciones(false)

    navigate(`/cumpleanos/${id}/correo`)
  }

  const verTodasLasNotificaciones = () => {
    setMostrarNotificaciones(false)
    navigate('/cumpleanos')
  }

  const ignorarCumpleanos = async (id) => {
    try {
      setIgnorandoId(id)

      await api.patch(`/cumpleanos/${id}/ignorar`)

      setCumpleanos((actuales) =>
        actuales.filter((item) => item.id !== id)
      )
    } catch (error) {
      console.error(
        'Error al ignorar notificación de cumpleaños:',
        error
      )
    } finally {
      setIgnorandoId(null)
    }
  }

  // ==========================================
  // FORMATEAR FECHA
  // ==========================================

  const formatearFecha = (fecha) => {
    if (!fecha) return ''

    const fechaObj =
      new Date(`${fecha}T00:00:00`)

    return fechaObj.toLocaleDateString('es-HN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-20 items-center justify-between
        border-b border-gray-200
        bg-white/95 backdrop-blur
        px-4 sm:px-6
        print:hidden
      "
    >

      {/* MENU MOBILE */}
      <button
        onClick={abrirMenu}
        className="
          rounded-xl p-2
          text-gray-600
          hover:bg-baby-secondary/40
          hover:text-baby-primary
          lg:hidden
        "
      >
        <Menu size={24} />
      </button>


      {/* TITULO */}
      <div className="hidden lg:block">

        <p className="text-sm text-gray-500">
          Bienvenido al sistema
        </p>

        <h2 className="text-lg font-semibold text-baby-dark">
          Punto de Venta
        </h2>

      </div>


      {/* ACCIONES */}
      <div className="ml-auto flex items-center gap-3">

        {/* NOTIFICACIONES */}
        <div className="relative">

          <button
            onClick={() =>
              setMostrarNotificaciones(
                !mostrarNotificaciones
              )
            }
            className="
              relative rounded-xl p-2.5
              text-gray-600
              hover:bg-baby-secondary/40
              hover:text-baby-primary
            "
          >

            <Bell size={21} />

            {cumpleanos.length > 0 && (

              <span
                className="
                  absolute -right-1 -top-1
                  flex h-5 min-w-5
                  items-center justify-center
                  rounded-full
                  bg-red-500
                  px-1
                  text-[10px]
                  font-bold
                  text-white
                "
              >

                {cumpleanos.length > 99
                  ? '99+'
                  : cumpleanos.length}

              </span>

            )}

          </button>


          {/* PANEL DE NOTIFICACIONES */}
          {mostrarNotificaciones && (

            <div
              className="
                absolute right-0 top-14
                z-50
                w-96
                overflow-hidden
                rounded-2xl
                border border-gray-200
                bg-white
                shadow-xl
              "
            >

              {/* CABECERA */}
              <div
                className="
                  flex items-center justify-between
                  border-b border-gray-100
                  px-4 py-3
                "
              >

                <div>

                  <h3
                    className="
                      text-sm font-semibold
                      text-baby-dark
                    "
                  >
                    Notificaciones
                  </h3>

                  <p className="text-xs text-gray-500">
                    Cumpleaños próximos
                  </p>

                </div>

                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-xl
                    bg-baby-secondary/40
                    text-baby-primary
                  "
                >
                  <Cake size={19} />
                </div>

              </div>


              {/* CONTENIDO */}
              <div className="max-h-96 overflow-y-auto">

                {cumpleanos.length === 0 ? (

                  <div className="px-4 py-8 text-center">

                    <Cake
                      size={35}
                      className="
                        mx-auto mb-2
                        text-gray-300
                      "
                    />

                    <p className="text-sm text-gray-500">
                      No hay cumpleaños próximos
                    </p>

                  </div>

                ) : (

                  <div>

                    {cumpleanos.map((notificacion) => (

                      <div
                        key={notificacion.id}
                        className="
                          border-b border-gray-100
                          px-4 py-4
                          transition
                          hover:bg-gray-50
                        "
                      >

                        <div className="flex gap-3">

                          <div
                            className="
                              flex h-10 w-10 shrink-0
                              items-center justify-center
                              rounded-xl
                              bg-baby-secondary/40
                              text-baby-primary
                            "
                          >
                            <Cake size={20} />
                          </div>


                          <div className="min-w-0 flex-1">

                            <p
                              className="
                                text-sm font-semibold
                                text-baby-dark
                              "
                            >
                              Cumpleaños próximo
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-sm
                                text-gray-600
                              "
                            >
                              {notificacion.cliente?.nombre}
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-gray-500
                              "
                            >
                              Cumpleaños:{' '}

                              {formatearFecha(
                                notificacion.fecha_cumpleanos
                              )}

                            </p>


                            {/* BOTON CORREO */}
                            <div className="mt-3 flex flex-wrap gap-2">

                              <button
                                onClick={() =>
                                  abrirCumpleanos(
                                    notificacion.id
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  bg-baby-primary
                                  px-3 py-2
                                  text-xs
                                  font-semibold
                                  text-white
                                  transition
                                  hover:opacity-90
                                "
                              >

                                <Mail size={15} />

                                Enviar correo

                              </button>

                              <button
                                onClick={() =>
                                  ignorarCumpleanos(
                                    notificacion.id
                                  )
                                }
                                disabled={
                                  ignorandoId === notificacion.id
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border border-gray-200
                                  px-3 py-2
                                  text-xs
                                  font-semibold
                                  text-gray-600
                                  transition
                                  hover:bg-gray-100
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              >

                                <X size={15} />

                                {ignorandoId === notificacion.id
                                  ? 'Ignorando...'
                                  : 'Ignorar'}

                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

              <div className="border-t border-gray-100 p-3">

                <button
                  onClick={verTodasLasNotificaciones}
                  className="
                    w-full rounded-xl
                    border border-baby-primary/20
                    px-3 py-2.5
                    text-sm font-semibold
                    text-baby-primary
                    transition
                    hover:bg-baby-secondary/20
                  "
                >
                  Ver todas las notificaciones
                </button>

              </div>

            </div>

          )}

        </div>


        {/* USUARIO */}
        <div
          className="
            flex items-center gap-3
            border-l border-gray-200
            pl-3
          "
        >

          <UserCircle
            size={36}
            className="text-baby-primary"
          />

          <div className="hidden sm:block">

            <p
              className="
                text-sm font-semibold
                text-baby-dark
              "
            >
              {usuario?.nombre || 'Usuario'}
            </p>

            <p className="text-xs text-gray-500">
              {usuario?.rol || 'Sin rol'}
            </p>

          </div>

        </div>

      </div>

    </header>
  )
}

export default Header

