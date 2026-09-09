import { useEffect, useState } from 'react'
import {
  Folder,
  Plus,
  RefreshCw,
  Edit,
  Power,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Search,
} from 'lucide-react'

import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  eliminarCategoriaDefinitiva,
} from '../../services/categoriaService'
import { useConfirm } from '../../components/ui/confirmContext'

const Categoria = () => {
  const confirmar = useConfirm()
  // ==============================
  // ESTADOS
  // ==============================

  const [categorias, setCategorias] = useState([])

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [modal, setModal] = useState(null)

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState(null)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [activo, setActivo] = useState(true)

  const [busqueda, setBusqueda] = useState('')

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  // ==============================
  // CARGAR CATEGORÍAS
  // ==============================

  const cargarCategorias = async () => {
    try {
      setCargando(true)
      setError('')

      const data = await obtenerCategorias()

      setCategorias(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (err) {
      console.error(
        'Error al obtener categorías:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudieron obtener las categorías'
      )
    } finally {
      setCargando(false)
    }
  }

  // ==============================
  // CARGA INICIAL
  // ==============================

  useEffect(() => {
    cargarCategorias()
  }, [])

  // ==============================
  // FILTRAR CATEGORÍAS
  // ==============================

  const categoriasFiltradas = categorias.filter(
    (categoria) => {
      const texto = busqueda
        .toLowerCase()
        .trim()

      if (!texto) return true

      return (
        categoria.nombre
          ?.toLowerCase()
          .includes(texto) ||
        categoria.descripcion
          ?.toLowerCase()
          .includes(texto)
      )
    }
  )

  // ==============================
  // ABRIR MODAL
  // ==============================

  const abrirModal = (tipo, categoria = null) => {
    setError('')
    setMensaje('')

    setModal(tipo)

    if (tipo === 'crear') {
      setCategoriaSeleccionada(null)
      setNombre('')
      setDescripcion('')
      setActivo(true)
    }

    if (tipo === 'editar' && categoria) {
      setCategoriaSeleccionada(categoria)
      setNombre(categoria.nombre || '')
      setDescripcion(categoria.descripcion || '')
      setActivo(categoria.activo ?? true)
    }
  }

  // ==============================
  // CERRAR MODAL
  // ==============================

  const cerrarModal = () => {
    if (guardando) return

    setModal(null)
    setCategoriaSeleccionada(null)
    setError('')
  }

  // ==============================
  // CREAR CATEGORÍA
  // ==============================

  const manejarCrear = async (e) => {
    e.preventDefault()

    const aceptado = await confirmar({
      titulo: 'Agregar categoría',
      mensaje: `¿Estás seguro de agregar la categoría "${nombre.trim() || 'sin nombre'}"?`,
      confirmarTexto: 'Agregar',
    })

    if (!aceptado) return

    setError('')
    setMensaje('')

    if (!nombre.trim()) {
      setError(
        'El nombre de la categoría es obligatorio'
      )
      return
    }

    try {
      setGuardando(true)

      await crearCategoria({
        nombre: nombre.trim(),
        descripcion:
          descripcion.trim() || null,
      })

      setModal(null)

      setNombre('')
      setDescripcion('')

      setMensaje(
        'Categoría creada correctamente'
      )

      await cargarCategorias()

      setTimeout(() => {
        setMensaje('')
      }, 3000)
    } catch (err) {
      console.error(
        'Error al crear categoría:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudo crear la categoría'
      )
    } finally {
      setGuardando(false)
    }
  }

  // ==============================
  // ACTUALIZAR CATEGORÍA
  // ==============================

  const manejarActualizar = async (e) => {
    e.preventDefault()

    const aceptado = await confirmar({
      titulo: 'Editar categoría',
      mensaje: `¿Estás seguro de guardar los cambios de "${nombre.trim() || 'sin nombre'}"?`,
      confirmarTexto: 'Guardar cambios',
    })

    if (!aceptado) return

    setError('')
    setMensaje('')

    if (!nombre.trim()) {
      setError(
        'El nombre de la categoría es obligatorio'
      )
      return
    }

    if (!categoriaSeleccionada) {
      setError(
        'No se encontró la categoría seleccionada'
      )
      return
    }

    try {
      setGuardando(true)

      await actualizarCategoria(
        categoriaSeleccionada.id,
        {
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() || null,
          activo,
        }
      )

      setModal(null)

      setCategoriaSeleccionada(null)

      setMensaje(
        'Categoría actualizada correctamente'
      )

      await cargarCategorias()

      setTimeout(() => {
        setMensaje('')
      }, 3000)
    } catch (err) {
      console.error(
        'Error al actualizar categoría:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudo actualizar la categoría'
      )
    } finally {
      setGuardando(false)
    }
  }

  // ==============================
  // ACTIVAR / DESACTIVAR
  // ==============================

  const manejarEstado = async (categoria) => {
    const nuevoEstado = !categoria.activo

    try {
      setError('')
      setMensaje('')

      await actualizarCategoria(
        categoria.id,
        {
          activo: nuevoEstado,
        }
      )

      setMensaje(
        nuevoEstado
          ? 'Categoría activada correctamente'
          : 'Categoría desactivada correctamente'
      )

      await cargarCategorias()

      setTimeout(() => {
        setMensaje('')
      }, 3000)
    } catch (err) {
      console.error(
        'Error al cambiar estado:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudo cambiar el estado de la categoría'
      )
    }
  }

  // ==============================
  // ELIMINAR DEFINITIVAMENTE
  // ==============================

  const manejarEliminarDefinitivo = async (
    categoria
  ) => {
    const aceptado = await confirmar({
      titulo: 'Eliminar categoría definitivamente',
      mensaje: `¿Estás seguro de eliminar definitivamente la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
      confirmarTexto: 'Eliminar',
      peligrosa: true,
    })

    if (!aceptado) return

    try {
      setError('')
      setMensaje('')

      await eliminarCategoriaDefinitiva(
        categoria.id
      )

      setMensaje(
        'Categoría eliminada definitivamente'
      )

      await cargarCategorias()

      setTimeout(() => {
        setMensaje('')
      }, 3000)
    } catch (err) {
      console.error(
        'Error al eliminar categoría:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudo eliminar definitivamente la categoría'
      )
    }
  }

  // ==============================
  // ELIMINAR / DESACTIVAR
  // ==============================

  const manejarEliminar = async (categoria) => {
    const aceptado = await confirmar({
      titulo: 'Desactivar categoría',
      mensaje: `¿Deseas desactivar la categoría "${categoria.nombre}"?`,
      confirmarTexto: 'Desactivar',
    })

    if (!aceptado) return

    try {
      setError('')
      setMensaje('')

      await eliminarCategoria(
        categoria.id
      )

      setMensaje(
        'Categoría desactivada correctamente'
      )

      await cargarCategorias()

      setTimeout(() => {
        setMensaje('')
      }, 3000)
    } catch (err) {
      console.error(
        'Error al desactivar categoría:',
        err
      )

      setError(
        err.response?.data?.message ||
          'No se pudo desactivar la categoría'
      )
    }
  }

  // ==============================
  // CARGANDO
  // ==============================

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-baby-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ==============================
          ENCABEZADO
      ============================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-baby-dark">
            Categorías
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Administra las categorías de los productos
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            onClick={cargarCategorias}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Actualizar
          </button>

          <button
            onClick={() =>
              abrirModal('crear')
            }
            className="flex items-center gap-2 rounded-lg bg-baby-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={18} />
            Nueva categoría
          </button>

        </div>

      </div>

      {/* ==============================
          MENSAJES
      ============================== */}

      {mensaje && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {mensaje}
        </div>
      )}

      {error && !modal && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* ==============================
          CONTENIDO
      ============================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        {/* HEADER TABLA */}

        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-baby-secondary p-2.5">
              <Folder
                size={20}
                className="text-baby-primary"
              />
            </div>

            <div>
              <h2 className="font-bold text-baby-dark">
                Lista de categorías
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {categorias.length}{' '}
                categoría
                {categorias.length !== 1
                  ? 's'
                  : ''}{' '}
                registrada
                {categorias.length !== 1
                  ? 's'
                  : ''}
              </p>
            </div>

          </div>

          {/* BUSCADOR */}

          <div className="relative w-full md:w-72">

            <Search
              size={17}
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
              placeholder="Buscar categoría..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
            />

          </div>

        </div>

        {/* ==============================
            TABLA
        ============================== */}

        {categoriasFiltradas.length === 0 ? (

          <div className="py-14 text-center">

            <Folder
              size={34}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="text-sm font-medium text-gray-600">
              No se encontraron categorías
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {busqueda
                ? 'Intenta con otro término de búsqueda.'
                : 'Aún no hay categorías registradas.'}
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Categoría
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Descripción
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>

                </tr>
              </thead>

              <tbody>

                {categoriasFiltradas.map(
                  (categoria) => (

                    <tr
                      key={categoria.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >

                      {/* CATEGORÍA */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-baby-secondary">

                            <Folder
                              size={17}
                              className="text-baby-primary"
                            />

                          </div>

                          <div>

                            <p className="text-sm font-semibold text-baby-dark">
                              {categoria.nombre}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID #{categoria.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* DESCRIPCIÓN */}

                      <td className="max-w-md px-5 py-4 text-sm text-gray-600">

                        {categoria.descripcion
                          ? categoria.descripcion
                          : (
                            <span className="text-gray-400">
                              Sin descripción
                            </span>
                          )}

                      </td>

                      {/* ESTADO */}

                      <td className="px-5 py-4">

                        {categoria.activo ? (

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">

                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                            Activa

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">

                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />

                            Inactiva

                          </span>

                        )}

                      </td>

                      {/* ACCIONES */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              abrirModal(
                                'editar',
                                categoria
                              )
                            }
                            title="Editar"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-baby-primary hover:bg-baby-secondary hover:text-baby-primary"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() =>
                              manejarEstado(
                                categoria
                              )
                            }
                            title={
                              categoria.activo
                                ? 'Desactivar'
                                : 'Activar'
                            }
                            className={`rounded-lg border p-2 transition ${
                              categoria.activo
                                ? 'border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600'
                                : 'border-gray-200 text-gray-500 hover:border-green-300 hover:bg-green-50 hover:text-green-600'
                            }`}
                          >
                            <Power size={16} />
                          </button>

                          <button
                            onClick={() =>
                              manejarEliminar(
                                categoria
                              )
                            }
                            title="Desactivar"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

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
          MODAL CREAR / EDITAR
      ============================== */}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

              <div>

                <h2 className="text-xl font-bold text-baby-dark">

                  {modal === 'crear'
                    ? 'Nueva categoría'
                    : 'Editar categoría'}

                </h2>

                <p className="mt-1 text-sm text-gray-500">

                  {modal === 'crear'
                    ? 'Registra una nueva categoría para tus productos.'
                    : 'Modifica la información de la categoría.'}

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
              onSubmit={
                modal === 'crear'
                  ? manejarCrear
                  : manejarActualizar
              }
              className="space-y-5 p-6"
            >

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* NOMBRE */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nombre *
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(
                      e.target.value
                    )
                  }
                  placeholder="Ej. Bebidas"
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                  autoFocus
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Máximo 100 caracteres.
                </p>

              </div>

              {/* DESCRIPCIÓN */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Descripción
                </label>

                <textarea
                  value={descripcion}
                  onChange={(e) =>
                    setDescripcion(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe brevemente esta categoría..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-baby-primary focus:ring-2 focus:ring-baby-primary/10"
                />

              </div>

              {/* ESTADO */}

              {modal === 'editar' && (
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Estado
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setActivo(!activo)
                    }
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 transition ${
                      activo
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <Power
                        size={18}
                        className={
                          activo
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }
                      />

                      <div className="text-left">

                        <p
                          className={`text-sm font-medium ${
                            activo
                              ? 'text-green-700'
                              : 'text-gray-600'
                          }`}
                        >
                          {activo
                            ? 'Categoría activa'
                            : 'Categoría inactiva'}
                        </p>

                        <p className="text-xs text-gray-400">
                          Haz clic para cambiar el estado.
                        </p>

                      </div>

                    </div>

                    <div
                      className={`h-5 w-9 rounded-full p-0.5 transition ${
                        activo
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    >

                      <div
                        className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          activo
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />

                    </div>

                  </button>

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
                  className="flex items-center gap-2 rounded-lg bg-baby-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >

                  <Save size={17} />

                  {guardando
                    ? 'Guardando...'
                    : modal === 'crear'
                      ? 'Crear categoría'
                      : 'Guardar cambios'}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default Categoria