
import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Pencil,
  UserRound,
  Mail,
  Phone,
  CreditCard,
  CalendarDays,
  UserCheck,
  UserX,
  X,
  Save,
} from 'lucide-react'

import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  desactivarCliente,
} from '../../services/clientesService'
import { useConfirm } from '../../components/ui/confirmContext'

const clienteInicial = {
  nombre: '',
  email: '',
  telefono: '',
  rtn: '',
  fecha_nacimiento: '',
  activo: true,
}

const Clientes = () => {
  const confirmar = useConfirm()
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)

  const [formulario, setFormulario] = useState(clienteInicial)

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  // ==============================
  // CARGAR CLIENTES
  // ==============================

  const cargarClientes = async () => {
    try {
      setCargando(true)
      setError('')

      const data = await obtenerClientes()

      setClientes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error al cargar clientes:', err)

      setError(
        err.response?.data?.message ||
          'No se pudieron cargar los clientes'
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  // ==============================
  // FILTRAR CLIENTES
  // ==============================

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim()

    return clientes.filter((cliente) => {
      const coincideBusqueda =
        !texto ||
        cliente.nombre?.toLowerCase().includes(texto) ||
        cliente.email?.toLowerCase().includes(texto) ||
        cliente.telefono?.toLowerCase().includes(texto) ||
        cliente.rtn?.toLowerCase().includes(texto)

      const coincideFiltro =
        filtro === 'todos' ||
        (filtro === 'activos' && cliente.activo) ||
        (filtro === 'inactivos' && !cliente.activo)

      return coincideBusqueda && coincideFiltro
    })
  }, [clientes, busqueda, filtro])

  // ==============================
  // ESTADÍSTICAS
  // ==============================

  const totalClientes = clientes.length

  const clientesActivos = clientes.filter(
    (cliente) => cliente.activo
  ).length

  const clientesInactivos = clientes.filter(
    (cliente) => !cliente.activo
  ).length

  const clientesConEmail = clientes.filter(
    (cliente) => cliente.email
  ).length

  // ==============================
  // ABRIR MODAL CREAR
  // ==============================

  const abrirModalCrear = () => {
    setModoEdicion(false)
    setClienteSeleccionado(null)
    setFormulario(clienteInicial)
    setError('')
    setMensaje('')
    setModalAbierto(true)
  }

  // ==============================
  // ABRIR MODAL EDITAR
  // ==============================

  const abrirModalEditar = (cliente) => {
    setModoEdicion(true)
    setClienteSeleccionado(cliente)

    setFormulario({
      nombre: cliente.nombre || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      rtn: cliente.rtn || '',
      fecha_nacimiento: cliente.fecha_nacimiento || '',
      activo: cliente.activo ?? true,
    })

    setError('')
    setMensaje('')
    setModalAbierto(true)
  }

  // ==============================
  // CERRAR MODAL
  // ==============================

  const cerrarModal = () => {
    if (guardando) return

    setModalAbierto(false)
    setClienteSeleccionado(null)
    setFormulario(clienteInicial)
    setError('')
  }

  // ==============================
  // CAMBIAR FORMULARIO
  // ==============================

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target

    setFormulario((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // ==============================
  // GUARDAR CLIENTE
  // ==============================

  const guardarCliente = async (e) => {
    e.preventDefault()

    const aceptado = await confirmar({
      titulo: modoEdicion ? 'Editar cliente' : 'Agregar cliente',
      mensaje: modoEdicion
        ? `¿Estás seguro de guardar los cambios de "${formulario.nombre.trim() || 'sin nombre'}"?`
        : `¿Estás seguro de agregar al cliente "${formulario.nombre.trim() || 'sin nombre'}"?`,
      confirmarTexto: modoEdicion ? 'Guardar cambios' : 'Agregar',
    })

    if (!aceptado) return

    setError('')
    setMensaje('')

    if (!formulario.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    try {
      setGuardando(true)

      const datos = {
        nombre: formulario.nombre.trim(),
        email: formulario.email.trim() || null,
        telefono: formulario.telefono.trim() || null,
        rtn: formulario.rtn.trim() || null,
        fecha_nacimiento:
          formulario.fecha_nacimiento || null,
      }

      if (modoEdicion) {
        await actualizarCliente(
          clienteSeleccionado.id,
          {
            ...datos,
            activo: formulario.activo,
          }
        )

        setMensaje('Cliente actualizado correctamente')
      } else {
        await crearCliente(datos)

        setMensaje('Cliente creado correctamente')
      }

      await cargarClientes()

      setTimeout(() => {
        cerrarModal()
      }, 700)
    } catch (err) {
      console.error('Error al guardar cliente:', err)

      setError(
        err.response?.data?.message ||
          'No se pudo guardar el cliente'
      )
    } finally {
      setGuardando(false)
    }
  }

  // ==============================
  // DESACTIVAR CLIENTE
  // ==============================

  const manejarDesactivar = async (cliente) => {
    const aceptado = await confirmar({
      titulo: 'Desactivar cliente',
      mensaje: `¿Deseas desactivar al cliente "${cliente.nombre}"?`,
      confirmarTexto: 'Desactivar',
    })

    if (!aceptado) return

    try {
      setError('')
      setMensaje('')

      await desactivarCliente(cliente.id)

      setMensaje('Cliente desactivado correctamente')

      await cargarClientes()

      setTimeout(() => {
        setMensaje('')
      }, 2500)
    } catch (err) {
      console.error('Error al desactivar cliente:', err)

      setError(
        err.response?.data?.message ||
          'No se pudo desactivar el cliente'
      )
    }
  }

  // ==============================
  // REACTIVAR CLIENTE
  // ==============================

  const manejarReactivar = async (cliente) => {
    try {
      setError('')
      setMensaje('')

      await actualizarCliente(cliente.id, {
        activo: true,
      })

      setMensaje('Cliente reactivado correctamente')

      await cargarClientes()

      setTimeout(() => {
        setMensaje('')
      }, 2500)
    } catch (err) {
      console.error('Error al reactivar cliente:', err)

      setError(
        err.response?.data?.message ||
          'No se pudo reactivar el cliente'
      )
    }
  }

  // ==============================
  // FORMATEAR FECHA
  // ==============================

  const formatearFecha = (fecha) => {
    if (!fecha) return '—'

    const partes = fecha.split('-')

    if (partes.length !== 3) return fecha

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ==============================
          ENCABEZADO
      ============================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-baby-dark">
            Clientes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Administra la información de tus clientes
          </p>
        </div>

        <button
          onClick={abrirModalCrear}
          className="flex items-center justify-center gap-2 rounded-lg bg-baby-primary px-4 py-2.5 font-medium text-white shadow-sm transition hover:opacity-90"
        >
          <Plus size={19} />
          Nuevo cliente
        </button>

      </div>

      {/* ==============================
          MENSAJES
      ============================== */}

      {mensaje && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      {error && !modalAbierto && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==============================
          ESTADÍSTICAS
      ============================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total clientes
              </p>

              <p className="mt-1 text-2xl font-bold text-baby-dark">
                {totalClientes}
              </p>
            </div>

            <div className="rounded-lg bg-baby-secondary p-3">
              <UserRound
                size={22}
                className="text-baby-primary"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Clientes activos
              </p>

              <p className="mt-1 text-2xl font-bold text-baby-dark">
                {clientesActivos}
              </p>
            </div>

            <div className="rounded-lg bg-green-100 p-3">
              <UserCheck
                size={22}
                className="text-green-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Clientes inactivos
              </p>

              <p className="mt-1 text-2xl font-bold text-baby-dark">
                {clientesInactivos}
              </p>
            </div>

            <div className="rounded-lg bg-red-100 p-3">
              <UserX
                size={22}
                className="text-red-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Con correo
              </p>

              <p className="mt-1 text-2xl font-bold text-baby-dark">
                {clientesConEmail}
              </p>
            </div>

            <div className="rounded-lg bg-blue-100 p-3">
              <Mail
                size={22}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>

      </div>

      {/* ==============================
          BUSCADOR Y FILTROS
      ============================== */}

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-md">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono o RTN..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
            />
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1">

            <button
              onClick={() => setFiltro('todos')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                filtro === 'todos'
                  ? 'bg-white text-baby-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Todos
            </button>

            <button
              onClick={() => setFiltro('activos')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                filtro === 'activos'
                  ? 'bg-white text-baby-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Activos
            </button>

            <button
              onClick={() => setFiltro('inactivos')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                filtro === 'inactivos'
                  ? 'bg-white text-baby-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Inactivos
            </button>

          </div>

        </div>

      </div>

      {/* ==============================
          TABLA
      ============================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        {cargando ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-baby-primary" />
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">

            <div className="mb-4 rounded-full bg-baby-secondary p-4">
              <UserRound
                size={30}
                className="text-baby-primary"
              />
            </div>

            <h3 className="text-lg font-semibold text-baby-dark">
              No se encontraron clientes
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {busqueda
                ? 'Intenta realizar otra búsqueda.'
                : 'Todavía no hay clientes registrados.'}
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Cliente
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Contacto
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    RTN
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Fecha nacimiento
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>

                </tr>
              </thead>

              <tbody>

                {clientesFiltrados.map((cliente) => (

                  <tr
                    key={cliente.id}
                    className="border-b border-gray-50 transition hover:bg-gray-50"
                  >

                    {/* CLIENTE */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-baby-secondary">
                          <UserRound
                            size={19}
                            className="text-baby-primary"
                          />
                        </div>

                        <div>
                          <p className="font-medium text-baby-dark">
                            {cliente.nombre}
                          </p>

                          <p className="text-xs text-gray-400">
                            ID #{cliente.id}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* CONTACTO */}

                    <td className="px-5 py-4">

                      <div className="space-y-1">

                        {cliente.email ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            {cliente.email}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            Sin correo
                          </div>
                        )}

                        {cliente.telefono ? (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone size={13} />
                            {cliente.telefono}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            Sin teléfono
                          </div>
                        )}

                      </div>

                    </td>

                    {/* RTN */}

                    <td className="px-5 py-4">

                      {cliente.rtn ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CreditCard size={15} />
                          {cliente.rtn}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          —
                        </span>
                      )}

                    </td>

                    {/* FECHA NACIMIENTO */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-sm text-gray-600">

                        <CalendarDays size={15} />

                        {formatearFecha(
                          cliente.fecha_nacimiento
                        )}

                      </div>

                    </td>

                    {/* ESTADO */}

                    <td className="px-5 py-4">

                      {cliente.activo ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          Inactivo
                        </span>
                      )}

                    </td>

                    {/* ACCIONES */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            abrirModalEditar(cliente)
                          }
                          title="Editar cliente"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-baby-secondary hover:text-baby-primary"
                        >
                          <Pencil size={17} />
                        </button>

                        {cliente.activo ? (
                          <button
                            onClick={() =>
                              manejarDesactivar(cliente)
                            }
                            title="Desactivar cliente"
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <UserX size={17} />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              manejarReactivar(cliente)
                            }
                            title="Reactivar cliente"
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-green-50 hover:text-green-600"
                          >
                            <UserCheck size={17} />
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ==============================
          MODAL CREAR / EDITAR
      ============================== */}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* HEADER MODAL */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

              <div>
                <h2 className="text-xl font-bold text-baby-dark">
                  {modoEdicion
                    ? 'Editar cliente'
                    : 'Nuevo cliente'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {modoEdicion
                    ? 'Actualiza la información del cliente'
                    : 'Registra un nuevo cliente'}
                </p>
              </div>

              <button
                onClick={cerrarModal}
                disabled={guardando}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORMULARIO */}

            <form
              onSubmit={guardarCliente}
              className="space-y-5 p-6"
            >

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {mensaje}
                </div>
              )}

              {/* NOMBRE */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nombre completo *
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    maxLength={150}
                    placeholder="Ej. María López"
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    required
                  />
                </div>
              </div>

              {/* CORREO Y TELEFONO */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      name="email"
                      value={formulario.email}
                      onChange={manejarCambio}
                      maxLength={150}
                      placeholder="cliente@email.com"
                      className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="tel"
                      name="telefono"
                      value={formulario.telefono}
                      onChange={manejarCambio}
                      maxLength={30}
                      placeholder="Ej. 9999-9999"
                      className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    />
                  </div>
                </div>

              </div>

              {/* RTN Y FECHA */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    RTN
                  </label>

                  <div className="relative">
                    <CreditCard
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="rtn"
                      value={formulario.rtn}
                      onChange={manejarCambio}
                      maxLength={20}
                      placeholder="RTN del cliente"
                      className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Fecha de nacimiento
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formulario.fecha_nacimiento}
                      onChange={manejarCambio}
                      className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                    />
                  </div>
                </div>

              </div>

              {/* ESTADO */}

              {modoEdicion && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      type="checkbox"
                      name="activo"
                      checked={formulario.activo}
                      onChange={manejarCambio}
                      className="h-4 w-4 rounded border-gray-300 text-baby-primary focus:ring-baby-primary"
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Cliente activo
                      </p>

                      <p className="text-xs text-gray-500">
                        Los clientes inactivos no estarán disponibles
                        para nuevas operaciones.
                      </p>
                    </div>

                  </label>

                </div>
              )}

              {/* BOTONES */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center gap-2 rounded-lg bg-baby-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {guardando ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {modoEdicion
                        ? 'Actualizar cliente'
                        : 'Guardar cliente'}
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

export default Clientes

