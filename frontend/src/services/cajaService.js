import api from './api'

// Obtener la caja actualmente abierta del usuario
export const obtenerCajaActual = async () => {
    const response = await api.get('/cajas/actual')
    return response.data
}

// Abrir una nueva caja
export const abrirCaja = async (monto_inicial) => {
    const response = await api.post('/cajas/abrir', {
        monto_inicial: Number(monto_inicial)
    })

    return response.data
}

// Registrar ingreso o egreso manual
export const registrarMovimiento = async ({
    tipo,
    monto,
    motivo
}) => {
    const response = await api.post('/cajas/movimiento', {
        tipo,
        monto: Number(monto),
        motivo: motivo.trim()
    })

    return response.data
}

// Cerrar caja
export const cerrarCaja = async ({
    monto_final,
    observaciones
}) => {
    const response = await api.post('/cajas/cerrar', {
        monto_final: Number(monto_final),
        observaciones: observaciones?.trim() || null
    })

    return response.data
}

// Obtener historial de cajas
export const obtenerHistorialCajas = async () => {
    const response = await api.get('/cajas/historial')
    return response.data
}

// Obtener una caja específica
export const obtenerCajaPorId = async (id) => {
    const response = await api.get(`/cajas/${id}`)
    return response.data
}