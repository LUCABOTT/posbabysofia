import api from './api'

export const listarFacturas = async () => {
    const response = await api.get('/facturas')
    return response.data
}

export const obtenerFactura = async (id) => {
    const response = await api.get(`/facturas/${id}`)
    return response.data
}

export const buscarFacturaPorNumero = async (numero) => {
    const response = await api.get(
        `/facturas/numero/${encodeURIComponent(numero)}`
    )

    return response.data
}

export const obtenerFacturaParaImpresion = async (id) => {
    const response = await api.get(
        `/facturas/${id}/impresion`
    )

    return response.data
}