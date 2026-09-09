import api from './api'

// ==============================
// OBTENER CONFIGURACIÓN FISCAL
// ==============================

export const obtenerConfiguracionFiscal = async () => {
    const response = await api.get('/configuracion-fiscal')
    return response.data
}

// ==============================
// CREAR CONFIGURACIÓN FISCAL
// ==============================

export const crearConfiguracionFiscal = async (data) => {
    const response = await api.post(
        '/configuracion-fiscal',
        data
    )

    return response.data
}

// ==============================
// ACTUALIZAR CONFIGURACIÓN FISCAL
// ==============================

export const actualizarConfiguracionFiscal = async (id, data) => {
    const response = await api.put(
        `/configuracion-fiscal/${id}`,
        data
    )

    return response.data
}