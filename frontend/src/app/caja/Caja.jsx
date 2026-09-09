import { useEffect, useState } from 'react'
import {
    Banknote,
    CircleDollarSign,
    Clock,
    History,
    LogIn,
    LogOut,
    ArrowDownCircle,
    ArrowUpCircle,
    RefreshCw,
    X,
    Wallet,
    AlertCircle,
    CheckCircle,
    Eye
} from 'lucide-react'

import {
    obtenerCajaActual,
    abrirCaja,
    registrarMovimiento,
    cerrarCaja,
    obtenerHistorialCajas,
    obtenerCajaPorId
} from '../../services/cajaService'


const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL'
    }).format(Number(valor || 0))
}


const formatoFecha = (fecha) => {
    if (!fecha) return '-'

    return new Date(fecha).toLocaleString('es-HN', {
        dateStyle: 'short',
        timeStyle: 'short'
    })
}


const Caja = () => {

    const [caja, setCaja] = useState(null)
    const [historial, setHistorial] = useState([])

    const [cargando, setCargando] = useState(true)
    const [cargandoHistorial, setCargandoHistorial] = useState(false)

    const [modalAbrir, setModalAbrir] = useState(false)
    const [modalMovimiento, setModalMovimiento] = useState(false)
    const [modalCerrar, setModalCerrar] = useState(false)
    const [modalDetalle, setModalDetalle] = useState(false)

    const [cajaSeleccionada, setCajaSeleccionada] = useState(null)

    const [montoInicial, setMontoInicial] = useState('')

    const [tipoMovimiento, setTipoMovimiento] = useState('INGRESO')
    const [montoMovimiento, setMontoMovimiento] = useState('')
    const [motivoMovimiento, setMotivoMovimiento] = useState('')

    const [montoFinal, setMontoFinal] = useState('')
    const [observaciones, setObservaciones] = useState('')

    const [mensaje, setMensaje] = useState('')
    const [error, setError] = useState('')

    const [procesando, setProcesando] = useState(false)


    // ==========================================
    // CARGAR CAJA ACTUAL
    // ==========================================

    const cargarCaja = async () => {
        try {

            setCargando(true)
            setError('')

            const data = await obtenerCajaActual()

            setCaja(data)

        } catch (err) {

            if (err.response?.status === 404) {
                setCaja(null)
            } else {
                console.error(err)

                setError(
                    err.response?.data?.message ||
                    'Error al obtener la caja actual'
                )
            }

        } finally {
            setCargando(false)
        }
    }


    // ==========================================
    // CARGAR HISTORIAL
    // ==========================================

    const cargarHistorial = async () => {

        try {

            setCargandoHistorial(true)

            const data = await obtenerHistorialCajas()

            setHistorial(data.cajas || [])

        } catch (err) {

            console.error(err)

            setError(
                err.response?.data?.message ||
                'Error al obtener el historial de cajas'
            )

        } finally {

            setCargandoHistorial(false)

        }
    }


    useEffect(() => {

        cargarCaja()
        cargarHistorial()

    }, [])


    // ==========================================
    // MENSAJES
    // ==========================================

    const mostrarMensaje = (texto) => {

        setMensaje(texto)

        setTimeout(() => {
            setMensaje('')
        }, 4000)

    }


    // ==========================================
    // ABRIR CAJA
    // ==========================================

    const manejarAbrirCaja = async (e) => {

        e.preventDefault()

        const monto = Number(montoInicial)

        if (isNaN(monto) || monto < 0) {

            setError('El monto inicial debe ser mayor o igual a 0')

            return
        }

        try {

            setProcesando(true)
            setError('')

            await abrirCaja(monto)

            mostrarMensaje('Caja abierta correctamente')

            setMontoInicial('')
            setModalAbrir(false)

            await cargarCaja()
            await cargarHistorial()

        } catch (err) {

            console.error(err)

            setError(
                err.response?.data?.message ||
                'Error al abrir la caja'
            )

        } finally {

            setProcesando(false)

        }
    }


    // ==========================================
    // REGISTRAR MOVIMIENTO
    // ==========================================

    const manejarMovimiento = async (e) => {

        e.preventDefault()

        const monto = Number(montoMovimiento)

        if (isNaN(monto) || monto <= 0) {

            setError('El monto debe ser mayor que 0')

            return
        }

        if (!motivoMovimiento.trim()) {

            setError('El motivo es obligatorio')

            return
        }

        try {

            setProcesando(true)
            setError('')

            await registrarMovimiento({
                tipo: tipoMovimiento,
                monto,
                motivo: motivoMovimiento
            })

            mostrarMensaje(
                tipoMovimiento === 'INGRESO'
                    ? 'Ingreso registrado correctamente'
                    : 'Egreso registrado correctamente'
            )

            setMontoMovimiento('')
            setMotivoMovimiento('')
            setTipoMovimiento('INGRESO')

            setModalMovimiento(false)

            await cargarCaja()
            await cargarHistorial()

        } catch (err) {

            console.error(err)

            setError(
                err.response?.data?.message ||
                'Error al registrar el movimiento'
            )

        } finally {

            setProcesando(false)

        }
    }


    // ==========================================
    // CERRAR CAJA
    // ==========================================

    const manejarCerrarCaja = async (e) => {

        e.preventDefault()

        const monto = Number(montoFinal)

        if (isNaN(monto) || monto < 0) {

            setError(
                'El monto final debe ser mayor o igual a 0'
            )

            return
        }

        try {

            setProcesando(true)
            setError('')

            await cerrarCaja({
                monto_final: monto,
                observaciones
            })

            mostrarMensaje('Caja cerrada correctamente')

            setMontoFinal('')
            setObservaciones('')
            setModalCerrar(false)

            await cargarCaja()
            await cargarHistorial()

        } catch (err) {

            console.error(err)

            setError(
                err.response?.data?.message ||
                'Error al cerrar la caja'
            )

        } finally {

            setProcesando(false)

        }
    }


    // ==========================================
    // VER DETALLE DE CAJA
    // ==========================================

    const verDetalleCaja = async (id) => {

        try {

            setError('')

            const data = await obtenerCajaPorId(id)

            setCajaSeleccionada(data)

            setModalDetalle(true)

        } catch (err) {

            console.error(err)

            setError(
                err.response?.data?.message ||
                'Error al obtener el detalle de la caja'
            )

        }
    }


    // ==========================================
    // CALCULOS
    // ==========================================

    const efectivoActual = Number(
        caja?.monto_esperado || 0
    )

    const ingresos = Number(
        caja?.ingresos || 0
    )

    const egresos = Number(
        caja?.egresos || 0
    )

    const montoInicialActual = Number(
        caja?.monto_inicial || 0
    )

    const movimientos = caja?.movimientos || []


    // ==========================================
    // LOADING
    // ==========================================

    if (cargando) {

        return (
            <div className="flex items-center justify-center min-h-[500px]">

                <div className="flex items-center gap-3 text-baby-dark">

                    <RefreshCw
                        size={24}
                        className="animate-spin"
                    />

                    <span>
                        Cargando información de caja...
                    </span>

                </div>

            </div>
        )
    }


    return (

        <div className="space-y-6">


            {/* =====================================
                ENCABEZADO
            ===================================== */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-baby-dark">
                        Caja
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Administración de apertura, movimientos y cierre de caja.
                    </p>

                </div>


                <div className="flex flex-wrap gap-3">

                    {!caja && (

                        <button
                            onClick={() => {
                                setError('')
                                setModalAbrir(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-baby-primary text-white rounded-lg hover:opacity-90 transition"
                        >

                            <LogIn size={18} />

                            Abrir caja

                        </button>

                    )}


                    {caja && (

                        <>

                            <button
                                onClick={() => {
                                    setError('')
                                    setModalMovimiento(true)
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-baby-secondary text-baby-dark rounded-lg hover:opacity-90 transition"
                            >

                                <CircleDollarSign size={18} />

                                Movimiento

                            </button>


                            <button
                                onClick={() => {
                                    setError('')
                                    setModalCerrar(true)
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >

                                <LogOut size={18} />

                                Cerrar caja

                            </button>

                        </>

                    )}

                </div>

            </div>


            {/* =====================================
                MENSAJES
            ===================================== */}

            {mensaje && (

                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">

                    <CheckCircle size={20} />

                    <span>
                        {mensaje}
                    </span>

                </div>

            )}


            {error && (

                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">

                    <AlertCircle size={20} />

                    <span className="flex-1">
                        {error}
                    </span>

                    <button
                        onClick={() => setError('')}
                        className="hover:text-red-900"
                    >
                        <X size={18} />
                    </button>

                </div>

            )}


            {/* =====================================
                ESTADO DE CAJA
            ===================================== */}

            {!caja ? (

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">

                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">

                        <Wallet
                            size={32}
                            className="text-gray-400"
                        />

                    </div>

                    <h2 className="text-xl font-semibold text-baby-dark">

                        No tienes una caja abierta

                    </h2>

                    <p className="text-gray-500 mt-2 mb-6">

                        Debes abrir una caja antes de registrar ventas en efectivo o movimientos.

                    </p>

                    <button
                        onClick={() => {
                            setError('')
                            setModalAbrir(true)
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-baby-primary text-white rounded-lg hover:opacity-90 transition"
                    >

                        <LogIn size={18} />

                        Abrir caja

                    </button>

                </div>

            ) : (

                <>

                    {/* =================================
                        INFORMACION PRINCIPAL
                    ================================= */}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                            <div>

                                <div className="flex items-center gap-2 mb-2">

                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>

                                    <span className="font-semibold text-green-600">
                                        Caja abierta
                                    </span>

                                </div>

                                <p className="text-sm text-gray-500">
                                    Apertura: {formatoFecha(caja.fecha_apertura)}
                                </p>

                            </div>


                            <div className="text-left md:text-right">

                                <p className="text-sm text-gray-500">
                                    Efectivo esperado
                                </p>

                                <p className="text-3xl font-bold text-baby-dark">
                                    {formatoMoneda(efectivoActual)}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =================================
                        TARJETAS RESUMEN
                    ================================= */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


                        {/* MONTO INICIAL */}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-gray-500">
                                        Monto inicial
                                    </p>

                                    <p className="text-2xl font-bold text-baby-dark mt-1">
                                        {formatoMoneda(montoInicialActual)}
                                    </p>

                                </div>

                                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">

                                    <Banknote
                                        size={23}
                                        className="text-blue-500"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* INGRESOS */}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-gray-500">
                                        Ingresos
                                    </p>

                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        {formatoMoneda(ingresos)}
                                    </p>

                                </div>

                                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">

                                    <ArrowUpCircle
                                        size={23}
                                        className="text-green-500"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* EGRESOS */}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-gray-500">
                                        Egresos
                                    </p>

                                    <p className="text-2xl font-bold text-red-600 mt-1">
                                        {formatoMoneda(egresos)}
                                    </p>

                                </div>

                                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">

                                    <ArrowDownCircle
                                        size={23}
                                        className="text-red-500"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* EFECTIVO */}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-gray-500">
                                        Efectivo esperado
                                    </p>

                                    <p className="text-2xl font-bold text-baby-primary mt-1">
                                        {formatoMoneda(efectivoActual)}
                                    </p>

                                </div>

                                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">

                                    <Wallet
                                        size={23}
                                        className="text-purple-500"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================
                        MOVIMIENTOS
                    ================================= */}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        <div className="p-6 border-b border-gray-100">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold text-baby-dark">
                                        Movimientos de la caja
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Movimientos registrados en la caja actual.
                                    </p>

                                </div>

                                <button
                                    onClick={cargarCaja}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                    title="Actualizar"
                                >

                                    <RefreshCw size={18} />

                                </button>

                            </div>

                        </div>


                        {movimientos.length === 0 ? (

                            <div className="p-10 text-center text-gray-500">

                                <CircleDollarSign
                                    size={36}
                                    className="mx-auto mb-3 text-gray-300"
                                />

                                <p>
                                    No hay movimientos registrados.
                                </p>

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead className="bg-gray-50">

                                        <tr>

                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Fecha
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Tipo
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Motivo
                                            </th>

                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                                Monto
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-gray-100">

                                        {movimientos.map((movimiento) => (

                                            <tr
                                                key={movimiento.id}
                                                className="hover:bg-gray-50"
                                            >

                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatoFecha(
                                                        movimiento.created_at
                                                    )}
                                                </td>


                                                <td className="px-6 py-4">

                                                    {movimiento.tipo === 'INGRESO' ? (

                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">

                                                            <ArrowUpCircle size={14} />

                                                            Ingreso

                                                        </span>

                                                    ) : (

                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">

                                                            <ArrowDownCircle size={14} />

                                                            Egreso

                                                        </span>

                                                    )}

                                                </td>


                                                <td className="px-6 py-4 text-sm text-gray-700">

                                                    <div>
                                                        <p>{movimiento.motivo}</p>
                                                        {Number(movimiento.descuento_productos || 0) > 0 && (
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Descuento aplicado: {formatoMoneda(movimiento.descuento_productos)}
                                                            </p>
                                                        )}
                                                    </div>

                                                </td>


                                                <td
                                                    className={`px-6 py-4 text-sm font-semibold text-right ${
                                                        movimiento.tipo === 'INGRESO'
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >

                                                    {movimiento.tipo === 'INGRESO'
                                                        ? '+'
                                                        : '-'
                                                    }

                                                    {formatoMoneda(
                                                        movimiento.monto
                                                    )}

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </>

            )}


            {/* =====================================
                HISTORIAL DE CAJAS
            ===================================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                <div className="p-6 border-b border-gray-100">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-baby-secondary flex items-center justify-center">

                            <History
                                size={20}
                                className="text-baby-dark"
                            />

                        </div>

                        <div>

                            <h2 className="text-lg font-semibold text-baby-dark">
                                Historial de cajas
                            </h2>

                            <p className="text-sm text-gray-500">
                                Consulta las cajas abiertas y cerradas anteriormente.
                            </p>

                        </div>

                    </div>

                </div>


                {cargandoHistorial ? (

                    <div className="p-8 text-center">

                        <RefreshCw
                            size={24}
                            className="mx-auto animate-spin text-gray-400"
                        />

                    </div>

                ) : historial.length === 0 ? (

                    <div className="p-8 text-center text-gray-500">

                        No existen registros de cajas.

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Apertura
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Cierre
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                        Inicial
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                        Esperado
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                                        Final
                                    </th>

                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                                        Estado
                                    </th>

                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                                        Acción
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-100">

                                {historial.map((item) => (

                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatoFecha(item.fecha_apertura)}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatoFecha(item.fecha_cierre)}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-right font-medium">
                                            {formatoMoneda(item.monto_inicial)}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-right font-medium">
                                            {formatoMoneda(item.monto_esperado)}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-right font-medium">
                                            {formatoMoneda(item.monto_final)}
                                        </td>


                                        <td className="px-6 py-4 text-center">

                                            {item.estado === 'ABIERTA' ? (

                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">

                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>

                                                    Abierta

                                                </span>

                                            ) : (

                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">

                                                    <Clock size={13} />

                                                    Cerrada

                                                </span>

                                            )}

                                        </td>


                                        <td className="px-6 py-4 text-center">

                                            <button
                                                onClick={() =>
                                                    verDetalleCaja(item.id)
                                                }
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-baby-primary hover:bg-baby-secondary transition"
                                            >

                                                <Eye size={16} />

                                                Ver

                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================
                MODAL ABRIR CAJA
            ===================================== */}

            {modalAbrir && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">

                        <div className="flex items-center justify-between p-6 border-b">

                            <div>

                                <h2 className="text-lg font-semibold text-baby-dark">
                                    Abrir caja
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Ingresa el efectivo inicial.
                                </p>

                            </div>

                            <button
                                onClick={() => setModalAbrir(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <form
                            onSubmit={manejarAbrirCaja}
                            className="p-6 space-y-5"
                        >

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monto inicial
                                </label>

                                <div className="relative">

                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        L
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={montoInicial}
                                        onChange={(e) =>
                                            setMontoInicial(e.target.value)
                                        }
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-baby-primary"
                                        autoFocus
                                    />

                                </div>

                            </div>


                            <div className="flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() => setModalAbrir(false)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={procesando}
                                    className="px-5 py-2.5 bg-baby-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                                >

                                    {procesando
                                        ? 'Abriendo...'
                                        : 'Abrir caja'
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================
                MODAL MOVIMIENTO
            ===================================== */}

            {modalMovimiento && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">

                        <div className="flex items-center justify-between p-6 border-b">

                            <div>

                                <h2 className="text-lg font-semibold text-baby-dark">
                                    Registrar movimiento
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Registra un ingreso o egreso manual.
                                </p>

                            </div>

                            <button
                                onClick={() => setModalMovimiento(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <form
                            onSubmit={manejarMovimiento}
                            className="p-6 space-y-5"
                        >

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de movimiento
                                </label>

                                <div className="grid grid-cols-2 gap-3">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTipoMovimiento('INGRESO')
                                        }
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition ${
                                            tipoMovimiento === 'INGRESO'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-300 text-gray-600'
                                        }`}
                                    >

                                        <ArrowUpCircle size={18} />

                                        Ingreso

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTipoMovimiento('EGRESO')
                                        }
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition ${
                                            tipoMovimiento === 'EGRESO'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-300 text-gray-600'
                                        }`}
                                    >

                                        <ArrowDownCircle size={18} />

                                        Egreso

                                    </button>

                                </div>

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monto
                                </label>

                                <div className="relative">

                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        L
                                    </span>

                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={montoMovimiento}
                                        onChange={(e) =>
                                            setMontoMovimiento(
                                                e.target.value
                                            )
                                        }
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-baby-primary"
                                    />

                                </div>

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo
                                </label>

                                <textarea
                                    value={motivoMovimiento}
                                    onChange={(e) =>
                                        setMotivoMovimiento(
                                            e.target.value
                                        )
                                    }
                                    rows="3"
                                    placeholder="Ej. Compra de materiales..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-baby-primary resize-none"
                                />

                            </div>


                            <div className="flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setModalMovimiento(false)
                                    }
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={procesando}
                                    className={`px-5 py-2.5 text-white rounded-lg disabled:opacity-50 ${
                                        tipoMovimiento === 'INGRESO'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >

                                    {procesando
                                        ? 'Guardando...'
                                        : 'Registrar movimiento'
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================
                MODAL CERRAR CAJA
            ===================================== */}

            {modalCerrar && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">

                        <div className="flex items-center justify-between p-6 border-b">

                            <div>

                                <h2 className="text-lg font-semibold text-baby-dark">
                                    Cerrar caja
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Registra el efectivo contado físicamente.
                                </p>

                            </div>

                            <button
                                onClick={() => setModalCerrar(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <form
                            onSubmit={manejarCerrarCaja}
                            className="p-6 space-y-5"
                        >

                            <div className="p-4 bg-gray-50 rounded-xl">

                                <div className="flex justify-between text-sm">

                                    <span className="text-gray-500">
                                        Efectivo esperado
                                    </span>

                                    <span className="font-semibold text-baby-dark">
                                        {formatoMoneda(efectivoActual)}
                                    </span>

                                </div>

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Efectivo contado
                                </label>

                                <div className="relative">

                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        L
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={montoFinal}
                                        onChange={(e) =>
                                            setMontoFinal(e.target.value)
                                        }
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-baby-primary"
                                        autoFocus
                                    />

                                </div>

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observaciones
                                </label>

                                <textarea
                                    value={observaciones}
                                    onChange={(e) =>
                                        setObservaciones(
                                            e.target.value
                                        )
                                    }
                                    rows="3"
                                    placeholder="Observaciones del cierre..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-baby-primary resize-none"
                                />

                            </div>


                            <div className="flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setModalCerrar(false)
                                    }
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={procesando}
                                    className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                >

                                    {procesando
                                        ? 'Cerrando...'
                                        : 'Cerrar caja'
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================
                MODAL DETALLE
            ===================================== */}

            {modalDetalle && cajaSeleccionada && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

                        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">

                            <div>

                                <h2 className="text-lg font-semibold text-baby-dark">
                                    Detalle de caja #{cajaSeleccionada.id}
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Información completa de la caja.
                                </p>

                            </div>

                            <button
                                onClick={() => {
                                    setModalDetalle(false)
                                    setCajaSeleccionada(null)
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <div className="p-6 space-y-6">


                            {/* RESUMEN */}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                                <div className="p-4 bg-gray-50 rounded-xl">

                                    <p className="text-xs text-gray-500">
                                        Monto inicial
                                    </p>

                                    <p className="text-lg font-bold text-baby-dark mt-1">
                                        {formatoMoneda(
                                            cajaSeleccionada.monto_inicial
                                        )}
                                    </p>

                                </div>


                                <div className="p-4 bg-green-50 rounded-xl">

                                    <p className="text-xs text-green-600">
                                        Ingresos
                                    </p>

                                    <p className="text-lg font-bold text-green-700 mt-1">
                                        {formatoMoneda(
                                            cajaSeleccionada.ingresos
                                        )}
                                    </p>

                                </div>


                                <div className="p-4 bg-red-50 rounded-xl">

                                    <p className="text-xs text-red-600">
                                        Egresos
                                    </p>

                                    <p className="text-lg font-bold text-red-700 mt-1">
                                        {formatoMoneda(
                                            cajaSeleccionada.egresos
                                        )}
                                    </p>

                                </div>


                                <div className="p-4 bg-blue-50 rounded-xl">

                                    <p className="text-xs text-blue-600">
                                        Diferencia
                                    </p>

                                    <p className="text-lg font-bold text-blue-700 mt-1">
                                        {formatoMoneda(
                                            cajaSeleccionada.diferencia
                                        )}
                                    </p>

                                </div>

                            </div>


                            {/* INFORMACION */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>

                                    <p className="text-sm text-gray-500">
                                        Fecha de apertura
                                    </p>

                                    <p className="font-medium text-baby-dark mt-1">
                                        {formatoFecha(
                                            cajaSeleccionada.fecha_apertura
                                        )}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm text-gray-500">
                                        Fecha de cierre
                                    </p>

                                    <p className="font-medium text-baby-dark mt-1">
                                        {formatoFecha(
                                            cajaSeleccionada.fecha_cierre
                                        )}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm text-gray-500">
                                        Efectivo esperado
                                    </p>

                                    <p className="font-medium text-baby-dark mt-1">
                                        {formatoMoneda(
                                            cajaSeleccionada.monto_esperado
                                        )}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm text-gray-500">
                                        Efectivo final
                                    </p>

                                    <p className="font-medium text-baby-dark mt-1">
                                        {formatoMoneda(
                                            cajaSeleccionada.monto_final
                                        )}
                                    </p>

                                </div>

                            </div>


                            {/* OBSERVACIONES */}

                            {cajaSeleccionada.observaciones && (

                                <div className="p-4 bg-gray-50 rounded-xl">

                                    <p className="text-sm font-medium text-gray-700">
                                        Observaciones
                                    </p>

                                    <p className="text-sm text-gray-600 mt-1">
                                        {cajaSeleccionada.observaciones}
                                    </p>

                                </div>

                            )}


                            {/* MOVIMIENTOS */}

                            <div>

                                <h3 className="font-semibold text-baby-dark mb-3">
                                    Movimientos
                                </h3>


                                {(!cajaSeleccionada.movimientos ||
                                    cajaSeleccionada.movimientos.length === 0) ? (

                                    <p className="text-sm text-gray-500">
                                        No hay movimientos registrados.
                                    </p>

                                ) : (

                                    <div className="overflow-x-auto border rounded-xl">

                                        <table className="w-full">

                                            <thead className="bg-gray-50">

                                                <tr>

                                                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">
                                                        Fecha
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">
                                                        Tipo
                                                    </th>

                                                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">
                                                        Motivo
                                                    </th>

                                                    <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">
                                                        Monto
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody className="divide-y divide-gray-100">

                                                {cajaSeleccionada.movimientos.map(
                                                    (movimiento) => (

                                                        <tr key={movimiento.id}>

                                                            <td className="px-4 py-3 text-sm">
                                                                {formatoFecha(
                                                                    movimiento.created_at
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-3 text-sm">

                                                                {movimiento.tipo}

                                                            </td>

                                                            <td className="px-4 py-3 text-sm">
                                                                <div>
                                                                    <p>{movimiento.motivo}</p>
                                                                    {Number(movimiento.descuento_productos || 0) > 0 && (
                                                                        <p className="mt-1 text-xs text-gray-500">
                                                                            Descuento aplicado: {formatoMoneda(movimiento.descuento_productos)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 text-sm text-right font-medium">
                                                                {formatoMoneda(
                                                                    movimiento.monto
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

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}


export default Caja