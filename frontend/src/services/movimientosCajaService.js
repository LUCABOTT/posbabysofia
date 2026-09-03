import api from './api'

export const listarMovimientos = async () => {
    const response = await api.get('/movimientos-caja')
    return response.data
}

export const crearMovimiento = async (data) => {
    const response = await api.post('/movimientos-caja', data)
    return response.data
}