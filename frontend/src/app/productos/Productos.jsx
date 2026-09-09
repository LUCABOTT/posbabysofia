import { useEffect, useMemo, useState } from 'react'
import {
  Package,
  Plus,
  RefreshCw,
  Edit,
  Power,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Search,
  Image as ImageIcon,
  Tag,
  Boxes,
} from 'lucide-react'

import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  eliminarProductoDefinitivo,
} from '../../services/productoService'

import { obtenerCategorias } from '../../services/categoriaService'
import { useConfirm } from '../../components/ui/confirmContext'

const API_ORIGEN = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api'
).replace(/\/api\/?$/, '')

const obtenerUrlImagen = (imagen) => {
  if (!imagen) return null

  if (/^(https?:|blob:|data:)/i.test(imagen)) {
    return imagen
  }

  return `${API_ORIGEN}${imagen.startsWith('/') ? imagen : `/${imagen}`}`
}

const Producto = () => {
  const confirmar = useConfirm()
  // ==============================
  // ESTADOS
  // ==============================

  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [modal, setModal] = useState(null)

  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null)

  // ==============================
  // FORMULARIO
  // ==============================

  const [categoriaId, setCategoriaId] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] =
    useState('')

  const [precioCompra, setPrecioCompra] =
    useState('')

  const [precioVenta, setPrecioVenta] =
    useState('')

  const [stock, setStock] = useState('')
  const [stockMinimo, setStockMinimo] =
    useState('')

  const [descuentoTipo, setDescuentoTipo] = useState('')
  const [descuentoValor, setDescuentoValor] = useState('')
  const [descuentoInicio, setDescuentoInicio] = useState('')
  const [descuentoFin, setDescuentoFin] = useState('')
  const [descuentoActivo, setDescuentoActivo] = useState(true)

  const [activo, setActivo] = useState(true)

  const [imagen, setImagen] = useState(null)
  const [imagenPreview, setImagenPreview] =
    useState(null)

  // ==============================
  // FILTROS
  // ==============================

  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] =
    useState('TODAS')

  const [filtroEstado, setFiltroEstado] =
    useState('TODOS')

  // ==============================
  // MENSAJES
  // ==============================

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  // ==============================
  // CARGAR PRODUCTOS
  // ==============================

  const cargarProductos = async () => {
    try {
      setCargando(true)
      setError('')

      const data = await listarProductos()

      setProductos(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (err) {
      console.error(
        'Error al obtener productos:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudieron obtener los productos'
      )
    } finally {
      setCargando(false)
    }
  }

  // ==============================
  // CARGAR CATEGORÍAS
  // ==============================

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias()

      setCategorias(
        Array.isArray(data)
          ? data.filter(
              (categoria) =>
                categoria.activo
            )
          : []
      )
    } catch (err) {
      console.error(
        'Error al obtener categorías:',
        err
      )
    }
  }

  // ==============================
  // CARGA INICIAL
  // ==============================

  useEffect(() => {
    const cargarDatos = async () => {
      await Promise.all([
        cargarProductos(),
        cargarCategorias(),
      ])
    }

    cargarDatos()
  }, [])

  // ==============================
  // FORMATEAR MONEDA
  // ==============================

  const moneda = (valor) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2,
    }).format(Number(valor || 0))
  }

  // ==============================
  // FILTRAR PRODUCTOS
  // ==============================

  const productosFiltrados = useMemo(() => {
    const texto = busqueda
      .toLowerCase()
      .trim()

    return productos.filter(
      (producto) => {
        const coincideBusqueda =
          !texto ||
          producto.nombre
            ?.toLowerCase()
            .includes(texto) ||
          producto.codigo
            ?.toLowerCase()
            .includes(texto) ||
          producto.categoria?.nombre
            ?.toLowerCase()
            .includes(texto)

        const coincideCategoria =
          filtroCategoria === 'TODAS' ||
          String(
            producto.categoria_id
          ) === String(filtroCategoria)

        const coincideEstado =
          filtroEstado === 'TODOS' ||
          (filtroEstado === 'ACTIVOS' &&
            producto.activo) ||
          (filtroEstado === 'INACTIVOS' &&
            !producto.activo)

        return (
          coincideBusqueda &&
          coincideCategoria &&
          coincideEstado
        )
      }
    )
  }, [
    productos,
    busqueda,
    filtroCategoria,
    filtroEstado,
  ])

  // ==============================
  // LIMPIAR FORMULARIO
  // ==============================

  const limpiarFormulario = () => {
    setProductoSeleccionado(null)

    setCategoriaId('')
    setCodigo('')
    setNombre('')
    setDescripcion('')

    setPrecioCompra('')
    setPrecioVenta('')

    setStock('')
    setStockMinimo('')

    setDescuentoTipo('')
    setDescuentoValor('')
    setDescuentoInicio('')
    setDescuentoFin('')
    setDescuentoActivo(true)

    setActivo(true)

    setImagen(null)
    setImagenPreview(null)
  }

  // ==============================
  // ABRIR MODAL
  // ==============================

  const abrirModal = (
    tipo,
    producto = null
  ) => {
    setError('')
    setMensaje('')

    if (tipo === 'crear') {
      limpiarFormulario()
      setModal('crear')
    }

    if (
      tipo === 'editar' &&
      producto
    ) {
      setProductoSeleccionado(producto)

      setCategoriaId(
        producto.categoria_id
          ? String(producto.categoria_id)
          : ''
      )

      setCodigo(producto.codigo || '')
      setNombre(producto.nombre || '')
      setDescripcion(
        producto.descripcion || ''
      )

      setPrecioCompra(
        producto.precio_compra ?? ''
      )

      setPrecioVenta(
        producto.precio_venta ?? ''
      )

      setStock(
        producto.stock ?? 0
      )

      setStockMinimo(
        producto.stock_minimo ?? 0
      )

      setDescuentoTipo(producto.descuento_tipo || '')
      setDescuentoValor(producto.descuento_valor ?? '')
      setDescuentoInicio(producto.descuento_inicio || '')
      setDescuentoFin(producto.descuento_fin || '')
      setDescuentoActivo(producto.descuento_activo ?? true)

      setActivo(
        producto.activo ?? true
      )

      setImagen(null)

      setImagenPreview(
        producto.imagen || null
      )

      setModal('editar')
    }
  }

  // ==============================
  // CERRAR MODAL
  // ==============================

  const cerrarModal = () => {
    if (guardando) return

    setModal(null)
    setError('')

    limpiarFormulario()
  }

  // ==============================
  // CAMBIAR IMAGEN
  // ==============================

  const manejarImagen = (e) => {
    const archivo = e.target.files?.[0]

    if (!archivo) return

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ]

    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {
      setError(
        'La imagen debe ser JPG, JPEG, PNG o WEBP'
      )

      return
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setError(
        'La imagen no puede superar los 5 MB'
      )

      return
    }

    setError('')

    setImagen(archivo)

    setImagenPreview(
      URL.createObjectURL(archivo)
    )
  }

  // ==============================
  // CREAR PRODUCTO
  // ==============================

  const manejarCrear = async (e) => {
    e.preventDefault()

    const aceptado = await confirmar({
      titulo: 'Agregar producto',
      mensaje: `¿Estás seguro de agregar el producto "${nombre.trim() || 'sin nombre'}"?`,
      confirmarTexto: 'Agregar',
    })

    if (!aceptado) return

    setError('')
    setMensaje('')

    if (!categoriaId) {
      setError(
        'Debes seleccionar una categoría'
      )

      return
    }

    if (!nombre.trim()) {
      setError(
        'El nombre del producto es obligatorio'
      )

      return
    }

    if (descuentoTipo && (!descuentoValor || Number(descuentoValor) <= 0)) {
      setError('El valor del descuento debe ser mayor a 0')
      return
    }

    if (descuentoTipo === 'PORCENTAJE' && Number(descuentoValor) > 100) {
      setError('El descuento porcentual no puede ser mayor a 100')
      return
    }

    if (descuentoTipo === 'MONTO' && Number(descuentoValor) >= Number(precioVenta)) {
      setError('El descuento en monto debe ser menor que el precio de venta')
      return
    }

    if (descuentoInicio && descuentoFin && descuentoInicio > descuentoFin) {
      setError('La fecha inicial no puede ser posterior a la fecha final')
      return
    }

    if (
      precioVenta === '' ||
      Number(precioVenta) < 0
    ) {
      setError(
        'El precio de venta debe ser válido'
      )

      return
    }

    if (
      Number(precioCompra || 0) < 0 ||
      Number(stock || 0) < 0 ||
      Number(stockMinimo || 0) < 0
    ) {
      setError(
        'Los valores numéricos no pueden ser negativos'
      )

      return
    }

    try {
      setGuardando(true)

      const formData = new FormData()

      formData.append(
        'categoria_id',
        categoriaId
      )

      formData.append(
        'nombre',
        nombre.trim()
      )

      formData.append(
        'descripcion',
        descripcion.trim()
      )

      formData.append(
        'precio_compra',
        precioCompra || 0
      )

      formData.append(
        'precio_venta',
        precioVenta
      )

      formData.append(
        'stock',
        stock || 0
      )

      formData.append(
        'stock_minimo',
        stockMinimo || 0
      )

      formData.append('descuento_tipo', descuentoTipo)
      formData.append('descuento_valor', descuentoValor || 0)
      formData.append('descuento_inicio', descuentoInicio)
      formData.append('descuento_fin', descuentoFin)
      formData.append('descuento_activo', descuentoActivo)

      if (imagen) {
        formData.append(
          'imagen',
          imagen
        )
      }

      await crearProducto(formData)

      setModal(null)

      limpiarFormulario()

      setMensaje(
        'Producto creado correctamente'
      )

      await cargarProductos()

      setTimeout(() => {
        setMensaje('')
      }, 3000)
    } catch (err) {
      console.error(
        'Error al crear producto:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudo crear el producto'
      )
    } finally {
      setGuardando(false)
    }
  }

  // ==============================
  // ACTUALIZAR PRODUCTO
  // ==============================

  const manejarActualizar = async (e) => {
    e.preventDefault()

    const aceptado = await confirmar({
      titulo: 'Editar producto',
      mensaje: `¿Estás seguro de guardar los cambios de "${nombre.trim() || 'sin nombre'}"?`,
      confirmarTexto: 'Guardar cambios',
    })

    if (!aceptado) return

    setError('')
    setMensaje('')

    if (!productoSeleccionado) {
      setError(
        'No se encontró el producto seleccionado'
      )

      return
    }

    if (!categoriaId) {
      setError(
        'Debes seleccionar una categoría'
      )

      return
    }

    if (!codigo.trim()) {
      setError(
        'El código del producto es obligatorio'
      )

      return
    }

    if (!nombre.trim()) {
      setError(
        'El nombre del producto es obligatorio'
      )

      return
    }

    if (
      precioVenta === '' ||
      Number(precioVenta) < 0
    ) {
      setError(
        'El precio de venta debe ser válido'
      )

      return
    }

    try {
      setGuardando(true)

      const formData = new FormData()

      formData.append(
        'categoria_id',
        categoriaId
      )

      formData.append(
        'codigo',
        codigo.trim()
      )

      formData.append(
        'nombre',
        nombre.trim()
      )

      formData.append(
        'descripcion',
        descripcion.trim()
      )

      formData.append(
        'precio_compra',
        precioCompra || 0
      )

      formData.append(
        'precio_venta',
        precioVenta
      )

      formData.append(
        'stock',
        stock || 0
      )

      formData.append(
        'stock_minimo',
        stockMinimo || 0
      )

      formData.append('descuento_tipo', descuentoTipo)
      formData.append('descuento_valor', descuentoValor || 0)
      formData.append('descuento_inicio', descuentoInicio)
      formData.append('descuento_fin', descuentoFin)
      formData.append('descuento_activo', descuentoActivo)

      formData.append(
        'activo',
        activo
      )

      if (imagen) {
        formData.append(
          'imagen',
          imagen
        )
      }

      await actualizarProducto(
        productoSeleccionado.id,
        formData
      )

      setModal(null)

      limpiarFormulario()

      setMensaje(
        'Producto actualizado correctamente'
      )

      await cargarProductos()

      setTimeout(() => {
        setMensaje('')
      }, 3000)
    } catch (err) {
      console.error(
        'Error al actualizar producto:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudo actualizar el producto'
      )
    } finally {
      setGuardando(false)
    }
  }

  // ==============================
  // ACTIVAR / DESACTIVAR
  // ==============================

  const manejarEstado = async (
    producto
  ) => {
    try {
      setError('')
      setMensaje('')

      if (producto.activo) {
        const aceptado = await confirmar({
          titulo: 'Desactivar producto',
          mensaje: `¿Deseas desactivar el producto "${producto.nombre}"?`,
          confirmarTexto: 'Desactivar',
        })

        if (!aceptado) return

        await eliminarProducto(
          producto.id
        )

        setMensaje(
          'Producto desactivado correctamente'
        )
      } else {
        await actualizarProducto(
          producto.id,
          (() => {
            const formData =
              new FormData()

            formData.append(
              'activo',
              true
            )

            return formData
          })()
        )

        setMensaje(
          'Producto activado correctamente'
        )
      }

      await cargarProductos()

      setTimeout(() => {
        setMensaje('')
      }, 3000)
    } catch (err) {
      console.error(
        'Error al cambiar estado:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudo cambiar el estado del producto'
      )
    }
  }

  // ==============================
  // ELIMINAR DEFINITIVAMENTE
  // ==============================

  const manejarEliminarDefinitivo =
    async (producto) => {
      const aceptado = await confirmar({
        titulo: 'Eliminar producto definitivamente',
        mensaje: `¿Estás seguro de eliminar definitivamente "${producto.nombre}"? Esta acción eliminará también su imagen y no se puede deshacer.`,
        confirmarTexto: 'Eliminar',
        peligrosa: true,
      })

      if (!aceptado) return

      try {
        setError('')
        setMensaje('')

        await eliminarProductoDefinitivo(
          producto.id
        )

        setMensaje(
          'Producto eliminado definitivamente'
        )

        await cargarProductos()

        setTimeout(() => {
          setMensaje('')
        }, 3000)
      } catch (err) {
        console.error(
          'Error al eliminar producto:',
          err
        )

        setError(
          err.response?.data?.message ||
            'No se pudo eliminar definitivamente el producto'
        )
      }
    }

  // ==============================
  // CARGANDO
  // ==============================

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-baby-primary" />
        </div>
      </div>
    )
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ==============================
          ENCABEZADO
      ============================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-baby-dark">
            Productos
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Administra los productos, precios e inventario
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            onClick={() => {
              cargarProductos()
              cargarCategorias()
            }}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Actualizar
          </button>

          <button
            onClick={() =>
              abrirModal('crear')
            }
            className="flex items-center gap-2 rounded-lg bg-baby-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={18} />
            Nuevo producto
          </button>

        </div>

      </div>

      {/* ==============================
          MENSAJES
      ============================== */}

      {mensaje && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {mensaje}
        </div>
      )}

      {error && !modal && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* ==============================
          RESUMEN
      ============================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Productos
              </p>

              <p className="mt-1 text-2xl font-bold text-baby-dark">
                {productos.length}
              </p>
            </div>

            <div className="rounded-lg bg-baby-secondary p-3">
              <Package
                size={22}
                className="text-baby-primary"
              />
            </div>

          </div>

        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Activos
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {
                  productos.filter(
                    (producto) =>
                      producto.activo
                  ).length
                }
              </p>
            </div>

            <div className="rounded-lg bg-green-100 p-3">
              <Power
                size={22}
                className="text-green-600"
              />
            </div>

          </div>

        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Categorías
              </p>

              <p className="mt-1 text-2xl font-bold text-baby-dark">
                {categorias.length}
              </p>
            </div>

            <div className="rounded-lg bg-baby-secondary p-3">
              <Tag
                size={22}
                className="text-baby-primary"
              />
            </div>

          </div>

        </div>

        <div className="rounded-xl bg-baby-primary p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-white/80">
                Stock bajo
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {
                  productos.filter(
                    (producto) =>
                      producto.activo &&
                      Number(
                        producto.stock
                      ) <=
                        Number(
                          producto.stock_minimo
                        )
                  ).length
                }
              </p>
            </div>

            <div className="rounded-lg bg-white/20 p-3">
              <Boxes
                size={22}
                className="text-white"
              />
            </div>

          </div>

        </div>

      </div>

      {/* ==============================
          TABLA
      ============================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        {/* HEADER */}

        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4">

          <div>
            <h2 className="font-bold text-baby-dark">
              Lista de productos
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {productosFiltrados.length}{' '}
              producto
              {productosFiltrados.length !==
              1
                ? 's'
                : ''}{' '}
              mostrado
              {productosFiltrados.length !==
              1
                ? 's'
                : ''}
            </p>
          </div>

          {/* FILTROS */}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            {/* BUSCADOR */}

            <div className="relative">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
                placeholder="Buscar producto..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
              />

            </div>

            {/* CATEGORÍA */}

            <select
              value={filtroCategoria}
              onChange={(e) =>
                setFiltroCategoria(
                  e.target.value
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
            >
              <option value="TODAS">
                Todas las categorías
              </option>

              {categorias.map(
                (categoria) => (
                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nombre}
                  </option>
                )
              )}
            </select>

            {/* ESTADO */}

            <select
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(
                  e.target.value
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
            >
              <option value="TODOS">
                Todos los estados
              </option>

              <option value="ACTIVOS">
                Activos
              </option>

              <option value="INACTIVOS">
                Inactivos
              </option>
            </select>

          </div>

        </div>

        {/* ==============================
            SIN RESULTADOS
        ============================== */}

        {productosFiltrados.length === 0 ? (

          <div className="py-14 text-center">

            <Package
              size={34}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="text-sm font-medium text-gray-600">
              No se encontraron productos
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {busqueda ||
              filtroCategoria !==
                'TODAS' ||
              filtroEstado !==
                'TODOS'
                ? 'Intenta cambiar los filtros de búsqueda.'
                : 'Aún no hay productos registrados.'}
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Producto
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Categoría
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Precio compra
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Precio venta
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Stock
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>

                </tr>
              </thead>

              <tbody>

                {productosFiltrados.map(
                  (producto) => {

                    const stockBajo =
                      Number(
                        producto.stock
                      ) <=
                      Number(
                        producto.stock_minimo
                      )

                    return (
                      <tr
                        key={producto.id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >

                        {/* PRODUCTO */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            {producto.imagen ? (

                              <img
                                src={
                                  obtenerUrlImagen(
                                    producto.imagen
                                  )
                                }
                                alt={
                                  producto.nombre
                                }
                                className="h-11 w-11 rounded-lg border border-gray-100 object-cover"
                              />

                            ) : (

                              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-baby-secondary">
                                <Package
                                  size={19}
                                  className="text-baby-primary"
                                />
                              </div>

                            )}

                            <div>

                              <p className="text-sm font-semibold text-baby-dark">
                                {producto.nombre}
                              </p>

                              <p className="text-xs text-gray-400">
                                Código:{' '}
                                {producto.codigo}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORÍA */}

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-baby-secondary px-3 py-1 text-xs font-medium text-baby-primary">
                            <Tag size={13} />

                            {producto
                              .categoria
                              ?.nombre ||
                              'Sin categoría'}
                          </span>

                        </td>

                        {/* PRECIO COMPRA */}

                        <td className="px-5 py-4 text-sm font-medium text-gray-700">
                          {moneda(
                            producto.precio_compra
                          )}
                        </td>

                        {/* PRECIO VENTA */}

                        <td className="px-5 py-4 text-sm font-semibold text-baby-dark">
                          {moneda(
                            producto.precio_venta
                          )}
                        </td>

                        {/* STOCK */}

                        <td className="px-5 py-4">

                          <div>

                            <span
                              className={`text-sm font-semibold ${
                                stockBajo
                                  ? 'text-red-600'
                                  : 'text-gray-700'
                              }`}
                            >
                              {producto.stock}
                            </span>

                            <span className="ml-1 text-xs text-gray-400">
                              unidades
                            </span>

                          </div>

                          <p className="mt-0.5 text-xs text-gray-400">
                            Mínimo:{' '}
                            {
                              producto.stock_minimo
                            }
                          </p>

                        </td>

                        {/* ESTADO */}

                        <td className="px-5 py-4">

                          {producto.activo ? (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">

                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                              Activo

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">

                              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />

                              Inactivo

                            </span>

                          )}

                        </td>

                        {/* ACCIONES */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                abrirModal(
                                  'editar',
                                  producto
                                )
                              }
                              title="Editar"
                              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-baby-primary hover:bg-baby-secondary hover:text-baby-primary"
                            >
                              <Edit
                                size={16}
                              />
                            </button>

                            <button
                              onClick={() =>
                                manejarEstado(
                                  producto
                                )
                              }
                              title={
                                producto.activo
                                  ? 'Desactivar'
                                  : 'Activar'
                              }
                              className={`rounded-lg border border-gray-200 p-2 text-gray-500 transition ${
                                producto.activo
                                  ? 'hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600'
                                  : 'hover:border-green-300 hover:bg-green-50 hover:text-green-600'
                              }`}
                            >
                              <Power
                                size={16}
                              />
                            </button>

                            {!producto.activo && (
                              <button
                                onClick={() =>
                                  manejarEliminarDefinitivo(
                                    producto
                                  )
                                }
                                title="Eliminar definitivamente"
                                className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ==============================
          MODAL
      ============================== */}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">

              <div>

                <h2 className="text-xl font-bold text-baby-dark">

                  {modal === 'crear'
                    ? 'Nuevo producto'
                    : 'Editar producto'}

                </h2>

                <p className="mt-1 text-sm text-gray-500">

                  {modal === 'crear'
                    ? 'Registra la información del nuevo producto.'
                    : 'Modifica la información del producto.'}

                </p>

              </div>

              <button
                onClick={cerrarModal}
                disabled={guardando}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORMULARIO */}

            <form
              onSubmit={
                modal === 'crear'
                  ? manejarCrear
                  : manejarActualizar
              }
              className="space-y-6 p-6"
            >

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle
                    size={18}
                  />

                  {error}
                </div>
              )}

              {/* ==============================
                  IMAGEN
              ============================== */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Imagen del producto
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">

                    {imagenPreview ? (

                      <img
                        src={
                          obtenerUrlImagen(
                            imagenPreview
                          )
                        }
                        alt="Vista previa"
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      <ImageIcon
                        size={32}
                        className="text-gray-300"
                      />

                    )}

                  </div>

                  <div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">

                      <ImageIcon
                        size={17}
                      />

                      Seleccionar imagen

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={
                          manejarImagen
                        }
                        className="hidden"
                      />

                    </label>

                    <p className="mt-2 text-xs text-gray-400">
                      JPG, PNG o WEBP. Máximo 5 MB.
                    </p>

                  </div>

                </div>

              </div>

              {/* ==============================
                  INFORMACIÓN BÁSICA
              ============================== */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* CATEGORÍA */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Categoría *
                  </label>

                  <select
                    value={categoriaId}
                    onChange={(e) =>
                      setCategoriaId(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                  >

                    <option value="">
                      Selecciona una categoría
                    </option>

                    {categorias.map(
                      (categoria) => (
                        <option
                          key={
                            categoria.id
                          }
                          value={
                            categoria.id
                          }
                        >
                          {
                            categoria.nombre
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* CÓDIGO */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Código
                  </label>

                  <input
                    type="text"
                    value={codigo || 'Se generará automáticamente'}
                    readOnly
                    disabled={modal === 'crear'}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none"
                  />

                </div>

                {/* NOMBRE */}

                <div className="md:col-span-2">

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>

                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) =>
                      setNombre(
                        e.target.value
                      )
                    }
                    maxLength={150}
                    placeholder="Ej. Leche entera"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                  />

                </div>

                {/* DESCRIPCIÓN */}

                <div className="md:col-span-2">

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Descripción
                  </label>

                  <textarea
                    value={descripcion}
                    onChange={(e) =>
                      setDescripcion(
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Descripción del producto..."
                    className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                  />

                </div>

              </div>

              {/* ==============================
                  PRECIOS
              ============================== */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-baby-dark">
                  Información de precios
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* PRECIO COMPRA */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Precio de compra
                    </label>

                    <div className="relative">

                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        L
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          precioCompra
                        }
                        onChange={(e) =>
                          setPrecioCompra(
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                      />

                    </div>

                  </div>

                  {/* PRECIO VENTA */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Precio de venta *
                    </label>

                    <div className="relative">

                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        L
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          precioVenta
                        }
                        onChange={(e) =>
                          setPrecioVenta(
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* ==============================
                  DESCUENTO
              ============================== */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-baby-dark">
                  Descuento / promoción
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Tipo de descuento
                    </label>
                    <select
                      value={descuentoTipo}
                      onChange={(e) => setDescuentoTipo(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    >
                      <option value="">Sin descuento</option>
                      <option value="PORCENTAJE">Porcentaje</option>
                      <option value="MONTO">Monto fijo</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Valor del descuento
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={descuentoValor}
                      onChange={(e) => setDescuentoValor(e.target.value)}
                      disabled={!descuentoTipo}
                      placeholder={descuentoTipo === 'PORCENTAJE' ? '10' : '20.00'}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Inicio de promoción
                    </label>
                    <input
                      type="date"
                      value={descuentoInicio}
                      onChange={(e) => setDescuentoInicio(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Fin de promoción
                    </label>
                    <input
                      type="date"
                      value={descuentoFin}
                      onChange={(e) => setDescuentoFin(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    />
                  </div>

                </div>

                {modal === 'editar' && descuentoTipo && (
                  <button
                    type="button"
                    onClick={() => setDescuentoActivo(!descuentoActivo)}
                    className={`mt-4 flex w-full items-center justify-between rounded-lg border px-4 py-3 transition ${
                      descuentoActivo
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {descuentoActivo ? 'Descuento activo' : 'Descuento inactivo'}
                    </span>
                    <span className={`h-5 w-9 rounded-full p-0.5 ${descuentoActivo ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${descuentoActivo ? 'translate-x-4' : ''}`} />
                    </span>
                  </button>
                )}

              </div>

              {/* ==============================
                  INVENTARIO
              ============================== */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-baby-dark">
                  Información de inventario
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* STOCK */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={stock}
                      onChange={(e) =>
                        setStock(
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    />

                  </div>

                  {/* STOCK MÍNIMO */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Stock mínimo
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        stockMinimo
                      }
                      onChange={(e) =>
                        setStockMinimo(
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    />

                    <p className="mt-1.5 text-xs text-gray-400">
                      Se utilizará para identificar productos con stock bajo.
                    </p>

                  </div>

                </div>

              </div>

              {/* ==============================
                  ESTADO
              ============================== */}

              {modal === 'editar' && (
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Estado
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setActivo(!activo)
                    }
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 transition ${
                      activo
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <Power
                        size={18}
                        className={
                          activo
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }
                      />

                      <div className="text-left">

                        <p
                          className={`text-sm font-medium ${
                            activo
                              ? 'text-green-700'
                              : 'text-gray-600'
                          }`}
                        >
                          {activo
                            ? 'Producto activo'
                            : 'Producto inactivo'}
                        </p>

                        <p className="text-xs text-gray-400">
                          Haz clic para cambiar el estado.
                        </p>

                      </div>

                    </div>

                    <div
                      className={`h-5 w-9 rounded-full p-0.5 transition ${
                        activo
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    >

                      <div
                        className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          activo
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />

                    </div>

                  </button>

                </div>
              )}

              {/* ==============================
                  BOTONES
              ============================== */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center gap-2 rounded-lg bg-baby-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >

                  <Save size={17} />

                  {guardando
                    ? 'Guardando...'
                    : modal === 'crear'
                      ? 'Crear producto'
                      : 'Guardar cambios'}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default Producto