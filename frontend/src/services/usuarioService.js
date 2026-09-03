import api from './api'

export const listarUsuarios = async () => {
    const response = await api.get('/auth/users')
    return response.data
}

export const registrarUsuario = async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
}

export const editarUsuario = async (id, data) => {
    const response = await api.put(`/auth/users/${id}`, data)
    return response.data
}

export const cambiarEstadoUsuario = async (id, activo) => {
    const response = await api.patch(`/auth/users/${id}/estado`, {
        activo
    })

    return response.data
}