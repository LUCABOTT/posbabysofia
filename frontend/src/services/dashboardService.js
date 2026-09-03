import api from './api'

export const obtenerDashboard = async () => {
  const response = await api.get('/dashboard')
  return response.data
}