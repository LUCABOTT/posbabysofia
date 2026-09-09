import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfirm } from '../../components/ui/confirmContext'

import {
    Search,
    Plus,
    RefreshCw,
    Eye,
    Ban,
    Receipt,
    ShoppingCart,
    CircleDollarSign,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    X,
    UserRound,
    CalendarDays,
} from 'lucide-react'

import {
    listarVentas,
    anularVenta,
} from '../../services/ventaService'

const Ventas = () => {
    const confirmar = useConfirm()

    const navigate = useNavigate()

    // =========================================================
    // ESTADOS
    // =========================================================

    const [ventas, setVentas] = useState([])

    const [cargando, setCargando] = useState(true)
    const [actualizando, setActualizando] = useState(false)
    const [anulando, setAnulando] = useState(null)

    const [busqueda, setBusqueda] = useState('')
    const [estadoFiltro, setEstadoFiltro] = useState('TODAS')

    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

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
    // FECHA
    // =========================================================

    const formatearFecha = (fecha) => {

        if (!fecha) {
            return '-'
        }

        const fechaObj = new Date(fecha)

        if (Number.isNaN(fechaObj.getTime())) {
            return '-'
        }

        return new Intl.DateTimeFormat('es-HN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(fechaObj)

    }

    // =========================================================
    // CARGAR VENTAS
    // =========================================================

    const cargarVentas = async () => {

        try {

            setCargando(true)
            setError('')

            const data = await listarVentas()

            setVentas(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.ventas)
                        ? data.ventas
                        : []
            )

        } catch (err) {

            console.error(
                'Error al cargar ventas:',
                err
            )

            setError(
                err.response?.data?.message ||
                'No se pudieron cargar las ventas'
            )

        } finally {

            setCargando(false)

        }

    }

    // =========================================================
    // CARGA INICIAL
    // =========================================================

    useEffect(() => {

        cargarVentas()

    }, [])

    // =========================================================
    // ACTUALIZAR
    // =========================================================

    const actualizarVentas = async () => {

        try {

            setActualizando(true)
            setError('')

            const data = await listarVentas()

            setVentas(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.ventas)
                        ? data.ventas
                        : []
            )

            setMensaje(
                'Ventas actualizadas correctamente'
            )

        } catch (err) {

            console.error(
                'Error al actualizar ventas:',
                err
            )

            setError(
                err.response?.data?.message ||
                'No se pudieron actualizar las ventas'
            )

        } finally {

            setActualizando(false)

        }

    }

    // =========================================================
    // FILTRAR VENTAS
    // =========================================================

    const ventasFiltradas = useMemo(() => {

        const texto =
            busqueda.toLowerCase().trim()

        return ventas.filter((venta) => {

            const cliente =
                venta.cliente?.nombre ||
                ''

            const usuario =
                venta.usuario?.nombre ||
                ''

            const numero =
                venta.numero ||
                ''

            const coincideBusqueda =
                !texto ||
                numero
                    .toLowerCase()
                    .includes(texto) ||
                cliente
                    .toLowerCase()
                    .includes(texto) ||
                usuario
                    .toLowerCase()
                    .includes(texto)

            const coincideEstado =
                estadoFiltro === 'TODAS' ||
                venta.estado === estadoFiltro

            return (
                coincideBusqueda &&
                coincideEstado
            )

        })

    }, [
        ventas,
        busqueda,
        estadoFiltro,
    ])

    // =========================================================
    // ESTADÍSTICAS
    // =========================================================

    const estadisticas = useMemo(() => {

        const completadas =
            ventas.filter(
                (venta) =>
                    venta.estado ===
                    'COMPLETADA'
            )

        const anuladas =
            ventas.filter(
                (venta) =>
                    venta.estado ===
                    'ANULADA'
            )

        const pendientes =
            ventas.filter(
                (venta) =>
                    venta.estado ===
                    'PENDIENTE'
            )

        const totalVendido =
            completadas.reduce(
                (total, venta) =>
                    total +
                    Number(
                        venta.total || 0
                    ),
                0
            )

        return {
            total: ventas.length,
            completadas:
                completadas.length,
            anuladas:
                anuladas.length,
            pendientes:
                pendientes.length,
            totalVendido,
        }

    }, [ventas])

    // =========================================================
    // ANULAR VENTA
    // =========================================================

    const manejarAnular = async (venta) => {

        if (
            venta.estado ===
            'ANULADA'
        ) {
            return
        }

        const aceptado = await confirmar({
            titulo: 'Anular venta',
            mensaje: `¿Estás seguro de que deseas anular la venta ${venta.numero}? Esta acción también anulará su factura y restaurará el inventario.`,
            confirmarTexto: 'Anular',
            peligrosa: true,
        })

        if (!aceptado) {
            return
        }

        try {

            setAnulando(venta.id)
            setError('')
            setMensaje('')

            await anularVenta(
                venta.id
            )

            setMensaje(
                `La venta ${venta.numero} fue anulada correctamente`
            )

            await cargarVentas()

        } catch (err) {

            console.error(
                'Error al anular venta:',
                err
            )

            setError(
                err.response?.data?.message ||
                'No se pudo anular la venta'
            )

        } finally {

            setAnulando(null)

        }

    }

    // =========================================================
    // ESTADO VISUAL
    // =========================================================

    const obtenerEstado = (estado) => {

        switch (estado) {

            case 'COMPLETADA':

                return {
                    texto: 'Completada',
                    clase:
                        'bg-green-50 text-green-700 border-green-200',
                    icono:
                        <CheckCircle2 size={14} />,
                }

            case 'ANULADA':

                return {
                    texto: 'Anulada',
                    clase:
                        'bg-red-50 text-red-700 border-red-200',
                    icono:
                        <XCircle size={14} />,
                }

            case 'PENDIENTE':

                return {
                    texto: 'Pendiente',
                    clase:
                        'bg-orange-50 text-orange-700 border-orange-200',
                    icono:
                        <Clock size={14} />,
                }

            default:

                return {
                    texto:
                        estado || 'Desconocido',
                    clase:
                        'bg-gray-50 text-gray-600 border-gray-200',
                    icono:
                        <AlertCircle size={14} />,
                }

        }

    }

    // =========================================================
    // OBTENER MÉTODOS DE PAGO
    // =========================================================

    const obtenerMetodoPago = (venta) => {

        if (
            !venta.pagos ||
            !Array.isArray(venta.pagos) ||
            venta.pagos.length === 0
        ) {
            return '-'
        }

        return venta.pagos
            .map(
                (pago) =>
                    pago.metodo
            )
            .join(', ')

    }

    // =========================================================
    // RENDER CARGANDO
    // =========================================================

    if (cargando) {

        return (

            <div className="min-h-screen bg-gray-50 p-4 md:p-6">

                <div className="flex min-h-[500px] items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-baby-primary" />

                        <p className="mt-3 text-sm text-gray-500">
                            Cargando ventas...
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

                <div>

                    <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-baby-secondary p-3">

                            <ShoppingCart
                                size={25}
                                className="text-baby-primary"
                            />

                        </div>

                        <div>

                            <h1 className="text-2xl font-bold text-baby-dark">
                                Ventas
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Gestiona las ventas realizadas en el sistema
                            </p>

                        </div>

                    </div>

                </div>

                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={actualizarVentas}
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

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/ventas/nueva'
                            )
                        }
                        className="flex items-center gap-2 rounded-lg bg-baby-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                    >

                        <Plus size={18} />

                        Nueva venta

                    </button>

                </div>

            </div>

            {/* =====================================================
                MENSAJES
            ===================================================== */}

            {mensaje && (

                <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                    <CheckCircle2 size={18} />

                    <span>
                        {mensaje}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setMensaje('')
                        }
                        className="ml-auto"
                    >
                        <X size={17} />
                    </button>

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
                ESTADÍSTICAS
            ===================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* TOTAL */}

                <div className="rounded-xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Total de ventas
                            </p>

                            <p className="mt-1 text-2xl font-bold text-baby-dark">
                                {estadisticas.total}
                            </p>

                        </div>

                        <div className="rounded-lg bg-baby-secondary p-3">

                            <Receipt
                                size={21}
                                className="text-baby-primary"
                            />

                        </div>

                    </div>

                </div>

                {/* VENTAS COMPLETADAS */}

                <div className="rounded-xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Completadas
                            </p>

                            <p className="mt-1 text-2xl font-bold text-green-600">
                                {estadisticas.completadas}
                            </p>

                        </div>

                        <div className="rounded-lg bg-green-50 p-3">

                            <CheckCircle2
                                size={21}
                                className="text-green-600"
                            />

                        </div>

                    </div>

                </div>

                {/* ANULADAS */}

                <div className="rounded-xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Anuladas
                            </p>

                            <p className="mt-1 text-2xl font-bold text-red-600">
                                {estadisticas.anuladas}
                            </p>

                        </div>

                        <div className="rounded-lg bg-red-50 p-3">

                            <XCircle
                                size={21}
                                className="text-red-600"
                            />

                        </div>

                    </div>

                </div>

                {/* TOTAL VENDIDO */}

                <div className="rounded-xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Total vendido
                            </p>

                            <p className="mt-1 text-xl font-bold text-baby-primary">
                                {moneda(
                                    estadisticas.totalVendido
                                )}
                            </p>

                        </div>

                        <div className="rounded-lg bg-baby-secondary p-3">

                            <CircleDollarSign
                                size={21}
                                className="text-baby-primary"
                            />

                        </div>

                    </div>

                </div>

            </div>

            {/* =====================================================
                FILTROS
            ===================================================== */}

            <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                    {/* BUSCADOR */}

                    <div className="relative flex-1">

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
                            placeholder="Buscar por número de venta, cliente o usuario..."
                            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                        />

                    </div>

                    {/* ESTADO */}

                    <div className="flex items-center gap-2">

                        <label className="whitespace-nowrap text-sm font-medium text-gray-600">
                            Estado:
                        </label>

                        <select
                            value={
                                estadoFiltro
                            }
                            onChange={(e) =>
                                setEstadoFiltro(
                                    e.target.value
                                )
                            }
                            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                        >

                            <option value="TODAS">
                                Todas
                            </option>

                            <option value="COMPLETADA">
                                Completadas
                            </option>

                            <option value="ANULADA">
                                Anuladas
                            </option>

                            <option value="PENDIENTE">
                                Pendientes
                            </option>

                        </select>

                    </div>

                </div>

                <div className="mt-3 text-xs text-gray-400">

                    Mostrando{' '}
                    <span className="font-semibold text-gray-600">
                        {ventasFiltradas.length}
                    </span>{' '}
                    de{' '}
                    <span className="font-semibold text-gray-600">
                        {ventas.length}
                    </span>{' '}
                    ventas

                </div>

            </div>

            {/* =====================================================
                TABLA
            ===================================================== */}

            <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                {ventasFiltradas.length === 0 ? (

                    <div className="flex flex-col items-center justify-center py-20 text-center">

                        <div className="mb-4 rounded-full bg-baby-secondary p-5">

                            <Receipt
                                size={32}
                                className="text-baby-primary"
                            />

                        </div>

                        <h3 className="font-semibold text-baby-dark">
                            No hay ventas para mostrar
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-gray-500">
                            No se encontraron ventas que coincidan con los filtros seleccionados.
                        </p>

                        {ventas.length === 0 && (

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        '/ventas/nueva'
                                    )
                                }
                                className="mt-5 flex items-center gap-2 rounded-lg bg-baby-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                            >

                                <Plus size={17} />

                                Registrar primera venta

                            </button>

                        )}

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1050px]">

                            <thead>

                                <tr className="border-b border-gray-100 bg-gray-50">

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Venta
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Cliente
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Fecha
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Productos
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Pago
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Total
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Estado
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Acciones
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {ventasFiltradas.map(
                                    (venta) => {

                                        const estado =
                                            obtenerEstado(
                                                venta.estado
                                            )

                                        const cantidadProductos =
                                            Array.isArray(
                                                venta.detalles
                                            )
                                                ? venta.detalles.reduce(
                                                    (
                                                        totalCantidad,
                                                        detalle
                                                    ) =>
                                                        totalCantidad +
                                                        Number(
                                                            detalle.cantidad ||
                                                            0
                                                        ),
                                                    0
                                                )
                                                : 0

                                        return (

                                            <tr
                                                key={
                                                    venta.id
                                                }
                                                className="transition hover:bg-gray-50"
                                            >

                                                {/* VENTA */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="rounded-lg bg-baby-secondary p-2">

                                                            <Receipt
                                                                size={17}
                                                                className="text-baby-primary"
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-baby-dark">
                                                                {
                                                                    venta.numero
                                                                }
                                                            </p>

                                                            {venta.factura && (

                                                                <p className="mt-0.5 text-xs text-gray-400">

                                                                    Factura:{' '}

                                                                    {
                                                                        venta.factura.numero_factura
                                                                    }

                                                                </p>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* CLIENTE */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <UserRound
                                                            size={16}
                                                            className="shrink-0 text-gray-400"
                                                        />

                                                        <div>

                                                            <p className="text-sm font-medium text-gray-700">

                                                                {venta.cliente?.nombre ||
                                                                    'Consumidor final'}

                                                            </p>

                                                            {venta.cliente?.rtn && (

                                                                <p className="text-xs text-gray-400">

                                                                    RTN:{' '}
                                                                    {
                                                                        venta.cliente.rtn
                                                                    }

                                                                </p>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* FECHA */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <CalendarDays
                                                            size={15}
                                                            className="text-gray-400"
                                                        />

                                                        <span className="text-sm text-gray-600">

                                                            {formatearFecha(
                                                                venta.created_at
                                                            )}

                                                        </span>

                                                    </div>

                                                </td>

                                                {/* PRODUCTOS */}

                                                <td className="px-5 py-4">

                                                    <div>

                                                        <p className="text-sm font-medium text-gray-700">

                                                            {cantidadProductos}{' '}
                                                            unidad
                                                            {cantidadProductos !== 1
                                                                ? 'es'
                                                                : ''}

                                                        </p>

                                                        <p className="text-xs text-gray-400">

                                                            {Array.isArray(
                                                                venta.detalles
                                                            )
                                                                ? venta.detalles.length
                                                                : 0}{' '}
                                                            producto
                                                            {(
                                                                Array.isArray(
                                                                    venta.detalles
                                                                )
                                                                    ? venta.detalles.length
                                                                    : 0
                                                            ) !== 1
                                                                ? 's'
                                                                : ''}

                                                        </p>

                                                    </div>

                                                </td>

                                                {/* PAGO */}

                                                <td className="px-5 py-4">

                                                    <span className="text-xs font-medium text-gray-600">

                                                        {
                                                            obtenerMetodoPago(
                                                                venta
                                                            )
                                                        }

                                                    </span>

                                                </td>

                                                {/* TOTAL */}

                                                <td className="px-5 py-4 text-right">

                                                    <span className="text-sm font-bold text-baby-dark">

                                                        {moneda(
                                                            venta.total
                                                        )}

                                                    </span>

                                                </td>

                                                {/* ESTADO */}

                                                <td className="px-5 py-4 text-center">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${estado.clase}`}
                                                    >

                                                        {
                                                            estado.icono
                                                        }

                                                        {
                                                            estado.texto
                                                        }

                                                    </span>

                                                </td>

                                                {/* ACCIONES */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center justify-center gap-1">

                                                        {/* VER */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/ventas/${venta.id}`
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-baby-secondary hover:text-baby-primary"
                                                            title="Ver venta"
                                                        >

                                                            <Eye
                                                                size={17}
                                                            />

                                                        </button>

                                                        {/* FACTURA */}

                                                        {venta.factura?.id && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/facturas/${venta.factura.id}`
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                                                                title="Ver factura"
                                                            >

                                                                <Receipt
                                                                    size={17}
                                                                />

                                                            </button>

                                                        )}

                                                        {/* ANULAR */}

                                                        {venta.estado !==
                                                            'ANULADA' && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    manejarAnular(
                                                                        venta
                                                                    )
                                                                }
                                                                disabled={
                                                                    anulando ===
                                                                    venta.id
                                                                }
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                                title="Anular venta"
                                                            >

                                                                {anulando ===
                                                                venta.id ? (

                                                                    <div className="h-[17px] w-[17px] animate-spin rounded-full border-2 border-gray-200 border-t-red-500" />

                                                                ) : (

                                                                    <Ban
                                                                        size={17}
                                                                    />

                                                                )}

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

        </div>

    )

}

export default Ventas