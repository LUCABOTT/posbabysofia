import { useEffect, useState } from 'react'
import {
    AlertCircle,
    Building2,
    CalendarDays,
    CheckCircle2,
    FileCheck2,
    Hash,
    Loader2,
    Pencil,
    Phone,
    RefreshCw,
    Save,
    X,
    MapPin,
    CreditCard,
    ArrowRight,
} from 'lucide-react'

import {
    obtenerConfiguracionFiscal,
    crearConfiguracionFiscal,
    actualizarConfiguracionFiscal,
} from '../../services/configuracionFiscalService'

// ==============================
// FORMATO DE FECHA
// ==============================

const formatearFecha = (fecha) => {
    if (!fecha) return '-'

    const fechaObj = new Date(`${fecha}T00:00:00`)

    if (Number.isNaN(fechaObj.getTime())) {
        return '-'
    }

    return new Intl.DateTimeFormat('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(fechaObj)
}

// ==============================
// COMPONENTE
// ==============================

export default function ConfiguracionFiscal() {

    // ==============================
    // ESTADOS
    // ==============================

    const [configuracion, setConfiguracion] = useState(null)

    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)

    const [modalAbierto, setModalAbierto] = useState(false)

    const [mensaje, setMensaje] = useState('')
    const [error, setError] = useState('')

    const [formulario, setFormulario] = useState({
        cai: '',
        rtn: '',
        razon_social: '',
        nombre_comercial: '',
        direccion: '',
        telefono: '',
        fecha_limite_emision: '',
        prefijo_factura: '',
        rango_inicial: '',
        rango_final: '',
        siguiente_numero: '',
        activo: true,
    })

    // ==============================
    // CARGAR CONFIGURACION
    // ==============================

    const cargarConfiguracion = async () => {

        try {

            setLoading(true)
            setError('')

            const data =
                await obtenerConfiguracionFiscal()

            setConfiguracion(data)

        } catch (err) {

            console.error(
                'Error al obtener configuración fiscal:',
                err
            )

            if (err.response?.status === 404) {

                setConfiguracion(null)

            } else {

                setError(
                    err.response?.data?.message ||
                    'No se pudo obtener la configuración fiscal.'
                )
            }

        } finally {

            setLoading(false)

        }
    }

    // ==============================
    // CARGA INICIAL
    // ==============================

    useEffect(() => {

        cargarConfiguracion()

    }, [])

    // ==============================
    // ABRIR MODAL
    // ==============================

    const abrirModal = () => {

        setMensaje('')
        setError('')

        if (configuracion) {

            setFormulario({
                cai: configuracion.cai || '',
                rtn: configuracion.rtn || '',
                razon_social:
                    configuracion.razon_social || '',
                nombre_comercial:
                    configuracion.nombre_comercial || '',
                direccion:
                    configuracion.direccion || '',
                telefono:
                    configuracion.telefono || '',
                fecha_limite_emision:
                    configuracion.fecha_limite_emision || '',
                prefijo_factura:
                    configuracion.prefijo_factura || '',
                rango_inicial:
                    configuracion.rango_inicial ?? '',
                rango_final:
                    configuracion.rango_final ?? '',
                siguiente_numero:
                    configuracion.siguiente_numero ?? '',
                activo:
                    configuracion.activo ?? true,
            })

        } else {

            setFormulario({
                cai: '',
                rtn: '',
                razon_social: '',
                nombre_comercial: '',
                direccion: '',
                telefono: '',
                fecha_limite_emision: '',
                prefijo_factura: '',
                rango_inicial: '',
                rango_final: '',
                siguiente_numero: '',
                activo: true,
            })

        }

        setModalAbierto(true)
    }

    // ==============================
    // CERRAR MODAL
    // ==============================

    const cerrarModal = () => {

        if (guardando) return

        setModalAbierto(false)

        setError('')
    }

    // ==============================
    // CAMBIAR FORMULARIO
    // ==============================

    const manejarCambio = (e) => {

        const { name, value, type, checked } = e.target

        setFormulario((prev) => ({
            ...prev,
            [name]:
                type === 'checkbox'
                    ? checked
                    : value,
        }))
    }

    // ==============================
    // FORMATEAR PREFIJO
    // ==============================

    const manejarPrefijo = (e) => {

        let valor = e.target.value

        valor = valor.replace(/\D/g, '')

        if (valor.length > 8) {
            valor = valor.substring(0, 8)
        }

        let resultado = valor

        if (valor.length > 3) {

            resultado =
                valor.substring(0, 3) +
                '-' +
                valor.substring(3)

        }

        if (valor.length > 6) {

            resultado =
                valor.substring(0, 3) +
                '-' +
                valor.substring(3, 6) +
                '-' +
                valor.substring(6)

        }

        setFormulario((prev) => ({
            ...prev,
            prefijo_factura: resultado,
        }))
    }

    // ==============================
    // VALIDAR FORMULARIO
    // ==============================

    const validarFormulario = () => {

        if (!formulario.cai.trim()) {
            return 'El CAI es obligatorio.'
        }

        if (!formulario.rtn.trim()) {
            return 'El RTN es obligatorio.'
        }

        if (!formulario.razon_social.trim()) {
            return 'La razón social es obligatoria.'
        }

        if (!formulario.fecha_limite_emision) {
            return 'La fecha límite de emisión es obligatoria.'
        }

        if (!formulario.prefijo_factura.trim()) {
            return 'El prefijo de factura es obligatorio.'
        }

        const formatoPrefijo =
            /^\d{3}-\d{3}-\d{2}$/

        if (
            !formatoPrefijo.test(
                formulario.prefijo_factura.trim()
            )
        ) {

            return (
                'El prefijo debe tener el formato 000-001-01.'
            )
        }

        if (
            formulario.rango_inicial === '' ||
            formulario.rango_final === ''
        ) {

            return (
                'El rango inicial y final son obligatorios.'
            )
        }

        const inicio =
            Number(formulario.rango_inicial)

        const fin =
            Number(formulario.rango_final)

        if (
            !Number.isInteger(inicio) ||
            !Number.isInteger(fin)
        ) {

            return (
                'Los rangos deben ser números enteros.'
            )
        }

        if (inicio <= 0 || fin <= 0) {

            return (
                'Los rangos deben ser mayores que 0.'
            )
        }

        if (inicio > fin) {

            return (
                'El rango inicial no puede ser mayor que el rango final.'
            )
        }

        const siguiente =
            formulario.siguiente_numero === ''
                ? inicio
                : Number(formulario.siguiente_numero)

        if (!Number.isInteger(siguiente)) {

            return (
                'El siguiente número debe ser un entero.'
            )
        }

        if (
            siguiente < inicio ||
            siguiente > fin
        ) {

            return (
                'El siguiente número debe estar dentro del rango autorizado.'
            )
        }

        return null
    }

    // ==============================
    // GUARDAR
    // ==============================

    const guardarConfiguracion = async (e) => {

        e.preventDefault()

        setError('')
        setMensaje('')

        const errorValidacion =
            validarFormulario()

        if (errorValidacion) {

            setError(errorValidacion)

            return
        }

        try {

            setGuardando(true)

            const datosConfiguracion = {

                    cai:
                        formulario.cai.trim(),

                    rtn:
                        formulario.rtn.trim(),

                    razon_social:
                        formulario.razon_social.trim(),

                    nombre_comercial:
                        formulario.nombre_comercial.trim() ||
                        null,

                    direccion:
                        formulario.direccion.trim() ||
                        null,

                    telefono:
                        formulario.telefono.trim() ||
                        null,

                    fecha_limite_emision:
                        formulario.fecha_limite_emision,

                    prefijo_factura:
                        formulario.prefijo_factura.trim(),

                    rango_inicial:
                        Number(
                            formulario.rango_inicial
                        ),

                    rango_final:
                        Number(
                            formulario.rango_final
                        ),

                    siguiente_numero:
                        formulario.siguiente_numero === ''
                            ? Number(
                                formulario.rango_inicial
                            )
                            : Number(
                                formulario.siguiente_numero
                            ),

                    activo:
                        formulario.activo,
                }

            const response = configuracion
                ? await actualizarConfiguracionFiscal(
                    configuracion.id,
                    datosConfiguracion
                )
                : await crearConfiguracionFiscal(datosConfiguracion)

            setMensaje(
                response?.message ||
                configuracion
                    ? 'Configuración fiscal actualizada correctamente.'
                    : 'Configuración fiscal creada correctamente.'
            )

            setModalAbierto(false)

            await cargarConfiguracion()

        } catch (err) {

            console.error(
                'Error al guardar configuración fiscal:',
                err
            )

            setError(
                err.response?.data?.message ||
                'No se pudo guardar la configuración fiscal.'
            )

        } finally {

            setGuardando(false)

        }
    }

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
                        Configuración fiscal
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Configura los datos fiscales y el rango autorizado para la emisión de facturas.
                    </p>

                </div>

                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={cargarConfiguracion}
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
                        onClick={abrirModal}
                        className="inline-flex items-center gap-2 rounded-lg bg-baby-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                    >

                        {configuracion ? (
                            <Pencil size={17} />
                        ) : (
                            <PlusIcon />
                        )}

                        {configuracion
                            ? 'Editar configuración'
                            : 'Crear configuración'}

                    </button>

                </div>

            </div>

            {/* ==============================
                MENSAJE
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
                CONFIGURACION
            ============================== */}

            {!configuracion ? (

                <div className="rounded-2xl bg-white p-8 shadow-sm">

                    <div className="mx-auto flex max-w-lg flex-col items-center text-center">

                        <div className="mb-5 rounded-full bg-baby-secondary p-5">

                            <FileCheck2
                                size={38}
                                className="text-baby-primary"
                            />

                        </div>

                        <h2 className="text-xl font-bold text-baby-dark">
                            No hay configuración fiscal
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Todavía no has registrado una configuración fiscal.
                            Debes configurarla antes de comenzar a emitir facturas.
                        </p>

                        <button
                            type="button"
                            onClick={abrirModal}
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-baby-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >

                            <PlusIcon />

                            Crear configuración fiscal

                        </button>

                    </div>

                </div>

            ) : (

                <div className="space-y-6">

                    {/* ==============================
                        ESTADO
                    ============================== */}

                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                        <div className="flex items-start gap-3">

                            <div className="rounded-lg bg-green-100 p-2">

                                <CheckCircle2
                                    size={20}
                                    className="text-green-600"
                                />

                            </div>

                            <div>

                                <p className="font-semibold text-green-800">
                                    Configuración fiscal activa
                                </p>

                                <p className="mt-1 text-sm text-green-700">
                                    Esta configuración será utilizada para la emisión de facturas.
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* ==============================
                        DATOS DE EMPRESA
                    ============================== */}

                    <div className="rounded-xl bg-white shadow-sm">

                        <div className="border-b border-gray-100 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="rounded-lg bg-baby-secondary p-2.5">

                                    <Building2
                                        size={21}
                                        className="text-baby-primary"
                                    />

                                </div>

                                <div>

                                    <h2 className="font-semibold text-baby-dark">
                                        Datos fiscales
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Información registrada de la empresa.
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                            <Dato
                                icon={CreditCard}
                                titulo="CAI"
                                valor={configuracion.cai}
                            />

                            <Dato
                                icon={Hash}
                                titulo="RTN"
                                valor={configuracion.rtn}
                            />

                            <Dato
                                icon={Building2}
                                titulo="Razón social"
                                valor={
                                    configuracion.razon_social
                                }
                            />

                            <Dato
                                icon={Building2}
                                titulo="Nombre comercial"
                                valor={
                                    configuracion.nombre_comercial ||
                                    '-'
                                }
                            />

                            <Dato
                                icon={MapPin}
                                titulo="Dirección"
                                valor={
                                    configuracion.direccion ||
                                    '-'
                                }
                            />

                            <Dato
                                icon={Phone}
                                titulo="Teléfono"
                                valor={
                                    configuracion.telefono ||
                                    '-'
                                }

                            />

                        </div>

                    </div>

                    {/* ==============================
                        RANGO AUTORIZADO
                    ============================== */}

                    <div className="rounded-xl bg-white shadow-sm">

                        <div className="border-b border-gray-100 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="rounded-lg bg-blue-50 p-2.5">

                                    <FileCheck2
                                        size={21}
                                        className="text-blue-600"
                                    />

                                </div>

                                <div>

                                    <h2 className="font-semibold text-baby-dark">
                                        Rango autorizado
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Información utilizada para generar los números de factura.
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 xl:grid-cols-4">

                            <Dato
                                icon={Hash}
                                titulo="Prefijo de factura"
                                valor={
                                    configuracion.prefijo_factura
                                }
                            />

                            <Dato
                                icon={CalendarDays}
                                titulo="Fecha límite de emisión"
                                valor={formatearFecha(
                                    configuracion.fecha_limite_emision
                                )}
                            />

                            <Dato
                                icon={ArrowRight}
                                titulo="Rango autorizado"
                                valor={`${configuracion.rango_inicial} — ${configuracion.rango_final}`}
                            />

                            <Dato
                                icon={Hash}
                                titulo="Siguiente número"
                                valor={
                                    configuracion.siguiente_numero
                                }
                            />

                        </div>

                    </div>

                    {/* ==============================
                        VISTA DE FACTURA
                    ============================== */}

                    <div className="rounded-xl bg-white shadow-sm">

                        <div className="border-b border-gray-100 px-6 py-5">

                            <h2 className="font-semibold text-baby-dark">
                                Próximo número de factura
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Número que utilizará el sistema para la próxima factura.
                            </p>

                        </div>

                        <div className="p-6">

                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">

                                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                    Próxima factura
                                </p>

                                <p className="mt-3 text-3xl font-bold tracking-wider text-baby-dark">

                                    {configuracion.prefijo_factura}
                                    -
                                    {String(
                                        configuracion.siguiente_numero
                                    ).padStart(8, '0')}

                                </p>

                                <p className="mt-3 text-sm text-gray-500">

                                    Rango disponible:{' '}

                                    <span className="font-medium text-gray-700">

                                        {configuracion.rango_inicial}

                                        {' — '}

                                        {configuracion.rango_final}

                                    </span>

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {/* ==============================
                MODAL
            ============================== */}

            {modalAbierto && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

                        {/* HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">

                            <div>

                                <h2 className="font-semibold text-baby-dark">
                                    {configuracion
                                        ? 'Editar configuración fiscal'
                                        : 'Crear configuración fiscal'}
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Completa los datos fiscales y el rango autorizado.
                                </p>

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
                            onSubmit={
                                guardarConfiguracion
                            }
                            className="space-y-6 p-6"
                        >

                            {/* ==============================
                                DATOS FISCALES
                            ============================== */}

                            <div>

                                <div className="mb-4">

                                    <h3 className="font-semibold text-baby-dark">
                                        Datos fiscales
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Información oficial de la empresa.
                                    </p>

                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    {/* CAI */}

                                    <Campo
                                        label="CAI"
                                        name="cai"
                                        value={
                                            formulario.cai
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        placeholder="Ingrese el CAI"
                                        required
                                        disabled={
                                            guardando
                                        }
                                    />

                                    {/* RTN */}

                                    <Campo
                                        label="RTN"
                                        name="rtn"
                                        value={
                                            formulario.rtn
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        placeholder="Ingrese el RTN"
                                        required
                                        disabled={
                                            guardando
                                        }
                                    />

                                    {/* RAZON SOCIAL */}

                                    <Campo
                                        label="Razón social"
                                        name="razon_social"
                                        value={
                                            formulario.razon_social
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        placeholder="Razón social"
                                        required
                                        disabled={
                                            guardando
                                        }
                                    />

                                    {/* NOMBRE COMERCIAL */}

                                    <Campo
                                        label="Nombre comercial"
                                        name="nombre_comercial"
                                        value={
                                            formulario.nombre_comercial
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        placeholder="Nombre comercial"
                                        disabled={
                                            guardando
                                        }
                                    />

                                    {/* TELEFONO */}

                                    <Campo
                                        label="Teléfono"
                                        name="telefono"
                                        value={
                                            formulario.telefono
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        placeholder="Número de teléfono"
                                        disabled={
                                            guardando
                                        }
                                    />

                                    {/* FECHA */}

                                    <Campo
                                        label="Fecha límite de emisión"
                                        name="fecha_limite_emision"
                                        type="date"
                                        value={
                                            formulario.fecha_limite_emision
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        required
                                        disabled={
                                            guardando
                                        }
                                    />

                                    {/* DIRECCION */}

                                    <div className="md:col-span-2">

                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Dirección
                                        </label>

                                        <textarea
                                            name="direccion"
                                            value={
                                                formulario.direccion
                                            }
                                            onChange={
                                                manejarCambio
                                            }
                                            rows={3}
                                            disabled={
                                                guardando
                                            }
                                            placeholder="Dirección de la empresa"
                                            className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10 disabled:bg-gray-50"
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* ==============================
                                RANGO
                            ============================== */}

                            <div>

                                <div className="mb-4">

                                    <h3 className="font-semibold text-baby-dark">
                                        Rango autorizado
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Configuración del correlativo de facturación.
                                    </p>

                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    {/* PREFIJO */}

                                    <div>

                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">

                                            Prefijo de factura

                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>

                                        </label>

                                        <input
                                            type="text"
                                            name="prefijo_factura"
                                            value={
                                                formulario.prefijo_factura
                                            }
                                            onChange={
                                                manejarPrefijo
                                            }
                                            disabled={
                                                guardando
                                            }
                                            placeholder="000-001-01"
                                            maxLength={10}
                                            className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm tracking-wider outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10 disabled:bg-gray-50"
                                        />

                                        <p className="mt-1 text-xs text-gray-400">
                                            Formato: 000-001-01
                                        </p>

                                    </div>

                                    {/* RANGO INICIAL */}

                                    <Campo
                                        label="Rango inicial"
                                        name="rango_inicial"
                                        type="number"
                                        value={
                                            formulario.rango_inicial
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        placeholder="Ej. 1"
                                        min="1"
                                        step="1"
                                        required
                                        disabled={
                                            guardando
                                        }
                                    />

                                    {/* RANGO FINAL */}

                                    <Campo
                                        label="Rango final"
                                        name="rango_final"
                                        type="number"
                                        value={
                                            formulario.rango_final
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        placeholder="Ej. 1000"
                                        min="1"
                                        step="1"
                                        required
                                        disabled={
                                            guardando
                                        }
                                    />

                                    {/* SIGUIENTE */}

                                    <Campo
                                        label="Siguiente número"
                                        name="siguiente_numero"
                                        type="number"
                                        value={
                                            formulario.siguiente_numero
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        placeholder={
                                            formulario.rango_inicial ||
                                            'Ej. 1'
                                        }
                                        min="1"
                                        step="1"
                                        disabled={
                                            guardando
                                        }
                                    />

                                </div>

                            </div>

                            {/* ==============================
                                PREVISUALIZACION
                            ============================== */}

                            {formulario.prefijo_factura &&
                                formulario.rango_inicial && (

                                    <div className="rounded-xl border border-baby-secondary bg-baby-secondary/40 p-4">

                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Vista previa
                                        </p>

                                        <div className="mt-3 flex items-center gap-3">

                                            <div className="rounded-lg bg-white p-2.5 shadow-sm">

                                                <FileCheck2
                                                    size={20}
                                                    className="text-baby-primary"
                                                />

                                            </div>

                                            <div>

                                                <p className="text-lg font-bold tracking-wide text-baby-dark">

                                                    {
                                                        formulario.prefijo_factura
                                                    }

                                                    -

                                                    {String(
                                                        formulario.siguiente_numero ||
                                                        formulario.rango_inicial ||
                                                        0
                                                    ).padStart(
                                                        8,
                                                        '0'
                                                    )}

                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    Próximo número de factura
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                )}

                            {/* ==============================
                                ESTADO
                            ============================== */}

                            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">

                                <div>

                                    <p className="text-sm font-semibold text-baby-dark">
                                        Configuración activa
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Permitir que esta configuración sea utilizada para emitir facturas.
                                    </p>

                                </div>

                                <label className="relative inline-flex cursor-pointer items-center">

                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={
                                            formulario.activo
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        disabled={
                                            guardando
                                        }
                                        className="peer sr-only"
                                    />

                                    <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-baby-primary peer-checked:after:translate-x-full peer-checked:after:border-white" />

                                </label>

                            </div>

                            {/* ==============================
                                ERROR
                            ============================== */}

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

                            {/* ==============================
                                BOTONES
                            ============================== */}

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                                <button
                                    type="button"
                                    onClick={
                                        cerrarModal
                                    }
                                    disabled={
                                        guardando
                                    }
                                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        guardando
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-baby-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {guardando ? (

                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />

                                            Guardando...
                                        </>

                                    ) : (

                                        <>
                                            <Save
                                                size={17}
                                            />

                                            Guardar configuración
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

// ==============================
// COMPONENTE CAMPO
// ==============================

function Campo({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    min,
    step,
}) {

    return (

        <div>

            <label className="mb-1.5 block text-sm font-medium text-gray-700">

                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                min={min}
                step={step}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10 disabled:bg-gray-50"
            />

        </div>
    )
}

// ==============================
// COMPONENTE DATO
// ==============================

function Dato({
    icon: Icon,
    titulo,
    valor,
}) {

    return (

        <div className="flex items-start gap-3">

            <div className="rounded-lg bg-gray-50 p-2">

                <Icon
                    size={18}
                    className="text-gray-500"
                />

            </div>

            <div className="min-w-0">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {titulo}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-baby-dark">
                    {valor}
                </p>

            </div>

        </div>
    )
}

// ==============================
// ICONO PLUS
// ==============================

function PlusIcon() {

    return (

        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >

            <path d="M12 5v14" />
            <path d="M5 12h14" />

        </svg>
    )
}