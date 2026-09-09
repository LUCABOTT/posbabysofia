import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const response = await api.get('/auth/me')
        setUsuario(response.data.user)
      } catch {
        setUsuario(null)
      } finally {
        setCargando(false)
      }
    }

    cargarSesion()
  }, [])

  const iniciarSesion = (usuarioAutenticado) => {
    setUsuario(usuarioAutenticado)
  }

  const cerrarSesion = () => {
    setUsuario(null)
  }

  const valor = useMemo(() => ({
    usuario,
    cargando,
    iniciarSesion,
    cerrarSesion,
  }), [usuario, cargando])

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return contexto
}

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CAJERO: 'CAJERO',
}

export const RUTAS_CAJERO = [
  '/ventas',
  '/ventas/nueva',
  '/facturas',
  '/clientes',
]

export const puedeAccederRuta = (rol, pathname) => {
  if (rol === ROLES.SUPER_ADMIN || rol === ROLES.ADMIN) return true

  if (rol !== ROLES.CAJERO) return false

  return RUTAS_CAJERO.some((ruta) => (
    pathname === ruta || pathname.startsWith(`${ruta}/`)
  ))
}
