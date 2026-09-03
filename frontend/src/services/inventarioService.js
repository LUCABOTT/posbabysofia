import api from './api'

// ==============================
// LISTAR MOVIMIENTOS
// ==============================
export const listarMovimientos = async () => {
    const response = await api.get('/inventario/movimientos')
    return response.data
}

// ==============================
// REGISTRAR ENTRADA
// ==============================
export const registrarEntrada = async (data) => {
    const response = await api.post('/inventario/entrada', data)
    return response.data
}

// ==============================
// REGISTRAR SALIDA
// ==============================
export const registrarSalida = async (data) => {
    const response = await api.post('/inventario/salida', data)
    return response.data
}

// ==============================
// REGISTRAR AJUSTE
// ==============================
export const registrarAjuste = async (data) => {
    const response = await api.post('/inventario/ajuste', data)
    return response.data
}

// ==============================
// MOVIMIENTOS DE UN PRODUCTO
// ==============================
export const movimientosProducto = async (id) => {
    const response = await api.get(`/inventario/producto/${id}`)
    return response.data
}