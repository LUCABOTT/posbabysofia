import { useEffect, useState } from 'react'
import {
    CheckCircle2,
    Eye,
    EyeOff,
    ShieldCheck,
    UserPlus,
    Users,
    User,
    Mail,
    CalendarDays,
    RefreshCw,
    Pencil,
    UserX,
    UserCheck,
    X,
    Save
} from 'lucide-react'

import {
    listarUsuarios,
    registrarUsuario as registrarUsuarioService,
    editarUsuario as editarUsuarioService,
    cambiarEstadoUsuario
} from '../../services/usuarioService'


const formularioInicial = {
    nombre: '',
    email: '',
    password: '',
    rol_id: '3'
}

const formularioEditarInicial = {
    id: null,
    nombre: '',
    email: '',
    rol_id: '3'
}


function Usuarios() {

    // =========================================================
    // REGISTRO
    // =========================================================

    const [formulario, setFormulario] = useState(formularioInicial)
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [guardando, setGuardando] = useState(false)

    // =========================================================
    // LISTADO
    // =========================================================

    const [usuarios, setUsuarios] = useState([])
    const [cargandoUsuarios, setCargandoUsuarios] = useState(true)

    // =========================================================
    // MENSAJES
    // =========================================================

    const [mensaje, setMensaje] = useState('')
    const [error, setError] = useState('')

    // =========================================================
    // EDICIÓN
    // =========================================================

    const [modalEditar, setModalEditar] = useState(false)
    const [formularioEditar, setFormularioEditar] = useState(
        formularioEditarInicial
    )

    const [guardandoEdicion, setGuardandoEdicion] = useState(false)

    // =========================================================
    // CAMBIO DE ESTADO
    // =========================================================

    const [procesandoEstado, setProcesandoEstado] = useState(null)


    // =========================================================
    // CARGAR USUARIOS
    // =========================================================

    const cargarUsuarios = async () => {

        try {

            setCargandoUsuarios(true)

            const response = await listarUsuarios()

            setUsuarios(response.usuarios || [])

        } catch (requestError) {

            console.error('Error al cargar usuarios:', requestError)

            setError(
                requestError.response?.data?.message ||
                'No se pudieron cargar los usuarios.'
            )

        } finally {

            setCargandoUsuarios(false)

        }
    }


    // =========================================================
    // CARGAR AL INICIAR
    // =========================================================

    useEffect(() => {

        cargarUsuarios()

    }, [])


    // =========================================================
    // CAMBIAR CAMPO REGISTRO
    // =========================================================

    const cambiarCampo = (event) => {

        setFormulario((actual) => ({
            ...actual,
            [event.target.name]: event.target.value
        }))

    }


    // =========================================================
    // REGISTRAR USUARIO
    // =========================================================

    const registrarUsuario = async (event) => {

        event.preventDefault()

        setGuardando(true)
        setError('')
        setMensaje('')

        try {

            const datos = {
                nombre: formulario.nombre.trim(),
                email: formulario.email.trim().toLowerCase(),
                password: formulario.password,
                rol_id: Number(formulario.rol_id)
            }

            const response = await registrarUsuarioService(datos)

            setMensaje(
                `${response.data?.usuario?.nombre || datos.nombre} fue registrado correctamente.`
            )

            setFormulario(formularioInicial)
            setMostrarPassword(false)

            await cargarUsuarios()

        } catch (requestError) {

            console.error('Error al registrar usuario:', requestError)

            setError(
                requestError.response?.data?.message ||
                'No se pudo registrar el usuario.'
            )

        } finally {

            setGuardando(false)

        }
    }


    // =========================================================
    // ABRIR MODAL DE EDICIÓN
    // =========================================================

    const abrirEditar = (usuario) => {

        setFormularioEditar({
            id: usuario.id,
            nombre: usuario.nombre || '',
            email: usuario.email || '',
            rol_id: String(
                usuario.rol_id ||
                usuario.rol?.id ||
                '3'
            )
        })

        setError('')
        setMensaje('')
        setModalEditar(true)

    }


    // =========================================================
    // CERRAR MODAL DE EDICIÓN
    // =========================================================

    const cerrarEditar = () => {

        if (guardandoEdicion) {
            return
        }

        setModalEditar(false)

        setFormularioEditar(formularioEditarInicial)

    }


    // =========================================================
    // CAMBIAR CAMPO EDICIÓN
    // =========================================================

    const cambiarCampoEditar = (event) => {

        setFormularioEditar((actual) => ({
            ...actual,
            [event.target.name]: event.target.value
        }))

    }


    // =========================================================
    // GUARDAR EDICIÓN
    // =========================================================

    const guardarEdicion = async (event) => {

        event.preventDefault()

        setGuardandoEdicion(true)
        setError('')
        setMensaje('')

        try {

            const datos = {
                nombre: formularioEditar.nombre.trim(),
                email: formularioEditar.email.trim().toLowerCase(),
                rol_id: Number(formularioEditar.rol_id)
            }

            const response = await editarUsuarioService(
                formularioEditar.id,
                datos
            )

            setMensaje(
                response.message ||
                'Usuario actualizado correctamente.'
            )

            setModalEditar(false)

            setFormularioEditar(formularioEditarInicial)

            await cargarUsuarios()

        } catch (requestError) {

            console.error('Error al editar usuario:', requestError)

            setError(
                requestError.response?.data?.message ||
                'No se pudo actualizar el usuario.'
            )

        } finally {

            setGuardandoEdicion(false)

        }
    }


    // =========================================================
    // ACTIVAR / DESACTIVAR
    // =========================================================

    const cambiarEstado = async (usuario) => {

        const nuevoEstado = !usuario.activo

        const accion = nuevoEstado
            ? 'activar'
            : 'desactivar'

        const confirmar = window.confirm(
            `¿Estás seguro de que deseas ${accion} al usuario "${usuario.nombre}"?`
        )

        if (!confirmar) {
            return
        }

        setProcesandoEstado(usuario.id)
        setError('')
        setMensaje('')

        try {

            const response = await cambiarEstadoUsuario(
                usuario.id,
                nuevoEstado
            )

            setMensaje(
                response.message ||
                `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`
            )

            await cargarUsuarios()

        } catch (requestError) {

            console.error(
                'Error al cambiar estado del usuario:',
                requestError
            )

            setError(
                requestError.response?.data?.message ||
                'No se pudo cambiar el estado del usuario.'
            )

        } finally {

            setProcesandoEstado(null)

        }
    }


    // =========================================================
    // NOMBRE DEL ROL
    // =========================================================

    const obtenerNombreRol = (usuario) => {

        if (usuario.rol?.nombre) {
            return usuario.rol.nombre
        }

        switch (Number(usuario.rol_id)) {

            case 1:
                return 'Super administrador'

            case 2:
                return 'Administrador'

            case 3:
                return 'Cajero'

            default:
                return 'Sin rol'

        }
    }


    // =========================================================
    // COLOR DEL ROL
    // =========================================================

    const obtenerColorRol = (usuario) => {

        const rol = obtenerNombreRol(usuario)

        if (rol === 'Super administrador') {

            return 'bg-purple-100 text-purple-700'

        }

        if (rol === 'Administrador') {

            return 'bg-blue-100 text-blue-700'

        }

        return 'bg-baby-secondary/40 text-baby-primary'
    }


    // =========================================================
    // FORMATO FECHA
    // =========================================================

    const formatearFecha = (fecha) => {

        if (!fecha) {
            return '—'
        }

        const fechaObj = new Date(fecha)

        if (Number.isNaN(fechaObj.getTime())) {
            return '—'
        }

        return fechaObj.toLocaleDateString('es-HN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }


    return (

        <div className="space-y-6">

            {/* =====================================================
                ENCABEZADO
            ====================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>

                    <p className="text-sm font-semibold uppercase tracking-wider text-baby-primary">
                        Administración
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-baby-dark">
                        Usuarios
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Administra las cuentas y permisos del equipo del punto de venta.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={cargarUsuarios}
                    disabled={cargandoUsuarios}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-baby-primary hover:text-baby-primary disabled:cursor-not-allowed disabled:opacity-60"
                >

                    <RefreshCw
                        size={17}
                        className={cargandoUsuarios ? 'animate-spin' : ''}
                    />

                    Actualizar

                </button>

            </div>


            {/* =====================================================
                MENSAJES
            ====================================================== */}

            {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    {error}

                </div>

            )}


            {mensaje && (

                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

                    <CheckCircle2 size={18} />

                    {mensaje}

                </div>

            )}


            {/* =====================================================
                REGISTRO + ROLES
            ====================================================== */}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">


                {/* =================================================
                    FORMULARIO REGISTRAR
                ================================================== */}

                <form
                    onSubmit={registrarUsuario}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
                >

                    <div className="flex items-center gap-3 border-b border-gray-100 pb-5">

                        <div className="rounded-xl bg-baby-secondary/40 p-3 text-baby-primary">

                            <UserPlus size={22} />

                        </div>

                        <div>

                            <h2 className="font-semibold text-baby-dark">
                                Registrar usuario
                            </h2>

                            <p className="text-sm text-gray-500">
                                Crea una cuenta con acceso según su rol.
                            </p>

                        </div>

                    </div>


                    <div className="mt-6 space-y-5">


                        {/* NOMBRE */}

                        <Field
                            label="Nombre completo"
                            name="nombre"
                            value={formulario.nombre}
                            onChange={cambiarCampo}
                            placeholder="Ej. Juan Pérez"
                            required
                        />


                        {/* EMAIL */}

                        <Field
                            label="Correo electrónico"
                            name="email"
                            type="email"
                            value={formulario.email}
                            onChange={cambiarCampo}
                            placeholder="correo@ejemplo.com"
                            required
                        />


                        {/* PASSWORD */}

                        <label className="block text-sm font-medium text-gray-700">

                            Contraseña

                            <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 transition focus-within:border-baby-primary">

                                <input
                                    name="password"
                                    type={mostrarPassword ? 'text' : 'password'}
                                    value={formulario.password}
                                    onChange={cambiarCampo}
                                    minLength="6"
                                    required
                                    className="w-full bg-transparent outline-none"
                                    placeholder="Mínimo 6 caracteres"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarPassword((actual) => !actual)
                                    }
                                    className="text-gray-400 transition hover:text-baby-primary"
                                    aria-label={
                                        mostrarPassword
                                            ? 'Ocultar contraseña'
                                            : 'Mostrar contraseña'
                                    }
                                >

                                    {mostrarPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}

                                </button>

                            </div>

                        </label>


                        {/* ROL */}

                        <label className="block text-sm font-medium text-gray-700">

                            Rol

                            <select
                                name="rol_id"
                                value={formulario.rol_id}
                                onChange={cambiarCampo}
                                required
                                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none transition focus:border-baby-primary"
                            >

                                <option value="3">
                                    Cajero
                                </option>

                                <option value="2">
                                    Administrador
                                </option>

                                <option value="1">
                                    Super administrador
                                </option>

                            </select>

                        </label>


                        {/* BOTÓN */}

                        <button
                            type="submit"
                            disabled={guardando}
                            className="w-full rounded-xl bg-baby-primary px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {guardando
                                ? 'Registrando...'
                                : 'Registrar usuario'
                            }

                        </button>

                    </div>

                </form>


                {/* =================================================
                    ROLES
                ================================================== */}

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baby-secondary/40 text-baby-primary">

                        <ShieldCheck size={22} />

                    </div>

                    <h2 className="mt-5 font-semibold text-baby-dark">
                        Roles del sistema
                    </h2>

                    <div className="mt-4 space-y-3 text-sm">

                        <Role
                            nombre="Cajero"
                            descripcion="Opera ventas y caja."
                        />

                        <Role
                            nombre="Administrador"
                            descripcion="Administra el catálogo y operaciones."
                        />

                        <Role
                            nombre="Super administrador"
                            descripcion="Tiene acceso total al sistema."
                        />

                    </div>

                    <p className="mt-6 border-t border-gray-100 pt-5 text-xs leading-5 text-gray-400">

                        Solo los usuarios con permisos de super administrador
                        pueden administrar cuentas.

                    </p>

                </div>

            </div>


            {/* =====================================================
                LISTADO DE USUARIOS
            ====================================================== */}

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">


                {/* ENCABEZADO TABLA */}

                <div className="flex flex-col gap-3 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-baby-secondary/40 p-3 text-baby-primary">

                            <Users size={22} />

                        </div>

                        <div>

                            <h2 className="font-semibold text-baby-dark">
                                Usuarios registrados
                            </h2>

                            <p className="text-sm text-gray-500">
                                {usuarios.length}{' '}
                                {usuarios.length === 1
                                    ? 'usuario registrado'
                                    : 'usuarios registrados'}
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    CARGANDO
                ================================================== */}

                {cargandoUsuarios ? (

                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                        <RefreshCw
                            size={28}
                            className="animate-spin text-baby-primary"
                        />

                        <p className="mt-4 text-sm text-gray-500">
                            Cargando usuarios...
                        </p>

                    </div>

                ) : usuarios.length === 0 ? (

                    /* =================================================
                       SIN USUARIOS
                    ================================================== */

                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-baby-secondary/40 text-baby-primary">

                            <Users size={26} />

                        </div>

                        <h3 className="mt-4 font-semibold text-baby-dark">
                            No hay usuarios registrados
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-gray-500">
                            Utiliza el formulario superior para registrar
                            el primer usuario.
                        </p>

                    </div>

                ) : (

                    /* =================================================
                       TABLA
                    ================================================== */

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[800px] text-left">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Usuario
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Rol
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Registro
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Estado
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Acciones
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-100">

                                {usuarios.map((usuario) => (

                                    <tr
                                        key={usuario.id}
                                        className="transition hover:bg-gray-50"
                                    >


                                        {/* USUARIO */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-baby-secondary/40 text-baby-primary">

                                                    <User size={19} />

                                                </div>

                                                <div className="min-w-0">

                                                    <p className="truncate font-semibold text-baby-dark">

                                                        {usuario.nombre}

                                                    </p>

                                                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">

                                                        <Mail size={13} />

                                                        <span className="truncate">
                                                            {usuario.email}
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </td>


                                        {/* ROL */}

                                        <td className="px-6 py-4">

                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${obtenerColorRol(usuario)}`}
                                            >

                                                {obtenerNombreRol(usuario)}

                                            </span>

                                        </td>


                                        {/* FECHA */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-2 text-sm text-gray-500">

                                                <CalendarDays size={16} />

                                                {formatearFecha(usuario.created_at)}

                                            </div>

                                        </td>


                                        {/* ESTADO */}

                                        <td className="px-6 py-4">

                                            {usuario.activo ? (

                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">

                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                                    Activo

                                                </span>

                                            ) : (

                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">

                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                                                    Inactivo

                                                </span>

                                            )}

                                        </td>


                                        {/* ACCIONES */}

                                        <td className="px-6 py-4">

                                            <div className="flex justify-end gap-2">


                                                {/* EDITAR */}

                                                <button
                                                    type="button"
                                                    onClick={() => abrirEditar(usuario)}
                                                    className="rounded-lg p-2 text-baby-primary transition hover:bg-baby-secondary/30"
                                                    title="Editar usuario"
                                                >

                                                    <Pencil size={18} />

                                                </button>


                                                {/* ACTIVAR / DESACTIVAR */}

                                                <button
                                                    type="button"
                                                    onClick={() => cambiarEstado(usuario)}
                                                    disabled={
                                                        procesandoEstado ===
                                                        usuario.id
                                                    }
                                                    className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        usuario.activo
                                                            ? 'text-red-500 hover:bg-red-50'
                                                            : 'text-emerald-500 hover:bg-emerald-50'
                                                    }`}
                                                    title={
                                                        usuario.activo
                                                            ? 'Desactivar usuario'
                                                            : 'Activar usuario'
                                                    }
                                                >

                                                    {procesandoEstado ===
                                                    usuario.id ? (

                                                        <RefreshCw
                                                            size={18}
                                                            className="animate-spin"
                                                        />

                                                    ) : usuario.activo ? (

                                                        <UserX size={18} />

                                                    ) : (

                                                        <UserCheck size={18} />

                                                    )}

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================================
                MODAL EDITAR
            ====================================================== */}

            {modalEditar && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">


                        {/* ENCABEZADO MODAL */}

                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="rounded-xl bg-baby-secondary/40 p-3 text-baby-primary">

                                    <Pencil size={21} />

                                </div>

                                <div>

                                    <h2 className="font-semibold text-baby-dark">
                                        Editar usuario
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Modifica la información de la cuenta.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={cerrarEditar}
                                disabled={guardandoEdicion}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* FORMULARIO */}

                        <form
                            onSubmit={guardarEdicion}
                            className="space-y-5 p-6"
                        >


                            {/* NOMBRE */}

                            <Field
                                label="Nombre completo"
                                name="nombre"
                                value={formularioEditar.nombre}
                                onChange={cambiarCampoEditar}
                                placeholder="Ej. Juan Pérez"
                                required
                            />


                            {/* EMAIL */}

                            <Field
                                label="Correo electrónico"
                                name="email"
                                type="email"
                                value={formularioEditar.email}
                                onChange={cambiarCampoEditar}
                                placeholder="correo@ejemplo.com"
                                required
                            />


                            {/* ROL */}

                            <label className="block text-sm font-medium text-gray-700">

                                Rol

                                <select
                                    name="rol_id"
                                    value={formularioEditar.rol_id}
                                    onChange={cambiarCampoEditar}
                                    required
                                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none transition focus:border-baby-primary"
                                >

                                    <option value="3">
                                        Cajero
                                    </option>

                                    <option value="2">
                                        Administrador
                                    </option>

                                    <option value="1">
                                        Super administrador
                                    </option>

                                </select>

                            </label>


                            {/* INFORMACIÓN */}

                            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">

                                La contraseña del usuario no se modifica
                                desde este formulario.

                            </div>


                            {/* BOTONES */}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={cerrarEditar}
                                    disabled={guardandoEdicion}
                                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                                >

                                    Cancelar

                                </button>


                                <button
                                    type="submit"
                                    disabled={guardandoEdicion}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-baby-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {guardandoEdicion ? (

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

                                            Guardar cambios
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


// =============================================================
// COMPONENTE FIELD
// =============================================================

function Field({
    label,
    ...props
}) {

    return (

        <label className="block text-sm font-medium text-gray-700">

            {label}

            <input
                {...props}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none transition focus:border-baby-primary"
            />

        </label>

    )
}


// =============================================================
// COMPONENTE ROLE
// =============================================================

function Role({
    nombre,
    descripcion
}) {

    return (

        <div className="rounded-xl bg-gray-50 p-3">

            <p className="font-medium text-baby-dark">
                {nombre}
            </p>

            <p className="mt-1 text-xs text-gray-500">
                {descripcion}
            </p>

        </div>

    )
}


export default Usuarios