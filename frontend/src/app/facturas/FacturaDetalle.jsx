import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
    ArrowLeft,
    Printer,
    Receipt,
    Building2,
    UserRound,
    CalendarDays,
    CreditCard,
    Banknote,
    Landmark,
    Phone,
    Mail,
    MapPin,
    FileText,
    AlertCircle,
    RefreshCw,
    CheckCircle2,
    ShoppingCart,
    CircleDollarSign,
} from 'lucide-react'

import { obtenerFacturaParaImpresion } from '../../services/facturaService'

const FacturaDetalle = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    const [factura, setFactura] = useState(null)

    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [imprimiendo, setImprimiendo] = useState(false)

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
        }).format(fechaObj)

    }

    // =========================================================
    // CARGAR FACTURA
    // =========================================================

    const cargarFactura = async () => {

        try {

            setCargando(true)
            setError('')

            const data =
                await obtenerFacturaParaImpresion(id)

            setFactura(data)

        } catch (err) {

            console.error(
                'Error al obtener factura:',
                err
            )

            setError(
                err.response?.data?.message ||
                'No se pudo cargar la factura'
            )

        } finally {

            setCargando(false)

        }

    }

    // =========================================================
    // CARGA INICIAL
    // =========================================================

    useEffect(() => {

        if (id) {
            cargarFactura()
        }

    }, [id])

    // =========================================================
    // IMPRIMIR
    // =========================================================

    const imprimirFactura = () => {

        setImprimiendo(true)

        setTimeout(() => {

            window.print()

            setImprimiendo(false)

        }, 100)

    }

    // =========================================================
    // MÉTODO DE PAGO
    // =========================================================

    const obtenerIconoPago = (metodo) => {

        switch (metodo) {

            case 'EFECTIVO':
                return (
                    <Banknote size={17} />
                )

            case 'TARJETA':
                return (
                    <CreditCard size={17} />
                )

            case 'TRANSFERENCIA':
                return (
                    <Landmark size={17} />
                )

            default:
                return (
                    <CreditCard size={17} />
                )

        }

    }

    // =========================================================
    // TEXTO MÉTODO
    // =========================================================

    const obtenerTextoPago = (metodo) => {

        switch (metodo) {

            case 'EFECTIVO':
                return 'Efectivo'

            case 'TARJETA':
                return 'Tarjeta'

            case 'TRANSFERENCIA':
                return 'Transferencia'

            default:
                return metodo || '-'

        }

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
                            Cargando factura...
                        </p>

                    </div>

                </div>

            </div>

        )

    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error || !factura) {

        return (

            <div className="min-h-screen bg-gray-50 p-4 md:p-6">

                <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">

                        <AlertCircle
                            size={30}
                            className="text-red-500"
                        />

                    </div>

                    <h2 className="text-lg font-bold text-baby-dark">
                        No se pudo cargar la factura
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {error ||
                            'La factura solicitada no existe o no está disponible.'}
                    </p>

                    <div className="mt-6 flex justify-center gap-2">

                        <button
                            type="button"
                            onClick={cargarFactura}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                        >

                            <RefreshCw size={16} />

                            Reintentar

                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/facturas')
                            }
                            className="rounded-lg bg-baby-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Ir a facturas
                        </button>

                    </div>

                </div>

            </div>

        )

    }

    // =========================================================
    // DATOS
    // =========================================================

    const datosFactura =
        factura.factura || {}

    const emisor =
        factura.emisor || {}

    const cliente =
        factura.cliente || null

    const venta =
        factura.venta || {}

    const pago =
        factura.pago || null

    const productos =
        Array.isArray(venta.productos)
            ? venta.productos
            : []

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* =====================================================
                BARRA SUPERIOR
            ===================================================== */}

            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/facturas')
                        }
                        className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-baby-primary"
                    >
                        <ArrowLeft size={19} />
                    </button>

                    <div>

                        <h1 className="text-2xl font-bold text-baby-dark">
                            Factura
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Detalle de la factura generada
                        </p>

                    </div>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/ventas/${venta.id}`
                            )
                        }
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
                    >

                        <FileText size={17} />

                        Ver venta

                    </button>

                    <button
                        type="button"
                        onClick={imprimirFactura}
                        disabled={imprimiendo}
                        className="flex items-center gap-2 rounded-lg bg-baby-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                    >

                        <Printer size={17} />

                        {imprimiendo
                            ? 'Preparando...'
                            : 'Imprimir factura'}

                    </button>

                </div>

            </div>

            {/* =====================================================
                FACTURA
            ===================================================== */}

            <div className="mx-auto max-w-4xl">

                <div
                    id="factura"
                    className="overflow-hidden rounded-xl bg-white shadow-sm print:rounded-none print:shadow-none"
                >

                    {/* =================================================
                        ENCABEZADO EMPRESA
                    ================================================= */}

                    <div className="border-b-2 border-baby-primary p-6 md:p-8">

                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                            {/* EMPRESA */}

                            <div className="flex items-start gap-4">

                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-baby-secondary">

                                    <Building2
                                        size={30}
                                        className="text-baby-primary"
                                    />

                                </div>

                                <div>

                                    <h2 className="text-xl font-bold text-baby-dark">
                                        {
                                            emisor.nombre_comercial ||
                                            emisor.razon_social ||
                                            'Empresa'
                                        }
                                    </h2>

                                    {emisor.razon_social &&
                                        emisor.nombre_comercial &&
                                        emisor.razon_social !==
                                        emisor.nombre_comercial && (

                                            <p className="mt-0.5 text-sm text-gray-500">
                                                {
                                                    emisor.razon_social
                                                }
                                            </p>

                                        )}

                                    {emisor.rtn && (

                                        <p className="mt-2 text-sm text-gray-600">

                                            <span className="font-semibold">
                                                RTN:
                                            </span>{' '}

                                            {
                                                emisor.rtn
                                            }

                                        </p>

                                    )}

                                    {emisor.direccion && (

                                        <div className="mt-1 flex items-start gap-1.5 text-sm text-gray-500">

                                            <MapPin
                                                size={14}
                                                className="mt-0.5 shrink-0"
                                            />

                                            <span>
                                                {
                                                    emisor.direccion
                                                }
                                            </span>

                                        </div>

                                    )}

                                    {emisor.telefono && (

                                        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">

                                            <Phone
                                                size={14}
                                            />

                                            {
                                                emisor.telefono
                                            }

                                        </div>

                                    )}

                                </div>

                            </div>

                            {/* FACTURA */}

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 md:min-w-[270px]">

                                <div className="mb-3 flex items-center gap-2">

                                    <Receipt
                                        size={19}
                                        className="text-baby-primary"
                                    />

                                    <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                                        Factura
                                    </span>

                                </div>

                                <p className="text-xl font-bold text-baby-dark">
                                    {
                                        datosFactura.numero_factura ||
                                        '-'
                                    }
                                </p>

                                <div className="mt-3 space-y-1.5 text-xs text-gray-500">

                                    <p>

                                        <span className="font-semibold">
                                            CAI:
                                        </span>{' '}

                                        {
                                            datosFactura.cai ||
                                            '-'
                                        }

                                    </p>

                                    <p>

                                        <span className="font-semibold">
                                            Fecha de emisión:
                                        </span>{' '}

                                        {
                                            formatearFecha(
                                                datosFactura.fecha_emision
                                            )
                                        }

                                    </p>

                                    {datosFactura.fecha_limite_emision && (

                                        <p>

                                            <span className="font-semibold">
                                                Fecha límite:
                                            </span>{' '}

                                            {
                                                formatearFecha(
                                                    datosFactura.fecha_limite_emision
                                                )
                                            }

                                        </p>

                                    )}

                                    <p>

                                        <span className="font-semibold">
                                            RTN emisor:
                                        </span>{' '}

                                        {
                                            datosFactura.rtn_emisor ||
                                            emisor.rtn ||
                                            '-'
                                        }

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        DATOS CLIENTE / VENTA
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-6 border-b border-gray-100 p-6 md:grid-cols-2 md:p-8">

                        {/* CLIENTE */}

                        <div>

                            <div className="mb-3 flex items-center gap-2">

                                <UserRound
                                    size={17}
                                    className="text-baby-primary"
                                />

                                <h3 className="text-sm font-semibold text-baby-dark">
                                    Datos del cliente
                                </h3>

                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">

                                <p className="font-semibold text-gray-700">

                                    {cliente?.nombre ||
                                        'Consumidor final'}

                                </p>

                                {cliente?.rtn && (

                                    <p className="mt-1 text-xs text-gray-500">

                                        RTN:{' '}
                                        {
                                            cliente.rtn
                                        }

                                    </p>

                                )}

                                {cliente?.email && (

                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">

                                        <Mail
                                            size={13}
                                        />

                                        {
                                            cliente.email
                                        }

                                    </div>

                                )}

                                {cliente?.telefono && (

                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">

                                        <Phone
                                            size={13}
                                        />

                                        {
                                            cliente.telefono
                                        }

                                    </div>

                                )}

                            </div>

                        </div>

                        {/* VENTA */}

                        <div>

                            <div className="mb-3 flex items-center gap-2">

                                <CalendarDays
                                    size={17}
                                    className="text-baby-primary"
                                />

                                <h3 className="text-sm font-semibold text-baby-dark">
                                    Información de venta
                                </h3>

                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">

                                <div className="flex justify-between gap-4 text-sm">

                                    <span className="text-gray-500">
                                        Número de venta
                                    </span>

                                    <span className="font-semibold text-gray-700">
                                        {
                                            venta.numero ||
                                            '-'
                                        }
                                    </span>

                                </div>

                                <div className="mt-2 flex justify-between gap-4 text-sm">

                                    <span className="text-gray-500">
                                        Fecha
                                    </span>

                                    <span className="font-medium text-gray-700">
                                        {
                                            formatearFecha(
                                                venta.fecha
                                            )
                                        }
                                    </span>

                                </div>

                                <div className="mt-2 flex justify-between gap-4 text-sm">

                                    <span className="text-gray-500">
                                        Estado
                                    </span>

                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                            datosFactura.estado ===
                                            'ANULADA'
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-green-50 text-green-600'
                                        }`}
                                    >

                                        {datosFactura.estado ===
                                        'ANULADA' ? (
                                            <AlertCircle
                                                size={13}
                                            />
                                        ) : (
                                            <CheckCircle2
                                                size={13}
                                            />
                                        )}

                                        {
                                            datosFactura.estado ||
                                            'EMITIDA'
                                        }

                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        PRODUCTOS
                    ================================================= */}

                    <div className="p-6 md:p-8">

                        <div className="mb-4 flex items-center gap-2">

                            <ShoppingCartIcon />

                            <h3 className="text-sm font-semibold text-baby-dark">
                                Detalle de productos
                            </h3>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[650px]">

                                <thead>

                                    <tr className="border-b border-gray-200">

                                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Código
                                        </th>

                                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Producto
                                        </th>

                                        <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Cantidad
                                        </th>

                                        <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Precio
                                        </th>

                                        <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Descuento
                                        </th>

                                        <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Subtotal
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                    {productos.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="py-10 text-center text-sm text-gray-400"
                                            >
                                                No hay productos registrados.
                                            </td>

                                        </tr>

                                    ) : (

                                        productos.map(
                                            (producto, index) => (

                                                <tr
                                                    key={`${producto.codigo}-${index}`}
                                                >

                                                    <td className="py-4 text-xs text-gray-500">

                                                        {
                                                            producto.codigo ||
                                                            '-'
                                                        }

                                                    </td>

                                                    <td className="py-4">

                                                        <p className="text-sm font-medium text-gray-700">
                                                            {
                                                                producto.nombre
                                                            }
                                                        </p>

                                                    </td>

                                                    <td className="py-4 text-center text-sm text-gray-600">

                                                        {
                                                            producto.cantidad
                                                        }

                                                    </td>

                                                    <td className="py-4 text-right text-sm text-gray-600">

                                                        {moneda(
                                                            producto.precio_unitario
                                                        )}

                                                    </td>

                                                    <td className="py-4 text-right text-sm text-gray-600">

                                                        {moneda(
                                                            producto.descuento
                                                        )}

                                                    </td>

                                                    <td className="py-4 text-right text-sm font-semibold text-gray-700">

                                                        {moneda(
                                                            producto.subtotal
                                                        )}

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* =================================================
                        TOTALES Y PAGO
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-6 border-t border-gray-100 bg-gray-50 p-6 md:grid-cols-2 md:p-8">

                        {/* PAGO */}

                        <div>

                            <div className="mb-3 flex items-center gap-2">

                                {obtenerIconoPago(
                                    pago?.metodo
                                )}

                                <h3 className="text-sm font-semibold text-baby-dark">
                                    Información de pago
                                </h3>

                            </div>

                            {pago ? (

                                <div className="rounded-lg bg-white p-4">

                                    <div className="flex items-center justify-between">

                                        <span className="text-sm text-gray-500">
                                            Método
                                        </span>

                                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">

                                            {obtenerIconoPago(
                                                pago.metodo
                                            )}

                                            {
                                                obtenerTextoPago(
                                                    pago.metodo
                                                )
                                            }

                                        </span>

                                    </div>

                                    <div className="mt-3 flex items-center justify-between">

                                        <span className="text-sm text-gray-500">
                                            Monto
                                        </span>

                                        <span className="text-sm font-semibold text-gray-700">
                                            {moneda(
                                                pago.monto
                                            )}
                                        </span>

                                    </div>

                                    {pago.metodo ===
                                        'EFECTIVO' && (

                                        <>

                                            <div className="mt-3 flex items-center justify-between">

                                                <span className="text-sm text-gray-500">
                                                    Recibido
                                                </span>

                                                <span className="text-sm font-semibold text-gray-700">
                                                    {moneda(
                                                        pago.monto_recibido
                                                    )}
                                                </span>

                                            </div>

                                            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">

                                                <span className="text-sm font-medium text-gray-600">
                                                    Cambio
                                                </span>

                                                <span className="text-base font-bold text-green-600">
                                                    {moneda(
                                                        pago.cambio
                                                    )}
                                                </span>

                                            </div>

                                        </>

                                    )}

                                    {pago.referencia && (

                                        <div className="mt-3 border-t border-gray-100 pt-3">

                                            <p className="text-xs text-gray-400">
                                                Referencia
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-700">
                                                {
                                                    pago.referencia
                                                }
                                            </p>

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <div className="rounded-lg bg-white p-4 text-sm text-gray-400">
                                    No hay información de pago.
                                </div>

                            )}

                        </div>

                        {/* TOTALES */}

                        <div>

                            <div className="mb-3 flex items-center gap-2">

                                <CircleDollarIcon />

                                <h3 className="text-sm font-semibold text-baby-dark">
                                    Totales
                                </h3>

                            </div>

                            <div className="rounded-lg bg-white p-4">

                                <div className="flex items-center justify-between text-sm">

                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <span className="font-medium text-gray-700">
                                        {moneda(
                                            venta.subtotal
                                        )}
                                    </span>

                                </div>

                                <div className="mt-3 flex items-center justify-between text-sm">

                                    <span className="text-gray-500">
                                        Descuento
                                    </span>

                                    <span className="font-medium text-red-500">
                                        - {moneda(
                                            venta.descuento
                                        )}
                                    </span>

                                </div>

                                <div className="mt-3 flex items-center justify-between text-sm">

                                    <span className="text-gray-500">
                                        Impuesto
                                    </span>

                                    <span className="font-medium text-gray-700">
                                        {moneda(
                                            venta.impuesto
                                        )}
                                    </span>

                                </div>

                                <div className="mt-4 border-t border-gray-100 pt-4">

                                    <div className="flex items-center justify-between">

                                        <span className="text-base font-bold text-baby-dark">
                                            Total
                                        </span>

                                        <span className="text-2xl font-bold text-baby-primary">
                                            {moneda(
                                                venta.total
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        PIE
                    ================================================= */}

                    <div className="border-t border-gray-100 px-6 py-5 text-center md:px-8">

                        <p className="text-xs text-gray-400">
                            Gracias por su compra.
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Este documento fue generado por el sistema POS.
                        </p>

                    </div>

                </div>

            </div>

        </div>

    )
}

// =============================================================
// ICONOS PEQUEÑOS
// =============================================================

const ShoppingCartIcon = () => (

    <ShoppingCart
        size={17}
        className="text-baby-primary"
    />

)

const CircleDollarIcon = () => (

    <CircleDollarSign
        size={17}
        className="text-baby-primary"
    />

)

export default FacturaDetalle