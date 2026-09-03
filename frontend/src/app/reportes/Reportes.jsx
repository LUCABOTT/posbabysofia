import { useState } from 'react'
import {
    BarChart3,
    CalendarDays,
    CreditCard,
    Banknote,
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    Package,
    RefreshCw,
    Search,
    ShoppingCart,
    Store,
    TrendingUp,
    WalletCards,
    XCircle
} from 'lucide-react'

import {
    obtenerReporteVentas,
    obtenerReporteCajas
} from '../../services/reporteService'

const Reportes = () => {

    const hoy = new Date()
    const fechaHoy = hoy.toISOString().split('T')[0]

    const [tipoReporte, setTipoReporte] = useState('ventas')

    const [fechaInicio, setFechaInicio] = useState(fechaHoy)
    const [fechaFin, setFechaFin] = useState(fechaHoy)

    const [reporteVentas, setReporteVentas] = useState(null)
    const [reporteCajas, setReporteCajas] = useState(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // ==============================
    // FORMATEAR MONEDA
    // ==============================

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL',
            minimumFractionDigits: 2
        }).format(Number(valor || 0))
    }

    // ==============================
    // FORMATEAR FECHA
    // ==============================

    const formatearFecha = (fecha) => {
        if (!fecha) return '-'

        return new Date(fecha).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    // ==============================
    // CARGAR REPORTE
    // ==============================

    const buscarReporte = async () => {

        if (!fechaInicio || !fechaFin) {
            setError('Debe seleccionar ambas fechas')
            return
        }

        if (fechaInicio > fechaFin) {
            setError(
                'La fecha inicial no puede ser mayor que la fecha final'
            )
            return
        }

        try {

            setLoading(true)
            setError('')

            if (tipoReporte === 'ventas') {

                const data = await obtenerReporteVentas(
                    fechaInicio,
                    fechaFin
                )

                setReporteVentas(data)

            } else {

                const data = await obtenerReporteCajas(
                    fechaInicio,
                    fechaFin
                )

                setReporteCajas(data)
            }

        } catch (error) {

            console.error('Error al obtener reporte:', error)

            setError(
                error.response?.data?.message ||
                'No se pudo obtener el reporte'
            )

        } finally {

            setLoading(false)
        }
    }

    // ==============================
    // CAMBIAR REPORTE
    // ==============================

    const cambiarReporte = (tipo) => {

        setTipoReporte(tipo)
        setError('')

    }

    // ==============================
    // REPORTE VENTAS
    // ==============================

    const renderReporteVentas = () => {

        if (!reporteVentas) {
            return (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                    <BarChart3
                        size={52}
                        className="mx-auto text-baby-primary mb-4"
                    />

                    <h3 className="text-lg font-semibold text-baby-dark">
                        Genera tu reporte de ventas
                    </h3>

                    <p className="text-gray-500 mt-2">
                        Selecciona un rango de fechas y presiona
                        buscar para consultar las ventas.
                    </p>
                </div>
            )
        }

        const resumen = reporteVentas.resumen
        const pagos = reporteVentas.pagos

        const totalPagos =
            Number(pagos.efectivo || 0) +
            Number(pagos.tarjeta || 0) +
            Number(pagos.transferencia || 0)

        const porcentajeEfectivo =
            totalPagos > 0
                ? (Number(pagos.efectivo || 0) / totalPagos) * 100
                : 0

        const porcentajeTarjeta =
            totalPagos > 0
                ? (Number(pagos.tarjeta || 0) / totalPagos) * 100
                : 0

        const porcentajeTransferencia =
            totalPagos > 0
                ? (Number(pagos.transferencia || 0) / totalPagos) * 100
                : 0

        return (
            <div className="space-y-6">

                {/* RESUMEN */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total ventas
                                </p>

                                <h3 className="text-2xl font-bold text-baby-dark mt-1">
                                    {formatearMoneda(
                                        resumen.total_ventas
                                    )}
                                </h3>
                            </div>

                            <div className="p-3 rounded-xl bg-baby-primary/10">
                                <TrendingUp
                                    size={25}
                                    className="text-baby-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Cantidad de ventas
                                </p>

                                <h3 className="text-2xl font-bold text-baby-dark mt-1">
                                    {resumen.cantidad_ventas}
                                </h3>
                            </div>

                            <div className="p-3 rounded-xl bg-green-100">
                                <ShoppingCart
                                    size={25}
                                    className="text-green-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Ventas anuladas
                                </p>

                                <h3 className="text-2xl font-bold text-baby-dark mt-1">
                                    {resumen.ventas_anuladas}
                                </h3>
                            </div>

                            <div className="p-3 rounded-xl bg-red-100">
                                <XCircle
                                    size={25}
                                    className="text-red-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Descuentos
                                </p>

                                <h3 className="text-2xl font-bold text-baby-dark mt-1">
                                    {formatearMoneda(
                                        resumen.total_descuentos
                                    )}
                                </h3>
                            </div>

                            <div className="p-3 rounded-xl bg-orange-100">
                                <ArrowDownToLine
                                    size={25}
                                    className="text-orange-600"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* MÉTODOS DE PAGO */}

                <div className="bg-white rounded-2xl shadow-sm p-6">

                    <div className="flex items-center gap-3 mb-6">
                        <WalletCards
                            size={23}
                            className="text-baby-primary"
                        />

                        <div>
                            <h2 className="text-lg font-semibold text-baby-dark">
                                Métodos de pago
                            </h2>

                            <p className="text-sm text-gray-500">
                                Distribución de las ventas por método de pago
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* EFECTIVO */}

                        <div className="border border-gray-100 rounded-xl p-5">

                            <div className="flex items-center justify-between mb-3">

                                <div className="flex items-center gap-3">

                                    <div className="p-2 rounded-lg bg-green-100">
                                        <Banknote
                                            size={20}
                                            className="text-green-600"
                                        />
                                    </div>

                                    <span className="font-medium text-baby-dark">
                                        Efectivo
                                    </span>

                                </div>

                                <span className="text-sm text-gray-500">
                                    {porcentajeEfectivo.toFixed(1)}%
                                </span>

                            </div>

                            <p className="text-xl font-bold text-baby-dark">
                                {formatearMoneda(pagos.efectivo)}
                            </p>

                            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                        width: `${porcentajeEfectivo}%`
                                    }}
                                />
                            </div>

                        </div>

                        {/* TARJETA */}

                        <div className="border border-gray-100 rounded-xl p-5">

                            <div className="flex items-center justify-between mb-3">

                                <div className="flex items-center gap-3">

                                    <div className="p-2 rounded-lg bg-blue-100">
                                        <CreditCard
                                            size={20}
                                            className="text-blue-600"
                                        />
                                    </div>

                                    <span className="font-medium text-baby-dark">
                                        Tarjeta
                                    </span>

                                </div>

                                <span className="text-sm text-gray-500">
                                    {porcentajeTarjeta.toFixed(1)}%
                                </span>

                            </div>

                            <p className="text-xl font-bold text-baby-dark">
                                {formatearMoneda(pagos.tarjeta)}
                            </p>

                            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{
                                        width: `${porcentajeTarjeta}%`
                                    }}
                                />
                            </div>

                        </div>

                        {/* TRANSFERENCIA */}

                        <div className="border border-gray-100 rounded-xl p-5">

                            <div className="flex items-center justify-between mb-3">

                                <div className="flex items-center gap-3">

                                    <div className="p-2 rounded-lg bg-purple-100">
                                        <WalletCards
                                            size={20}
                                            className="text-purple-600"
                                        />
                                    </div>

                                    <span className="font-medium text-baby-dark">
                                        Transferencia
                                    </span>

                                </div>

                                <span className="text-sm text-gray-500">
                                    {porcentajeTransferencia.toFixed(1)}%
                                </span>

                            </div>

                            <p className="text-xl font-bold text-baby-dark">
                                {formatearMoneda(
                                    pagos.transferencia
                                )}
                            </p>

                            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                                <div
                                    className="bg-purple-500 h-2 rounded-full"
                                    style={{
                                        width: `${porcentajeTransferencia}%`
                                    }}
                                />
                            </div>

                        </div>

                    </div>

                </div>

                {/* PRODUCTOS MÁS VENDIDOS */}

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                    <div className="p-6 border-b border-gray-100">

                        <div className="flex items-center gap-3">

                            <Package
                                size={23}
                                className="text-baby-primary"
                            />

                            <div>
                                <h2 className="text-lg font-semibold text-baby-dark">
                                    Productos más vendidos
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Top 10 productos del período seleccionado
                                </p>
                            </div>

                        </div>

                    </div>

                    {reporteVentas.productos_mas_vendidos?.length > 0 ? (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                            #
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                            Producto
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                            Código
                                        </th>

                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                                            Cantidad
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Total generado
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {reporteVentas.productos_mas_vendidos.map(
                                        (item, index) => (

                                            <tr
                                                key={item.producto_id}
                                                className="border-t border-gray-100 hover:bg-gray-50"
                                            >

                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {index + 1}
                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="p-2 rounded-lg bg-baby-primary/10">
                                                            <Package
                                                                size={18}
                                                                className="text-baby-primary"
                                                            />
                                                        </div>

                                                        <span className="font-medium text-baby-dark">
                                                            {item.producto?.nombre || 'Sin nombre'}
                                                        </span>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {item.producto?.codigo || '-'}
                                                </td>

                                                <td className="px-6 py-4 text-center font-semibold text-baby-dark">
                                                    {Number(
                                                        item.cantidad_vendida || 0
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-right font-semibold text-baby-dark">
                                                    {formatearMoneda(
                                                        item.total_generado
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="p-10 text-center text-gray-500">
                            No hay productos vendidos en este período.
                        </div>

                    )}

                </div>

                {/* VENTAS */}

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                    <div className="p-6 border-b border-gray-100">

                        <div className="flex items-center gap-3">

                            <Store
                                size={23}
                                className="text-baby-primary"
                            />

                            <div>
                                <h2 className="text-lg font-semibold text-baby-dark">
                                    Detalle de ventas
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Ventas realizadas durante el período
                                </p>
                            </div>

                        </div>

                    </div>

                    {reporteVentas.ventas?.length > 0 ? (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                            Número
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                            Fecha
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Subtotal
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Descuento
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Impuesto
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Total
                                        </th>

                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                                            Estado
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {reporteVentas.ventas.map((venta) => (

                                        <tr
                                            key={venta.id}
                                            className="border-t border-gray-100 hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-4 font-medium text-baby-dark">
                                                {venta.numero || `#${venta.id}`}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatearFecha(
                                                    venta.created_at
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                {formatearMoneda(
                                                    venta.subtotal
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                {formatearMoneda(
                                                    venta.descuento
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                {formatearMoneda(
                                                    venta.impuesto
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right font-semibold">
                                                {formatearMoneda(
                                                    venta.total
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">

                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                                        venta.estado === 'COMPLETADA'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {venta.estado}
                                                </span>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="p-10 text-center text-gray-500">
                            No hay ventas en el período seleccionado.
                        </div>

                    )}

                </div>

            </div>
        )
    }

    // ==============================
    // REPORTE CAJAS
    // ==============================

    const renderReporteCajas = () => {

        if (!reporteCajas) {

            return (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center">

                    <Boxes
                        size={52}
                        className="mx-auto text-baby-primary mb-4"
                    />

                    <h3 className="text-lg font-semibold text-baby-dark">
                        Genera tu reporte de cajas
                    </h3>

                    <p className="text-gray-500 mt-2">
                        Selecciona un rango de fechas para consultar
                        las cajas abiertas y cerradas.
                    </p>

                </div>
            )
        }

        return (
            <div className="space-y-6">

                {/* RESUMEN */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                    <div className="bg-white rounded-2xl shadow-sm p-5">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Total de cajas
                                </p>

                                <h3 className="text-2xl font-bold text-baby-dark mt-1">
                                    {reporteCajas.total_cajas}
                                </h3>

                            </div>

                            <div className="p-3 rounded-xl bg-baby-primary/10">

                                <Boxes
                                    size={25}
                                    className="text-baby-primary"
                                />

                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Cajas abiertas
                                </p>

                                <h3 className="text-2xl font-bold text-baby-dark mt-1">

                                    {
                                        reporteCajas.cajas.filter(
                                            caja => caja.estado === 'ABIERTA'
                                        ).length
                                    }

                                </h3>

                            </div>

                            <div className="p-3 rounded-xl bg-green-100">

                                <Store
                                    size={25}
                                    className="text-green-600"
                                />

                            </div>

                        </div>

                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Cajas cerradas
                                </p>

                                <h3 className="text-2xl font-bold text-baby-dark mt-1">

                                    {
                                        reporteCajas.cajas.filter(
                                            caja => caja.estado === 'CERRADA'
                                        ).length
                                    }

                                </h3>

                            </div>

                            <div className="p-3 rounded-xl bg-blue-100">

                                <WalletCards
                                    size={25}
                                    className="text-blue-600"
                                />

                            </div>

                        </div>

                    </div>

                </div>

                {/* TABLA */}

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                    <div className="p-6 border-b border-gray-100">

                        <div className="flex items-center gap-3">

                            <Boxes
                                size={23}
                                className="text-baby-primary"
                            />

                            <div>

                                <h2 className="text-lg font-semibold text-baby-dark">
                                    Detalle de cajas
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Cajas abiertas durante el período seleccionado
                                </p>

                            </div>

                        </div>

                    </div>

                    {reporteCajas.cajas?.length > 0 ? (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                            Usuario
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                            Apertura
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                            Cierre
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Inicial
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Ingresos
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Egresos
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Esperado
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                            Final
                                        </th>

                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                                            Estado
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {reporteCajas.cajas.map((caja) => (

                                        <tr
                                            key={caja.id}
                                            className="border-t border-gray-100 hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-4">

                                                <div>

                                                    <p className="font-medium text-baby-dark">
                                                        {caja.usuario?.nombre || 'Sin usuario'}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {caja.usuario?.email || ''}
                                                    </p>

                                                </div>

                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatearFecha(
                                                    caja.fecha_apertura
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {caja.fecha_cierre
                                                    ? formatearFecha(
                                                        caja.fecha_cierre
                                                    )
                                                    : 'Abierta'
                                                }
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                {formatearMoneda(
                                                    caja.monto_inicial
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right text-green-600 font-semibold">
                                                {formatearMoneda(
                                                    caja.ingresos
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right text-red-600 font-semibold">
                                                {formatearMoneda(
                                                    caja.egresos
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right font-semibold text-baby-dark">
                                                {formatearMoneda(
                                                    caja.monto_esperado
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right font-semibold">

                                                {caja.monto_final !== null
                                                    ? formatearMoneda(
                                                        caja.monto_final
                                                    )
                                                    : '-'
                                                }

                                            </td>

                                            <td className="px-6 py-4 text-center">

                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                                        caja.estado === 'ABIERTA'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {caja.estado}
                                                </span>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="p-10 text-center text-gray-500">
                            No hay cajas en el período seleccionado.
                        </div>

                    )}

                </div>

            </div>
        )
    }

    // ==============================
    // RENDER
    // ==============================

    return (

        <div className="p-4 md:p-6 space-y-6">

            {/* HEADER */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="p-3 rounded-xl bg-baby-primary/10">

                            <BarChart3
                                size={28}
                                className="text-baby-primary"
                            />

                        </div>

                        <div>

                            <h1 className="text-2xl font-bold text-baby-dark">
                                Reportes
                            </h1>

                            <p className="text-sm text-gray-500">
                                Consulta las ventas y movimientos de caja
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* SELECTOR DE REPORTE */}

            <div className="bg-white rounded-2xl shadow-sm p-2 flex flex-col sm:flex-row gap-2">

                <button
                    onClick={() => cambiarReporte('ventas')}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition ${
                        tipoReporte === 'ventas'
                            ? 'bg-baby-primary text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <TrendingUp size={19} />
                    Reporte de ventas
                </button>

                <button
                    onClick={() => cambiarReporte('cajas')}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition ${
                        tipoReporte === 'cajas'
                            ? 'bg-baby-primary text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Boxes size={19} />
                    Reporte de cajas
                </button>

            </div>

            {/* FILTROS */}

            <div className="bg-white rounded-2xl shadow-sm p-5">

                <div className="flex flex-col lg:flex-row lg:items-end gap-4">

                    <div className="flex-1">

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha inicial
                        </label>

                        <div className="relative">

                            <CalendarDays
                                size={19}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) =>
                                    setFechaInicio(e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baby-primary/30 focus:border-baby-primary"
                            />

                        </div>

                    </div>

                    <div className="flex-1">

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha final
                        </label>

                        <div className="relative">

                            <CalendarDays
                                size={19}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) =>
                                    setFechaFin(e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baby-primary/30 focus:border-baby-primary"
                            />

                        </div>

                    </div>

                    <button
                        onClick={buscarReporte}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-baby-primary text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                        {loading ? (
                            <>
                                <RefreshCw
                                    size={19}
                                    className="animate-spin"
                                />
                                Cargando...
                            </>
                        ) : (
                            <>
                                <Search size={19} />
                                Buscar reporte
                            </>
                        )}

                    </button>

                </div>

            </div>

            {/* ERROR */}

            {error && (

                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3">

                    <XCircle size={20} />

                    <span>{error}</span>

                </div>

            )}

            {/* REPORTE */}

            {tipoReporte === 'ventas'
                ? renderReporteVentas()
                : renderReporteCajas()
            }

        </div>
    )
}

export default Reportes