import { useEffect, useState } from 'react'

import {
    AlertCircle,
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    Banknote,
    BarChart3,
    Boxes,
    CalendarDays,
    CreditCard,
    Package,
    RefreshCw,
    ShoppingCart,
    Store,
    TrendingUp,
    WalletCards,
} from 'lucide-react'

import { obtenerDashboard } from '../../services/dashboardService'


const Dashboard = () => {

    // ==========================================
    // ESTADOS
    // ==========================================

    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [actualizando, setActualizando] = useState(false)
    const [error, setError] = useState('')


    // ==========================================
    // CARGAR DASHBOARD
    // ==========================================

    const cargarDashboard = async (mostrarCarga = true) => {

        try {

            if (mostrarCarga) {
                setLoading(true)
            } else {
                setActualizando(true)
            }

            setError('')

            const data = await obtenerDashboard()

            setDashboard(data)

        } catch (error) {

            console.error('Error al cargar dashboard:', error)

            setError(
                error?.response?.data?.message ||
                'No se pudo cargar la información del dashboard'
            )

        } finally {

            setLoading(false)
            setActualizando(false)
        }
    }


    // ==========================================
    // CARGAR AL INICIAR
    // ==========================================

    useEffect(() => {
        cargarDashboard()
    }, [])


    // ==========================================
    // FORMATEAR MONEDA
    // ==========================================

    const formatearMoneda = (valor) => {

        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL',
            minimumFractionDigits: 2
        }).format(Number(valor || 0))
    }


    // ==========================================
    // FORMATEAR FECHA
    // ==========================================

    const formatearFecha = (fecha) => {

        if (!fecha) return '-'

        const fechaLocal = new Date(`${fecha}T00:00:00`)

        return fechaLocal.toLocaleDateString('es-HN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="min-h-[500px] flex items-center justify-center">

                <div className="flex flex-col items-center gap-3">

                    <RefreshCw
                        size={32}
                        className="animate-spin text-baby-primary"
                    />

                    <p className="text-sm text-gray-500">
                        Cargando dashboard...
                    </p>

                </div>

            </div>
        )
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error && !dashboard) {

        return (
            <div className="space-y-6">

                <div className="flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-baby-dark">
                            Dashboard
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Resumen general de tu punto de venta
                        </p>
                    </div>

                    <button
                        onClick={() => cargarDashboard()}
                        className="
                            flex items-center gap-2
                            px-4 py-2
                            rounded-xl
                            bg-baby-primary
                            text-white
                            hover:opacity-90
                            transition
                        "
                    >
                        <RefreshCw size={18} />
                        Reintentar
                    </button>

                </div>


                <div className="
                    bg-red-50
                    border border-red-200
                    rounded-2xl
                    p-6
                    flex items-start gap-3
                ">

                    <AlertCircle
                        size={22}
                        className="text-red-500 mt-0.5"
                    />

                    <div>
                        <h3 className="font-semibold text-red-700">
                            Error al cargar el dashboard
                        </h3>

                        <p className="text-sm text-red-600 mt-1">
                            {error}
                        </p>
                    </div>

                </div>

            </div>
        )
    }


    // ==========================================
    // DATOS
    // ==========================================

    const ventas = dashboard?.ventas || {
        cantidad: 0,
        total: 0,
        anuladas: 0
    }

    const pagos = dashboard?.pagos || {
        efectivo: 0,
        tarjeta: 0,
        transferencia: 0
    }

    const productosMasVendidos =
        dashboard?.productos_mas_vendidos || []

    const productosStockBajo =
        dashboard?.productos_stock_bajo || []

    const caja = dashboard?.caja || null


    // ==========================================
    // TOTAL PAGOS
    // ==========================================

    const totalPagos =
        Number(pagos.efectivo || 0) +
        Number(pagos.tarjeta || 0) +
        Number(pagos.transferencia || 0)


    // ==========================================
    // PORCENTAJES DE PAGO
    // ==========================================

    const porcentajePago = (valor) => {

        if (!totalPagos) return 0

        return Math.round(
            (Number(valor || 0) / totalPagos) * 100
        )
    }


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="space-y-6">

            {/* =====================================
                HEADER
            ====================================== */}

            <div className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-4
            ">

                <div>

                    <div className="flex items-center gap-2">

                        <Store
                            size={26}
                            className="text-baby-primary"
                        />

                        <h1 className="
                            text-2xl
                            font-bold
                            text-baby-dark
                        ">
                            Dashboard
                        </h1>

                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                        Resumen general de tu punto de venta
                    </p>

                </div>


                <div className="flex items-center gap-3">

                    <div className="
                        hidden
                        sm:flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        bg-white
                        border
                        border-gray-200
                        rounded-xl
                        text-sm
                        text-gray-600
                    ">

                        <CalendarDays size={17} />

                        <span className="capitalize">
                            {formatearFecha(dashboard?.fecha)}
                        </span>

                    </div>


                    <button
                        onClick={() => cargarDashboard(false)}
                        disabled={actualizando}
                        className="
                            flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-xl
                            bg-baby-primary
                            text-white
                            hover:opacity-90
                            transition
                            disabled:opacity-60
                        "
                    >

                        <RefreshCw
                            size={18}
                            className={
                                actualizando
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        <span className="hidden sm:inline">
                            Actualizar
                        </span>

                    </button>

                </div>

            </div>


            {/* =====================================
                ERROR
            ====================================== */}

            {error && (

                <div className="
                    bg-red-50
                    border
                    border-red-200
                    rounded-xl
                    px-4
                    py-3
                    flex
                    items-center
                    gap-3
                    text-red-700
                ">

                    <AlertCircle size={20} />

                    <span className="text-sm">
                        {error}
                    </span>

                </div>

            )}


            {/* =====================================
                TARJETAS PRINCIPALES
            ====================================== */}

            <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-4
                gap-4
            ">


                {/* VENTAS */}

                <div className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    border
                    border-gray-100
                    p-5
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div className="
                            w-11
                            h-11
                            rounded-xl
                            bg-baby-primary/10
                            flex
                            items-center
                            justify-center
                        ">

                            <TrendingUp
                                size={22}
                                className="text-baby-primary"
                            />

                        </div>

                        <span className="
                            text-xs
                            font-medium
                            text-gray-400
                        ">
                            HOY
                        </span>

                    </div>


                    <p className="
                        text-sm
                        text-gray-500
                        mt-4
                    ">
                        Ventas del día
                    </p>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-baby-dark
                        mt-1
                    ">
                        {formatearMoneda(ventas.total)}
                    </h2>

                </div>


                {/* CANTIDAD VENTAS */}

                <div className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    border
                    border-gray-100
                    p-5
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div className="
                            w-11
                            h-11
                            rounded-xl
                            bg-blue-50
                            flex
                            items-center
                            justify-center
                        ">

                            <ShoppingCart
                                size={22}
                                className="text-blue-600"
                            />

                        </div>

                        <span className="
                            text-xs
                            font-medium
                            text-gray-400
                        ">
                            TRANSACCIONES
                        </span>

                    </div>


                    <p className="
                        text-sm
                        text-gray-500
                        mt-4
                    ">
                        Ventas completadas
                    </p>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-baby-dark
                        mt-1
                    ">
                        {ventas.cantidad}
                    </h2>

                </div>


                {/* ANULADAS */}

                <div className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    border
                    border-gray-100
                    p-5
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div className="
                            w-11
                            h-11
                            rounded-xl
                            bg-red-50
                            flex
                            items-center
                            justify-center
                        ">

                            <AlertTriangle
                                size={22}
                                className="text-red-500"
                            />

                        </div>

                        <span className="
                            text-xs
                            font-medium
                            text-red-400
                        ">
                            HOY
                        </span>

                    </div>


                    <p className="
                        text-sm
                        text-gray-500
                        mt-4
                    ">
                        Ventas anuladas
                    </p>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-baby-dark
                        mt-1
                    ">
                        {ventas.anuladas}
                    </h2>

                </div>


                {/* CAJA */}

                <div className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    border
                    border-gray-100
                    p-5
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div className="
                            w-11
                            h-11
                            rounded-xl
                            bg-green-50
                            flex
                            items-center
                            justify-center
                        ">

                            <Banknote
                                size={22}
                                className="text-green-600"
                            />

                        </div>

                        <span className="
                            text-xs
                            font-medium
                            text-gray-400
                        ">
                            CAJA
                        </span>

                    </div>


                    <p className="
                        text-sm
                        text-gray-500
                        mt-4
                    ">
                        Efectivo esperado
                    </p>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-baby-dark
                        mt-1
                    ">

                        {caja
                            ? formatearMoneda(caja.monto_esperado)
                            : 'No abierta'
                        }

                    </h2>

                </div>

            </div>


            {/* =====================================
                VENTAS POR MÉTODO DE PAGO
            ====================================== */}

            <div className="
                bg-white
                rounded-2xl
                shadow-sm
                border
                border-gray-100
                p-5
            ">

                <div className="
                    flex
                    items-center
                    justify-between
                    mb-5
                ">

                    <div>

                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <WalletCards
                                size={21}
                                className="text-baby-primary"
                            />

                            <h2 className="
                                text-lg
                                font-semibold
                                text-baby-dark
                            ">
                                Métodos de pago
                            </h2>

                        </div>

                        <p className="
                            text-sm
                            text-gray-500
                            mt-1
                        ">
                            Distribución de las ventas del día
                        </p>

                    </div>


                    <span className="
                        text-sm
                        font-semibold
                        text-baby-dark
                    ">
                        {formatearMoneda(totalPagos)}
                    </span>

                </div>


                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-4
                ">


                    {/* EFECTIVO */}

                    <div className="
                        border
                        border-gray-100
                        rounded-xl
                        p-4
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <div className="
                                    w-10
                                    h-10
                                    rounded-lg
                                    bg-green-50
                                    flex
                                    items-center
                                    justify-center
                                ">

                                    <Banknote
                                        size={20}
                                        className="text-green-600"
                                    />

                                </div>

                                <div>

                                    <p className="
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    ">
                                        Efectivo
                                    </p>

                                    <p className="
                                        text-xs
                                        text-gray-400
                                    ">
                                        {porcentajePago(
                                            pagos.efectivo
                                        )}%
                                    </p>

                                </div>

                            </div>

                            <span className="
                                font-semibold
                                text-baby-dark
                            ">
                                {formatearMoneda(
                                    pagos.efectivo
                                )}
                            </span>

                        </div>


                        <div className="
                            h-2
                            bg-gray-100
                            rounded-full
                            mt-4
                            overflow-hidden
                        ">

                            <div
                                className="
                                    h-full
                                    bg-green-500
                                    rounded-full
                                "
                                style={{
                                    width: `${porcentajePago(
                                        pagos.efectivo
                                    )}%`
                                }}
                            />

                        </div>

                    </div>


                    {/* TARJETA */}

                    <div className="
                        border
                        border-gray-100
                        rounded-xl
                        p-4
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <div className="
                                    w-10
                                    h-10
                                    rounded-lg
                                    bg-blue-50
                                    flex
                                    items-center
                                    justify-center
                                ">

                                    <CreditCard
                                        size={20}
                                        className="text-blue-600"
                                    />

                                </div>

                                <div>

                                    <p className="
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    ">
                                        Tarjeta
                                    </p>

                                    <p className="
                                        text-xs
                                        text-gray-400
                                    ">
                                        {porcentajePago(
                                            pagos.tarjeta
                                        )}%
                                    </p>

                                </div>

                            </div>

                            <span className="
                                font-semibold
                                text-baby-dark
                            ">
                                {formatearMoneda(
                                    pagos.tarjeta
                                )}
                            </span>

                        </div>


                        <div className="
                            h-2
                            bg-gray-100
                            rounded-full
                            mt-4
                            overflow-hidden
                        ">

                            <div
                                className="
                                    h-full
                                    bg-blue-500
                                    rounded-full
                                "
                                style={{
                                    width: `${porcentajePago(
                                        pagos.tarjeta
                                    )}%`
                                }}
                            />

                        </div>

                    </div>


                    {/* TRANSFERENCIA */}

                    <div className="
                        border
                        border-gray-100
                        rounded-xl
                        p-4
                    ">

                        <div className="
                            flex
                            items-center
                            justify-between
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <div className="
                                    w-10
                                    h-10
                                    rounded-lg
                                    bg-purple-50
                                    flex
                                    items-center
                                    justify-center
                                ">

                                    <ArrowUpFromLine
                                        size={20}
                                        className="text-purple-600"
                                    />

                                </div>

                                <div>

                                    <p className="
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    ">
                                        Transferencia
                                    </p>

                                    <p className="
                                        text-xs
                                        text-gray-400
                                    ">
                                        {porcentajePago(
                                            pagos.transferencia
                                        )}%
                                    </p>

                                </div>

                            </div>

                            <span className="
                                font-semibold
                                text-baby-dark
                            ">
                                {formatearMoneda(
                                    pagos.transferencia
                                )}
                            </span>

                        </div>


                        <div className="
                            h-2
                            bg-gray-100
                            rounded-full
                            mt-4
                            overflow-hidden
                        ">

                            <div
                                className="
                                    h-full
                                    bg-purple-500
                                    rounded-full
                                "
                                style={{
                                    width: `${porcentajePago(
                                        pagos.transferencia
                                    )}%`
                                }}
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================
                PRODUCTOS + STOCK
            ====================================== */}

            <div className="
                grid
                grid-cols-1
                xl:grid-cols-2
                gap-6
            ">


                {/* =================================
                    PRODUCTOS MÁS VENDIDOS
                ================================== */}

                <div className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    border
                    border-gray-100
                    overflow-hidden
                ">

                    <div className="
                        p-5
                        border-b
                        border-gray-100
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <div className="
                                flex
                                items-center
                                gap-2
                            ">

                                <BarChart3
                                    size={21}
                                    className="text-baby-primary"
                                />

                                <h2 className="
                                    text-lg
                                    font-semibold
                                    text-baby-dark
                                ">
                                    Productos más vendidos
                                </h2>

                            </div>

                            <p className="
                                text-sm
                                text-gray-500
                                mt-1
                            ">
                                Top 5 productos del día
                            </p>

                        </div>

                        <Package
                            size={22}
                            className="text-gray-300"
                        />

                    </div>


                    <div className="p-5">

                        {productosMasVendidos.length === 0 ? (

                            <div className="
                                py-10
                                flex
                                flex-col
                                items-center
                                justify-center
                                text-center
                            ">

                                <ShoppingCart
                                    size={38}
                                    className="text-gray-300"
                                />

                                <p className="
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    mt-3
                                ">
                                    No hay ventas registradas
                                </p>

                                <p className="
                                    text-xs
                                    text-gray-400
                                    mt-1
                                ">
                                    Los productos vendidos aparecerán aquí.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-3">

                                {productosMasVendidos.map(
                                    (item, index) => (

                                        <div
                                            key={item.producto_id}
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                p-3
                                                rounded-xl
                                                hover:bg-gray-50
                                                transition
                                            "
                                        >

                                            <div className="
                                                w-9
                                                h-9
                                                rounded-lg
                                                bg-baby-primary/10
                                                text-baby-primary
                                                flex
                                                items-center
                                                justify-center
                                                font-bold
                                                text-sm
                                                shrink-0
                                            ">
                                                {index + 1}
                                            </div>


                                            <div className="
                                                min-w-0
                                                flex-1
                                            ">

                                                <p className="
                                                    font-medium
                                                    text-sm
                                                    text-baby-dark
                                                    truncate
                                                ">
                                                    {item.producto?.nombre ||
                                                        'Producto'}
                                                </p>

                                                <p className="
                                                    text-xs
                                                    text-gray-400
                                                    mt-0.5
                                                ">
                                                    Código:{' '}
                                                    {item.producto?.codigo ||
                                                        '-'}
                                                </p>

                                            </div>


                                            <div className="
                                                text-right
                                                shrink-0
                                            ">

                                                <p className="
                                                    text-sm
                                                    font-semibold
                                                    text-baby-dark
                                                ">
                                                    {Number(
                                                        item.cantidad_vendida || 0
                                                    )}{' '}
                                                    uds.
                                                </p>

                                                <p className="
                                                    text-xs
                                                    text-gray-400
                                                    mt-0.5
                                                ">
                                                    {formatearMoneda(
                                                        item.total_generado
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>


                {/* =================================
                    STOCK BAJO
                ================================== */}

                <div className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    border
                    border-gray-100
                    overflow-hidden
                ">

                    <div className="
                        p-5
                        border-b
                        border-gray-100
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <div className="
                                flex
                                items-center
                                gap-2
                            ">

                                <AlertTriangle
                                    size={21}
                                    className="text-orange-500"
                                />

                                <h2 className="
                                    text-lg
                                    font-semibold
                                    text-baby-dark
                                ">
                                    Stock bajo
                                </h2>

                            </div>

                            <p className="
                                text-sm
                                text-gray-500
                                mt-1
                            ">
                                Productos que requieren reposición
                            </p>

                        </div>


                        <span className="
                            min-w-8
                            h-8
                            px-2
                            rounded-lg
                            bg-orange-50
                            text-orange-600
                            flex
                            items-center
                            justify-center
                            text-sm
                            font-bold
                        ">
                            {productosStockBajo.length}
                        </span>

                    </div>


                    <div className="p-5">

                        {productosStockBajo.length === 0 ? (

                            <div className="
                                py-10
                                flex
                                flex-col
                                items-center
                                justify-center
                                text-center
                            ">

                                <Boxes
                                    size={38}
                                    className="text-green-400"
                                />

                                <p className="
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    mt-3
                                ">
                                    Stock en buen estado
                                </p>

                                <p className="
                                    text-xs
                                    text-gray-400
                                    mt-1
                                ">
                                    No hay productos por debajo del mínimo.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-3">

                                {productosStockBajo.map(
                                    (producto) => {

                                        const stock =
                                            Number(producto.stock || 0)

                                        const minimo =
                                            Number(producto.stock_minimo || 0)

                                        const porcentaje =
                                            minimo > 0
                                                ? Math.min(
                                                    (stock / minimo) * 100,
                                                    100
                                                )
                                                : 0

                                        return (

                                            <div
                                                key={producto.id}
                                                className="
                                                    p-3
                                                    rounded-xl
                                                    border
                                                    border-gray-100
                                                "
                                            >

                                                <div className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-3
                                                ">

                                                    <div className="min-w-0">

                                                        <p className="
                                                            text-sm
                                                            font-medium
                                                            text-baby-dark
                                                            truncate
                                                        ">
                                                            {producto.nombre}
                                                        </p>

                                                        <p className="
                                                            text-xs
                                                            text-gray-400
                                                            mt-0.5
                                                        ">
                                                            Código:{' '}
                                                            {producto.codigo}
                                                        </p>

                                                    </div>


                                                    <div className="
                                                        text-right
                                                        shrink-0
                                                    ">

                                                        <p className="
                                                            text-sm
                                                            font-bold
                                                            text-orange-600
                                                        ">
                                                            {stock}
                                                        </p>

                                                        <p className="
                                                            text-xs
                                                            text-gray-400
                                                        ">
                                                            mín. {minimo}
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="
                                                    h-1.5
                                                    bg-gray-100
                                                    rounded-full
                                                    overflow-hidden
                                                    mt-3
                                                ">

                                                    <div
                                                        className="
                                                            h-full
                                                            bg-orange-500
                                                            rounded-full
                                                        "
                                                        style={{
                                                            width: `${porcentaje}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        )
                                    }
                                )}

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =====================================
                RESUMEN DE CAJA
            ====================================== */}

            <div className="
                bg-white
                rounded-2xl
                shadow-sm
                border
                border-gray-100
                overflow-hidden
            ">

                <div className="
                    p-5
                    border-b
                    border-gray-100
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                ">

                    <div>

                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <WalletCards
                                size={21}
                                className="text-baby-primary"
                            />

                            <h2 className="
                                text-lg
                                font-semibold
                                text-baby-dark
                            ">
                                Caja actual
                            </h2>

                        </div>

                        <p className="
                            text-sm
                            text-gray-500
                            mt-1
                        ">
                            Resumen de la caja abierta por el usuario
                        </p>

                    </div>


                    {caja && (

                        <span className="
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1.5
                            rounded-full
                            bg-green-50
                            text-green-700
                            text-xs
                            font-semibold
                            w-fit
                        ">

                            <span className="
                                w-2
                                h-2
                                rounded-full
                                bg-green-500
                            " />

                            CAJA ABIERTA

                        </span>

                    )}

                </div>


                {caja ? (

                    <div className="
                        p-5
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-4
                    ">


                        {/* MONTO INICIAL */}

                        <div className="
                            p-4
                            rounded-xl
                            bg-gray-50
                        ">

                            <div className="
                                flex
                                items-center
                                gap-2
                                text-gray-500
                            ">

                                <Banknote size={18} />

                                <span className="text-sm">
                                    Monto inicial
                                </span>

                            </div>

                            <p className="
                                text-xl
                                font-bold
                                text-baby-dark
                                mt-2
                            ">
                                {formatearMoneda(
                                    caja.monto_inicial
                                )}
                            </p>

                        </div>


                        {/* INGRESOS */}

                        <div className="
                            p-4
                            rounded-xl
                            bg-green-50
                        ">

                            <div className="
                                flex
                                items-center
                                gap-2
                                text-green-700
                            ">

                                <ArrowUpFromLine size={18} />

                                <span className="text-sm">
                                    Ingresos
                                </span>

                            </div>

                            <p className="
                                text-xl
                                font-bold
                                text-green-700
                                mt-2
                            ">
                                {formatearMoneda(
                                    caja.ingresos
                                )}
                            </p>

                        </div>


                        {/* EGRESOS */}

                        <div className="
                            p-4
                            rounded-xl
                            bg-red-50
                        ">

                            <div className="
                                flex
                                items-center
                                gap-2
                                text-red-700
                            ">

                                <ArrowDownToLine size={18} />

                                <span className="text-sm">
                                    Egresos
                                </span>

                            </div>

                            <p className="
                                text-xl
                                font-bold
                                text-red-700
                                mt-2
                            ">
                                {formatearMoneda(
                                    caja.egresos
                                )}
                            </p>

                        </div>


                        {/* ESPERADO */}

                        <div className="
                            p-4
                            rounded-xl
                            bg-baby-primary/10
                        ">

                            <div className="
                                flex
                                items-center
                                gap-2
                                text-baby-primary
                            ">

                                <WalletCards size={18} />

                                <span className="text-sm">
                                    Efectivo esperado
                                </span>

                            </div>

                            <p className="
                                text-xl
                                font-bold
                                text-baby-dark
                                mt-2
                            ">
                                {formatearMoneda(
                                    caja.monto_esperado
                                )}
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="
                        p-8
                        flex
                        flex-col
                        items-center
                        justify-center
                        text-center
                    ">

                        <div className="
                            w-14
                            h-14
                            rounded-2xl
                            bg-gray-100
                            flex
                            items-center
                            justify-center
                        ">

                            <WalletCards
                                size={28}
                                className="text-gray-400"
                            />

                        </div>

                        <h3 className="
                            font-semibold
                            text-baby-dark
                            mt-4
                        ">
                            No hay una caja abierta
                        </h3>

                        <p className="
                            text-sm
                            text-gray-500
                            mt-1
                            max-w-md
                        ">
                            Actualmente no tienes una caja abierta.
                            Abre una caja para comenzar a registrar
                            operaciones de venta.
                        </p>

                    </div>

                )}

            </div>


        </div>
    )
}

export default Dashboard