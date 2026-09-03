import api from './api'

export const obtenerCategorias = async () => {
  const response = await api.get('/categorias')
  return response.data
}

export const obtenerCategoria = async (id) => {
  const response = await api.get(`/categorias/${id}`)
  return response.data
}

export const crearCategoria = async (data) => {
  const response = await api.post('/categorias', data)
  return response.data
}

export const actualizarCategoria = async (id, data) => {
  const response = await api.put(`/categorias/${id}`, data)
  return response.data
}

export const eliminarCategoria = async (id) => {
  const response = await api.delete(`/categorias/${id}`)
  return response.data
}

export const eliminarCategoriaDefinitiva = async (id) => {
  const response = await api.delete(
    `/categorias/definitivo/${id}`
  )

  return response.data
}