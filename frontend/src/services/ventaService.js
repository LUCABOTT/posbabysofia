import api from './api'

export const crearVenta = async (data) => {
    const response = await api.post('/ventas', data)
    return response.data
}

export const listarVentas = async () => {
    const response = await api.get('/ventas')
    return response.data
}

export const obtenerVenta = async (id) => {
    const response = await api.get(`/ventas/${id}`)
    return response.data
}

export const anularVenta = async (id) => {
    const response = await api.put(`/ventas/${id}/anular`)
    return response.data
}