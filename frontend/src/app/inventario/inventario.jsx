import { useEffect, useMemo, useState } from 'react'
import {
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    ClipboardList,
    History,
    Package,
    Plus,
    RefreshCw,
    Search,
    SlidersHorizontal,
    X,
    Save,
    CheckCircle2,
    AlertCircle,
    Boxes,
} from 'lucide-react'

import {
    listarMovimientos,
    registrarEntrada,
    registrarSalida,
    registrarAjuste,
} from '../../services/inventarioService'

import { obtenerProductos } from '../../services/productoService'

// ==============================
// FORMATO DE FECHA
// ==============================
const formatearFecha = (fecha) => {
    if (!fecha) return '-'

    const fechaFormateada = new Date(fecha)

    if (Number.isNaN(fechaFormateada.getTime())) {
        return '-'
    }

    return new Intl.DateTimeFormat('es-HN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(fechaFormateada)
}

// ==============================
// FORMATO DE NUMERO
// ==============================
const formatearNumero = (numero) => {
    return new Intl.NumberFormat('es-HN').format(Number(numero || 0))
}

// ==============================
// COMPONENTE
// ==============================
export default function Inventario() {

    // ==============================
    // ESTADOS
    // ==============================

    const [productos, setProductos] = useState([])
    const [movimientos, setMovimientos] = useState([])

    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)

    const [mensaje, setMensaje] = useState('')
    const [error, setError] = useState('')

    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('TODOS')

    const [modalAbierto, setModalAbierto] = useState(false)

    const [tipoMovimiento, setTipoMovimiento] = useState('ENTRADA')

    const [productoSeleccionado, setProductoSeleccionado] = useState(null)

    const [formulario, setFormulario] = useState({
        producto_id: '',
        cantidad: '',
        stock_nuevo: '',
        motivo: '',
    })

    // ==============================
    // CARGAR INFORMACION
    // ==============================

    const cargarDatos = async () => {
        try {
            setLoading(true)
            setError('')

            const [productosData, movimientosData] = await Promise.all([
                obtenerProductos(),
                listarMovimientos(),
            ])

            setProductos(Array.isArray(productosData) ? productosData : [])
            setMovimientos(
                Array.isArray(movimientosData) ? movimientosData : []
            )

        } catch (err) {
            console.error('Error al cargar inventario:', err)

            setError(
                err.response?.data?.message ||
                'No se pudo cargar la información del inventario'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    // ==============================
    // PRODUCTOS FILTRADOS
    // ==============================

    const productosFiltrados = useMemo(() => {

        const texto = busqueda.trim().toLowerCase()

        return productos.filter((producto) => {

            const coincideBusqueda =
                !texto ||
                producto.nombre?.toLowerCase().includes(texto) ||
                producto.codigo?.toLowerCase().includes(texto)

            return coincideBusqueda
        })

    }, [productos, busqueda])

    // ==============================
    // MOVIMIENTOS FILTRADOS
    // ==============================

    const movimientosFiltrados = useMemo(() => {

        const texto = busqueda.trim().toLowerCase()

        return movimientos.filter((movimiento) => {

            const coincideTipo =
                filtroTipo === 'TODOS' ||
                movimiento.tipo === filtroTipo

            const coincideBusqueda =
                !texto ||
                movimiento.producto?.nombre
                    ?.toLowerCase()
                    .includes(texto) ||
                movimiento.producto?.codigo
                    ?.toLowerCase()
                    .includes(texto)

            return coincideTipo && coincideBusqueda
        })

    }, [movimientos, busqueda, filtroTipo])

    // ==============================
    // ESTADISTICAS
    // ==============================

    const estadisticas = useMemo(() => {

        const activos = productos.filter(
            (producto) => producto.activo
        )

        const bajoStock = activos.filter(
            (producto) =>
                Number(producto.stock || 0) <=
                Number(producto.stock_minimo || 0)
        )

        const unidades = activos.reduce(
            (total, producto) =>
                total + Number(producto.stock || 0),
            0
        )

        return {
            productos: productos.length,
            activos: activos.length,
            bajoStock: bajoStock.length,
            unidades,
        }

    }, [productos])

    // ==============================
    // ABRIR MODAL
    // ==============================

    const abrirModal = (tipo = 'ENTRADA') => {

        setTipoMovimiento(tipo)

        setFormulario({
            producto_id: '',
            cantidad: '',
            stock_nuevo: '',
            motivo: '',
        })

        setProductoSeleccionado(null)

        setMensaje('')
        setError('')

        setModalAbierto(true)
    }

    // ==============================
    // CERRAR MODAL
    // ==============================

    const cerrarModal = () => {

        if (guardando) return

        setModalAbierto(false)

        setFormulario({
            producto_id: '',
            cantidad: '',
            stock_nuevo: '',
            motivo: '',
        })

        setProductoSeleccionado(null)
    }

    // ==============================
    // CAMBIO DE PRODUCTO
    // ==============================

    const manejarProducto = (e) => {

        const productoId = e.target.value

        const producto = productos.find(
            (item) => String(item.id) === String(productoId)
        )

        setFormulario((prev) => ({
            ...prev,
            producto_id: productoId,
            cantidad: '',
            stock_nuevo: '',
        }))

        setProductoSeleccionado(producto || null)
    }

    // ==============================
    // CAMBIO DE FORMULARIO
    // ==============================

    const manejarCambio = (e) => {

        const { name, value } = e.target

        setFormulario((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // ==============================
    // GUARDAR MOVIMIENTO
    // ==============================

    const guardarMovimiento = async (e) => {

        e.preventDefault()

        setError('')
        setMensaje('')

        // ------------------------------
        // VALIDAR PRODUCTO
        // ------------------------------

        if (!formulario.producto_id) {
            setError('Debes seleccionar un producto.')
            return
        }

        // ------------------------------
        // VALIDAR ENTRADA / SALIDA
        // ------------------------------

        if (
            tipoMovimiento === 'ENTRADA' ||
            tipoMovimiento === 'SALIDA'
        ) {

            if (
                formulario.cantidad === '' ||
                Number(formulario.cantidad) <= 0
            ) {
                setError('La cantidad debe ser mayor que 0.')
                return
            }

            if (
                tipoMovimiento === 'SALIDA' &&
                productoSeleccionado &&
                Number(formulario.cantidad) >
                    Number(productoSeleccionado.stock || 0)
            ) {
                setError(
                    `No hay suficiente stock. Stock disponible: ${formatearNumero(
                        productoSeleccionado.stock
                    )}.`
                )
                return
            }
        }

        // ------------------------------
        // VALIDAR AJUSTE
        // ------------------------------

        if (tipoMovimiento === 'AJUSTE') {

            if (
                formulario.stock_nuevo === '' ||
                Number(formulario.stock_nuevo) < 0
            ) {
                setError(
                    'El nuevo stock debe ser mayor o igual a 0.'
                )
                return
            }

            if (!formulario.motivo.trim()) {
                setError(
                    'Debes indicar el motivo del ajuste.'
                )
                return
            }
        }

        try {

            setGuardando(true)

            let response

            // ------------------------------
            // ENTRADA
            // ------------------------------

            if (tipoMovimiento === 'ENTRADA') {

                response = await registrarEntrada({
                    producto_id: Number(
                        formulario.producto_id
                    ),
                    cantidad: Number(
                        formulario.cantidad
                    ),
                    motivo:
                        formulario.motivo.trim() || null,
                })
            }

            // ------------------------------
            // SALIDA
            // ------------------------------

            if (tipoMovimiento === 'SALIDA') {

                response = await registrarSalida({
                    producto_id: Number(
                        formulario.producto_id
                    ),
                    cantidad: Number(
                        formulario.cantidad
                    ),
                    motivo:
                        formulario.motivo.trim() || null,
                })
            }

            // ------------------------------
            // AJUSTE
            // ------------------------------

            if (tipoMovimiento === 'AJUSTE') {

                response = await registrarAjuste({
                    producto_id: Number(
                        formulario.producto_id
                    ),
                    stock_nuevo: Number(
                        formulario.stock_nuevo
                    ),
                    motivo: formulario.motivo.trim(),
                })
            }

            setMensaje(
                response?.message ||
                'Movimiento registrado correctamente.'
            )

            setModalAbierto(false)

            setFormulario({
                producto_id: '',
                cantidad: '',
                stock_nuevo: '',
                motivo: '',
            })

            setProductoSeleccionado(null)

            await cargarDatos()

        } catch (err) {

            console.error(
                'Error al registrar movimiento:',
                err
            )

            setError(
                err.response?.data?.message ||
                'No se pudo registrar el movimiento.'
            )

        } finally {

            setGuardando(false)
        }
    }

    // ==============================
    // CONFIGURACION VISUAL
    // ==============================

    const configuracionTipo = {

        ENTRADA: {
            titulo: 'Registrar entrada',
            descripcion:
                'Aumenta las existencias de un producto.',
            icono: ArrowDownToLine,
            color: 'text-green-600',
            fondo: 'bg-green-50',
            boton:
                'bg-green-600 hover:bg-green-700',
        },

        SALIDA: {
            titulo: 'Registrar salida',
            descripcion:
                'Reduce las existencias de un producto.',
            icono: ArrowUpFromLine,
            color: 'text-orange-600',
            fondo: 'bg-orange-50',
            boton:
                'bg-orange-600 hover:bg-orange-700',
        },

        AJUSTE: {
            titulo: 'Ajustar inventario',
            descripcion:
                'Establece manualmente el stock actual.',
            icono: SlidersHorizontal,
            color: 'text-blue-600',
            fondo: 'bg-blue-50',
            boton:
                'bg-baby-primary hover:opacity-90',
        },

    }

    const configuracion =
        configuracionTipo[tipoMovimiento]

    const IconoMovimiento =
        configuracion.icono

    // ==============================
    // LOADING
    // ==============================

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6">

                <div className="flex min-h-[500px] items-center justify-center">

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
                HEADER
            ============================== */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-baby-dark">
                        Inventario
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Administra las existencias y movimientos de inventario.
                    </p>

                </div>

                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={cargarDatos}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                    >

                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        Actualizar

                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            abrirModal('ENTRADA')
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-baby-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                    >

                        <Plus size={18} />

                        Movimiento

                    </button>

                </div>

            </div>

            {/* ==============================
                MENSAJES
            ============================== */}

            {mensaje && (

                <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                    <CheckCircle2 size={19} />

                    <span>
                        {mensaje}
                    </span>

                    <button
                        type="button"
                        onClick={() => setMensaje('')}
                        className="ml-auto rounded p-1 hover:bg-green-100"
                    >
                        <X size={17} />
                    </button>

                </div>

            )}

            {error && !modalAbierto && (

                <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    <AlertCircle size={19} />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() => setError('')}
                        className="ml-auto rounded p-1 hover:bg-red-100"
                    >
                        <X size={17} />
                    </button>

                </div>

            )}

            {/* ==============================
                ESTADISTICAS
            ============================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* TOTAL PRODUCTOS */}

                <div className="rounded-xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-gray-500">
                                Total productos
                            </p>

                            <p className="mt-2 text-2xl font-bold text-baby-dark">
                                {formatearNumero(
                                    estadisticas.productos
                                )}
                            </p>

                        </div>

                        <div className="rounded-xl bg-baby-secondary p-3">

                            <Package
                                size={22}
                                className="text-baby-primary"
                            />

                        </div>

                    </div>

                </div>

                {/* PRODUCTOS ACTIVOS */}

                <div className="rounded-xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-gray-500">
                                Productos activos
                            </p>

                            <p className="mt-2 text-2xl font-bold text-baby-dark">
                                {formatearNumero(
                                    estadisticas.activos
                                )}
                            </p>

                        </div>

                        <div className="rounded-xl bg-green-50 p-3">

                            <Boxes
                                size={22}
                                className="text-green-600"
                            />

                        </div>

                    </div>

                </div>

                {/* BAJO STOCK */}

                <div className="rounded-xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-gray-500">
                                Bajo stock
                            </p>

                            <p className="mt-2 text-2xl font-bold text-baby-dark">
                                {formatearNumero(
                                    estadisticas.bajoStock
                                )}
                            </p>

                        </div>

                        <div className="rounded-xl bg-orange-50 p-3">

                            <AlertTriangle
                                size={22}
                                className="text-orange-500"
                            />

                        </div>

                    </div>

                </div>

                {/* UNIDADES */}

                <div className="rounded-xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-gray-500">
                                Unidades en stock
                            </p>

                            <p className="mt-2 text-2xl font-bold text-baby-dark">
                                {formatearNumero(
                                    estadisticas.unidades
                                )}
                            </p>

                        </div>

                        <div className="rounded-xl bg-blue-50 p-3">

                            <ClipboardList
                                size={22}
                                className="text-blue-600"
                            />

                        </div>

                    </div>

                </div>

            </div>

            {/* ==============================
                ACCIONES
            ============================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* ENTRADA */}

                <button
                    type="button"
                    onClick={() =>
                        abrirModal('ENTRADA')
                    }
                    className="flex items-center gap-4 rounded-xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                    <div className="rounded-xl bg-green-50 p-3">

                        <ArrowDownToLine
                            size={23}
                            className="text-green-600"
                        />

                    </div>

                    <div>

                        <p className="font-semibold text-baby-dark">
                            Entrada de inventario
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Agregar unidades al stock
                        </p>

                    </div>

                </button>

                {/* SALIDA */}

                <button
                    type="button"
                    onClick={() =>
                        abrirModal('SALIDA')
                    }
                    className="flex items-center gap-4 rounded-xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                    <div className="rounded-xl bg-orange-50 p-3">

                        <ArrowUpFromLine
                            size={23}
                            className="text-orange-600"
                        />

                    </div>

                    <div>

                        <p className="font-semibold text-baby-dark">
                            Salida de inventario
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Retirar unidades del stock
                        </p>

                    </div>

                </button>

                {/* AJUSTE */}

                <button
                    type="button"
                    onClick={() =>
                        abrirModal('AJUSTE')
                    }
                    className="flex items-center gap-4 rounded-xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                    <div className="rounded-xl bg-blue-50 p-3">

                        <SlidersHorizontal
                            size={23}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <p className="font-semibold text-baby-dark">
                            Ajustar inventario
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Corregir el stock actual
                        </p>

                    </div>

                </button>

            </div>

            {/* ==============================
                TABLA
            ============================== */}

            <div className="rounded-xl bg-white shadow-sm">

                {/* FILTROS */}

                <div className="border-b border-gray-100 p-5">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <h2 className="flex items-center gap-2 text-lg font-semibold text-baby-dark">

                                <History size={20} />

                                Historial de movimientos

                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Consulta las entradas, salidas y ajustes realizados.
                            </p>

                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">

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
                                    placeholder="Buscar producto..."
                                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10 sm:w-64"
                                />

                            </div>

                            {/* FILTRO TIPO */}

                            <select
                                value={filtroTipo}
                                onChange={(e) =>
                                    setFiltroTipo(
                                        e.target.value
                                    )
                                }
                                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 outline-none focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                            >

                                <option value="TODOS">
                                    Todos los movimientos
                                </option>

                                <option value="ENTRADA">
                                    Entradas
                                </option>

                                <option value="SALIDA">
                                    Salidas
                                </option>

                                <option value="AJUSTE">
                                    Ajustes
                                </option>

                                <option value="DEVOLUCION">
                                    Devoluciones
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                {/* TABLA */}

                {movimientosFiltrados.length === 0 ? (

                    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">

                        <div className="mb-4 rounded-full bg-baby-secondary p-4">

                            <History
                                size={30}
                                className="text-baby-primary"
                            />

                        </div>

                        <h3 className="text-base font-semibold text-baby-dark">
                            No hay movimientos
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-gray-500">
                            Todavía no se han registrado movimientos que coincidan con los filtros seleccionados.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px]">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Fecha
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Producto
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Tipo
                                    </th>

                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Cantidad
                                    </th>

                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Stock anterior
                                    </th>

                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Stock nuevo
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Motivo
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {movimientosFiltrados.map(
                                    (movimiento) => (

                                        <tr
                                            key={movimiento.id}
                                            className="transition hover:bg-gray-50"
                                        >

                                            {/* FECHA */}

                                            <td className="px-5 py-4 text-sm text-gray-600">

                                                {formatearFecha(
                                                    movimiento.created_at
                                                )}

                                            </td>

                                            {/* PRODUCTO */}

                                            <td className="px-5 py-4">

                                                <div>

                                                    <p className="text-sm font-semibold text-baby-dark">

                                                        {movimiento
                                                            .producto
                                                            ?.nombre ||
                                                            'Producto'}

                                                    </p>

                                                    <p className="mt-0.5 text-xs text-gray-500">

                                                        Código:{' '}

                                                        {movimiento
                                                            .producto
                                                            ?.codigo ||
                                                            '-'}

                                                    </p>

                                                </div>

                                            </td>

                                            {/* TIPO */}

                                            <td className="px-5 py-4">

                                                {movimiento.tipo ===
                                                    'ENTRADA' && (

                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">

                                                        <ArrowDownToLine
                                                            size={13}
                                                        />

                                                        Entrada

                                                    </span>

                                                )}

                                                {movimiento.tipo ===
                                                    'SALIDA' && (

                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">

                                                        <ArrowUpFromLine
                                                            size={13}
                                                        />

                                                        Salida

                                                    </span>

                                                )}

                                                {movimiento.tipo ===
                                                    'AJUSTE' && (

                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">

                                                        <SlidersHorizontal
                                                            size={13}
                                                        />

                                                        Ajuste

                                                    </span>

                                                )}

                                                {movimiento.tipo ===
                                                    'DEVOLUCION' && (

                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">

                                                        Devolución

                                                    </span>

                                                )}

                                            </td>

                                            {/* CANTIDAD */}

                                            <td className="px-5 py-4 text-center">

                                                <span className="text-sm font-semibold text-baby-dark">

                                                    {formatearNumero(
                                                        movimiento.cantidad
                                                    )}

                                                </span>

                                            </td>

                                            {/* STOCK ANTERIOR */}

                                            <td className="px-5 py-4 text-center text-sm text-gray-600">

                                                {formatearNumero(
                                                    movimiento.stock_anterior
                                                )}

                                            </td>

                                            {/* STOCK NUEVO */}

                                            <td className="px-5 py-4 text-center">

                                                <span className="text-sm font-semibold text-baby-dark">

                                                    {formatearNumero(
                                                        movimiento.stock_nuevo
                                                    )}

                                                </span>

                                            </td>

                                            {/* MOTIVO */}

                                            <td className="max-w-[250px] px-5 py-4 text-sm text-gray-500">

                                                {movimiento.motivo || (
                                                    <span className="text-gray-400">
                                                        Sin motivo
                                                    </span>
                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ==============================
                MODAL
            ============================== */}

            {modalAbierto && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">

                        {/* HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">

                            <div className="flex items-center gap-3">

                                <div
                                    className={`rounded-lg p-2 ${configuracion.fondo}`}
                                >

                                    <IconoMovimiento
                                        size={21}
                                        className={
                                            configuracion.color
                                        }
                                    />

                                </div>

                                <div>

                                    <h2 className="font-semibold text-baby-dark">
                                        {configuracion.titulo}
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        {configuracion.descripcion}
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={cerrarModal}
                                disabled={guardando}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                            >

                                <X size={19} />

                            </button>

                        </div>

                        {/* FORMULARIO */}

                        <form
                            onSubmit={guardarMovimiento}
                            className="space-y-5 p-6"
                        >

                            {/* PRODUCTO */}

                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Producto
                                </label>

                                <select
                                    value={
                                        formulario.producto_id
                                    }
                                    onChange={
                                        manejarProducto
                                    }
                                    disabled={guardando}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10 disabled:bg-gray-50"
                                >

                                    <option value="">
                                        Selecciona un producto
                                    </option>

                                    {productos
                                        .filter(
                                            (producto) =>
                                                producto.activo
                                        )
                                        .map(
                                            (producto) => (

                                                <option
                                                    key={
                                                        producto.id
                                                    }
                                                    value={
                                                        producto.id
                                                    }
                                                >

                                                    {
                                                        producto.codigo
                                                    }{' '}
                                                    —{' '}
                                                    {
                                                        producto.nombre
                                                    }

                                                </option>

                                            )
                                        )}

                                </select>

                            </div>

                            {/* INFORMACION STOCK */}

                            {productoSeleccionado && (

                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Stock actual
                                            </p>

                                            <p className="mt-1 text-xl font-bold text-baby-dark">
                                                {formatearNumero(
                                                    productoSeleccionado.stock
                                                )}
                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Stock mínimo
                                            </p>

                                            <p className="mt-1 text-right text-xl font-bold text-gray-600">
                                                {formatearNumero(
                                                    productoSeleccionado.stock_minimo
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                    {Number(
                                        productoSeleccionado.stock
                                    ) <=
                                        Number(
                                            productoSeleccionado.stock_minimo
                                        ) && (

                                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">

                                            <AlertTriangle
                                                size={15}
                                            />

                                            Este producto se encuentra en bajo stock.

                                        </div>

                                    )}

                                </div>

                            )}

                            {/* CANTIDAD */}

                            {(tipoMovimiento ===
                                'ENTRADA' ||
                                tipoMovimiento ===
                                'SALIDA') && (

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Cantidad
                                    </label>

                                    <input
                                        type="number"
                                        name="cantidad"
                                        value={
                                            formulario.cantidad
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        min="1"
                                        step="1"
                                        disabled={guardando}
                                        placeholder="Ej. 10"
                                        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10 disabled:bg-gray-50"
                                    />

                                    {tipoMovimiento ===
                                        'SALIDA' &&
                                        productoSeleccionado && (

                                            <p className="mt-1.5 text-xs text-gray-500">

                                                Disponible:{' '}

                                                <span className="font-medium text-baby-dark">
                                                    {formatearNumero(
                                                        productoSeleccionado.stock
                                                    )}{' '}
                                                    unidades
                                                </span>

                                            </p>

                                        )}

                                </div>

                            )}

                            {/* STOCK NUEVO */}

                            {tipoMovimiento ===
                                'AJUSTE' && (

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Nuevo stock
                                    </label>

                                    <input
                                        type="number"
                                        name="stock_nuevo"
                                        value={
                                            formulario.stock_nuevo
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        min="0"
                                        step="1"
                                        disabled={guardando}
                                        placeholder="Ej. 25"
                                        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10 disabled:bg-gray-50"
                                    />

                                    {productoSeleccionado &&
                                        formulario.stock_nuevo !==
                                            '' && (

                                            <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">

                                                Stock actual:{' '}

                                                <strong>
                                                    {formatearNumero(
                                                        productoSeleccionado.stock
                                                    )}
                                                </strong>

                                                {' → '}

                                                Nuevo stock:{' '}

                                                <strong>
                                                    {formatearNumero(
                                                        formulario.stock_nuevo
                                                    )}
                                                </strong>

                                            </div>

                                        )}

                                </div>

                            )}

                            {/* MOTIVO */}

                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-700">

                                    Motivo

                                    {tipoMovimiento ===
                                        'AJUSTE' && (

                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>

                                    )}

                                </label>

                                <textarea
                                    name="motivo"
                                    value={
                                        formulario.motivo
                                    }
                                    onChange={
                                        manejarCambio
                                    }
                                    disabled={guardando}
                                    rows={3}
                                    maxLength={255}
                                    placeholder={
                                        tipoMovimiento ===
                                        'AJUSTE'
                                            ? 'Indica el motivo del ajuste...'
                                            : 'Motivo opcional...'
                                    }
                                    className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10 disabled:bg-gray-50"
                                />

                                <p className="mt-1 text-right text-xs text-gray-400">
                                    {
                                        formulario.motivo
                                            .length
                                    }
                                    /255
                                </p>

                            </div>

                            {/* ERROR */}

                            {error && (

                                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">

                                    <AlertCircle
                                        size={17}
                                        className="mt-0.5 shrink-0"
                                    />

                                    <span>
                                        {error}
                                    </span>

                                </div>

                            )}

                            {/* BOTONES */}

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                                <button
                                    type="button"
                                    onClick={
                                        cerrarModal
                                    }
                                    disabled={guardando}
                                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${configuracion.boton}`}
                                >

                                    {guardando ? (

                                        <>
                                            <RefreshCw
                                                size={17}
                                                className="animate-spin"
                                            />

                                            Guardando...
                                        </>

                                    ) : (

                                        <>
                                            <Save size={17} />

                                            Registrar movimiento
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    )
}