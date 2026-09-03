import api from './api'

export const obtenerProductos = async () => {
  const response = await api.get('/productos')
  return response.data
}

export const listarProductos = obtenerProductos

export const obtenerProducto = async (id) => {
  const response = await api.get(`/productos/${id}`)
  return response.data
}

export const crearProducto = async (formData) => {
  const response = await api.post(
    '/productos',
    formData
  )

  return response.data
}

export const actualizarProducto = async (
  id,
  formData
) => {
  const response = await api.put(
    `/productos/${id}`,
    formData
  )

  return response.data
}

export const eliminarProducto = async (id) => {
  const response = await api.delete(
    `/productos/${id}`
  )

  return response.data
}

export const eliminarProductoDefinitivo = async (id) => {
  const response = await api.delete(
    `/productos/definitivo/${id}`
  )

  return response.data
}