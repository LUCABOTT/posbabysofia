import {
  ArrowLeft,
  Cake,
  Mail,
  Send,
  ShoppingBag,
  X,
  Search
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { useConfirm } from '../../components/ui/confirmContext'
import FeedbackModal from '../../components/ui/FeedbackModal'

function CumpleanosCorreo() {
  const confirmar = useConfirm()
  const navigate = useNavigate()
  const { id } = useParams()

  const [notificacion, setNotificacion] = useState(null)
  const [productos, setProductos] = useState([])

  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [productosSeleccionados, setProductosSeleccionados] =
    useState([])

  const [busqueda, setBusqueda] = useState('')

  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)


  // ==========================================
  // CARGAR NOTIFICACIÓN
  // ==========================================

  useEffect(() => {
    cargarDatos()
  }, [id])


  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError('')

      const [notificacionResponse, productosResponse] =
        await Promise.all([
          api.get(`/cumpleanos/${id}`),
          api.get('/productos')
        ])

      const datosNotificacion =
        notificacionResponse.data

      setNotificacion(datosNotificacion)

      const cliente =
        datosNotificacion.cliente

      // Asunto inicial
      setAsunto(
        `¡Feliz cumpleaños, ${cliente?.nombre || ''}! 🎂`
      )

      // Mensaje inicial
      setMensaje(
        `Hola ${cliente?.nombre || ''},

Queremos desearle un muy feliz cumpleaños a tu hija. 🎂✨

En Baby Sofia Boutique nos encanta poder celebrar contigo este día tan especial.

Hemos preparado algunas opciones que podrían gustarte para celebrar esta ocasión.

¡Esperamos que tengas un día maravilloso! 💕
`
      )

      setProductos(
        productosResponse.data?.productos ||
        productosResponse.data ||
        []
      )

    } catch (error) {

      console.error(
        'Error al cargar datos:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No fue posible cargar la información'
      )

    } finally {
      setCargando(false)
    }
  }


  // ==========================================
  // SELECCIONAR PRODUCTO
  // ==========================================

  const seleccionarProducto = (producto) => {

    const existe =
      productosSeleccionados.some(
        item => item.id === producto.id
      )

    if (existe) {
      setProductosSeleccionados(
        productosSeleccionados.filter(
          item => item.id !== producto.id
        )
      )

      return
    }

    setProductosSeleccionados([
      ...productosSeleccionados,
      producto
    ])
  }


  // ==========================================
  // QUITAR PRODUCTO
  // ==========================================

  const quitarProducto = (idProducto) => {

    setProductosSeleccionados(
      productosSeleccionados.filter(
        item => item.id !== idProducto
      )
    )
  }


  // ==========================================
  // FILTRAR PRODUCTOS
  // ==========================================

  const productosFiltrados = productos.filter(
    producto =>
      producto.nombre
        ?.toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )
  )


  // ==========================================
  // ENVIAR CORREO
  // ==========================================

  const enviarCorreo = async () => {

    if (!asunto.trim()) {
      setError(
        'El asunto del correo es obligatorio'
      )

      return
    }

    if (!mensaje.trim()) {
      setError(
        'El mensaje del correo es obligatorio'
      )

      return
    }

    const aceptado = await confirmar({
      titulo: 'Enviar correo',
      mensaje: `¿Deseas enviar este correo a ${notificacion?.cliente?.email}?`,
      confirmarTexto: 'Enviar',
    })

    if (!aceptado) {
      return
    }

    try {

      setEnviando(true)
      setError('')

      await api.post(
    `/cumpleanos/${id}/enviar`,
    {
        asunto,
        mensaje,
        productos: productosSeleccionados.map(
            producto => ({
                id: producto.id
            })
        )
    }
)

      setResultado({
        tipo: 'exito',
        titulo: 'Correo enviado correctamente',
        mensaje: `El correo fue enviado a ${notificacion?.cliente?.email || 'el cliente'}.`,
      })

    } catch (error) {

      console.error(
        'Error al enviar correo:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No fue posible enviar el correo'
      )

      setResultado({
        tipo: 'error',
        titulo: 'No fue posible enviar el correo',
        mensaje: error.response?.data?.message ||
          'Ocurrió un problema al enviar el correo. Verifica la información e inténtalo nuevamente.',
      })

    } finally {

      setEnviando(false)

    }
  }


  // ==========================================
  // CARGANDO
  // ==========================================

  if (cargando) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div
            className="
              mx-auto mb-3
              h-10 w-10
              animate-spin
              rounded-full
              border-4
              border-gray-200
              border-t-baby-primary
            "
          />

          <p className="text-sm text-gray-500">
            Cargando información...
          </p>

        </div>

      </div>
    )
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (!notificacion) {
    return (
      <div className="p-6">

        <div
          className="
            rounded-2xl
            border border-red-200
            bg-red-50
            p-5
            text-red-700
          "
        >
          {error || 'No se encontró la notificación'}
        </div>

      </div>
    )
  }


  const cliente = notificacion.cliente


  return (
    <>
      <div className="p-4 sm:p-6">

      {/* ====================================== */}
      {/* ENCABEZADO */}
      {/* ====================================== */}

      <div className="mb-6">

        <button
          onClick={() => navigate(-1)}
          className="
            mb-4
            inline-flex
            items-center
            gap-2
            rounded-xl
            px-3 py-2
            text-sm
            font-medium
            text-gray-600
            transition
            hover:bg-gray-100
            hover:text-baby-primary
          "
        >
          <ArrowLeft size={18} />

          Regresar
        </button>


        <div className="flex items-center gap-3">

          <div
            className="
              flex h-12 w-12
              items-center justify-center
              rounded-2xl
              bg-baby-secondary/40
              text-baby-primary
            "
          >
            <Cake size={25} />
          </div>

          <div>

            <h1
              className="
                text-2xl
                font-bold
                text-baby-dark
              "
            >
              Preparar correo de cumpleaños
            </h1>

            <p className="text-sm text-gray-500">
              Personaliza el correo antes de enviarlo
            </p>

          </div>

        </div>

      </div>


      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div
          className="
            mb-5
            rounded-xl
            border border-red-200
            bg-red-50
            px-4 py-3
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}


      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">


        {/* ==================================== */}
        {/* COLUMNA PRINCIPAL */}
        {/* ==================================== */}

        <div className="space-y-6 xl:col-span-2">


          {/* INFORMACIÓN CLIENTE */}

          <div
            className="
              rounded-2xl
              border border-gray-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <div className="mb-4 flex items-center gap-2">

              <Mail
                size={19}
                className="text-baby-primary"
              />

              <h2
                className="
                  font-semibold
                  text-baby-dark
                "
              >
                Información del cliente
              </h2>

            </div>


            <div
              className="
                grid grid-cols-1
                gap-4
                sm:grid-cols-3
              "
            >

              <div>

                <p className="text-xs text-gray-500">
                  Cliente
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-baby-dark
                  "
                >
                  {cliente?.nombre}
                </p>

              </div>


              <div>

                <p className="text-xs text-gray-500">
                  Correo
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-baby-dark
                  "
                >
                  {cliente?.email || 'Sin correo'}
                </p>

              </div>


              <div>

                <p className="text-xs text-gray-500">
                  Cumpleaños
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-baby-dark
                  "
                >
                  {new Date(
                    `${notificacion.fecha_cumpleanos}T00:00:00`
                  ).toLocaleDateString('es-HN')}
                </p>

              </div>

            </div>

          </div>


          {/* EDITOR */}

          <div
            className="
              rounded-2xl
              border border-gray-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <h2
              className="
                mb-5
                font-semibold
                text-baby-dark
              "
            >
              Contenido del correo
            </h2>


            {/* ASUNTO */}

            <div className="mb-5">

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-700
                "
              >
                Asunto
              </label>

              <input
                type="text"
                value={asunto}
                onChange={(e) =>
                  setAsunto(e.target.value)
                }
                placeholder="Asunto del correo"
                className="
                  w-full
                  rounded-xl
                  border border-gray-300
                  px-4 py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-baby-primary
                  focus:ring-2
                  focus:ring-baby-primary/20
                "
              />

            </div>


            {/* MENSAJE */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-700
                "
              >
                Mensaje
              </label>

              <textarea
                value={mensaje}
                onChange={(e) =>
                  setMensaje(e.target.value)
                }
                rows={12}
                placeholder="Escribe el mensaje..."
                className="
                  w-full
                  resize-y
                  rounded-xl
                  border border-gray-300
                  px-4 py-3
                  text-sm
                  leading-6
                  outline-none
                  transition
                  focus:border-baby-primary
                  focus:ring-2
                  focus:ring-baby-primary/20
                "
              />

              <p className="mt-2 text-xs text-gray-400">
                Puedes personalizar libremente el mensaje
                antes de enviarlo.
              </p>

            </div>

          </div>


          {/* PRODUCTOS */}

          <div
            className="
              rounded-2xl
              border border-gray-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <div
              className="
                mb-5
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <div className="flex items-center gap-2">

                  <ShoppingBag
                    size={19}
                    className="text-baby-primary"
                  />

                  <h2
                    className="
                      font-semibold
                      text-baby-dark
                    "
                  >
                    Productos para promocionar
                  </h2>

                </div>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-500
                  "
                >
                  Selecciona los productos que
                  quieres mostrar en el correo.
                </p>

              </div>


              {/* BUSCADOR */}

              <div className="relative">

                <Search
                  size={17}
                  className="
                    absolute
                    left-3 top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                  placeholder="Buscar producto..."
                  className="
                    w-full
                    rounded-xl
                    border border-gray-300
                    py-2.5
                    pl-9 pr-3
                    text-sm
                    outline-none
                    focus:border-baby-primary
                  "
                />

              </div>

            </div>


            {productosFiltrados.length === 0 ? (

              <div
                className="
                  rounded-xl
                  bg-gray-50
                  px-4 py-8
                  text-center
                "
              >

                <ShoppingBag
                  size={32}
                  className="
                    mx-auto
                    mb-2
                    text-gray-300
                  "
                />

                <p className="text-sm text-gray-500">
                  No hay productos disponibles
                </p>

              </div>

            ) : (

              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
              >

                {productosFiltrados.map(
                  (producto) => {

                    const seleccionado =
                      productosSeleccionados.some(
                        item =>
                          item.id === producto.id
                      )

                    return (

                      <button
                        key={producto.id}
                        type="button"
                        onClick={() =>
                          seleccionarProducto(
                            producto
                          )
                        }
                        className={`
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          p-3
                          text-left
                          transition

                          ${
                            seleccionado
                              ? `
                                border-baby-primary
                                bg-baby-secondary/30
                              `
                              : `
                                border-gray-200
                                hover:border-baby-primary/50
                                hover:bg-gray-50
                              `
                          }
                        `}
                      >

                        {/* IMAGEN */}

                        <div
                          className="
                            h-14 w-14
                            shrink-0
                            overflow-hidden
                            rounded-lg
                            bg-gray-100
                          "
                        >

                          {producto.imagen ? (

                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />

                          ) : (

                            <div
                              className="
                                flex
                                h-full w-full
                                items-center
                                justify-center
                                text-gray-300
                              "
                            >
                              <ShoppingBag size={20} />
                            </div>

                          )}

                        </div>


                        {/* INFORMACIÓN */}

                        <div className="min-w-0 flex-1">

                          <p
                            className="
                              truncate
                              text-sm
                              font-semibold
                              text-baby-dark
                            "
                          >
                            {producto.nombre}
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              font-medium
                              text-baby-primary
                            "
                          >
                            L{' '}
                            {Number(
                              producto.precio_venta || 0
                            ).toFixed(2)}
                          </p>

                        </div>


                        {/* CHECK */}

                        <div
                          className={`
                            flex h-5 w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-md
                            border

                            ${
                              seleccionado
                                ? `
                                  border-baby-primary
                                  bg-baby-primary
                                  text-white
                                `
                                : `
                                  border-gray-300
                                `
                            }
                          `}
                        >

                          {seleccionado && (
                            <span className="text-xs">
                              ✓
                            </span>
                          )}

                        </div>

                      </button>

                    )
                  }
                )}

              </div>

            )}

          </div>

        </div>


        {/* ==================================== */}
        {/* COLUMNA DERECHA */}
        {/* ==================================== */}

        <div className="space-y-6">


          {/* PRODUCTOS SELECCIONADOS */}

          <div
            className="
              rounded-2xl
              border border-gray-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <div className="mb-4">

              <h2
                className="
                  font-semibold
                  text-baby-dark
                "
              >
                Productos seleccionados
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {productosSeleccionados.length}{' '}
                producto(s)
              </p>

            </div>


            {productosSeleccionados.length === 0 ? (

              <div
                className="
                  rounded-xl
                  bg-gray-50
                  px-4 py-8
                  text-center
                "
              >

                <ShoppingBag
                  size={30}
                  className="
                    mx-auto
                    mb-2
                    text-gray-300
                  "
                />

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  No has seleccionado productos.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {productosSeleccionados.map(
                  (producto) => (

                    <div
                      key={producto.id}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-gray-100
                        p-3
                      "
                    >

                      <div
                        className="
                          h-12 w-12
                          shrink-0
                          overflow-hidden
                          rounded-lg
                          bg-gray-100
                        "
                      >

                        {producto.imagen ? (

                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />

                        ) : (

                          <div
                            className="
                              flex
                              h-full w-full
                              items-center
                              justify-center
                              text-gray-300
                            "
                          >
                            <ShoppingBag size={18} />
                          </div>

                        )}

                      </div>


                      <div className="min-w-0 flex-1">

                        <p
                          className="
                            truncate
                            text-sm
                            font-medium
                            text-baby-dark
                          "
                        >
                          {producto.nombre}
                        </p>

                        <p
                          className="
                            text-xs
                            text-baby-primary
                          "
                        >
                          L{' '}
                          {Number(
                            producto.precio_venta || 0
                          ).toFixed(2)}
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          quitarProducto(
                            producto.id
                          )
                        }
                        className="
                          rounded-lg
                          p-1.5
                          text-gray-400
                          hover:bg-red-50
                          hover:text-red-500
                        "
                      >
                        <X size={17} />
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* PREVISUALIZACIÓN */}

          <div
            className="
              rounded-2xl
              border border-gray-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <h2
              className="
                mb-4
                font-semibold
                text-baby-dark
              "
            >
              Resumen
            </h2>

            <div className="space-y-3">

              <div>

                <p className="text-xs text-gray-500">
                  Para
                </p>

                <p className="text-sm font-medium">
                  {cliente?.email || 'Sin correo'}
                </p>

              </div>


              <div>

                <p className="text-xs text-gray-500">
                  Asunto
                </p>

                <p
                  className="
                    text-sm
                    font-medium
                    text-baby-dark
                  "
                >
                  {asunto ||
                    'Sin asunto'}
                </p>

              </div>


              <div>

                <p className="text-xs text-gray-500">
                  Productos
                </p>

                <p className="text-sm font-medium">
                  {productosSeleccionados.length}
                </p>

              </div>

            </div>

          </div>


          {/* BOTONES */}

          <div
            className="
              rounded-2xl
              border border-gray-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <button
              type="button"
              onClick={enviarCorreo}
              disabled={
                enviando ||
                !cliente?.email
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-baby-primary
                px-4 py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {enviando ? (

                <>
                  <div
                    className="
                      h-4 w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white
                      border-t-transparent
                    "
                  />

                  Enviando...

                </>

              ) : (

                <>
                  <Send size={17} />

                  Enviar correo
                </>

              )}

            </button>


            {!cliente?.email && (

              <p
                className="
                  mt-3
                  text-center
                  text-xs
                  text-red-500
                "
              >
                Este cliente no tiene correo
                electrónico registrado.
              </p>

            )}

          </div>

        </div>

      </div>

      </div>

      <FeedbackModal
        tipo={resultado?.tipo}
        titulo={resultado?.titulo}
        mensaje={resultado?.mensaje}
        onClose={() => {
          const fueExitoso = resultado?.tipo === 'exito'
          setResultado(null)

          if (fueExitoso) {
            navigate('/dashboard')
          }
        }}
      />
    </>
  )
}

export default CumpleanosCorreo