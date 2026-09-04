import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Receipt,
    Search,
    RefreshCw,
    Eye,
    Printer,
    FileText,
    CheckCircle2,
    XCircle,
    CalendarDays,
    UserRound,
    Building2,
    AlertCircle,
} from 'lucide-react'

import { listarFacturas } from '../../services/facturaService'

const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL',
        minimumFractionDigits: 2,
    }).format(Number(valor || 0))
}

const formatearFechaHora = (fecha) => {
    if (!fecha) return '—'

    const fechaLocal = new Date(fecha)

    if (Number.isNaN(fechaLocal.getTime())) {
        return fecha
    }

    return fechaLocal.toLocaleString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const obtenerNombreCliente = (factura) => {
    return factura?.venta?.cliente?.nombre || 'Consumidor final'
}

const obtenerTotalFactura = (factura) => {
    return Number(factura?.venta?.total || 0)
}

const Facturas = () => {
    const navigate = useNavigate()

    const [facturas, setFacturas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const [busqueda, setBusqueda] = useState('')
    const [estadoFiltro, setEstadoFiltro] = useState('TODAS')

    const cargarFacturas = async () => {
        try {
            setCargando(true)
            setError('')

            const data = await listarFacturas()

            const lista = Array.isArray(data)
                ? data
                : Array.isArray(data?.facturas)
                    ? data.facturas
                    : []

            setFacturas(lista)
        } catch (err) {
            console.error('Error al cargar facturas:', err)

            setError(
                err?.response?.data?.mensaje ||
                err?.response?.data?.message ||
                'No se pudieron cargar las facturas.'
            )
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarFacturas()
    }, [])

    const facturasFiltradas = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()

        return facturas.filter((factura) => {
            const coincideEstado =
                estadoFiltro === 'TODAS' ||
                factura.estado === estadoFiltro

            if (!coincideEstado) {
                return false
            }

            if (!texto) {
                return true
            }

            const numeroFactura =
                String(factura.numero_factura || '').toLowerCase()

            const cai =
                String(factura.cai || '').toLowerCase()

            const rtn =
                String(factura.rtn_emisor || '').toLowerCase()

            const cliente =
                String(
                    factura?.venta?.cliente?.nombre || ''
                ).toLowerCase()

            const rtnCliente =
                String(
                    factura?.venta?.cliente?.rtn || ''
                ).toLowerCase()

            const numeroVenta =
                String(
                    factura?.venta?.numero || ''
                ).toLowerCase()

            return (
                numeroFactura.includes(texto) ||
                cai.includes(texto) ||
                rtn.includes(texto) ||
                cliente.includes(texto) ||
                rtnCliente.includes(texto) ||
                numeroVenta.includes(texto)
            )
        })
    }, [facturas, busqueda, estadoFiltro])

    const estadisticas = useMemo(() => {
        const emitidas = facturas.filter(
            (factura) => factura.estado === 'EMITIDA'
        )

        const anuladas = facturas.filter(
            (factura) => factura.estado === 'ANULADA'
        )

        const totalFacturado = emitidas.reduce(
            (total, factura) =>
                total + obtenerTotalFactura(factura),
            0
        )

        return {
            total: facturas.length,
            emitidas: emitidas.length,
            anuladas: anuladas.length,
            totalFacturado,
        }
    }, [facturas])

    const irADetalle = (id) => {
        navigate(`/facturas/${id}`)
    }

    const imprimirFactura = (id) => {
        navigate(`/facturas/${id}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Encabezado */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baby-primary text-baby-dark">
                                <Receipt size={23} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-baby-dark">
                                    Facturas
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Consulta y gestión de facturas emitidas
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={cargarFacturas}
                        disabled={cargando}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-baby-secondary px-4 py-2.5 text-sm font-semibold text-baby-dark transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={18}
                            className={cargando ? 'animate-spin' : ''}
                        />

                        Actualizar
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle
                            size={20}
                            className="mt-0.5 shrink-0"
                        />

                        <div>
                            <p className="font-semibold">
                                Ocurrió un error
                            </p>

                            <p className="mt-1 text-sm">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Estadísticas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total facturas
                                </p>

                                <p className="mt-1 text-2xl font-bold text-baby-dark">
                                    {estadisticas.total}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-baby-primary">
                                <Receipt
                                    size={21}
                                    className="text-baby-dark"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Emitidas
                                </p>

                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    {estadisticas.emitidas}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100">
                                <CheckCircle2
                                    size={21}
                                    className="text-green-600"
                                />
                            </div>
                        </div>
                    </div>

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

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-100">
                                <XCircle
                                    size={21}
                                    className="text-red-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total facturado
                                </p>

                                <p className="mt-1 text-xl font-bold text-baby-dark">
                                    {formatearMoneda(
                                        estadisticas.totalFacturado
                                    )}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-baby-secondary">
                                <FileText
                                    size={21}
                                    className="text-baby-dark"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Filtros */}
                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        {/* Buscar */}
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Buscar factura
                            </label>

                            <div className="relative">
                                <Search
                                    size={19}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) =>
                                        setBusqueda(e.target.value)
                                    }
                                    placeholder="Número de factura, CAI, cliente, RTN o venta..."
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/20"
                                />
                            </div>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Estado
                            </label>

                            <select
                                value={estadoFiltro}
                                onChange={(e) =>
                                    setEstadoFiltro(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/20"
                            >
                                <option value="TODAS">
                                    Todas
                                </option>

                                <option value="EMITIDA">
                                    Emitidas
                                </option>

                                <option value="ANULADA">
                                    Anuladas
                                </option>
                            </select>
                        </div>

                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                    <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="font-bold text-baby-dark">
                                Listado de facturas
                            </h2>

                            <p className="text-sm text-gray-500">
                                {facturasFiltradas.length}{' '}
                                resultado
                                {facturasFiltradas.length !== 1
                                    ? 's'
                                    : ''}
                            </p>
                        </div>
                    </div>

                    {cargando ? (
                        <div className="flex min-h-64 items-center justify-center">
                            <div className="flex items-center gap-3 text-gray-500">
                                <RefreshCw
                                    size={20}
                                    className="animate-spin"
                                />

                                <span>
                                    Cargando facturas...
                                </span>
                            </div>
                        </div>
                    ) : facturasFiltradas.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                <Receipt
                                    size={26}
                                    className="text-gray-400"
                                />
                            </div>

                            <h3 className="font-semibold text-gray-700">
                                No se encontraron facturas
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Intenta cambiar los filtros de búsqueda.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                                            Factura
                                        </th>

                                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                                            Cliente
                                        </th>

                                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                                            Venta
                                        </th>

                                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                                            Fecha
                                        </th>

                                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                                            Total
                                        </th>

                                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                                            Estado
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {facturasFiltradas.map((factura) => {
                                        const anulada =
                                            factura.estado === 'ANULADA'

                                        return (
                                            <tr
                                                key={factura.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                {/* Factura */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-baby-primary">
                                                            <Receipt
                                                                size={17}
                                                                className="text-baby-dark"
                                                            />
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-baby-dark">
                                                                {factura.numero_factura || '—'}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                CAI:{' '}
                                                                {factura.cai || '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Cliente */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <UserRound
                                                            size={16}
                                                            className="text-gray-400"
                                                        />

                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {obtenerNombreCliente(
                                                                    factura
                                                                )}
                                                            </p>

                                                            {factura?.venta?.cliente?.rtn && (
                                                                <p className="text-xs text-gray-500">
                                                                    RTN:{' '}
                                                                    {factura.venta.cliente.rtn}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Venta */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {factura?.venta?.numero || '—'}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {factura?.venta?.usuario?.nombre
                                                            ? `Usuario: ${factura.venta.usuario.nombre}`
                                                            : ''}
                                                    </p>
                                                </td>

                                                {/* Fecha */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <CalendarDays
                                                            size={16}
                                                            className="text-gray-400"
                                                        />

                                                        {formatearFechaHora(
                                                            factura.created_at
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Total */}
                                                <td className="px-5 py-4">
                                                    <p className="font-bold text-baby-dark">
                                                        {formatearMoneda(
                                                            obtenerTotalFactura(
                                                                factura
                                                            )
                                                        )}
                                                    </p>
                                                </td>

                                                {/* Estado */}
                                                <td className="px-5 py-4">
                                                    {anulada ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                            <XCircle size={14} />
                                                            Anulada
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                                            <CheckCircle2 size={14} />
                                                            Emitida
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Acciones */}
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                irADetalle(
                                                                    factura.id
                                                                )
                                                            }
                                                            title="Ver factura"
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-baby-primary hover:bg-baby-primary/20 hover:text-baby-dark"
                                                        >
                                                            <Eye size={17} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                imprimirFactura(
                                                                    factura.id
                                                                )
                                                            }
                                                            title="Ver para imprimir"
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-baby-secondary hover:bg-baby-secondary/30 hover:text-baby-dark"
                                                        >
                                                            <Printer size={17} />
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Información fiscal */}
                <div className="rounded-xl border border-baby-primary/30 bg-baby-primary/10 p-4">
                    <div className="flex items-start gap-3">
                        <Building2
                            size={20}
                            className="mt-0.5 shrink-0 text-baby-dark"
                        />

                        <div>
                            <p className="font-semibold text-baby-dark">
                                Información fiscal
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                                Las facturas muestran el CAI, RTN del emisor,
                                número correlativo, fecha de emisión y demás
                                información fiscal configurada en el sistema.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Facturas