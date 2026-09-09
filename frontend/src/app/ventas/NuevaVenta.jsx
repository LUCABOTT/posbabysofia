import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfirm } from '../../components/ui/confirmContext'

import {
    ArrowLeft,
    Search,
    Package,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    UserRound,
    CreditCard,
    Banknote,
    Landmark,
    Receipt,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    X,
    WalletCards,
} from 'lucide-react'

import { listarProductos } from '../../services/productoService'
import { obtenerClientes } from '../../services/clientesService'
import { crearVenta } from '../../services/ventaService'
import { obtenerCajaActual } from '../../services/cajaService'

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

const NuevaVenta = () => {
    const confirmar = useConfirm()

    const navigate = useNavigate()

    // =========================================================
    // DATOS
    // =========================================================

    const [productos, setProductos] = useState([])
    const [clientes, setClientes] = useState([])

    const [caja, setCaja] = useState(null)

    // =========================================================
    // ESTADOS
    // =========================================================

    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [actualizando, setActualizando] = useState(false)

    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    // =========================================================
    // BUSCADOR
    // =========================================================

    const [busqueda, setBusqueda] = useState('')

    // =========================================================
    // CARRITO
    // =========================================================

    const [carrito, setCarrito] = useState([])

    // =========================================================
    // CLIENTE
    // =========================================================

    const [clienteId, setClienteId] = useState('')

    // =========================================================
    // PAGO
    // =========================================================

    const [metodoPago, setMetodoPago] = useState('EFECTIVO')

    const [recibido, setRecibido] = useState('')

    const [referencia, setReferencia] = useState('')

    // =========================================================
    // MONEDA
    // =========================================================

    const moneda = (valor) => {

        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL',
            minimumFractionDigits: 2,
        }).format(Number(valor || 0))

    }

    // =========================================================
    // CARGAR DATOS
    // =========================================================

    const cargarDatos = async () => {

        try {

            setCargando(true)
            setError('')

            const [
                productosData,
                clientesData,
            ] = await Promise.all([
                listarProductos(),
                obtenerClientes(),
            ])

            setProductos(
                Array.isArray(productosData)
                    ? productosData.filter(
                        (producto) => producto.activo
                    )
                    : []
            )

            setClientes(
                Array.isArray(clientesData)
                    ? clientesData.filter(
                        (cliente) => cliente.activo
                    )
                    : []
            )

            try {

                const cajaData = await obtenerCajaActual()

                setCaja(cajaData)

            } catch (cajaError) {

                if (
                    cajaError.response?.status === 404
                ) {
                    setCaja(null)
                } else {
                    console.error(
                        'Error al obtener caja:',
                        cajaError
                    )
                }

            }

        } catch (err) {

            console.error(
                'Error al cargar datos:',
                err
            )

            setError(
                err.response?.data?.message ||
                'No se pudieron cargar los datos de la venta'
            )

        } finally {

            setCargando(false)

        }

    }

    // =========================================================
    // CARGA INICIAL
    // =========================================================

    useEffect(() => {

        cargarDatos()

    }, [])

    // =========================================================
    // ACTUALIZAR DATOS
    // =========================================================

    const actualizarDatos = async () => {

        try {

            setActualizando(true)
            setError('')

            const productosData = await listarProductos()

            setProductos(
                Array.isArray(productosData)
                    ? productosData.filter(
                        (producto) => producto.activo
                    )
                    : []
            )

            try {

                const cajaData = await obtenerCajaActual()

                setCaja(cajaData)

            } catch (cajaError) {

                if (
                    cajaError.response?.status === 404
                ) {
                    setCaja(null)
                }

            }

        } catch (err) {

            console.error(
                'Error al actualizar:',
                err
            )

            setError(
                err.response?.data?.message ||
                'No se pudieron actualizar los datos'
            )

        } finally {

            setActualizando(false)

        }

    }

    // =========================================================
    // PRODUCTOS FILTRADOS
    // =========================================================

    const productosFiltrados = useMemo(() => {

        const texto = busqueda
            .toLowerCase()
            .trim()

        return productos.filter((producto) => {

            if (!texto) {
                return true
            }

            return (
                producto.nombre
                    ?.toLowerCase()
                    .includes(texto) ||

                producto.codigo
                    ?.toLowerCase()
                    .includes(texto) ||

                producto.categoria?.nombre
                    ?.toLowerCase()
                    .includes(texto)
            )

        })

    }, [
        productos,
        busqueda,
    ])

    // =========================================================
    // AGREGAR PRODUCTO
    // =========================================================

    const agregarProducto = (producto) => {

        setError('')
        setMensaje('')

        if (!producto.activo) {

            setError(
                'El producto seleccionado está inactivo'
            )

            return
        }

        const stockDisponible =
            Number(producto.stock || 0)

        if (stockDisponible <= 0) {

            setError(
                `El producto "${producto.nombre}" no tiene stock disponible`
            )

            return
        }

        const productoExistente =
            carrito.find(
                (item) =>
                    Number(item.producto_id) ===
                    Number(producto.id)
            )

        if (productoExistente) {

            if (
                productoExistente.cantidad >=
                stockDisponible
            ) {

                setError(
                    `No hay más stock disponible de "${producto.nombre}"`
                )

                return
            }

            setCarrito((prev) =>
                prev.map((item) =>
                    Number(item.producto_id) ===
                    Number(producto.id)
                        ? {
                            ...item,
                            cantidad:
                                item.cantidad + 1,
                            subtotal:
                                (
                                    (item.cantidad + 1) *
                                    Number(
                                        item.precio_unitario
                                    )
                                ),
                        }
                        : item
                )
            )

            return
        }

        setCarrito((prev) => [
            ...prev,
            {
                producto_id: producto.id,
                codigo: producto.codigo,
                nombre: producto.nombre,
                imagen: producto.imagen,
                precio_unitario:
                    Number(producto.precio_final ?? producto.precio_venta ?? 0),
                precio_original: Number(producto.precio_venta || 0),
                cantidad: 1,
                stock: stockDisponible,
                subtotal:
                    Number(producto.precio_final ?? producto.precio_venta ?? 0),
            },
        ])

    }

    // =========================================================
    // AUMENTAR CANTIDAD
    // =========================================================

    const aumentarCantidad = (productoId) => {

        setError('')

        setCarrito((prev) =>
            prev.map((item) => {

                if (
                    Number(item.producto_id) !==
                    Number(productoId)
                ) {
                    return item
                }

                if (
                    item.cantidad >=
                    Number(item.stock)
                ) {

                    setError(
                        `No hay más stock disponible de "${item.nombre}"`
                    )

                    return item
                }

                const nuevaCantidad =
                    item.cantidad + 1

                return {
                    ...item,
                    cantidad: nuevaCantidad,
                    subtotal:
                        nuevaCantidad *
                        Number(item.precio_unitario),
                }

            })
        )

    }

    // =========================================================
    // DISMINUIR CANTIDAD
    // =========================================================

    const disminuirCantidad = (productoId) => {

        setError('')

        setCarrito((prev) =>
            prev
                .map((item) => {

                    if (
                        Number(item.producto_id) !==
                        Number(productoId)
                    ) {
                        return item
                    }

                    const nuevaCantidad =
                        item.cantidad - 1

                    return {
                        ...item,
                        cantidad: nuevaCantidad,
                        subtotal:
                            nuevaCantidad *
                            Number(item.precio_unitario),
                    }

                })
                .filter(
                    (item) =>
                        item.cantidad > 0
                )
        )

    }

    // =========================================================
    // ELIMINAR DEL CARRITO
    // =========================================================

    const eliminarDelCarrito = (productoId) => {

        setCarrito((prev) =>
            prev.filter(
                (item) =>
                    Number(item.producto_id) !==
                    Number(productoId)
            )
        )

        setError('')

    }

    // =========================================================
    // LIMPIAR CARRITO
    // =========================================================

    const limpiarVenta = async () => {

        if (carrito.length === 0) {
            return
        }

        const aceptado = await confirmar({
            titulo: 'Limpiar venta',
            mensaje: '¿Deseas eliminar todos los productos de la venta?',
            confirmarTexto: 'Limpiar',
            peligrosa: true,
        })

        if (!aceptado) return

        setCarrito([])
        setClienteId('')
        setRecibido('')
        setReferencia('')
        setError('')
        setMensaje('')

    }

    // =========================================================
    // SUBTOTAL
    // =========================================================

    const subtotal = useMemo(() => {

        return carrito.reduce(
            (total, item) =>
                total +
                Number(item.subtotal || 0),
            0
        )

    }, [carrito])

    const descuentoNumerico = 0

    const descuentoProductos = useMemo(() => {
        return carrito.reduce(
            (total, item) => total + Math.max(
                0,
                Number(item.precio_original || item.precio_unitario) -
                Number(item.precio_unitario)
            ) * Number(item.cantidad || 0),
            0
        )
    }, [carrito])

    // =========================================================
    // TOTAL
    // =========================================================

    const total = useMemo(() => {

        return Math.max(0, subtotal - descuentoNumerico)

    }, [
        subtotal,
        descuentoNumerico,
    ])

    // =========================================================
    // CAMBIO
    // =========================================================

    const cambio = useMemo(() => {

        if (
            metodoPago !== 'EFECTIVO'
        ) {
            return 0
        }

        return Math.max(
            0,
            Number(recibido || 0) -
            total
        )

    }, [
        recibido,
        total,
        metodoPago,
    ])

    // =========================================================
    // EFECTIVO ACTUAL
    // =========================================================

    const efectivoActual = Number(
        caja?.monto_esperado ??
        caja?.monto_inicial ??
        0
    )

    // =========================================================
    // CAMBIAR MÉTODO DE PAGO
    // =========================================================

    const cambiarMetodoPago = (metodo) => {

        setMetodoPago(metodo)
        setRecibido('')
        setReferencia('')
        setError('')

    }

    // =========================================================
    // VALIDAR VENTA
    // =========================================================

    const validarVenta = () => {

        if (carrito.length === 0) {

            setError(
                'Debes agregar al menos un producto a la venta'
            )

            return false
        }

        if (descuentoNumerico < 0) {

            setError(
                'El descuento no puede ser negativo'
            )

            return false
        }

        if (descuentoNumerico > subtotal) {

            setError(
                'El descuento no puede ser mayor al subtotal'
            )

            return false
        }

        if (
            metodoPago === 'EFECTIVO' &&
            !caja
        ) {

            setError(
                'No hay una caja abierta. Debes abrir una caja para registrar una venta en efectivo.'
            )

            return false
        }

        if (metodoPago === 'EFECTIVO') {

            const montoRecibido =
                Number(recibido || 0)

            if (montoRecibido <= 0) {

                setError(
                    'Ingresa el monto recibido'
                )

                return false
            }

            if (montoRecibido < total) {

                setError(
                    `El efectivo recibido es insuficiente. Faltan ${moneda(
                        total - montoRecibido
                    )}`
                )

                return false
            }

        }

        if (
            metodoPago === 'TARJETA' ||
            metodoPago === 'TRANSFERENCIA'
        ) {

            if (
                Number(recibido || 0) !==
                Number(total)
            ) {

                setError(
                    'El monto recibido debe ser exactamente igual al total de la venta'
                )

                return false
            }

        }

        if (
            metodoPago === 'TRANSFERENCIA' &&
            !referencia.trim()
        ) {

            setError(
                'Debes ingresar la referencia de la transferencia'
            )

            return false
        }

        return true

    }

    // =========================================================
    // REGISTRAR VENTA
    // =========================================================

    const manejarCrearVenta = async () => {

        setError('')
        setMensaje('')

        if (!validarVenta()) {
            return
        }

        try {

            setGuardando(true)

            const datos = {

                cliente_id:
                    clienteId
                        ? Number(clienteId)
                        : null,

                productos:
                    carrito.map((item) => ({
                        producto_id:
                            Number(
                                item.producto_id
                            ),

                        cantidad:
                            Number(
                                item.cantidad
                            ),
                    })),

                descuento:
                    Number(
                        descuentoNumerico || 0
                    ),

                pago: {

                    metodo:
                        metodoPago,

                    recibido:
                        Number(
                            recibido || 0
                        ),

                    referencia:
                        referencia.trim() ||
                        null,

                },

            }

            const respuesta =
                await crearVenta(datos)

            setMensaje(
                'Venta registrada correctamente'
            )

            /*
             * El backend devuelve:
             *
             * factura: {
             *   id,
             *   numero_factura
             * }
             */

            if (
                respuesta?.factura?.id
            ) {

                setTimeout(() => {

                    navigate(
                        `/facturas/${respuesta.factura.id}`
                    )

                }, 500)

                return
            }

            /*
             * Si por alguna razón el backend
             * no devuelve la factura, volvemos
             * a la lista de ventas.
             */

            setTimeout(() => {

                navigate('/ventas')

            }, 700)

        } catch (err) {

            console.error(
                'Error al crear venta:',
                err
            )

            setError(
                err.response?.data?.message ||
                'No se pudo registrar la venta'
            )

        } finally {

            setGuardando(false)

        }

    }

    // =========================================================
    // PRODUCTO EN CARRITO
    // =========================================================

    const productoEnCarrito = (productoId) => {

        return carrito.find(
            (item) =>
                Number(item.producto_id) ===
                Number(productoId)
        )

    }

    // =========================================================
    // CARGANDO
    // =========================================================

    if (cargando) {

        return (

            <div className="min-h-screen bg-gray-50 p-4 md:p-6">

                <div className="flex min-h-[500px] items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-baby-primary" />

                        <p className="mt-3 text-sm text-gray-500">
                            Cargando punto de venta...
                        </p>

                    </div>

                </div>

            </div>

        )

    }

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* =====================================================
                ENCABEZADO
            ===================================================== */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/ventas')
                        }
                        className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-baby-primary"
                    >
                        <ArrowLeft size={19} />
                    </button>

                    <div>

                        <h1 className="text-2xl font-bold text-baby-dark">
                            Nueva venta
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Registra una nueva venta y genera su factura
                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={actualizarDatos}
                        disabled={actualizando}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
                    >

                        <RefreshCw
                            size={17}
                            className={
                                actualizando
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        Actualizar

                    </button>

                </div>

            </div>

            {/* =====================================================
                MENSAJES
            ===================================================== */}

            {mensaje && (

                <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                    <CheckCircle2 size={18} />

                    {mensaje}

                </div>

            )}

            {error && (

                <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError('')
                        }
                        className="ml-auto shrink-0"
                    >
                        <X size={17} />
                    </button>

                </div>

            )}

            {/* =====================================================
                CAJA
            ===================================================== */}

            <div className="mb-6">

                {caja ? (

                    <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-green-100 p-3">

                                <WalletCards
                                    size={21}
                                    className="text-green-600"
                                />

                            </div>

                            <div>

                                <p className="text-sm font-semibold text-green-800">
                                    Caja abierta
                                </p>

                                <p className="text-xs text-green-600">
                                    Puedes registrar ventas en efectivo
                                </p>

                            </div>

                        </div>

                        <div className="text-left md:text-right">

                            <p className="text-xs text-green-600">
                                Efectivo disponible
                            </p>

                            <p className="text-lg font-bold text-green-700">
                                {moneda(efectivoActual)}
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-orange-100 p-3">

                                <AlertCircle
                                    size={21}
                                    className="text-orange-600"
                                />

                            </div>

                            <div>

                                <p className="text-sm font-semibold text-orange-800">
                                    No hay una caja abierta
                                </p>

                                <p className="text-xs text-orange-600">
                                    Las ventas en efectivo requieren una caja abierta.
                                </p>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/caja')
                            }
                            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
                        >
                            Ir a caja
                        </button>

                    </div>

                )}

            </div>

            {/* =====================================================
                CONTENIDO PRINCIPAL
            ===================================================== */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">

                {/* =================================================
                    IZQUIERDA - PRODUCTOS
                ================================================= */}

                <div className="min-w-0">

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                        {/* HEADER */}

                        <div className="border-b border-gray-100 p-5">

                            <div className="mb-4 flex items-center justify-between">

                                <div>

                                    <h2 className="font-bold text-baby-dark">
                                        Productos
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Selecciona los productos que deseas vender
                                    </p>

                                </div>

                                <div className="rounded-lg bg-baby-secondary p-2.5">

                                    <Package
                                        size={20}
                                        className="text-baby-primary"
                                    />

                                </div>

                            </div>

                            {/* BUSCADOR */}

                            <div className="relative">

                                <Search
                                    size={18}
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
                                    placeholder="Buscar por nombre, código o categoría..."
                                    className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                                />

                            </div>

                        </div>

                        {/* PRODUCTOS */}

                        {productosFiltrados.length === 0 ? (

                            <div className="flex flex-col items-center justify-center py-16 text-center">

                                <div className="mb-4 rounded-full bg-baby-secondary p-4">

                                    <Package
                                        size={30}
                                        className="text-baby-primary"
                                    />

                                </div>

                                <p className="font-semibold text-baby-dark">
                                    No se encontraron productos
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Intenta cambiar el término de búsqueda.
                                </p>

                            </div>

                        ) : (

                            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">

                                {productosFiltrados.map(
                                    (producto) => {

                                        const item =
                                            productoEnCarrito(
                                                producto.id
                                            )

                                        const cantidad =
                                            item?.cantidad || 0

                                        const stock =
                                            Number(
                                                producto.stock || 0
                                            )

                                        const sinStock =
                                            stock <= 0

                                        const stockBajo =
                                            stock <=
                                            Number(
                                                producto.stock_minimo || 0
                                            )

                                        return (

                                            <div
                                                key={
                                                    producto.id
                                                }
                                                className="group rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-baby-primary/30 hover:shadow-md"
                                            >

                                                {/* IMAGEN */}

                                                <div className="relative mb-3 flex h-36 items-center justify-center overflow-hidden rounded-lg bg-gray-50">

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
                                                            className="h-full w-full object-cover"
                                                        />

                                                    ) : (

                                                        <Package
                                                            size={38}
                                                            className="text-gray-300"
                                                        />

                                                    )}

                                                    {cantidad > 0 && (

                                                        <div className="absolute right-2 top-2 rounded-full bg-baby-primary px-2.5 py-1 text-xs font-bold text-white shadow-sm">

                                                            {cantidad}
                                                            {' '}
                                                            en carrito

                                                        </div>

                                                    )}

                                                </div>

                                                {/* INFO */}

                                                <div>

                                                    <p className="line-clamp-2 min-h-[40px] text-sm font-semibold text-baby-dark">

                                                        {
                                                            producto.nombre
                                                        }

                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">

                                                        Código:{' '}
                                                        {
                                                            producto.codigo
                                                        }

                                                    </p>

                                                    <div className="mt-3 flex items-end justify-between gap-2">

                                                        <div>

                                                            <p className="text-base font-bold text-baby-primary">

                                                                {producto.descuento_vigente && (
                                                                    <span className="mr-2 text-xs text-gray-400 line-through">
                                                                        {moneda(producto.precio_venta)}
                                                                    </span>
                                                                )}
                                                                {moneda(
                                                                    producto.precio_final ?? producto.precio_venta
                                                                )}

                                                            </p>

                                                            <p
                                                                className={`mt-0.5 text-xs ${
                                                                    sinStock
                                                                        ? 'text-red-500'
                                                                        : stockBajo
                                                                            ? 'text-orange-500'
                                                                            : 'text-gray-400'
                                                                }`}
                                                            >

                                                                Stock:{' '}
                                                                {stock}

                                                            </p>

                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                agregarProducto(
                                                                    producto
                                                                )
                                                            }
                                                            disabled={
                                                                sinStock ||
                                                                cantidad >=
                                                                stock
                                                            }
                                                            className="flex items-center gap-1.5 rounded-lg bg-baby-primary px-3 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                                                        >

                                                            <Plus
                                                                size={15}
                                                            />

                                                            Agregar

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        )

                                    }
                                )}

                            </div>

                        )}

                    </div>

                </div>

                {/* =================================================
                    DERECHA - RESUMEN
                ================================================= */}

                <div className="min-w-0">

                    <div className="sticky top-4 overflow-hidden rounded-xl bg-white shadow-sm">

                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                            <div className="flex items-center gap-3">

                                <div className="rounded-lg bg-baby-secondary p-2.5">

                                    <ShoppingCart
                                        size={20}
                                        className="text-baby-primary"
                                    />

                                </div>

                                <div>

                                    <h2 className="font-bold text-baby-dark">
                                        Resumen de venta
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        {carrito.length}{' '}
                                        producto
                                        {carrito.length !== 1
                                            ? 's'
                                            : ''}
                                    </p>

                                </div>

                            </div>

                            {carrito.length > 0 && (

                                <button
                                    type="button"
                                    onClick={limpiarVenta}
                                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                    title="Limpiar venta"
                                >
                                    <Trash2 size={17} />
                                </button>

                            )}

                        </div>

                        <div className="max-h-[calc(100vh-180px)] overflow-y-auto">

                            {/* =====================================
                                CLIENTE
                            ===================================== */}

                            <div className="border-b border-gray-100 p-5">

                                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-baby-dark">

                                    <UserRound
                                        size={16}
                                        className="text-baby-primary"
                                    />

                                    Cliente

                                </label>

                                <select
                                    value={clienteId}
                                    onChange={(e) =>
                                        setClienteId(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                                >

                                    <option value="">
                                        Consumidor final / Sin cliente
                                    </option>

                                    {clientes.map(
                                        (cliente) => (

                                            <option
                                                key={
                                                    cliente.id
                                                }
                                                value={
                                                    cliente.id
                                                }
                                            >
                                                {
                                                    cliente.nombre
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            {/* =====================================
                                CARRITO
                            ===================================== */}

                            <div className="border-b border-gray-100 p-5">

                                <div className="mb-3 flex items-center justify-between">

                                    <h3 className="text-sm font-semibold text-baby-dark">
                                        Productos seleccionados
                                    </h3>

                                    {carrito.length > 0 && (

                                        <span className="text-xs text-gray-400">
                                            {carrito.reduce(
                                                (
                                                    totalCantidad,
                                                    item
                                                ) =>
                                                    totalCantidad +
                                                    item.cantidad,
                                                0
                                            )}
                                            {' '}
                                            unidades
                                        </span>

                                    )}

                                </div>

                                {carrito.length === 0 ? (

                                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">

                                        <ShoppingCart
                                            size={28}
                                            className="mx-auto mb-2 text-gray-300"
                                        />

                                        <p className="text-sm font-medium text-gray-500">
                                            El carrito está vacío
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Agrega productos para comenzar la venta.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="space-y-3">

                                        {carrito.map(
                                            (item) => (

                                                <div
                                                    key={
                                                        item.producto_id
                                                    }
                                                    className="rounded-lg border border-gray-100 p-3"
                                                >

                                                    <div className="flex gap-3">

                                                        {/* IMAGEN */}

                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-baby-secondary">

                                                            {item.imagen ? (

                                                                <img
                                                                    src={
                                                                        obtenerUrlImagen(
                                                                            item.imagen
                                                                        )
                                                                    }
                                                                    alt={
                                                                        item.nombre
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />

                                                            ) : (

                                                                <Package
                                                                    size={20}
                                                                    className="text-baby-primary"
                                                                />

                                                            )}

                                                        </div>

                                                        {/* INFO */}

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-start justify-between gap-2">

                                                                <div className="min-w-0">

                                                                    <p className="truncate text-sm font-semibold text-baby-dark">
                                                                        {
                                                                            item.nombre
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-gray-400">
                                                                        {
                                                                            moneda(
                                                                                item.precio_unitario
                                                                            )
                                                                        }
                                                                        {' '}
                                                                        c/u
                                                                    </p>

                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        eliminarDelCarrito(
                                                                            item.producto_id
                                                                        )
                                                                    }
                                                                    className="shrink-0 rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                                >

                                                                    <Trash2
                                                                        size={15}
                                                                    />

                                                                </button>

                                                            </div>

                                                            <div className="mt-2 flex items-center justify-between">

                                                                {/* CANTIDAD */}

                                                                <div className="flex items-center rounded-lg border border-gray-200">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            disminuirCantidad(
                                                                                item.producto_id
                                                                            )
                                                                        }
                                                                        className="p-1.5 text-gray-500 transition hover:bg-gray-50 hover:text-baby-primary"
                                                                    >
                                                                        <Minus
                                                                            size={14}
                                                                        />
                                                                    </button>

                                                                    <span className="min-w-[32px] text-center text-sm font-semibold text-baby-dark">
                                                                        {
                                                                            item.cantidad
                                                                        }
                                                                    </span>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            aumentarCantidad(
                                                                                item.producto_id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            item.cantidad >=
                                                                            item.stock
                                                                        }
                                                                        className="p-1.5 text-gray-500 transition hover:bg-gray-50 hover:text-baby-primary disabled:cursor-not-allowed disabled:text-gray-200"
                                                                    >
                                                                        <Plus
                                                                            size={14}
                                                                        />
                                                                    </button>

                                                                </div>

                                                                <p className="text-sm font-bold text-baby-dark">

                                                                    {moneda(
                                                                        item.subtotal
                                                                    )}

                                                                </p>

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </div>

                            {/* =====================================
                                TOTALES
                            ===================================== */}

                            <div className="border-b border-gray-100 p-5">

                                <div className="space-y-3">

                                    <div className="flex items-center justify-between text-sm">

                                        <span className="text-gray-500">
                                            Subtotal
                                        </span>

                                        <span className="font-medium text-gray-700">
                                            {moneda(subtotal)}
                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between text-sm">

                                        <span className="text-gray-500">
                                            Descuentos de productos
                                        </span>

                                        <span className="font-medium text-red-500">
                                            - {moneda(
                                                descuentoProductos
                                            )}
                                        </span>

                                    </div>

                                    <div className="border-t border-gray-100 pt-3">

                                        <div className="flex items-center justify-between">

                                            <span className="text-base font-semibold text-baby-dark">
                                                Total
                                            </span>

                                            <span className="text-2xl font-bold text-baby-primary">
                                                {moneda(total)}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* =====================================
                                MÉTODO DE PAGO
                            ===================================== */}

                            <div className="border-b border-gray-100 p-5">

                                <div className="mb-3 flex items-center gap-2">

                                    <CreditCard
                                        size={17}
                                        className="text-baby-primary"
                                    />

                                    <h3 className="text-sm font-semibold text-baby-dark">
                                        Método de pago
                                    </h3>

                                </div>

                                <div className="grid grid-cols-3 gap-2">

                                    {/* EFECTIVO */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            cambiarMetodoPago(
                                                'EFECTIVO'
                                            )
                                        }
                                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition ${
                                            metodoPago ===
                                            'EFECTIVO'
                                                ? 'border-baby-primary bg-baby-secondary text-baby-primary'
                                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >

                                        <Banknote
                                            size={19}
                                        />

                                        Efectivo

                                    </button>

                                    {/* TARJETA */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            cambiarMetodoPago(
                                                'TARJETA'
                                            )
                                        }
                                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition ${
                                            metodoPago ===
                                            'TARJETA'
                                                ? 'border-baby-primary bg-baby-secondary text-baby-primary'
                                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >

                                        <CreditCard
                                            size={19}
                                        />

                                        Tarjeta

                                    </button>

                                    {/* TRANSFERENCIA */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            cambiarMetodoPago(
                                                'TRANSFERENCIA'
                                            )
                                        }
                                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition ${
                                            metodoPago ===
                                            'TRANSFERENCIA'
                                                ? 'border-baby-primary bg-baby-secondary text-baby-primary'
                                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >

                                        <Landmark
                                            size={19}
                                        />

                                        Transferencia

                                    </button>

                                </div>

                                {/* EFECTIVO */}

                                {metodoPago ===
                                    'EFECTIVO' && (

                                    <div className="mt-4 space-y-3">

                                        <div>

                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Efectivo recibido
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
                                                        recibido
                                                    }
                                                    onChange={(e) =>
                                                        setRecibido(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    className="w-full rounded-lg border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                                                />

                                            </div>

                                        </div>

                                        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">

                                            <span className="text-sm text-gray-500">
                                                Cambio
                                            </span>

                                            <span className="text-lg font-bold text-green-600">
                                                {moneda(cambio)}
                                            </span>

                                        </div>

                                    </div>

                                )}

                                {/* TARJETA */}

                                {metodoPago ===
                                    'TARJETA' && (

                                    <div className="mt-4">

                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Monto a cobrar
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
                                                    recibido
                                                }
                                                onChange={(e) =>
                                                    setRecibido(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={
                                                    Number(
                                                        total
                                                    ).toFixed(
                                                        2
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                                            />

                                        </div>

                                        <p className="mt-1.5 text-xs text-gray-400">
                                            Debe coincidir exactamente con el total.
                                        </p>

                                    </div>

                                )}

                                {/* TRANSFERENCIA */}

                                {metodoPago ===
                                    'TRANSFERENCIA' && (

                                    <div className="mt-4 space-y-3">

                                        <div>

                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Monto transferido
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
                                                        recibido
                                                    }
                                                    onChange={(e) =>
                                                        setRecibido(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={
                                                        Number(
                                                            total
                                                        ).toFixed(
                                                            2
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                                                />

                                            </div>

                                        </div>

                                        <div>

                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Referencia de transferencia
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    referencia
                                                }
                                                onChange={(e) =>
                                                    setReferencia(
                                                        e.target.value
                                                    )
                                                }
                                                maxLength={
                                                    100
                                                }
                                                placeholder="Ej. TRX-123456"
                                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                                            />

                                        </div>

                                    </div>

                                )}

                            </div>

                            {/* =====================================
                                BOTÓN FINAL
                            ===================================== */}

                            <div className="p-5">

                                <button
                                    type="button"
                                    onClick={
                                        manejarCrearVenta
                                    }
                                    disabled={
                                        guardando ||
                                        carrito.length === 0
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-baby-primary px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {guardando ? (

                                        <>

                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                            Registrando venta...

                                        </>

                                    ) : (

                                        <>

                                            <Receipt
                                                size={18}
                                            />

                                            Confirmar venta

                                        </>

                                    )}

                                </button>

                                <p className="mt-2 text-center text-xs text-gray-400">
                                    Al confirmar se generará la factura automáticamente.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    )
}

export default NuevaVenta