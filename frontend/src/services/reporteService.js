import api from './api'

export const obtenerReporteVentas = async (fechaInicio, fechaFin) => {
    const response = await api.get('/reporte/ventas', {
        params: {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        }
    })

    return response.data
}

export const obtenerReporteCajas = async (fechaInicio, fechaFin) => {
    const response = await api.get('/reporte/cajas', {
        params: {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        }
    })

    return response.data
}